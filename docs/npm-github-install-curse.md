# 诅咒知识：`npx github:user/repo` 安装链全解剖

> 2026-03 血泪两天排查同一段死路，记录于此，警示后人。

---

## TL;DR — 三层叠加陷阱

这不是一个 bug，是**三个彼此掩盖的 bug 叠加**，每修一层才能看见下一层。

| 层 | 症状 | 根因 | 修复 |
|---|---|---|---|
| 1 | `postinstall` code: 1 | `dist/` 被 gitignore，tarball 无构建产物，运行时强依赖 devDeps 构建 | 提交 `dist/` 到 git，去掉 gitignore |
| 2 | `prepare.mjs` 早退出分支仍 code: 1 | `dist/` 存在时仍调用 `ensureCoreDist()`，该函数在 npx 上下文中 `process.cwd()` 指向 `node_modules/@wenyan-md/mcp/` 而非项目根目录，路径计算全错 | 早退出即 `return`，不再调任何依赖 cwd 的函数 |
| 3 | `postinstall` 找不到 `scripts/prepare.mjs`，`module not found` | `"files": ["dist"]` 在 `npm pack` 阶段过滤掉了 `scripts/`；`postinstall` 脚本路径写的是源码路径，安装包里根本不存在 | 删除 `postinstall`（`prepare` 已覆盖）；`"files"` 加入 `"scripts"` 作防御 |

---

## 背景：`npx github:user/repo` 的安装时序

理解陷阱前必须先明白 npm 如何处理 GitHub URL 依赖：

```
用户执行
npx -p github:jussker/wenyan-mcp -- wenyan-mcp
         │
         ▼
npm 下载 GitHub tarball（HEAD commit 的 git archive）
         │
         ▼
解压到 _npx/<hash>/node_modules/@wenyan-md/mcp/
         │
         ├─ 运行该包的 postinstall（在包目录内运行）
         │   process.cwd() = node_modules/@wenyan-md/mcp/
         │
         └─ 也运行 prepare（在 npm pack 的临时构建目录运行，与上面不同！）
                process.cwd() = /tmp/npm-pack-xxxxx/package/
```

**关键差异（Crucial Difference）**：

- `prepare` 运行时：当前目录是**整个源码树**的临时拷贝，`scripts/`、`src/`、`libs/` 全都在。
- `postinstall` 运行时：当前目录是**安装后的包目录**，只有 `"files"` 字段声明的内容。

这意味着同一行 `node ./scripts/prepare.mjs`：
- 在 `prepare` 里 → 找得到文件 → ✅
- 在 `postinstall` 里（若 `scripts/` 不在 `"files"` 里）→ 找不到文件 → ❌

---

## 陷阱一：`dist/` 被 gitignore

### 表现

`postinstall` 报 `ERR_MODULE_NOT_FOUND` 或构建失败，日志里看到 vite/tsc 尝试安装 devDeps 后仍失败。

### 根因

`.gitignore` 里有 `dist/`，GitHub tarball = git archive，不包含 gitignored 文件。
安装包里没有 `dist/`，`"bin"` 指向的 `dist/index.js` 不存在（`.bin/wenyan-mcp` 也不会被创建）。

### 修复

```diff
# .gitignore
- dist/
```

然后 `git add dist/ && git commit`，把构建产物纳入版本控制。

### 惯性认知陷阱 (Mental Model Trap)

> "dist/ 不应该提交，应该构建时生成"

对 npm registry 包（`npm publish`）成立—— `npm publish` 会执行 `prepare` 然后打 tarball，dist/ 自然存在。

对 GitHub URL 安装**不成立**——GitHub tarball 直接来自 git archive，构建步骤不在下载链路里。除非 `postinstall` 能完整重建，否则必须提交 dist/。

---

## 陷阱二：`postinstall` 的 `process.cwd()` 语义

### 表现

`scripts/prepare.mjs` 能被找到，开始执行，但内部调用 `ensureCoreDist()` 等依赖相对路径的函数时，找不到 `node_modules/@wenyan-md/core`、`libs/wenyan-core` 等目录。

### 根因

`ensureCoreDist()` 里类似：

```js
const coreDir = path.join(process.cwd(), "node_modules", "@wenyan-md", "core");
```

本地开发时 `process.cwd()` = 项目根目录，`node_modules/@wenyan-md/core` 存在。

`postinstall` 运行时 `process.cwd()` = `<npx-cache>/<hash>/node_modules/@wenyan-md/mcp/`，
往下拼 `node_modules/@wenyan-md/core` 路径 → 根本不存在。

### 修复

**早退出 = 完全退出**，不碰任何依赖 `cwd` 的函数：

```js
function main() {
  const distIndex = path.join(process.cwd(), "dist", "index.js");
  if (exists(distIndex)) {
    log("dist already present, skip all setup");
    return; // ← 必须是裸 return，不能再调任何 cwd 路径函数
  }
  // ...
}
```

### 惯性认知陷阱

> "既然 dist/ 已存在，ensureCoreDist() 里的检查也会短路"

不对。`ensureCoreDist()` 里检查的是 `node_modules/@wenyan-md/core/dist/`，这个路径在 `postinstall` 上下文里完全是另一个目录——该目录不存在，函数不会短路，而是走"核心丢失"的错误分支。

---

## 陷阱三：`"files"` 字段打包过滤

### 表现

即使上面两个问题修复了，`postinstall: "node ./scripts/prepare.mjs"` 仍以 code: 1 失败，npm debug log 里看不到任何 prepare.mjs 的输出（脚本压根没执行）。

### 根因

`package.json` 里：

```json
"files": ["dist"]
```

`npm pack`（也是 `prepare` 阶段执行后打包的步骤）会用 `"files"` 过滤，最终 tarball 只含 `dist/`。
安装后包目录里没有 `scripts/`，`postinstall` 找 `scripts/prepare.mjs` → 文件不存在 → 直接 exit 1（Node 的 module resolution 错误）。

### 修复

方案 A（推荐）：**删除 `postinstall`**。
`prepare` 钩子在 `npm pack` 之前的临时目录运行，能访问完整源码树；安装包里已有 dist/，不需要再 postinstall。

方案 B（防御性）：在 `"files"` 里加 `"scripts"`，让脚本跟着 tarball 走：

```json
"files": ["dist", "scripts"]
```

两者结合最稳：

```json
"files": ["dist", "scripts"],
"scripts": {
  "prepare": "node ./scripts/prepare.mjs"
  // ← 无 postinstall
}
```

### 惯性认知陷阱

> "postinstall 和 prepare 都写了同一个命令，总有一个能跑"

`prepare` 跑在打包前（完整源码），`postinstall` 跑在安装后（只有 `"files"` 声明的内容）。两者的运行上下文是**完全不同的文件系统快照**，不能互相替代。

---

## 调试方法备忘（Debug Playbook）

### 1. npm debug log 不捕获脚本 stdout

`npm install` 的 debug log（`~/.npm/_logs/*.log`）只记录**脚本的退出码**，不记录脚本的 stdout/stderr。

要看实际输出：
```bash
# 手动在安装后的目录里重现
cd ~/.npm/_npx/<hash>/node_modules/@wenyan-md/mcp/
node ./scripts/prepare.mjs
```

但 postinstall 失败后 npm 会清理整个 `_npx/<hash>/`，所以要在失败前先赶紧进去。

更好的方法：手动提 tarball 测试：
```bash
mkdir /tmp/test && cd /tmp/test
curl -sL "https://codeload.github.com/user/repo/tar.gz/<sha>" | tar xz --strip-components=1
node ./scripts/prepare.mjs
```

### 2. npm cache clean --force 不清 _npx

```bash
npm cache clean --force  # ← 不清 _npx/
/bin/rm -rf ~/.npm/_npx/*  # ← 这个才清
```

### 3. npm file: 协议在 npm 11 是 symlink

```bash
npm install "file:/path/to/package"
```

npm 11 会创建 symlink 而不是拷贝 tarball。bin 链接只在 `bin` 目标文件**已存在**时才被创建；stale cache + dist/index.js 不存在 = `.bin/wenyan-mcp` 静默缺失。

### 4. TypeScript composite 模式的 tsbuildinfo 陷阱

`tsconfig.json` 里 `"composite": true` 时，`tsc` 会在 **tsconfig 所在目录**（不是 `outDir`）生成 `tsconfig.tsbuildinfo`。
下次构建时 tsc 认为"已是最新"直接 exit 0，不 emit 任何 JS 文件。

修复：构建前删除：
```js
fs.rmSync(path.join(process.cwd(), "tsconfig.tsbuildinfo"), { force: true });
```

---

## 结语

下次遇到 `postinstall: code: 1` 且日志里没有输出，**先问自己这三个问题**：

1. `"files"` 字段有没有包含 postinstall 脚本所在目录？
2. 脚本里有没有依赖 `process.cwd()` 的路径假设，在安装上下文里是否成立？
3. dist/ 有没有提交进 git（对于 GitHub URL 安装）？
