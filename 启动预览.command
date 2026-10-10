#!/bin/zsh
set -e
cd "$(dirname "$0")"

if /usr/bin/curl --silent --fail --max-time 2 http://127.0.0.1:5173/ | /usr/bin/grep -q '刘圣星'; then
  print '作品集预览已在运行：http://127.0.0.1:5173/'
  /usr/bin/open 'http://127.0.0.1:5173/'
  exit 0
fi

if command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1; then
  if [[ ! -d node_modules ]]; then npm install; fi
  portfolio_node="$(command -v node)"
else
  portfolio_runtime="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies"
  if [[ -x "$portfolio_runtime/node/bin/node" && -x "$portfolio_runtime/bin/fallback/pnpm" ]]; then
    export PATH="$portfolio_runtime/node/bin:$PATH"
    if [[ ! -d node_modules ]]; then "$portfolio_runtime/bin/fallback/pnpm" install; fi
    portfolio_node="$portfolio_runtime/node/bin/node"
  else
    print '请安装 Node.js 20.19+ 或 22.12+，然后在此目录执行 npm install 和 npm run dev。'
    read -k 1 '?按任意键关闭。'
    exit 1
  fi
fi

"$portfolio_node" scripts/start-preview.mjs
/usr/bin/open 'http://127.0.0.1:5173/'
