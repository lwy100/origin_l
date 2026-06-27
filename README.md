# Signal Garden

一个匿名、轻松、活泼的个人静态主页。页面只简单透露“大模型背景”，重点放在旅行打卡、好玩的小交互和可继续扩展的个人表达上。

## 快速开始

```bash
python3 -m http.server 4173
```

然后访问：

```text
http://127.0.0.1:4173/
```

## 项目结构

```text
index.html                 # 页面结构
assets/css/main.css        # 样式入口
assets/css/tokens.css      # 主题变量
assets/css/base.css        # 基础样式
assets/css/layout.css      # 页面布局
assets/css/components.css  # 组件样式
assets/js/app.js           # 脚本入口
assets/js/data/content.js  # 可编辑文案数据
assets/js/data/places.js   # 旅行目的地数据
assets/js/modules/         # 交互模块
docs/ARCHITECTURE.md       # 架构说明
```

## 当前内容

- 默认不展示真实姓名
- 联系邮箱：`1142516819@qq.com`
- 内置四套候选风格：霓虹训练场、纸上实验室、像素游乐园、水墨终端
- 交互包括主题切换、出门签、旅行实验室、随机推荐、轻松任务卡片、复制邮箱

## 扩展方式

- 改文案：编辑 `assets/js/data/content.js`
- 改旅行地/推荐池/城市漫游：编辑 `assets/js/data/places.js`
- 加新交互：在 `assets/js/modules/` 新建模块，并在 `assets/js/app.js` 初始化
- 加新主题：在 `assets/css/tokens.css` 增加 `body[data-theme="..."]` 变量
- 加图片素材：放入 `assets/images/`，在 HTML 或 CSS 中用相对路径引用
