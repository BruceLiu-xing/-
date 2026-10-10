import { readdir, stat } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const limit = 25 * 1024 * 1024;
const assetDirectory = process.argv[2]
  ? resolve(process.argv[2])
  : fileURLToPath(new URL("../dist/", import.meta.url));

function formatSize(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MiB（${bytes.toLocaleString("en-US")} 字节）`;
}

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(path)));
    } else if (entry.isFile()) {
      files.push({
        path: relative(assetDirectory, path),
        size: (await stat(path)).size,
      });
    }
  }
  return files;
}

try {
  if (process.argv.length > 3) {
    throw new Error("用法：node scripts/check-assets.mjs [待检查目录]");
  }
  const files = await collectFiles(assetDirectory);
  const total = files.reduce((sum, file) => sum + file.size, 0);
  const largest = files.reduce(
    (maximum, file) => (!maximum || file.size > maximum.size ? file : maximum),
    null,
  );
  const oversized = files.filter((file) => file.size > limit);

  console.log(`资源目录：${assetDirectory}`);
  console.log(`文件数：${files.length}；总大小：${formatSize(total)}`);
  console.log(
    largest
      ? `最大文件：${largest.path} — ${formatSize(largest.size)}`
      : "最大文件：无（目录为空）",
  );

  if (oversized.length) {
    console.error(
      `检查失败：${oversized.length} 个文件超过 Cloudflare Pages 单文件 25 MiB 限制。`,
    );
    for (const file of oversized) {
      console.error(`- ${file.path} — ${formatSize(file.size)}`);
    }
    process.exitCode = 1;
  } else {
    console.log("检查通过：所有文件均不超过 Cloudflare Pages 单文件 25 MiB 限制。");
  }
} catch (error) {
  console.error(`资源大小检查失败：${error.message}`);
  process.exitCode = 1;
}
