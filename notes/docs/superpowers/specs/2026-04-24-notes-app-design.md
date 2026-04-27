# Notes App Design Spec

## Context

需要一个跨平台的备忘录 Web 应用，支持手机、笔记本、PC 等多设备访问和编辑。核心诉求是"纯记录"，类似苹果备忘录的体验——打开即用，无需登录，所见即所得富文本编辑。

## Tech Stack

- **Frontend**: Vue 3 + Tiptap (CDN 引入，无构建步骤)
- **Backend**: Node.js + Express 4 + better-sqlite3 (沿用 ccapi 分层模式)
- **Port**: 3175
- **No auth, no image upload, no categories** — keep it minimal

## Architecture

```
wx/notes/
├── server.js               # 入口：先 migrate 再 listen
├── package.json
├── .env / .env.example
├── src/
│   ├── app.js              # Express 实例 + 静态托管 + 路由 + 错误处理
│   ├── config/index.js     # 读 .env，集中配置
│   ├── db/
│   │   ├── index.js        # SQLite 单例（WAL 模式）
│   │   └── migrate.js      # 建表，幂等
│   ├── controllers/
│   │   └── note.controller.js
│   ├── services/
│   │   └── note.service.js
│   ├── routes/
│   │   └── note.route.js
│   ├── middlewares/
│   │   └── error.js        # 统一错误处理 + 404
│   └── utils/
│       └── response.js     # ok() / fail() 统一响应
├── public/                  # 前端静态文件，express.static 托管
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── app.js          # Vue 3 + Tiptap 应用
└── data/
    └── notes.db
```

前后端同项目，后端托管 `public/`，打开 `http://localhost:3175` 即用。

后端分层沿用 ccapi 风格：`route → controller → service → db`。

## Data Model

### Table: `note`

| Column      | Type      | Description                    |
|-------------|-----------|--------------------------------|
| `id`        | INTEGER PK| 自增                           |
| `title`     | TEXT      | 标题，取内容前 30 字符自动生成  |
| `content`   | TEXT      | Tiptap 输出的 HTML 内容        |
| `created_at`| DATETIME  | 创建时间，默认 `datetime('now','localtime')` |
| `updated_at`| DATETIME  | 更新时间，默认同 created_at     |

Index: `idx_note_updated_at` on `updated_at DESC`。

## API

| Method | Path           | Description          |
|--------|----------------|----------------------|
| GET    | `/api/notes`   | 笔记列表（按更新时间倒序） |
| GET    | `/api/notes/:id`| 笔记详情            |
| POST   | `/api/notes`   | 创建笔记             |
| PUT    | `/api/notes/:id`| 更新笔记            |
| DELETE | `/api/notes/:id`| 删除笔记            |

统一响应格式：`{ code: 0, message, data }` / `{ code, message, data: null }`。

POST/PUT body: `{ content: "..." }`，title 由后端从 content 自动提取。

## Frontend UI

### 桌面端 (>768px)：左右分栏

- **左侧列表栏** (~280px)
  - 顶部搜索框（实时过滤标题/内容）
  - 笔记卡片：标题 + 摘要前 50 字 + 更新时间
  - 底部新建按钮
- **右侧编辑区** (占满剩余空间)
  - 顶部 Tiptap 工具栏（加粗、斜体、标题、列表、分割线等）
  - 内容编辑区：白色背景，最大宽度 680px 居中，纸张感
  - 无单独标题输入框，第一行自动作为标题

### 移动端 (<=768px)：单栏切换

- 默认显示列表
- 点击笔记 → 滑入编辑页
- 编辑页左上角返回按钮

### 风格

- 浅色暖白背景（类似苹果备忘录）
- 圆角卡片，hover / 选中高亮
- 流畅过渡动画
- 响应式适配手机、平板、桌面

## Environment Variables

| Variable   | Default                  | Purpose      |
|------------|--------------------------|--------------|
| `PORT`     | 3175                     | 监听端口     |
| `DB_PATH`  | ./data/notes.db          | SQLite 文件  |

## Verification

1. `cd notes && npm install && npm start` — 服务启动在 3175 端口
2. 浏览器打开 `http://localhost:3175` — 看到备忘录界面
3. 新建笔记 → 输入内容 → 自动保存 → 列表中显示
4. 点击笔记 → 编辑 → 内容持久化
5. 删除笔记 → 列表中消失
6. 手机浏览器访问同一 URL → 响应式布局正常
