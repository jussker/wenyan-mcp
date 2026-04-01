import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execSync } from "node:child_process";

function now() {
  return new Date().toISOString();
}

function log(message) {
  console.log(`[prepare][${now()}] ${message}`);
}

function run(command, cwd = process.cwd(), envExtra = {}) {
  const startedAt = Date.now();
  log(`run:start cwd=${cwd} cmd=${command}`);
  try {
    execSync(command, {
      cwd,
      stdio: "inherit",
      env: {
        ...process.env,
        ...envExtra
      }
    });
    const elapsedMs = Date.now() - startedAt;
    log(`run:done  cwd=${cwd} cmd=${command} elapsedMs=${elapsedMs}`);
  } catch (error) {
    const elapsedMs = Date.now() - startedAt;
    log(`run:fail  cwd=${cwd} cmd=${command} elapsedMs=${elapsedMs}`);
    throw error;
  }
}

function exists(filePath) {
  return fs.existsSync(filePath);
}

function isInstalledPackageContext() {
  const cwd = process.cwd();
  return cwd.includes(`${path.sep}node_modules${path.sep}@wenyan-md${path.sep}mcp`);
}

function buildLocalCoreIfAvailable() {
  const localCoreRoot = path.join(process.cwd(), "libs", "wenyan-core");
  const localCorePackage = path.join(localCoreRoot, "package.json");
  if (!exists(localCorePackage)) {
    log(`core:local package missing, skip local core build path=${localCorePackage}`);
    return false;
  }

  log(`core:build local workspace package path=${localCoreRoot}`);
  run("npm install --ignore-scripts --no-audit --no-fund", localCoreRoot, {
    PUPPETEER_SKIP_DOWNLOAD: process.env.PUPPETEER_SKIP_DOWNLOAD ?? "1"
  });
  run("npm run build", localCoreRoot, {
    PUPPETEER_SKIP_DOWNLOAD: process.env.PUPPETEER_SKIP_DOWNLOAD ?? "1"
  });

  const localCoreDist = path.join(localCoreRoot, "dist");
  const hasLocalCoreDist = exists(localCoreDist);
  log(`core:build local done dist=${localCoreDist} exists=${hasLocalCoreDist}`);
  return hasLocalCoreDist;
}

function ensureCoreDist() {
  const coreDir = path.join(process.cwd(), "node_modules", "@wenyan-md", "core");
  log(`core:check node_modules path=${coreDir}`);
  if (!exists(coreDir)) {
    log("core:missing in node_modules; bootstrap install deps with ignore-scripts");
    run("npm install --ignore-scripts --no-audit --no-fund", process.cwd(), {
      PUPPETEER_SKIP_DOWNLOAD: process.env.PUPPETEER_SKIP_DOWNLOAD ?? "1"
    });
    if (exists(coreDir)) {
      log("core:bootstrap install completed and core is now available");
    } else {
      throw new Error("@wenyan-md/core is not installed in node_modules after bootstrap install");
    }
  }

  buildLocalCoreIfAvailable();

  const localCoreDist = path.join(process.cwd(), "libs", "wenyan-core", "dist");
  const hasLocalCoreDist = exists(localCoreDist);
  log(`core:check local dist path=${localCoreDist} exists=${hasLocalCoreDist}`);

  const requiredFiles = [
    path.join(coreDir, "dist", "wrapper.js"),
    path.join(coreDir, "dist", "wechat.js"),
    path.join(coreDir, "dist", "types", "node", "wrapper.d.ts")
  ];

  // Prefer local submodule artifacts when available, so local fixes override remote tarball dist.
  if (hasLocalCoreDist) {
    log("core:branch local-submodule-dist");
    fs.mkdirSync(path.join(coreDir, "dist"), { recursive: true });
    fs.cpSync(localCoreDist, path.join(coreDir, "dist"), { recursive: true, force: true });
    if (requiredFiles.every(exists)) {
      log("core:ready copied from local submodule");
      return true;
    }
    console.warn("[prepare] local submodule dist copy incomplete, falling back to auto-build");
  }

  if (requiredFiles.every(exists)) {
    log("core:ready already present in installed package");
    return true;
  }

  console.warn("[prepare] core dist missing, attempting auto-build");

  const coreSrcDir = path.join(coreDir, "src");
  if (exists(coreSrcDir)) {
    log(`core:branch build-in-node_modules src=${coreSrcDir}`);
    // Build in-place when source code is present in node_modules package.
    run("npm install --include=dev --no-audit --no-fund", coreDir, {
      PUPPETEER_SKIP_DOWNLOAD: process.env.PUPPETEER_SKIP_DOWNLOAD ?? "1"
    });
    run("npm run build", coreDir, {
      PUPPETEER_SKIP_DOWNLOAD: process.env.PUPPETEER_SKIP_DOWNLOAD ?? "1"
    });
    if (requiredFiles.every(exists)) {
      log("core:ready generated in node_modules");
      return true;
    }
  }

  // Fallback: clone fork repo, build dist, then copy dist into installed package.
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "wenyan-core-build-"));
  const cloneDir = path.join(tempRoot, "wenyan-core");
  log(`core:branch fallback-clone tempRoot=${tempRoot}`);

  try {
    run("git clone --depth 1 https://github.com/jussker/wenyan-core " + cloneDir);
    run("npm install --include=dev --no-audit --no-fund", cloneDir, {
      PUPPETEER_SKIP_DOWNLOAD: process.env.PUPPETEER_SKIP_DOWNLOAD ?? "1"
    });
    run("npm install --no-audit --no-fund form-data-encoder formdata-node jsdom", cloneDir, {
      PUPPETEER_SKIP_DOWNLOAD: process.env.PUPPETEER_SKIP_DOWNLOAD ?? "1"
    });
    run("npm run build", cloneDir, {
      PUPPETEER_SKIP_DOWNLOAD: process.env.PUPPETEER_SKIP_DOWNLOAD ?? "1"
    });

    const builtDist = path.join(cloneDir, "dist");
    if (!exists(builtDist)) {
      throw new Error("built dist not found from fork repository");
    }

    fs.mkdirSync(path.join(coreDir, "dist"), { recursive: true });
    fs.cpSync(builtDist, path.join(coreDir, "dist"), { recursive: true, force: true });

    if (!requiredFiles.every(exists)) {
      throw new Error("core dist copy incomplete after fallback build");
    }

    log("core:ready generated from fork fallback build");
    return true;
  } finally {
    log(`core:cleanup tempRoot=${tempRoot}`);
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

function main() {
  // Only skip setup for installed package context (node_modules path).
  // In repo development context, always rebuild to keep src and dist consistent.
  const distIndex = path.join(process.cwd(), "dist", "index.js");
  if (exists(distIndex) && isInstalledPackageContext()) {
    log("main:dist already present in installed package context, skip setup");
    return;
  }

  log("main:start ensureCoreDist");
  ensureCoreDist();
  log("main:start tsc");
  // Delete stale tsbuildinfo to force full JS emit on every build.
  // With composite:true, tsc stores tsbuildinfo at tsconfig path root (not outDir).
  // Without cleanup tsc sees "up to date" and emits nothing (exit 0, no output).
  const tsBuildInfoPath = path.join(process.cwd(), "tsconfig.tsbuildinfo");
  if (exists(tsBuildInfoPath)) {
    fs.rmSync(tsBuildInfoPath);
    log("main:cleaned stale tsbuildinfo");
  }
  const localTscBin = path.join(process.cwd(), "node_modules", ".bin", "tsc");
  if (exists(localTscBin)) {
    run(`\"${localTscBin}\" -p tsconfig.json --pretty false --emitDeclarationOnly false`);
  } else {
    log("main:tsc bin missing in node_modules, fallback to npm exec typescript");
    run("npm exec --yes --package=typescript -- tsc -p tsconfig.json --pretty false --emitDeclarationOnly false");
  }
  log("main:done");
}

main();
