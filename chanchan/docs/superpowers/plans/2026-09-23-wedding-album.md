# 婚纱相册小程序改造执行计划（更新）

> **For agentic workers:** 在当前任务使用 superpowers:executing-plans，按任务逐项实施。本轮根据用户新提供的资源地址、分享和加载要求更新计划；执行步骤以复选框跟踪。

**Goal:** 将现有小程序默认体验改为“光的折页”婚纱相册，让 70 张照片按参考版式和顺序展示，支持分享，通过低调的 vvdc 入口进入完整菜谱功能。

**Architecture:** 保留旧菜谱路径和四个 tabBar 页面。新增一个非 tabBar 相册页，用本地编排数据驱动四章、31 页与八种拼版；照片从用户提供的三个 HTTPS 目录按需加载。当前拼版逐张显现，完成后才开始加载缩略图；相邻页在翻到时加载。服务器资源不随小程序代码包发布。

**Tech Stack:** 微信原生小程序，WXML / WXSS / CommonJS / JSON；继续使用现有菜谱 API。

**Spec:** `../specs/2026-09-23-wedding-album-reference.md`。

## Global Constraints

- 不修改 ccapi、数据库、现有上传图片及其他项目；不引入 Web 框架或 web-view。
- 保留原 6 个菜谱页面和 4 个 tabBar 页面路径；相册作为 app.json 第一个页面。
- 依照参考使用 70 张照片、31 页，排除 DSCF0369.jpg；不改动人物影像。
- 图片前缀：`https://vvcsclbb.com/photos/Originals/`、`https://vvcsclbb.com/photos/Previews/`、`https://vvcsclbb.com/photos/Thumbnails/`。大小写、JPEG 文件名均与资源清单一致。
- 2026-09-23 已以 HEAD 逐一核对 70×3 个照片 URL，均返回 200/image/jpeg，Content-Length 与本地文件一致；仍需在微信开发者工具验收合法域名与实际加载。
- 原图仅在大图查看或保存时按需下载，不做启动时全量预取。
- 不主动运行项目级全量构建、打包或测试。最终小程序真机与上传验证需要开发者工具。
- 保留当前 Git 工作区既有修改，不主动重构旧菜谱代码。

## Review Focus

1. 首张加载慢或失败时，后续照片能继续，页面可重试而不空白。
2. 快速切章节、翻页、点击缩略图时，旧图片回调不能覆盖最新选择。
3. 分享给朋友与朋友圈的章节参数合法，打开后落在对应章节；坏参数回第一章。
4. 微信下载、保存权限失败与网络错误不会阻断普通浏览。
5. 无照片预下载暴增：首屏只请求必要图片，后续根据可见状态加载。

## 任务 1：迁移参考编排数据

**新增：** `miniprogram/data/album.js`、`miniprogram/utils/album-layout.js`。

**参考：** `FoldAlbum/Resources/manifest.json`、`EditorialLayout.swift`、`SpreadComposition.swift`。

**接口：** `chapters` 保留 id/title/files；`photosById` 保留 file/chapterId/order/width/height/thumbnailUrl/previewUrl/originalUrl；`pagesByChapter` 保留 id/kind/files。`getPhotoPageIndex(chapterId, file)` 返回该图在章节的页索引；`layoutSpread(page, photosById, width, height)` 返回图片位置、尺寸、旋转和层级。

- [x] 按 manifest 生成 70 张照片元数据，URL 由独立 ALBUM_ASSET_BASE_URL 拼接三个服务器目录。
- [x] 从 EditorialLayout 导入 12/9/4/6 页分组，保持八种 kind 及 DSCF0027/0024/0029 同页。
- [x] 从 SpreadComposition 导入按画布宽高自适应的布局规则，不使用 HTML 示例的固定 390px 坐标。
- [x] 用局部脚本检查每章 25/20/10/15 张、70 张唯一覆盖、共 31 页、排除照不存在及缩略图跳页映射。

**验收：** 数据与参考一致，没有重复或缺失，分享可使用稳定章节 id。

## 任务 2：验证与接入服务器图片

**修改：** `miniprogram/config.js` 增加独立相册资源前缀；不得修改菜谱 API 地址。

**新增：** `miniprogram/utils/album-media.js` 处理远程图片预览和按需下载。

- [x] 对 manifest 的 70×3 个 HTTPS 地址做 HEAD 核对，全部 200/image/jpeg，字节数与本地文件一致。
- [x] URL 使用用户指定的 `/photos/{Originals|Previews|Thumbnails}/{filename}` 结构，不把 `Resources/` 重复拼进路径。
- [ ] 在微信开发者平台检查图片加载及 `wx.downloadFile` 所需的服务器域名配置，确保 `vvcsclbb.com` 允许。
- [x] 大图查看与保存才请求 Originals；普通相册阅读使用 Previews，照片带与目录使用 Thumbnails。
- [x] 远程加载失败显示占位或重试，不访问本地资源。

**验收：** 三类 URL 都能在微信开发者工具中加载；首屏没有 210 个并发图片请求。

## 任务 3：相册页面、八种版式和有序加载

**新增：** `miniprogram/pages/album/index.{js,json,wxml,wxss}`、`miniprogram/components/album-spread/index.{js,json,wxml,wxss}`。目录抽屉直接由相册页管理。

**修改：** `miniprogram/app.json`，相册排第一；仅调整新增页面所需的启动窗口背景和导航属性，核对旧页面的独立设置。

**状态：** chapterId、pageIndex、focusedFile、loadQueue、navigationVersion。使用 `bindload` / `binderror` 驱动下一张展示；切章和翻页时失效旧队列。

- [x] 打开即显示山野来信第一页；顶部四套风格与目录、中央竖向整页阅读、底部独立缩略图带。
- [x] 首屏只为当前页第一张设置图片 src；成功或超时/错误后继续同页下一张，逐张淡入；单图失败可重试且不会阻塞其他图片。
- [x] 当前页完成后才为附近缩略图设置 URL；首次进入不加载 70 张原图或全部预览图。相邻页在翻到时加载。
- [x] 翻页或切章时当前页成为最高优先级，组件使失效加载批次不能覆盖新选择；浏览器与小程序图片缓存可复用已完成资源。
- [x] 按八种 kind 和四套配色构造布局，保留图片比例、纸边、短句、背景与页码。
- [x] 根据画布实际宽高计算布局，预留状态栏、胶囊和底部安全区。
- [x] 相册首屏数据不等待菜谱页面请求或 tab 配置；登录仍由原 app 启动逻辑后台触发。

**验收：** 可看到第一张、第二张先后出现；四章共 31 页可完整阅读，快速操作不会跳回旧页；菜谱 tabBar 不出现在相册。

## 任务 4：目录、完整大图和保存

**新增：** `miniprogram/pages/album-photo/index.{js,json,wxml,wxss}`；目录抽屉实现于相册页。

- [x] 目录包含“风格”及按章节筛选的“全部照片”，缩略图点选后定位该图所在拼版页。
- [x] 点击拼版照片进入完整大图，按需下载 Originals；支持双指缩放、返回和网络错误重试。
- [x] 阅读页与大图底部都提供保存原片入口；下载完成后再请求微信相册保存接口。
- [x] 处理下载错误、页面离开时取消下载、相册授权拒绝和设置入口，不把失败误报为成功。
- [x] 返回大图时保留原章节、页码和选中照片。

**验收：** 用户可从任一拼版完整查看与保存原图，网络失败后仍可回相册浏览。

## 任务 5：vvdc、返回相册与分享

**修改：** 相册页面与目录组件、`miniprogram/custom-tab-bar/index.{js,wxml,wxss}`、`miniprogram/pages/list/index.js`、`miniprogram/pages/category/index.js`、`miniprogram/pages/meal/index.js`、`miniprogram/pages/meal-list/index.js`。

- [x] 在相册目录底部加入低调的 vvdc 文字按钮；点击进入原找菜页。
- [x] 原 tab 导航、菜谱详情和食记列表加入返回相册入口；使用 `wx.reLaunch` 清理浏览栈；目录远程菜单为空时也可返回。
- [x] 在相册页定义 `onShareAppMessage`，返回章节标题、预览图及 `/pages/album/index?chapterId=<合法章节>`。
- [x] 在相册页定义 `onShareTimeline`，使用同一章节标题、预览图和 `chapterId` 查询参数；相册页显示朋友及朋友圈分享菜单。
- [x] 相册 onLoad 只接受四个已知 chapterId；缺失或无效参数回到山野第一页。
- [x] 菜谱详情/推荐页继续分享菜谱；找菜、逛逛、食记发布、食记列表分享相册首页，不携带个人食记内容。旧菜谱分享直达仍可用。
- [ ] 在真机检查右上角“转发”与“分享到朋友圈”入口、分享卡片、接收者打开路径和返回相册。

**验收：** 相册各章和旧菜谱入口页均可从右上角分享；相册分享打开正确章节，旧入口页分享打开相册首页；菜谱往返不积累页面栈。

## 任务 6：局部验证与交付

- [x] 对新增和修改的 JS 做语法检查，解析 JSON，并核对相册页面、拼版组件注册。
- [x] 局部验证 70 张覆盖、31 页分组、布局边界、图像 URL、顺序加载错误继续及分享参数白名单。
- [x] 检查 Git diff，确认只涉及小程序和计划文件，没有改动服务器或原始婚纱照。
- [ ] 在微信开发者工具及真机按链路测试：冷启动逐张显示、慢网/断网、翻页切章、缩略图、大图下载保存、两类分享、vvdc、四个菜谱 tab、旧详情与食记。
- [ ] 核对微信合法域名、服务器缓存响应、实际上传包体和网络加载表现；未跑的设备验证明确标注。

**完成标准：** 相册参考的四章与八种排版可用，照片按先后加载，三类服务器图片正常读取，右上角分享落到相册章节，vvdc 可进入原菜谱区并返回。
