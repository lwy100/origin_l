# Signal Garden 当前设计与改动备忘

> 这是仅供本地 Agent 使用的项目备忘，不参与 Git 版本控制。正式仓库规范仍以 `AGENTS.md` 为准。

## 1. 项目定位

- 品牌：`Signal Garden`
- 类型：无依赖、纯 HTML/CSS/JavaScript 的 GitHub Pages 静态个人主页
- 内容方向：匿名的旅行、城市散步、生活兴趣和轻松互动
- 不展示：真实姓名、工作经历、公司信息、大模型或技术背景
- 公开联系邮箱：`1142516819@qq.com`
- 线上地址：`https://lwy100.github.io/origin_l/`

## 2. 主要视觉设计

- 整体为年轻、自然、松弛、有编辑感的个人数字客厅。
- 默认配色以浅灰米白背景、深绿黑文字和珊瑚橙强调色为主。
- 避免模板化 AI 紫色渐变、过量玻璃卡片和简历式表达。
- 首屏使用不对称双栏：左侧大标题，右侧桃桃互动花园。
- 四套可切换主题：
  1. 日落橘汽水 `neon`
  2. 旧书与远方 `paper`
  3. 像素游乐园 `pixel`
  4. 山林夜游 `ink`
- 山林夜游主题中的“换一句”按钮必须保持浅色实心背景和深色文字，避免低对比度。
- 右下短句卡使用两个无可见文字的色块切换栏目：珊瑚橙为旷野类短句，淡紫为含蓄诗句；保留隐藏标签、换一句和点赞。

## 3. 桃桃互动伙伴

### 资源

- 配置：`assets/pets/taotao/pet.json`
- 精灵图：`assets/pets/taotao/spritesheet.webp`
- 状态机：`assets/js/modules/pet.js`

### 交互规则

- 使用 Codex Pet v2 的 8x11 精灵图。
- 鼠标移动时按 16 个方向跟随。
- 原图左侧方向不准确，左向视觉使用右向帧实时镜像补齐。
- 鼠标停止 0.8 秒后恢复正面帧，气泡显示“桃桃正看着你”。
- 状态气泡嵌入人物容器，始终跟随人物并保持在头顶约 7-8px。
- 点击活动框空白位置，桃桃使用左右行走动画移动到目标位置。
- 移动目标受右下短句卡安全边界限制，不能被卡片遮挡。
- 点击桃桃随机触发挥手、跳跃或等待。
- 顶部按钮支持打招呼、一起玩、看地图。
- 出门签、主题切换、旅行推荐和地点互动会联动桃桃状态。
- 桌面端和移动端都不得出现工具栏、状态气泡、短句卡与桃桃重叠。

## 4. 旅行地图权限设计

- `点亮足迹` 表示站主本人真实去过的地点。
- 点亮结果存入 Supabase `owner_visits`，所有访客可读。
- 普通访客只能看到：
  - `站主已点亮 ✓`
  - `站主还没去`
- 普通访客看不到可操作的“点亮足迹”按钮。
- 只有站主通过 `1142516819@qq.com` 的 Supabase Magic Link 登录后，才显示点亮/取消点亮按钮。
- 数据库 RLS 必须同时限制 `owner_visits` 只有该邮箱可以 insert/delete，不能只依靠前端隐藏按钮。
- 访客可操作“我也去过”，该数据为所有人可见的累计人数。
- 顶部统计的“已点亮”读取站主共享足迹，而不是当前访客的 localStorage。

## 5. Supabase 数据设计

### 配置

- 前端公开配置：`assets/js/config.js`
- REST/Auth 客户端：`assets/js/modules/supabase.js`
- 数据库脚本：`supabase/schema.sql`
- 浏览器端只能使用 Project URL 和 publishable/anon key。
- 绝不能提交或使用 `service_role`、secret key、数据库密码。

### 表与数据

- `owner_visits`：站主共享点亮足迹，公开读、指定站主邮箱认证后写
- `place_comments`：公开地点留言
- `place_likes`：访客“我也去过”记录
- `quote_likes`：短句点赞记录
- `place_like_counts` / `quote_like_counts`：公开累计数量视图
- 访客以浏览器生成的 UUID 标识自己的点赞状态。
- Supabase 未配置或网络异常时，留言和点赞降级到 localStorage；站主共享点亮需要 Supabase。

### Supabase 后台要求

- 在 SQL Editor 执行最新版 `supabase/schema.sql`。
- Authentication / URL Configuration：
  - Site URL：`https://lwy100.github.io/origin_l/`
  - Redirect URLs：
    - `https://lwy100.github.io/origin_l/**`
    - `http://127.0.0.1:4173/**`
- 站主登录入口位于旅行地图标题区域。

## 6. 核心模块

- `assets/js/modules/pet.js`：桃桃方向、状态、点击移动
- `assets/js/modules/travelLab.js`：旅行地图、站主点亮、访客点赞、留言
- `assets/js/modules/quotes.js`：短句切换和共享点赞
- `assets/js/modules/supabase.js`：Supabase REST、Auth、Magic Link 和会话
- `assets/js/modules/recommendations.js`：热门目的地和城市漫游推荐
- `assets/js/modules/reveal.js`：滚动入场
- `assets/js/data/content.js`：出门签、轻任务和短句池
- `assets/js/data/places.js`：旅行地点与推荐数据

## 7. 修改与验证注意事项

- 保持纯静态实现，不引入 npm、框架或构建步骤。
- 修改交互后更新入口资源版本号，避免 GitHub Pages/浏览器缓存旧 ES Module。
- 重点手动验证：
  - 普通访客无法点亮站主足迹
  - 站主 Magic Link 登录后可以点亮/取消
  - 其他访客能看到站主最新点亮状态
  - “我也去过”、留言和短句点赞为共享累计数据
  - 桃桃 16 方向跟随、0.8 秒回正、点击移动、气泡头顶跟随
  - 桃桃不能移动到短句卡下方
  - 山林夜游“换一句”清晰可见
  - 移动端菜单、布局、按钮和卡片无重叠、无横向溢出
- 常用检查：

```bash
python3 -m http.server 4173
```

```bash
python3 - <<'PY'
from html.parser import HTMLParser
HTMLParser().feed(open('index.html').read())
print('index.html: ok')
PY
```

```bash
for f in assets/js/app.js assets/js/config.js assets/js/modules/*.js assets/js/data/*.js; do
  node --check "$f" || exit 1
done
```
