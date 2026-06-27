# Repository Guidelines

## 项目结构与模块组织

本仓库是一个无依赖的静态个人网页项目。主入口是 `index.html`。样式从 `assets/css/main.css` 进入，并拆分为 `tokens.css`、`base.css`、`layout.css`、`components.css`。脚本从 `assets/js/app.js` 进入，交互模块位于 `assets/js/modules/`，可编辑文案数据位于 `assets/js/data/content.js`，旅行目的地、推荐池和城市漫游数据位于 `assets/js/data/places.js`。图片和后续静态素材放入 `assets/images/`。架构说明见 `docs/ARCHITECTURE.md`。

当前主页定位是匿名的有大模型背景的年轻人展示页，品牌名为 `Signal Garden`。页面不展示真实姓名，公开联系邮箱为 `1142516819@qq.com`。核心内容包括四套视觉主题、旅行实验室、随机推荐、轻松任务卡片和联系卡片。

## 构建、测试与本地开发命令

本项目不需要安装依赖，也没有构建步骤。常用命令如下：

```bash
python3 -m http.server 4173
```

在本地启动静态服务器，通过 `http://127.0.0.1:4173/` 预览页面。

```bash
python3 - <<'PY'
from html.parser import HTMLParser
HTMLParser().feed(open('index.html').read())
print('index.html: ok')
PY
```

用于进行轻量 HTML 解析检查。发布时将变更推送到 `main` 分支，GitHub Pages 会从 `main` 分支发布。

## 编码风格与命名规范

除非明确要求，否则保持纯 HTML、CSS、JavaScript 实现，不引入打包工具或前端框架。HTML/CSS/JS 使用两个空格缩进。优先使用语义化 HTML、清晰的 class 命名，以及 CSS 变量维护颜色和通用样式。界面文案默认使用中文；如果已有双语设计，可保留英文作为辅助。保持年轻、技术感、活泼但专业的视觉方向。

新增主题时，在 `assets/css/tokens.css` 中添加 `body[data-theme="..."]` 变量，并在首页主题卡片中补充对应按钮。新增交互时，优先在 `assets/js/modules/` 新建独立模块，再由 `assets/js/app.js` 初始化。新增可变文案时，优先放入 `assets/js/data/content.js`，避免把数据写死在交互逻辑中。

## 测试指南

当前没有自动化测试框架。提交前应启动本地服务器并在浏览器中检查页面。重点验证：移动端菜单、主题切换、出门签、旅行实验室、随机推荐、轻松任务卡片、复制邮箱、响应式布局和 GitHub Pages 路径兼容性。如果新增较多 JavaScript，请拆分为 `assets/js/modules/` 下的具名模块，并在 PR 或提交说明中写明手动测试内容。

## Commit 与 Pull Request 规范

提交信息保持简短、祈使句、聚焦单一变更，例如 `Build personal living room site`。PR 应包含变更摘要、视觉改动截图或录屏、手动测试说明，以及是否影响 GitHub Pages 发布。

## Agent 专用说明

默认使用中文回复用户。不要覆盖用户未要求修改的内容。保持项目简单、静态、兼容 GitHub Pages。用户要求发布时，先检查 Git 状态和变更文件，再提交并推送到 `main`。

不要重新引入根目录 `styles.css` 或 `script.js`；它们已迁移到 `assets/css/` 和 `assets/js/`。修改架构时同步更新 `README.md` 与 `docs/ARCHITECTURE.md`。涉及个人信息时，继续保持匿名展示，不要加入真实姓名或公司敏感信息。
