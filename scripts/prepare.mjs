import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execSync } from "node:child_process";

function run(command, cwd = process.cwd(), envExtra = {}) {
  execSync(command, {
    cwd,
    stdio: "inherit",
    env: {
      ...process.env,
      ...envExtra
    }
  });
}

function exists(filePath) {
  return fs.existsSync(filePath);
}

function ensureCoreDist() {
  const coreDir = path.join(process.cwd(), "node_modules", "@wenyan-md", "core");
  if (!exists(coreDir)) {
    throw new Error("@wenyan-md/core is not installed in node_modules");
  }

  const requiredFiles = [
    path.join(coreDir, "dist", "wrapper.js"),
    path.join(coreDir, "dist", "wechat.js"),
    path.join(coreDir, "dist", "types", "node", "wrapper.d.ts")
  ];

  if (requiredFiles.every(exists)) {
    console.log("[prepare] core dist is ready");
    return;
  }

  console.warn("[prepare] core dist missing, attempting auto-build");

  const coreSrcDir = path.join(coreDir, "src");
  if (exists(coreSrcDir)) {
    // Build in-place when source code is present in node_modules package.
    run("npm install --include=dev --no-audit --no-fund", coreDir, {
      PUPPETEER_SKIP_DOWNLOAD: process.env.PUPPETEER_SKIP_DOWNLOAD ?? "1"
    });
    run("npm run build", coreDir, {
      PUPPETEER_SKIP_DOWNLOAD: process.env.PUPPETEER_SKIP_DOWNLOAD ?? "1"
    });
    if (requiredFiles.every(exists)) {
      console.log("[prepare] core dist generated in node_modules");
      return;
    }
  }

  // Offline-first fallback: reuse local submodule build artifacts if available.
  const localCoreDist = path.join(process.cwd(), "libs", "wenyan-core", "dist");
  if (exists(localCoreDist)) {
    fs.mkdirSync(path.join(coreDir, "dist"), { recursive: true });
    fs.cpSync(localCoreDist, path.join(coreDir, "dist"), { recursive: true, force: true });
    if (requiredFiles.every(exists)) {
      console.log("[prepare] core dist copied from local submodule");
      return;
    }
  }

  // Fallback: clone fork repo, build dist, then copy dist into installed package.
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "wenyan-core-build-"));
  const cloneDir = path.join(tempRoot, "wenyan-core");

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

    console.log("[prepare] core dist generated from fork fallback build");
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

function main() {
  ensureCoreDist();
  run("npx tsc -p tsconfig.json --pretty false");
}

main();
