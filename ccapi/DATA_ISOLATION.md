# 数据隔离方案（按微信号隔离食记数据）

## 概述

每个微信用户只能看到自己上传的食记数据。指定的管理员微信号可以查看所有用户的数据。

## 工作原理

1. 小程序启动时调用 `wx.login()` 获取临时 `code`，发送到后端 `/api/auth/login`
2. 后端用 `code` 调用微信 API 换取 `openid`，签发 JWT token 返回给小程序
3. 小程序后续所有请求自动携带 `Authorization: Bearer <token>` header
4. 后端中间件解析 token，取出 `openid` 和 `isAdmin`
5. 创建食记时自动写入当前用户的 `openid`
6. 查询食记时：普通用户只看到自己的，管理员看到所有人的

## 如何设置管理员

### 第一步：获取 openid

#### 方法一：查看登录用户列表（推荐）

让目标用户先打开一次小程序（自动登录），然后管理员调用接口查看所有登录用户的 openid：

```bash
# 替换 <token> 为管理员的 JWT token
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/auth/users
```

返回示例：

```json
{
  "code": 0,
  "data": [
    {
      "openid": "oXXXX123456789",
      "firstLogin": "2024-01-01 10:00:00",
      "lastLogin": "2024-06-15 08:30:00",
      "isAdmin": false
    }
  ]
}
```

从中挑出需要的 openid。

#### 方法二：小程序控制台

在微信开发者工具的控制台（Console）中，启动小程序后执行：

```javascript
const app = getApp()
console.log('openid:', app.getOpenid())
```

#### 方法三：查看网络请求

小程序启动时发出的 `POST /api/auth/login` 响应中包含 `openid` 字段。

### 第二步：配置管理员

编辑 `ccapi/.env`，将获取到的 openid 填入 `ADMIN_OPENIDS`，多个用英文逗号分隔：

```
ADMIN_OPENIDS=oXXXXXX1,oXXXXXX2,oXXXXXX3
```

### 第三步：重启后端

```bash
# 开发环境
npm run dev

# 生产环境（PM2）
pm2 restart ccapi
```

重启后，新登录的管理员用户将能看到所有数据。

### 验证管理员身份

重新打开小程序，在控制台执行：

```javascript
const app = getApp()
console.log('isAdmin:', app.isAdminUser())  // 应该输出 true
```

## 环境变量说明

| 变量 | 说明 | 示例 |
|---|---|---|
| `WX_APPID` | 微信小程序 AppID | `wx1234567890abcdef` |
| `WX_SECRET` | 微信小程序 AppSecret | `abcdef1234567890abcdef` |
| `JWT_SECRET` | JWT 签名密钥，随意填一个长随机字符串 | `my-super-secret-key-2024` |
| `ADMIN_OPENIDS` | 管理员 openid 列表，逗号分隔 | `oABC123,oDEF456` |

**获取 AppID 和 AppSecret**：微信公众平台 → 开发 → 开发管理 → 开发设置

## 历史数据处理

首次运行迁移时，已有的没有 `openid` 的历史记录会被自动分配给 `ADMIN_OPENIDS` 中的第一个管理员。普通用户看不到这些历史记录，管理员可以看到。

## 数据库变更

`meal_record` 表新增 `openid TEXT` 列，记录创建者的微信 openid。新增 `user` 表记录所有登录过的用户：

```sql
CREATE TABLE user (
  openid       TEXT PRIMARY KEY,
  first_login  DATETIME,
  last_login   DATETIME
);
```

每次用户登录时自动 `upsert`，更新 `last_login`。管理员通过 `GET /api/auth/users` 接口查看。

## API 变更

### 新增接口

- `POST /api/auth/login` — 登录，参数 `{ code }`，返回 `{ token, openid, isAdmin }`
- `GET /api/auth/users` — 获取所有登录用户列表（仅管理员），返回 `[{ openid, firstLogin, lastLogin, isAdmin }]`

### 现有接口变更

所有 `/api/meal/*` 接口现在需要在 header 中携带 `Authorization: Bearer <token>`，否则返回 401。

| 接口 | 变更 |
|---|---|
| `POST /api/meal/create` | 自动绑定当前用户 openid |
| `GET /api/meal/list` | 普通用户只返回自己的数据，管理员返回全部 |
| `GET /api/meal/:id` | 普通用户只能查看自己的，管理员可查全部 |
| `DELETE /api/meal/:id` | 普通用户只能删除自己的，管理员可删全部 |

### 无需鉴权的接口

- `POST /api/auth/login` — 登录本身
- `GET /api/health` — 健康检查
- `GET /api/caipu/*` — 菜谱接口（公开数据）
- `GET /api/config` — 配置接口
- `GET /uploads/*` — 图片静态访问

## 小程序端变更

- `app.js`：启动时自动调用 `wx.login()` + `/api/auth/login`，token 存入 storage 和 globalData
- `utils/request.js`：自动携带 `Authorization` header，401 时自动重新登录
- `api/meal.js`：`createMeal` 和 `listMeals` 都携带 token
