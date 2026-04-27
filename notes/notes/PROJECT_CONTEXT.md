# Notes 备忘录项目 — 上下文文档

> 供项目所有者查看，了解项目全貌、设计决策和实现进度。

## 项目简介

跨平台备忘录 Web 应用，类似苹果备忘录。打开浏览器即可使用，无需登录，所见即所得富文本编辑。

## 设计决策

| 决策项 | 选择 | 理由 |
|--------|------|------|
| 笔记格式 | 所得即所得富文本（Tiptap） | 接近苹果备忘录体验 |
| 分类组织 | 无分类，只有列表 | 保持简单 |
| 图片附件 | 不支持 | 专注纯文字记录 |
| 用户体系 | 不需要登录 | 打开即用 |
| 技术栈 | Vue 3 + Tiptap (CDN) + Express + SQLite | 沿用 ccapi 风格，零构建步骤 |
| 端口 | 3175 | 用户指定 |

## 技术架构

```
notes/
├── server.js               # 入口
├── package.json
├── .env / .env.example
├── src/
│   ├── app.js              # Express + 静态托管
│   ├── config/index.js     # 配置
│   ├── db/
│   │   ├── index.js        # SQLite 单例 (WAL)
│   │   └── migrate.js      # 建表
│   ├── controllers/note.controller.js
│   ├── services/note.service.js
│   ├── routes/note.route.js
│   ├── middlewares/error.js
│   └── utils/response.js
├── public/                  # 前端静态文件
│   ├── index.html
│   ├── css/style.css
│   └── js/app.js           # Vue 3 + Tiptap
└── data/notes.db
```

后端分层：`route → controller → service → db`（沿用 ccapi）。

## 数据模型

### note 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PK | 自增 |
| title | TEXT | 自动取内容前 30 字符 |
| content | TEXT | Tiptap 输出的 HTML |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

## API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/notes | 列表（按更新时间倒序） |
| GET | /api/notes/:id | 详情 |
| POST | /api/notes | 创建 |
| PUT | /api/notes/:id | 更新 |
| DELETE | /api/notes/:id | 删除 |

## 前端 UI

- **桌面 (>768px)**：左右分栏（列表 280px + 编辑区）
- **移动 (<=768px)**：单栏切换（列表 ↔ 编辑）
- 风格：暖白背景、圆角卡片、hover 高亮、过渡动画
- 编辑区最大宽度 680px 居中
- Tiptap 工具栏：加粗、斜体、标题、列表、分割线
- 自动保存：内容变更后 debounce 1s

## 实现步骤

1. ✅ 初始化项目结构（package.json, .env, server.js）
2. ✅ 后端基础设施（config, db, migrate, response, error, app）
3. ✅ 后端 CRUD（service, controller, route）
4. ✅ 前端 HTML + CSS（响应式布局）
5. ✅ 前端 Vue 3 + Tiptap 应用
6. ✅ 安装依赖 & 启动测试

## 如何启动

```bash
cd notes
npm install
npm start
# 浏览器打开 http://localhost:3175
```
