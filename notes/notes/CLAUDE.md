# CLAUDE.md — Notes 备忘录项目 AI 上下文

> 面向 AI 协作者的项目说明。修改代码前先读完本文件。

## 项目定位

跨平台备忘录 Web 应用，类似苹果备忘录。浏览器打开即用，无需登录，所见即所得富文本编辑。

## 技术栈

- **运行时**：Node.js ≥ 18，CommonJS
- **Web**：Express 4
- **数据库**：SQLite（better-sqlite3，同步 API）
- **前端**：Vue 3 + Tiptap（CDN 引入，无构建步骤）
- **端口**：3175

## 目录结构

```
notes/
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
│   │   └── error.js
│   └── utils/
│       └── response.js
├── public/                  # 前端静态文件
│   ├── index.html
│   ├── css/style.css
│   └── js/app.js
└── data/notes.db
```

## 数据模型

### note 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PK | 自增 |
| title | TEXT | 自动取内容前 30 字符 |
| content | TEXT | Tiptap HTML 内容 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

索引：`idx_note_updated_at` on `updated_at DESC`。

## 分层约定

```
route → controller → service → db
```

- **controller**：解析 HTTP 参数，调用 service，组装响应。禁止写 SQL。
- **service**：业务与 SQL。数据库行通过 `hydrate()` 转换。
- **db/index.js**：只暴露连接实例，不写具体 SQL。

## 统一响应

`src/utils/response.js`：

```js
ok(data, message?)     // { code: 0, message, data }
fail(message, code?)   // { code, message, data: null }
```

所有接口必须走这两个函数。

## 环境变量

| 变量 | 默认 | 用途 |
|------|------|------|
| PORT | 3175 | 监听端口 |
| DB_PATH | ./data/notes.db | SQLite 文件 |

## API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/notes | 列表（按更新时间倒序） |
| GET | /api/notes/:id | 详情 |
| POST | /api/notes | 创建 |
| PUT | /api/notes/:id | 更新 |
| DELETE | /api/notes/:id | 删除 |

POST/PUT body: `{ content: "..." }`，title 由后端从 content 自动提取。

## 前端要点

- Vue 3 + Tiptap CDN 引入，无构建步骤
- 桌面：左右分栏（列表 280px + 编辑区）
- 移动：单栏切换（列表 ↔ 编辑）
- 苹果备忘录风格：暖白背景、圆角卡片
- 自动保存：内容变更后 debounce 1s PUT
- 编辑区最大宽度 680px 居中
- 搜索框实时过滤标题/内容

## 关键约束

1. better-sqlite3 是同步 API，不要 `await`。
2. 不要引入 ORM，保持原生 SQL。
3. 不要在代码里硬编码端口/路径，走 `config`。
4. 不要改变响应结构 `{code, message, data}`。
5. 前端不要引入构建工具，保持 CDN 方式。

## 常用命令

```bash
npm install           # 安装依赖
npm start             # 启动
npm run dev           # nodemon 热重载
npm run migrate       # 单独执行建表
```

## 不做的事

- 不要引入用户登录/鉴权
- 不要引入图片上传功能
- 不要引入笔记分类/标签
- 不要引入前端构建工具（Webpack/Vite）
- 不要把业务逻辑写进 controller 或 route
