# 刘圣星个人作品集

基于 React + Vite 的本地作品集基础版。深黑与灰绿色为底色，浅绿色用于交互强调，桌面版心最大 1700px。

## 预览

当前地址：<http://127.0.0.1:5173/>。

本机预览已改由 macOS 用户后台服务管理：登录后自动启动，进程退出后自动恢复，仅监听本机 `127.0.0.1:5173`。关闭终端或 Codex 不会停止此服务。电脑关机或休眠时无法访问，唤醒并登录后再打开上述地址。

也可以双击 `启动预览.command`，它会检查并恢复服务，再打开浏览器。后台服务日志保存在 `~/Library/Logs/LiuShengxingPortfolio/vite.log`；普通后台预览日志保存在 `.preview/vite.log`。

服务配置位于 `~/Library/LaunchAgents/cn.liushengxing.portfolio.preview.plist`。更换项目位置或 Node 路径后，使用当前 Node 运行 `node scripts/install-preview-service.mjs` 更新配置。其他电脑未安装该服务时，双击启动脚本仍会使用普通后台预览。

如需停止预览并关闭登录启动，可在终端执行以下两行；以后双击启动脚本会重新启用：

```sh
launchctl disable "gui/$(id -u)/cn.liushengxing.portfolio.preview"
launchctl bootout "gui/$(id -u)/cn.liushengxing.portfolio.preview"
```

安装了 Node.js 20.19+ 或 22.12+ 的电脑也可以运行：

```sh
npm install
npm run dev
```

生产构建：

```sh
npm run build
npm run preview
```

构建文件位于 `dist/`。本次交付为本地预览，未部署到公网。

### Cloudflare Pages 部署

构建命令填写 `npm run build`，输出目录填写 `dist`。Pages 的限制是每个文件最多 25 MiB，整个网站可以大于 25 MiB。三段大视频已使用完整时长的网页压缩版，每段约 23 MiB；案例保留原 AAC 音轨，背景视频保持静音。更新后的 `public/media/` 文件需要一起同步到部署仓库。

每次构建结束会自动运行 `scripts/check-assets.mjs`，超过限制时列出具体文件并停止。也可运行 `node scripts/check-assets.mjs public` 提前检查源素材。

`scripts/optimize-media-for-pages.py` 使用 FFmpeg 两遍编码压缩三段视频，默认读取 `.preview/media-tools/bin/` 中的 FFmpeg/FFprobe，也可通过 `PORTFOLIO_FFMPEG`、`PORTFOLIO_FFPROBE` 指定路径。转换前的网页版本保存在 `.preview/pages-media/`，用户原始视频保持不变；备份和工具已被 Git 忽略，不会进入部署。重新运行 `scripts/prepare-video-cases.py` 也会调用这一步，避免再次生成超限素材。

## 页面与功能

- 全屏首页：《地下世界》完整视频的静音循环背景、身份介绍、导航、作品入口和视频暂停按钮。
- 视频案例：位于首页之后的第二屏，展示《东南亚人口贩卖升级》（3:20）和《日本经济崩盘》（3:32）两支完整作品。首页按钮和导航直达案例区，点击后加载带原声的视频播放器，支持进度、音量和全屏；关闭后恢复之前的首页背景播放状态。磨砂导航从新第二屏开始吸顶。
- 个人经历：原作品集人物形象、介绍、联系方式、数据、可展开的 4 段工作经历。
- 精选项目：4 个项目、分类筛选、项目详情弹窗、历史图片大图查看。
- 业绩证明：在精选项目下完整收录 59 张截图与照片，按账号与榜单（14）、星图商单（11）、视频带货（11）、收入证明（15）、自媒体教学（3）、项目与荣誉（5）分类；支持分批加载、放大、方向键切换与查看原图，项目详情提供相关分类入口。
- 个人优势：AI 工作流、内容编导、账号增长、商业策划。
- 整屏联系页：邮件链接、电话链接、复制联系方式、返回顶部。
- 响应式布局、键盘焦点、Escape 关闭详情、减少动态效果偏好支持。

## 后续修改入口

- `src/content.js`：联系方式、经历、项目数据与能力介绍。
- `src/main.jsx`：模块结构、首页和联系页文案、交互。
- `src/styles.css`：色彩、字体、布局、尺寸和响应式断点。
- `public/media/`：站内使用的图片与背景视频。
- `src/EvidenceGallery.jsx`：业绩证明分类、图片列表与查看器。
- `src/VideoCases.jsx`、`src/video-cases.css`：视频案例卡片、播放器及样式。
- `public/media/video-cases/`：两支案例视频的网页版本及真实画面封面。
- `src/evidence-data.json`：全部业绩图片的来源、分类与文件清单。
- `public/evidence/`：业绩图片原件与轻量缩略图。
- `scripts/import-evidence.py`：重新导入业绩目录中的图片并生成清单与缩略图，需要 Python 和 Pillow。

首页背景为 `public/media/hero-underground.mp4`，`hero-underground-poster.webp` 是加载前的封面。视频由用户提供的《地下世界》转为 H.264 MP4，保留完整约 3 分 45 秒时长，720 × 1280、24 fps、无音轨，并启用 faststart。竖屏画面在头图中居中裁切铺满，配合原有暗色遮罩；源 MOV 文件未修改。两支案例网页版本同为 720 × 1280、24 fps，保留完整时长与原声音轨。

## 素材和数据来源

- 经历与成果以用户提供的 `个人简历(Boss10.19）2026.docx` 当前文件为准，不沿用旧版本的求职定位。
- 人物图、账号、商单和课程截图取自 `个人简介作品集2026.pptx`。旧版宇宙封面继续作为项目卡片素材保留。
- 首页背景视频取自 `/Users/liuxing/Downloads/碎片記/已发/地下一万米/地下世界.mov`，封面截自同一作品。
- 视频案例取自用户提供的 `/Users/liuxing/Downloads/剪辑项目/成品/8月/贩卖升级.mp4` 和 `日本碰盘.mp4`，展示标题按用户指定，分别为《东南亚人口贩卖升级》《日本经济崩盘》。网页视频保留完整时长和声音，原文件未修改。
- 品牌沟通会议照片取自 `业绩证明/项目截图/IMG_3484.JPG`，保留正确方向。
- 数字保留原项目口径：公司全网粉丝、特定账号项目粉丝、商单合作数量分别标注，未相加。
- 项目记录为历史截图，不能理解为实时后台数据。卡片上的排版为本次网站展示设计。
- 根据补齐截图的要求，已将 `业绩证明/` 六个分类中的全部 59 张图片加入本地网站，保留原图并生成缩略图；未包含该目录中的 PDF 和视频，也未加入原始完整简历。
- 年龄在简历与旧作品集中不一致，因此本版不展示年龄；经历日期按简历保留。

字体优先使用 Manrope（Google Fonts），加载失败时回退到本地中文系统字体。图片与视频均从本地站点加载。

开发服务启用文件轮询，以兼容当前环境的文件监听。正常启动后修改源码会自动更新。
