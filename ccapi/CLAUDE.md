# CLAUDE.md

面向 AI 协作者的项目说明。修改代码前先读完本文件。

> **AI 必读**：每次进入本项目协作时，除本文件外，还必须阅读 [`RECIPE_API.md`](./RECIPE_API.md)（菜谱接口文档）。涉及 `/api/caipu/*` 的任何新增/修改必须先对齐该文档。

## 项目定位

「食记」后端服务：记录用户每次吃饭的图片、内容、标题、时间，提供 REST API。
当前处于 MVP 阶段，暂无鉴权 / 用户体系。

## 技术栈

- **运行时**：Node.js ≥ 18，CommonJS（`require`，不要改 ESM）
- **Web**：Express 4
- **数据库**：SQLite（`better-sqlite3`，**同步 API**）
- **文件上传**：multer 2.x（本地存储，字段名固定 `images`）
- **其它**：dotenv / cors / morgan / nanoid

## 目录结构

```
ccapi/
├── server.js                  # 入口：先 migrate 再 listen
├── src/
│   ├── app.js                 # Express 实例，注册中间件、路由、静态目录
│   ├── config/index.js        # 读 .env，集中配置
│   ├── db/
│   │   ├── index.js           # SQLite 单例（WAL 模式）
│   │   └── migrate.js         # 建表，幂等，可 npm run migrate
│   ├── middlewares/
│   │   ├── upload.js          # multer 配置（类型/大小/数量限制）
│   │   └── error.js           # 统一错误处理 + 404
│   ├── controllers/           # 只处理 HTTP 入参出参
│   ├── services/              # 业务 + SQL，controller 只调 service
│   ├── routes/                # 路由挂载
│   └── utils/response.js      # ok() / fail() 统一响应
├── uploads/                   # 图片存储（gitignored）
├── data/meal.db               # SQLite 文件（gitignored）
├── .env / .env.example
├── API.md                     # 接口文档（对外用）
└── package.json
```

## 数据模型

表 `meal_record`：

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | INTEGER PK | 自增 |
| `title` | TEXT | 可空 |
| `content` | TEXT | 可空 |
| `image_urls` | TEXT NOT NULL | **JSON 字符串**（数组），读写时需要 parse / stringify |
| `created_at` | DATETIME | `datetime('now','localtime')` 默认值 |

索引：`idx_meal_created_at` on `created_at DESC`。

## 分层约定（重要）

```
route → controller → service → db
```

- **controller**：解析/校验 HTTP 参数，调用 service，组装响应。禁止写 SQL。
- **service**：业务与 SQL。数据库行通过 `hydrate(row)` 转成对外结构（`image_urls` 从 JSON 字符串还原为数组）。
- **db/index.js**：只暴露连接实例，不写具体 SQL。
- 新增资源时沿用同样的四层结构，文件命名 `xxx.controller.js` / `xxx.service.js` / `xxx.route.js`。

## 统一响应

`src/utils/response.js`：

```js
ok(data, message?)     // { code: 0, message, data }
fail(message, code?)   // { code, message, data: null }
```

**所有接口必须走这两个函数**，不要手搓 `{ code, message, data }`。HTTP 状态码与 `code` 保持一致（400/404/500）。

## 环境变量

全部走 `.env`（示例见 `.env.example`）：

| 变量 | 默认 | 用途 |
|---|---|---|
| `PORT` | 3000 | 监听端口 |
| `BASE_URL` | http://localhost:3000 | 拼接图片 URL，上云时改此项即可 |
| `DB_PATH` | ./data/meal.db | SQLite 文件 |
| `UPLOAD_DIR` | ./uploads | 上传目录 |
| `MAX_FILE_SIZE` | 10485760 | 单文件 10MB |
| `MAX_FILES` | 9 | 单请求最多 9 张 |

**不要硬编码这些值**，一律走 `require('../config')`。

## 常用命令

```bash
npm install           # 安装依赖
npm start             # 启动（生产式）
npm run dev           # nodemon 热重载
npm run migrate       # 单独执行建表
```

启动时 `server.js` 会自动调用 `migrate()`，无需手动跑。

## 接口一览

详见 `API.md`。

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/health` | 健康检查 |
| POST | `/api/meal/create` | 创建（multipart，images 多文件） |
| GET | `/api/meal/list` | 分页列表 |
| GET | `/api/meal/:id` | 详情 |
| DELETE | `/api/meal/:id` | 删除（含本地图片清理） |
| GET | `/uploads/:file` | 静态图片访问 |

## 关键约束 / 易踩坑

1. **`image_urls` 是 JSON 字符串**。从 DB 读出后必须 `JSON.parse`；写入前必须 `JSON.stringify`。已有 `hydrate()` 做这件事，新查询请复用。
2. **better-sqlite3 是同步 API**，不要 `await`。service 里的函数不需要 `async`，controller 用 `async` 只是为了 try/catch。
3. **id 校验**：controller 层用 `parseId()` 保证正整数，避免 `NaN` 进 SQL。
4. **删除时清理本地文件**：`meal.service.remove` 里做了路径穿越防御（只删 `config.uploadDir` 下的文件）。上云换 OSS 时替换 `fs.unlink` 部分。
5. **multer 错误**通过 `instanceof multer.MulterError` 在 `error.js` 统一转成 400。新增校验别自己包 try/catch，交给 `next(err)`。
6. **`images` 字段名写死**在 `upload.array('images')`。前端必须用这个 key。
7. **路由顺序**：`/meal/list` 要在 `/meal/:id` 之前，否则 `list` 会被当成 id。（当前 `meal.route.js` 顺序正确，不要随意调整。）

## 上云时改什么

- `.env` 改 `BASE_URL` 为公网域名。
- **SQLite → 云数据库**：只改 `src/db/index.js`（连接）和 service 层 SQL 方言（基本兼容）。
- **本地存储 → OSS/S3**：
  - `src/middlewares/upload.js`：换 `multer-s3` / `multer-aliyun-oss` 等 storage
  - `src/services/meal.service.js` 的 `fileToUrl()` 和 `remove()` 里的 `fs.unlink` 换成对应 SDK。
- 静态目录 `/uploads` 可下线（改用对象存储域名）。

## 不要做的事

- 不要引入 ORM（Sequelize/Prisma），保持 `better-sqlite3` 原生 SQL 的直接和性能。
- 不要把业务逻辑写进 controller 或 route。
- 不要在代码里硬编码 `localhost:3000` 或路径，走 `config`。
- 不要改变响应结构（`{code, message, data}`），前端已对齐。
- 不要跳过 `migrate`，新增字段时加一条 `ALTER TABLE` 到 `migrate.js`（幂等）。
- 不要提交 `uploads/` / `data/` / `.env`（`.gitignore` 已覆盖）。
