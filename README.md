# F1 GUIDE — F1 科普与数据站

> 为中文用户打造的 F1 赛事数据 + 科普内容 + 社区互动平台

🌐 **线上地址**：https://f1-guide.vercel.app

---

## 项目截图

![首页](https://i.imgur.com/placeholder-hero.png)

---

## 功能概览

| 页面 | 功能 |
|------|------|
| 🏠 首页 | Hero 视频区、赛季数据高亮、六大模块导航卡片 |
| 📅 赛程 | 2026 全年赛历、4格倒计时、颁奖台成绩（Jolpica API 真实数据） |
| 🏆 积分榜 | 车手榜 + 车队榜、逐站积分走势折线图（API自动计算） |
| 📚 科普 | 10个模块的B站视频（新手入门 + 进阶课堂） |
| 🏎️ 车队 | 11支车队详情、抽屉面板、历年战绩 |
| 💬 社区 | 热门辩论投票（Supabase实时）、赛场快报RSS |

---

## 技术栈

```
前端框架：React 18 + Vite 8
样式：Tailwind CSS v4
动效：Framer Motion
图表：Chart.js
地图：Leaflet
后端/数据库：Supabase（PostgreSQL + Realtime）
部署：Vercel（Edge Functions + 全球 CDN）
数据源：Jolpica API（F1 官方数据镜像，免费）
```

---

## 开发全流程记录

### 第一阶段：设计与原型（HTML 静态页面）

**做了什么：**
在开始写 React 代码之前，先用纯 HTML + CSS + JavaScript 把 6 个页面的视觉效果全部做出来，保存在 `stitch-pages/` 目录中。

**为什么这样做：**
HTML 原型改起来比 React 组件快得多，可以快速验证：
- 配色方案（最终确定：`#0D0D0D` 黑底 + `#00D2BE` 青色主色）
- 字体组合（Titillium Web 标题 + JetBrains Mono 数据）
- 交互细节（hover 效果、卡片动效、图表交互）

原型验证完毕后，HTML 文件就"锁定"了，不再修改，只作为 React 开发的视觉参考。

---

### 第二阶段：React 项目初始化

**创建项目：**
```bash
npm create vite@latest f1-guide -- --template react
cd f1-guide
npm install
```

**安装核心依赖：**
```bash
npm install framer-motion chart.js react-chartjs-2 leaflet react-leaflet
npm install react-router-dom @supabase/supabase-js
npm install tailwindcss @tailwindcss/vite
```

**项目结构：**
```
f1-guide/
├── api/                    # Vercel Serverless Functions（生产环境代理）
│   ├── img-proxy.js        # 图片代理（绕过 hotlink 保护）
│   └── rss-proxy.js        # RSS 代理（绕过 CORS 限制）
├── public/                 # 静态资源（favicon、图标）
├── src/
│   ├── components/         # 可复用组件（按页面分组）
│   ├── data/               # 静态 JSON 数据（赛历、车手、车队）
│   ├── hooks/              # 自定义 React Hook（数据获取逻辑）
│   ├── pages/              # 6 个页面组件
│   └── services/           # API 服务层（Jolpica、Supabase）
├── vercel.json             # Vercel 部署配置
└── vite.config.js          # 构建配置 + 开发环境代理
```

---

### 第三阶段：数据架构设计（双轨制）

这是整个项目最重要的技术决策。

**问题：** F1 数据 API 响应慢（2~5秒），如果等 API 返回才显示页面，用户体验很差。

**解决方案：双轨制加载**

```
用户访问页面
    │
    ├──① 立即显示静态 JSON（0ms，本地数据）
    │      用户马上看到内容，不会白屏
    │
    └──② 后台异步请求 Jolpica API（2~5秒）
           ↓
       API 返回后，用最新数据覆盖静态数据
       （用户无感知刷新）
```

**静态 JSON 数据（`src/data/`）：**
- `races2026.json` — 全年赛历（含赛道、时间、地点）
- `drivers2026.json` — 22名车手基础信息（名字、国籍、头像）
- `teams2026.json` — 11支车队信息

**Jolpica API 提供：**
- 实时积分榜（每场比赛结束后更新）
- 比赛成绩（颁奖台、最快圈速）
- 全年逐站积分走势

**24小时 localStorage 缓存：**
```javascript
// API 数据缓存到本地，24小时内不重复请求
function cacheGet(key) {
  const { data, ts } = JSON.parse(localStorage.getItem(key))
  if (Date.now() - ts > 24 * 60 * 60 * 1000) return null  // 过期
  return data
}
```

---

### 第四阶段：积分走势图（全自动计算）

**问题：** 积分走势折线图需要"每站结束后的累计积分"数组，比如 Russell 的走势：`[25, 51, 63, 80, 88, ...]`。这个数据 API 不直接提供。

**解决方案：** 用一个 API 请求拿全年所有比赛成绩，自己计算累积积分。

```javascript
// 一次请求拿全年成绩（正赛 + 冲刺赛同时并发）
const [mainRes, sprintRes] = await Promise.all([
  fetch('/2026/results.json?limit=500'),  // 正赛
  fetch('/2026/sprint.json?limit=200'),    // 冲刺赛
])

// 按轮次排序，逐站累加积分
for (const race of sortedRaces) {
  for (const result of race.Results) {
    // 正赛积分 + 当轮冲刺积分 → 累计快照
    driverCum[code] += pts
    driverTrend[code].push(driverCum[code])
  }
}
```

**效果：** 每次新分站结束，用户刷新网站，2小时内缓存过期后自动重新计算，积分走势图完全自动更新，**无需任何手动维护**。

---

### 第五阶段：CORS 跨域问题处理

**什么是 CORS？**
浏览器出于安全考虑，不允许网页直接请求"不同域名"的资源。比如我们的网站不能直接从 `motorsport.com` 抓 RSS 新闻。

**遇到的问题：**
1. RSS 新闻 XML — 被各新闻网站的服务器拦截（403/CORS错误）
2. 新闻图片 — 被 hotlink 保护拦截（直接访问返回403）

**解决方案：服务端代理**

在**服务器端**（不是浏览器端）发起请求，服务器不受 CORS 限制：

```
浏览器 → 我们的服务器（代理）→ motorsport.com
   ↑                                    ↓
   └──── 返回 RSS 数据 ←────────────────┘
```

**开发环境：** Vite 插件中间件（Node.js）
```javascript
// vite.config.js — 本地开发时模拟代理
server.middlewares.use('/api/img-proxy', async (req, res) => {
  const imgRes = await fetch(targetUrl, { headers: { 'User-Agent': '...' } })
  res.end(Buffer.from(await imgRes.arrayBuffer()))
})
```

**生产环境：** Vercel Edge Functions
```javascript
// api/img-proxy.js — 部署到 Vercel 后自动运行
export default async function handler(request) {
  const imgRes = await fetch(targetUrl, { ... })
  return new Response(imgRes.body, { headers: { 'Cache-Control': '...' } })
}
```

开发和生产使用**完全相同的路径**（`/api/img-proxy`），切换无感知。

---

### 第六阶段：Supabase 实时投票

**技术实现：**

```sql
-- 数据库结构
CREATE TABLE debates (id, title, created_at);
CREATE TABLE debate_options (id, debate_id, label, color);
CREATE TABLE votes (id, debate_id, option_id, user_nickname, created_at,
  UNIQUE(debate_id, user_nickname)  -- 同一昵称只能投一次
);

-- 实时统计视图
CREATE VIEW vote_counts AS
  SELECT option_id, COUNT(*) as count FROM votes GROUP BY option_id;
```

**Realtime 订阅：**
```javascript
// 任何人投票后，所有在线用户的页面实时刷新
supabase.channel('votes')
  .on('postgres_changes', { event: 'INSERT', table: 'votes' }, fetchCounts)
  .subscribe()
```

---

### 第七阶段：部署上线

**构建优化（代码分割）：**
```javascript
// vite.config.js — 把大型依赖拆成独立文件，浏览器并行加载
manualChunks(id) {
  if (id.includes('chart.js'))     return 'vendor-chart'   // 168 kB
  if (id.includes('framer-motion')) return 'vendor-motion'  // 142 kB
  if (id.includes('@supabase'))    return 'vendor-db'       // 201 kB
  // ... 主业务代码只剩 277 kB（原来 971 kB）
}
```

**Vercel 配置（`vercel.json`）：**
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```
这行配置让 React 路由正常工作：用户直接访问 `/standings` 不会 404，而是返回 `index.html`，由 React Router 接管显示积分榜页面。

---

## 本地开发

```bash
# 克隆项目
git clone https://github.com/mukulee/f1-guide.git
cd f1-guide

# 安装依赖
npm install

# 复制环境变量模板
cp .env.local.example .env.local
# 编辑 .env.local，填入 Supabase 密钥

# 启动开发服务器
npm run dev
# 访问 http://localhost:5173
```

## 部署

```bash
# 修改代码后，推送到 GitHub，Vercel 自动重新部署
git add -A
git commit -m "描述改了什么"
git push
```

---

## 环境变量

| 变量名 | 说明 | 获取方式 |
|--------|------|---------|
| `VITE_SUPABASE_URL` | Supabase 项目地址 | Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Supabase 公开密钥 | 同上 |
| `VITE_JOLPICA_BASE_URL` | F1 数据 API 地址 | 固定值：`https://api.jolpi.ca/ergast/f1` |

---

## 数据来源

- **F1 赛事数据**：[Jolpica API](https://jolpi.ca/)（免费，Ergast API 镜像）
- **科普视频**：B站（三驱兄弟 + 虾哥方程式系列）
- **赛场快报**：Motorsport.com / Autosport / The Race（RSS）
- **社区投票**：Supabase（自建数据库）

---

*Made with ❤️ for F1 fans in China*
