# AGENTS.md

## 工作区说明

这是一个单 Git 仓库，下面放了多个相互独立的小项目。根目录没有统一的 `package.json`，不要假设有共享构建工具。修改某个项目时，优先进入对应目录查看本项目的说明和代码结构。

| 目录 | 说明 | 技术栈 |
|---|---|---|
| `chanchan/` | 馋馋微信小程序前端 | 微信小程序原生框架 + 少量云开发函数 |
| `ccapi/` | 馋馋/食记后端服务 | Express 4 + SQLite + multer + sharp/heic-convert |
| `notes/notes/` | 备忘录应用 | Express 4 + SQLite + Vue 3 + Vite |
| `dream-site/` | 静态落地页 | 原生 HTML/CSS/JS，GSAP CDN |
| `claudeHistory Viewer/` | Claude CLI 历史查看器 | Python 3 标准库 HTTP 服务 |
| `opencodeHistory/` | OpenCode CLI 会话管理器 | Python 3.9+ + SQLite |

## 重点项目：chanchan

`chanchan/` 是前端微信小程序，主要负责菜谱浏览、分类、推荐、食记上传和食记列表展示。它不是 Web 项目，没有 `npm run build` 这类构建流程，开发和预览主要依赖微信开发者工具。

### 目录结构

```text
chanchan/
├── miniprogram/                 # 小程序前端主体
│   ├── app.js                   # 小程序启动、云开发初始化、登录入口
│   ├── app.json                 # 页面注册、底部 tab、窗口配置
│   ├── config.js                # 后端 API 地址配置
│   ├── api/                     # 后端接口封装
│   │   ├── config.js            # 底部菜单/配置接口
│   │   ├── meal.js              # 食记创建、列表接口
│   │   └── recipe.js            # 菜谱接口
│   ├── pages/                   # 页面
│   │   ├── list/                # 找菜
│   │   ├── category/            # 分类/逛逛
│   │   ├── recommend/           # 吃啥推荐
│   │   ├── meal/                # 发布食记，选择图片并上传
│   │   ├── meal-list/           # 我的食记列表、图片预览
│   │   └── detail/              # 菜谱详情
│   ├── custom-tab-bar/          # 自定义底部菜单
│   ├── utils/                   # 请求、收藏、本地 multipart 工具
│   └── images/                  # 图标和图片资源
├── cloudfunctions/              # 微信云函数，目前主要保留 quickstartFunctions
├── project.config.json          # 微信开发者工具项目配置
└── uploadCloudFunction.sh       # 云函数上传脚本
```

### 功能说明

- 底部菜单包括：找菜、逛逛、吃啥、我的。
- 菜谱相关页面调用 `ccapi` 的 `/api/caipu/*` 接口。
- 食记发布页 `pages/meal/` 使用 `wx.chooseMedia` 选择图片，通过 `miniprogram/api/meal.js` 调用后端 `/api/meal/create`。
- 小程序端为了支持多图一次创建食记，使用 `utils/multipart.js` 手动拼 `multipart/form-data`，字段名必须是 `images`。
- 食记列表页 `pages/meal-list/` 使用后端返回的 `image_urls` 直接渲染和预览图片。

### 开发和发布

- 使用微信开发者工具打开 `chanchan/`。
- 没有 CLI 构建命令。
- 云函数如需上传，可使用微信开发者工具 UI，或执行 `uploadCloudFunction.sh`。
- 小程序访问后端的生产入口是 `https://vvcsclbb.com/app3000`。

## 重点项目：ccapi

`ccapi/` 是后端服务，给 `chanchan` 提供菜谱、食记、登录和配置接口。后端使用 CommonJS，不要改成 ESM。数据库使用 SQLite 和 `better-sqlite3`，数据库调用是同步 API。

### 目录结构

```text
ccapi/
├── server.js                    # 启动入口：先 migrate 再 listen
├── src/
│   ├── app.js                   # Express app，中间件、静态目录、路由挂载
│   ├── config/index.js          # 统一读取 .env 配置
│   ├── db/
│   │   ├── index.js             # SQLite 单例
│   │   ├── migrate.js           # 建表和幂等迁移
│   │   └── normalize-urls.js    # 历史图片 URL 规范化脚本
│   ├── routes/                  # 路由层
│   ├── controllers/             # 控制器层，只处理 HTTP 入参出参
│   ├── services/                # 业务层和 SQL
│   ├── middlewares/             # 鉴权、上传、错误处理
│   ├── utils/                   # 响应格式、URL 拼接等工具
│   └── data/                    # 菜谱数据加载相关代码
├── data/meal.db                 # SQLite 数据库文件，线上持久化数据
├── uploads/                     # 上传图片目录，线上图片文件
├── API.md                       # 食记接口文档
├── RECIPE_API.md                # 菜谱接口文档
├── package.json
└── .env                         # 当前线上部署会使用的环境变量
```

### 架构约定

后端坚持分层：

```text
route → controller → service → db
```

- `routes/` 只定义路径和中间件。
- `controllers/` 只做参数解析、调用 service、返回响应，不写 SQL。
- `services/` 放业务逻辑和 SQL。
- `db/` 只维护数据库连接和迁移。
- 所有标准接口统一使用 `src/utils/response.js` 的 `ok()` / `fail()`，不要手写 `{ code, message, data }`。
- `/api/caipu/*` 是例外，它为了兼容天行 API 风格，返回 `{ code: 200, msg, result }`。

### 主要接口

- `GET /api/health`：健康检查。
- `POST /api/auth/login`：微信登录。
- `GET /api/config`：小程序底部菜单配置。
- `GET /api/caipu/*`：菜谱列表、详情等。
- `POST /api/meal/create`：创建食记，多图上传字段名固定为 `images`。
- `GET /api/meal/list`：食记分页列表。
- `GET /api/meal/:id`：食记详情。
- `DELETE /api/meal/:id`：删除食记。
- `GET /uploads/:filename`：上传图片静态访问。

### 数据库

SQLite 数据库路径由 `.env` 的 `DB_PATH` 控制，默认是 `./data/meal.db`。

主要表：

- `meal_record`
  - `id`：自增主键
  - `title`：标题，可空
  - `content`：内容，可空
  - `image_urls`：JSON 字符串，存相对路径数组，例如 `["/uploads/xxx.jpg"]`
  - `openid`：微信用户标识，可空
  - `created_at`：创建时间
- `user`
  - `openid`：主键
  - `first_login`：首次登录时间
  - `last_login`：最近登录时间

注意：`image_urls` 在数据库里是 JSON 字符串。读出后要 `JSON.parse`，写入前要 `JSON.stringify`。已有 `meal.service.js` 的 `hydrate()` 负责转换和拼接公网 URL。

### 图片上传和 HEIC

- `multer` 上传字段名固定为 `images`。
- 支持 `jpg/png/gif/webp/heic/heif`。
- iPhone 上传的 HEIC/HEIF 会在服务端转成 JPEG 保存。
- HEIC 转换优先使用 `sharp`，如果 `sharp` 不支持当前 HEVC 压缩格式，会 fallback 到 `heic-convert`。
- 数据库仍然只保存 `/uploads/xxx.jpg` 这样的相对路径。
- 返回给小程序的完整图片地址由 `BASE_URL` 拼接生成。

## ccapi 常用命令

在 `ccapi/` 目录执行：

```bash
npm install
npm run dev              # nodemon 开发启动
npm start                # node server.js
npm run migrate          # 手动迁移，启动时也会自动执行
npm run normalize-urls   # 规范化历史图片 URL
```

## 线上发布方式

线上服务器目录：

```text
/home/ubuntu/wx/wx/ccapi
```

发布流程：

```bash
cd /home/ubuntu/wx/wx
git pull
cd ccapi
npm install
npm run dev
pm2 restart ccapi --update-env
```

说明：

- 线上由 PM2 守护 `ccapi` 进程。
- 外部访问入口是 `https://vvcsclbb.com/app3000`。
- `ccapi/.env` 里的 `BASE_URL` 必须是：

```bash
BASE_URL=https://vvcsclbb.com/app3000
```

- 这样接口返回的食记图片地址才会是 `https://vvcsclbb.com/app3000/uploads/...`。
- 如果 `BASE_URL` 为空，后端会按请求 Host 自动拼 URL，在线上反代路径前缀场景会生成错误地址。
- 修改 `.env` 后必须执行：

```bash
pm2 restart ccapi --update-env
```

验证：

```bash
curl "https://vvcsclbb.com/app3000/api/health"
curl "https://vvcsclbb.com/app3000/api/meal/list?page=1&pageSize=1"
```

## 线上数据和清理

- 食记数据库：`ccapi/data/meal.db`
- 上传图片：`ccapi/uploads/`

备份线上数据：

```bash
cd /home/ubuntu/wx/wx/ccapi
tar -czf /tmp/ccapi-backup-$(date +%Y%m%d-%H%M%S).tgz data uploads
```

清空食记和上传图片前必须先备份。只删除 `uploads/` 不删除数据库会导致列表里仍有记录但图片 404。

## 其他项目简要说明

### notes/notes/

备忘录应用。实际应用目录是 `notes/notes/`，不是外层 `notes/`。

```bash
npm install
npm run dev
npm start
npm run build
npm run migrate
```

注意：`notes/notes/public/` 是 Vite 构建产物，不要直接编辑。

### dream-site/

静态页面，无构建流程：

```bash
python3 -m http.server 8000
```

### claudeHistory Viewer/

Python 标准库服务：

```bash
python3 claude-history-server.py
```

默认访问 `http://localhost:7734`。

### opencodeHistory/

OpenCode 会话管理工具：

```bash
./opencode-history serve [-p 7780]
./opencode-history index
./opencode-history list
./opencode-history search <query>
python3 -m pytest tests/
```

## 通用注意事项

- 后端不要引入 ORM，保持 raw SQL。
- `better-sqlite3` 是同步 API，不要 `await` 数据库调用。
- 后端配置统一从 `.env` 和 `src/config/index.js` 读取，不要在代码里硬编码端口、数据库路径、上传目录或公网域名。
- 改动尽量小而明确，不要顺手重构无关模块。
- 提交信息尽量具体，例如 `fix heic upload preview`、`调整食记图片地址前缀`。
