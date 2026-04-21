# 食记 API 文档

> Base URL（本地）：`http://localhost:3000`
> 上云后改 `.env` 中的 `BASE_URL` 即可。

---

## 通用说明

### 统一响应结构

```json
{
  "code": 0,
  "message": "ok",
  "data": {}
}
```

| 字段 | 类型 | 说明 |
|---|---|---|
| `code` | number | `0` 表示成功；非 0 为错误码（与 HTTP 状态码一致，400/404/500 等） |
| `message` | string | 提示文案 |
| `data` | any | 业务数据，失败时为 `null` |

### 错误码

| HTTP | code | 场景 |
|---|---|---|
| 400 | 400 | 参数错误（id 非法、未上传图片、文件类型/大小不符） |
| 404 | 404 | 接口或资源不存在 |
| 500 | 500 | 服务器内部错误 |

### 数据对象：`MealRecord`

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | number | 主键 |
| `title` | string \| null | 标题（可空） |
| `content` | string \| null | 内容（可空） |
| `image_urls` | string[] | 图片 URL 数组（可直接用于前端 `<img src>`） |
| `created_at` | string | 创建时间，格式 `YYYY-MM-DD HH:mm:ss`（本地时间） |

---

## 1. 健康检查

**`GET /api/health`**

用于存活检测。

**响应**
```json
{ "code": 0, "message": "ok" }
```

---

## 2. 客户端配置（底部菜单权限）

**`GET /api/config`**

供小程序启动时拉取底部 Tab 配置，后端按需下发可见 Tab。
`visible === false` 或未返回的项，前端不会渲染。

**响应示例**
```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "tabs": [
      { "key": "list",      "text": "找菜", "pagePath": "/pages/list/index",      "visible": true },
      { "key": "category",  "text": "逛逛", "pagePath": "/pages/category/index",  "visible": true },
      { "key": "recommend", "text": "吃啥", "pagePath": "/pages/recommend/index", "visible": true }
    ]
  }
}
```

**字段说明**

| 字段 | 类型 | 说明 |
|---|---|---|
| `tabs[].key` | string | Tab 唯一标识，前端按此键映射本地图标 |
| `tabs[].text` | string | Tab 文案 |
| `tabs[].pagePath` | string | 目标页面路径，必须与 `app.json` 中 `tabBar.list` 的 `pagePath` 一致 |
| `tabs[].visible` | boolean | 是否渲染，`false` 时前端过滤掉该项 |

> 配置写死在 `src/controllers/config.controller.js` 的 `TABS` 常量中，放开或隐藏某个 Tab 直接改该常量并重启进程。

---

## 3. 创建食记

**`POST /api/meal/create`**

**Content-Type：`multipart/form-data`**

**请求参数**

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `title` | string | 否 | 标题 |
| `content` | string | 否 | 内容 |
| `images` | file[] | **是** | 图片文件，字段名固定 `images`，支持多张（1–9 张），单张 ≤ 10MB，仅支持 `jpg / png / gif / webp` |

**curl 示例**
```bash
curl -X POST http://localhost:3000/api/meal/create \
  -F "title=今天的午饭" \
  -F "content=吃了牛肉面，很好吃！" \
  -F "images=@/path/to/1.jpg" \
  -F "images=@/path/to/2.jpg"
```

**成功响应 `200`**
```json
{
  "code": 0,
  "message": "创建成功",
  "data": {
    "id": 1,
    "title": "今天的午饭",
    "content": "吃了牛肉面，很好吃！",
    "image_urls": [
      "http://localhost:3000/uploads/1776655391731_iO-coAGl.png",
      "http://localhost:3000/uploads/1776655391733_4FcXsl77.png"
    ],
    "created_at": "2026-04-20 11:23:11"
  }
}
```

**失败响应**

| HTTP | 场景 | 响应示例 |
|---|---|---|
| 400 | 未上传图片 | `{"code":400,"message":"至少需要上传一张图片","data":null}` |
| 400 | 文件类型不支持 | `{"code":400,"message":"上传失败：仅支持 jpg/png/gif/webp 图片","data":null}` |
| 400 | 文件过大（>10MB） | `{"code":400,"message":"上传失败：File too large","data":null}` |
| 400 | 图片超过 9 张 | `{"code":400,"message":"上传失败：Too many files","data":null}` |

---

## 4. 列表（分页）

**`GET /api/meal/list`**

**Query 参数**

| 字段 | 类型 | 必填 | 默认 | 说明 |
|---|---|---|---|---|
| `page` | number | 否 | `1` | 页码，从 1 开始 |
| `pageSize` | number | 否 | `10` | 每页条数，最大 `100` |

按 `created_at DESC, id DESC` 倒序。

**curl**
```bash
curl "http://localhost:3000/api/meal/list?page=1&pageSize=10"
```

**成功响应**
```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "list": [
      {
        "id": 2,
        "title": null,
        "content": null,
        "image_urls": ["http://localhost:3000/uploads/xxx.png"],
        "created_at": "2026-04-20 11:23:18"
      }
    ],
    "page": 1,
    "pageSize": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

---

## 5. 详情

**`GET /api/meal/:id`**

**Path 参数**

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | number | 记录 id（正整数） |

**curl**
```bash
curl http://localhost:3000/api/meal/1
```

**成功响应** — `data` 为 `MealRecord` 对象（结构同创建接口返回的 `data`）。

**失败响应**

| HTTP | 场景 | 响应 |
|---|---|---|
| 400 | id 非法 | `{"code":400,"message":"id 非法","data":null}` |
| 404 | 记录不存在 | `{"code":404,"message":"记录不存在","data":null}` |

---

## 6. 删除

**`DELETE /api/meal/:id`**

删除数据库记录，并同步清理本地已上传的图片文件。

**Path 参数**

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | number | 记录 id（正整数） |

**curl**
```bash
curl -X DELETE http://localhost:3000/api/meal/1
```

**成功响应**
```json
{ "code": 0, "message": "删除成功", "data": null }
```

**失败响应**

| HTTP | 场景 | 响应 |
|---|---|---|
| 400 | id 非法 | `{"code":400,"message":"id 非法","data":null}` |
| 404 | 记录不存在 | `{"code":404,"message":"记录不存在","data":null}` |

---

## 7. 静态资源（图片访问）

**`GET /uploads/:filename`**

由 Express 静态服务直接返回图片，无需额外鉴权。`image_urls` 中的链接即是此路径。

---

## 附录：本地启动

```bash
npm install
npm start        # 或 npm run dev（nodemon 热重载）
```

环境变量见 `.env.example`。
