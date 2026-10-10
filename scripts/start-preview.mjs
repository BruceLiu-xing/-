import { execFileSync, spawn } from "node:child_process";
import { closeSync, existsSync, mkdirSync, openSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";

const project = fileURLToPath(new URL("../", import.meta.url));
const url = "http://127.0.0.1:5173/";
const stateDir = join(project, ".preview");
const logPath = join(stateDir, "vite.log");
const label = "cn.liushengxing.portfolio.preview";
const plistPath = join(homedir(), "Library/LaunchAgents", `${label}.plist`);

async function isReady() {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(1000) });
    return response.ok && (await response.text()).includes("刘圣星");
  } catch {
    return false;
  }
}

if (process.platform === "darwin" && existsSync(plistPath) && !process.argv.includes("--standalone")) {
  const domain = `gui/${process.getuid()}`;
  const service = `${domain}/${label}`;
  const launchctl = (...args) => execFileSync("/bin/launchctl", args, { stdio: ["ignore", "pipe", "pipe"] });
  launchctl("enable", service);
  let loaded = false;
  try { launchctl("print", service); loaded = true; } catch {}
  if (!loaded) launchctl("bootstrap", domain, plistPath);
  launchctl("kickstart", service);
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    if (await isReady()) { ready = true; break; }
    await delay(250);
  }
  if (!ready) throw new Error(`预览服务尚未就绪，请检查 ${join(homedir(), "Library/Logs/LiuShengxingPortfolio/vite.log")}`);
  console.log(`作品集预览服务已就绪：${url}\n由 macOS 管理，登录后自动启动，服务退出后自动恢复。`);
} else if (await isReady()) {
  console.log(`作品集预览已在运行：${url}`);
} else {
  mkdirSync(stateDir, { recursive: true });
  const log = openSync(logPath, "a");
  const server = spawn(process.execPath, [join(project, "node_modules/vite/bin/vite.js"), "--host", "127.0.0.1", "--port", "5173", "--strictPort"], {
    cwd: project,
    detached: true,
    stdio: ["ignore", log, log],
    env: { ...process.env, PATH: `${dirname(process.execPath)}:${process.env.PATH ?? ""}` },
  });
  closeSync(log);
  await new Promise((resolve, reject) => {
    server.once("spawn", resolve);
    server.once("error", reject);
  });
  server.unref();
  writeFileSync(join(stateDir, "process.pid"), `${server.pid}\n`);

  let ready = false;
  for (let attempt = 0; attempt < 40; attempt++) {
    if (await isReady()) {
      ready = true;
      break;
    }
    await delay(250);
  }
  if (!ready) {
    console.error(readFileSync(logPath, "utf8").split("\n").slice(-15).join("\n"));
    throw new Error(`预览启动失败，请检查 ${logPath}`);
  }
  console.log(`作品集预览已在后台启动：${url}\n关闭终端窗口不会停止预览。`);
}
