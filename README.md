# Signal Garden

一个匿名、轻松、活泼的个人静态主页，专注旅行打卡、城市散步、日常灵感和好玩的小交互。

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
- 内置四套候选风格：日落橘汽水、旧书与远方、像素游乐园、山林夜游
- 交互包括互动伙伴桃桃、点击移动、方向跟随、双栏短句与点赞、主题切换、滚动入场、出门签、旅行地图、随机推荐、轻松任务卡片、复制邮箱

## 扩展方式

- 改文案：编辑 `assets/js/data/content.js`
- 改旅行地/推荐池/城市漫游：编辑 `assets/js/data/places.js`
- 加新交互：在 `assets/js/modules/` 新建模块，并在 `assets/js/app.js` 初始化
- 加新主题：在 `assets/css/tokens.css` 增加 `body[data-theme="..."]` 变量
- 加图片素材：放入 `assets/images/`，在 HTML 或 CSS 中用相对路径引用


## Supabase 共享留言与点赞

页面在未配置 Supabase 时会继续使用浏览器 `localStorage`。要让所有访客共享留言和点赞：

1. 在 Supabase 新建项目。
2. 打开 SQL Editor，执行 `supabase/schema.sql`。
3. 在 Project Settings / API 中复制 Project URL 和 **publishable key**（旧项目也可使用 `anon` key）。
4. 编辑 `assets/js/config.js`：

```js
window.SIGNAL_GARDEN_SUPABASE = {
  url: "https://YOUR_PROJECT.supabase.co",
  publishableKey: "YOUR_PUBLISHABLE_OR_ANON_KEY"
};
```

浏览器端绝不能填写 `service_role` 或 secret key。共享数据包括站主点亮足迹、旅行地留言、“我也去过”累计点赞和短句累计点赞。访客只能查看站主足迹；使用 GitHub 账号 `lwy100` 登录后才能修改点亮状态。


### GitHub 站主登录设置

1. 在 Supabase Dashboard 打开 **Authentication → Providers → GitHub** 并启用。
2. 按页面提示在 GitHub 创建 OAuth App，将 GitHub Client ID 和 Client Secret 填回 Supabase。
3. GitHub OAuth App 的 Authorization callback URL 使用 Supabase GitHub Provider 页面展示的 callback URL，通常是：

```text
https://你的项目ID.supabase.co/auth/v1/callback
```

4. 在 Supabase **Authentication → URL Configuration** 设置：
   - Site URL：`https://lwy100.github.io/origin_l/`
   - Redirect URLs：`http://127.0.0.1:4173/**` 和 `https://lwy100.github.io/origin_l/**`
5. 在 `assets/js/config.js` 中保持：

```js
ownerGithubLogin: "lwy100"
```

网页中的“GitHub 站主登录”会跳转 GitHub 授权。`supabase/schema.sql` 的 RLS 根据 GitHub 用户名限制只有 `lwy100` 可以写入 `owner_visits`。
