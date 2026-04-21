# 菜谱 API 文档（AI 必读）

> 本文档是菜谱模块（`/api/caipu/*`）对外接口的唯一真相来源。
> AI 协作者在修改或使用菜谱相关接口前，**必须完整阅读本文档**。

---

## 通用说明

### Base URL
- 本地：`http://localhost:3000`
- 生产：改 `.env` 的 `BASE_URL`

### 响应结构（与食记接口不同！）
菜谱模块 **对齐天行 API 风格**，与 `meal` 模块的 `{code:0, message, data}` 不同：

```json
{ "code": 200, "msg": "success", "result": {} }
```

| 字段 | 类型 | 说明 |
|---|---|---|
| `code` | number | `200` 成功；非 `200` 为错误 |
| `msg` | string | 提示 |
| `result` | any | 业务数据 |

### 数据源

| 来源 | 用途 |
|---|---|
| `./caipu.json` | 本地菜品全量数据（5000+ 条），接口 1、2 使用 |
| 天行 API `https://apis.tianapi.com/caipu/cpinfo` | 接口 3 代理调用 |

`caipu.json` 单条结构：

```json
{ "id": 5218, "type_id": 101, "type_name": "婴儿类", "cp_name": "蛋花丝瓜汤", "texing": "" }
```

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | number | 菜品 ID（供详情接口使用） |
| `type_id` | number | 分类 ID |
| `type_name` | string | 分类名 |
| `cp_name` | string | 菜名 |
| `texing` | string | 特性描述（可能为空字符串） |

---

## 1. 菜品查询（分页 + 关键词）

**`GET /api/caipu/list`**

### Query 参数

| 字段 | 类型 | 必填 | 默认 | 说明 |
|---|---|---|---|---|
| `num` | number | 否 | `10` | 每页条数，范围 `1–100` |
| `page` | number | 否 | `1` | 页码，从 `1` 开始 |
| `word` | string | 否 | — | 关键词；匹配 `cp_name` / `texing` / `type_name`（包含匹配） |

### 示例

```bash
curl "http://localhost:3000/api/caipu/list?num=10&page=1&word=黄瓜"
```

### 成功响应

```json
{
  "code": 200,
  "msg": "success",
  "result": {
    "curpage": 1,
    "allnum": 30,
    "list": [
      {
        "id": 1618,
        "type_id": 67,
        "type_name": "沪菜",
        "cp_name": "雪菜炒冬笋",
        "texing": "雪菜就是雪里蕻咸菜..."
      }
    ]
  }
}
```

| `result` 字段 | 类型 | 说明 |
|---|---|---|
| `curpage` | number | 当前页码（回显请求的 `page`） |
| `allnum` | number | 匹配到的总条数（非总页数） |
| `list` | object[] | 当前页数据；结构同 `caipu.json` 单条 |

---

## 2. 菜谱分类

**`GET /api/caipu/category`**

从 `caipu.json` 聚合得到所有分类及其菜品数量。

### 示例

```bash
curl "http://localhost:3000/api/caipu/category"
```

### 成功响应

```json
{
  "code": 200,
  "msg": "success",
  "result": [
    { "type_id": 1, "type_name": "家常菜", "count": 321 },
    { "type_id": 67, "type_name": "沪菜", "count": 58 },
    { "type_id": 101, "type_name": "婴儿类", "count": 42 }
  ]
}
```

`result` 为数组，**按业务定义的展示顺序排列**（菜品/菜系 → 汤 → 蛋/主食 → 甜品 → 饮料酒水 → 其他/不明确），具体顺序见 `src/services/caipu.service.js` 中的 `CATEGORY_ORDER`。

> 已剔除医疗/进补类分类（如肿瘤癌症、糖尿病人菜肴、各类系统疾病、补气补血、保健美容、孕产妇/更年期妇女 等），不会出现在本接口或 `/api/caipu/list` 中。

| 字段 | 类型 | 说明 |
|---|---|---|
| `type_id` | number | 分类 ID |
| `type_name` | string | 分类名 |
| `count` | number | 该分类下菜品数量 |

---

## 3. 菜谱详情（代理天行 API）

**`GET /api/caipu/detail`**

后端调用上游 `https://apis.tianapi.com/caipu/cpinfo?key=***&id=:id`，**原样返回上游响应**。前端不需要持有上游 `key`。

### Query 参数

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `id` | number | 是 | 菜品 ID（取自接口 1 返回的 `list[].id`） |

### 示例

```bash
curl "http://localhost:3000/api/caipu/detail?id=5218"
```

### 成功响应（样例，实际结构以天行 API 为准）

```json
{
  "code": 200,
  "msg": "success",
  "result": {
    "id": 5218,
    "cp_name": "蛋花丝瓜汤",
    "peiliao": "...",
    "zuofa": "...",
    "texing": "..."
  }
}
```

### 失败响应

| HTTP | 场景 | 响应 |
|---|---|---|
| 400 | 未传 `id` | `{"code":400,"msg":"id 必填","result":null}` |
| — | 上游返回非 JSON | `{"code":<status>,"msg":"upstream non-json","result":"<raw>"}` |
| — | 上游业务错误 | 原样透传上游的 `code`/`msg` |

### 注意
- 上游 `key` 固化在 `src/services/caipu.service.js`，如需替换/隐藏请移到 `.env`。
- 上游限频或失败时，本接口会把错误原样透传给前端，不做二次封装。

---

## 实现文件索引

| 文件 | 作用 |
|---|---|
| `src/data/caipu-loader.js` | `caipu.json` 内存缓存加载器（首次读取，后续复用） |
| `src/services/caipu.service.js` | 搜索/分类/详情代理业务 |
| `src/controllers/caipu.controller.js` | HTTP 入参出参 + 统一 `{code,msg,result}` 包装 |
| `src/routes/caipu.route.js` | 路由挂载，挂在 `/api/caipu` 下 |

---

## AI 协作约束

1. **新增或修改 `/api/caipu/*` 接口前**：先读本文件，保持响应结构一致。
2. **响应结构不同于 meal 模块**：菜谱走 `{code, msg, result}`，食记走 `{code, message, data}`，**不要混用**。
3. **不要把天行 `key` 写入版本库之外的新地方**；如需脱敏，统一改到 `.env` 并更新本文件。
4. **数据源保持只读**：不要修改 `caipu.json`；如需派生结构（如缓存），放到 `src/data/` 下并保持幂等。
5. **分页字段命名遵循天行风格**（`num`/`page`/`curpage`/`allnum`），不要改成 `pageSize`/`total`。
