import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";

if (process.platform !== "darwin") throw new Error("此脚本仅用于 macOS。");

const project = fileURLToPath(new URL("../", import.meta.url));
const label = "cn.liushengxing.portfolio.preview";
const domain = `gui/${process.getuid()}`;
const service = `${domain}/${label}`;
const stateDir = join(project, ".preview");
const logDir = join(homedir(), "Library/Logs/LiuShengxingPortfolio");
const logPath = join(logDir, "vite.log");
const agentDir = join(homedir(), "Library/LaunchAgents");
const plistPath = join(agentDir, `${label}.plist`);
const vite = join(project, "node_modules/vite/bin/vite.js");
const xml = (value) => value.replace(/[<>&'\"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]);
const run = (...args) => execFileSync("/bin/launchctl", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
let loaded = false;
try { run("print", service); loaded = true; } catch {}

if (!existsSync(vite)) throw new Error("请先安装项目依赖。");
mkdirSync(stateDir, { recursive: true });
mkdirSync(agentDir, { recursive: true });
mkdirSync(logDir, { recursive: true });

const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>${label}</string>
  <key>ProgramArguments</key><array>
    <string>${xml(process.execPath)}</string><string>${xml(vite)}</string>
    <string>--host</string><string>127.0.0.1</string>
    <string>--port</string><string>5173</string><string>--strictPort</string>
  </array>
  <key>WorkingDirectory</key><string>${xml(project)}</string>
  <key>EnvironmentVariables</key><dict><key>PATH</key><string>${xml(dirname(process.execPath))}:/usr/bin:/bin:/usr/sbin:/sbin</string></dict>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>ThrottleInterval</key><integer>5</integer>
  <key>StandardOutPath</key><string>${xml(logPath)}</string>
  <key>StandardErrorPath</key><string>${xml(logPath)}</string>
</dict></plist>
`;
const stagedPlist = join(stateDir, `${label}.plist`);
writeFileSync(stagedPlist, plist);
execFileSync("/usr/bin/plutil", ["-lint", stagedPlist]);

// Only migrate the exact detached Vite process recorded by this project's starter.
if (!loaded && existsSync(join(stateDir, "process.pid"))) {
  const pid = Number(readFileSync(join(stateDir, "process.pid"), "utf8").trim());
  if (Number.isSafeInteger(pid) && pid > 1) {
    let command = "";
    try { command = execFileSync("/bin/ps", ["-p", String(pid), "-o", "command="], { encoding: "utf8" }).trim(); } catch {}
    const expected = `${process.execPath} ${vite} --host 127.0.0.1 --port 5173 --strictPort`;
    if (command === expected) {
      process.kill(pid, "SIGTERM");
      for (let attempt = 0; attempt < 30; attempt++) {
        try { process.kill(pid, 0); } catch { break; }
        await delay(100);
      }
    }
  }
}

const changed = !existsSync(plistPath) || readFileSync(plistPath, "utf8") !== plist;
if (loaded && changed) { run("bootout", service); loaded = false; }
if (changed) writeFileSync(plistPath, plist, { mode: 0o644 });
run("enable", service);
if (!loaded) run("bootstrap", domain, plistPath);
run("kickstart", service);

for (let attempt = 0; attempt < 60; attempt++) {
  const status = run("print", service);
  const pid = status.match(/\n\s*pid = (\d+)/)?.[1];
  if (pid) {
    try {
      const response = await fetch("http://127.0.0.1:5173/", { signal: AbortSignal.timeout(1000) });
      if (response.ok && (await response.text()).includes("刘圣星")) {
        console.log(`作品集预览服务已就绪，PID ${pid}。\n登录后自动启动，退出后自动恢复：http://127.0.0.1:5173/`);
        process.exit(0);
      }
    } catch {}
  }
  await delay(250);
}
throw new Error(`服务启动后未通过检查，请查看 ${logPath}`);
