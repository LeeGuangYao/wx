# 婚纱相册参考规格

参考根目录：`/Users/liguangyao/Documents/Codex/2026-09-15/ios-app-app-volumes-cache-album/outputs`。

以最新版 `相册新版式预览.html`、`婚纱相册App设计提案.md` 和 `FoldAlbum/App` 为建议基准。早期视觉稿 1/2/3 不作为默认实现基准。已在本机浏览器打开 HTML 并查看版式；这验证了静态参考，不代表运行或验证了 iOS App。

## 界面及交互

- 无封面，打开即显示“山野来信”第一页。
- 顶部四个风格 Tab，点击任一项都回到该套第一页。
- 中央画布上下整页翻动，每页 2–3 张照片。
- 底部显示页码、当前照片序号、横向缩略图与保存按钮。当前页照片明亮，选中照片有边框；点击缩略图定位到所在拼版并选中用于保存。
- 目录包含“风格”“全部照片”两种视图；版面照片可进入完整大图并缩放。
- 小程序使用自身状态栏、胶囊和安全区；iOS 原生导航、手势、字体、保存权限按微信能力适配，不承诺两个平台的系统界面像素一致。
- 主要布局支持竖屏，横屏按参考改为并排排版；开关只作用于新增相册页，避免影响旧菜谱。
- 原参考无音乐、视频、评论、上传等相册功能；本轮不新增这些功能。
- 首次进入先加载当前页第一张，再依次显示同页其余照片；首屏完成后加载可见缩略图，相邻页在翻到时逐张加载。切章后重新以目标章第一页为最高优先级。加载失败不得阻塞后续照片。
- 相册页面支持微信右上角分享给朋友及分享到朋友圈；分享链接进入当前章节，从该章节第一页开始。无效章节参数回到“山野来信”。
- 旧页面中的找菜、逛逛、食记发布、食记列表目前没有分享回调，补上分享相册首页的入口。菜谱详情和吃啥推荐已有分享菜谱的回调，维持其原有分享目标。

## 四套风格

| 章节 | 照片 | 拼版页 | 版式 | 主色 |
| --- | ---: | ---: | --- | --- |
| 山野来信 / mountains | 25 | 12 | landscapeStory、landscapeSequence | 炭灰 #343230、浅字 #F5F2ED |
| 花影长廊 / palace | 20 | 9 | palaceWindows、palaceFeature | 香槟 #E9DECC、深字 #3E362D |
| 纯白对白 / white | 10 | 4 | whiteDiptych、whiteContact | 冷白 #F8F9F7、深字 #242722 |
| 光的余温 / golden | 15 | 6 | goldenCollage、goldenFeature | 炭棕 #24211F、暖字 #F1E8D8 |

照片清单来自 `FoldAlbum/Resources/manifest.json`；页分组来自 `FoldAlbum/App/Models/EditorialLayout.swift`；几何布局来自 `SpreadComposition.swift`；渲染细节来自 `EditorialSpreadView.swift`、`FoldTheme.swift`。原 HTML 提供八种版式的示例，并非一个可以直接嵌入运行的完整相册。

70 张照片必须各出现一次，不遗漏、不重复；明确排除 `DSCF0369.jpg`。`DSCF0027.jpg`、`DSCF0024.jpg`、`DSCF0029.jpg` 保持同页三连画。所有拼版尽量保留原始比例，完整图可从详情查看。

## 资源实测

| 资源 | 文件数 | 字节 | MiB |
| --- | ---: | ---: | ---: |
| Originals | 70 | 554356080 | 528.68 |
| Previews | 70 | 22414080 | 21.38 |
| Thumbnails | 70 | 2582130 | 2.46 |

各章现有预览图：山野 7.55 MiB、长廊 7.70 MiB、纯白 1.47 MiB、暖光 4.65 MiB。

2026-09-23 已读取[微信官方分包文档](https://developers.weixin.qq.com/miniprogram/dev/framework/subpackages.html)：单个主包/分包不超过 2M，全部分包合计不超过 30M，服务商代开发不超过 20M。开发者工具的最终上传校验优先。

结论：原图不能全部随代码包发布；现有预览图也不能直接按四个章节原样打包。用户已提供三类照片的服务器访问地址，本轮采用全部远程读取方案。

用户现已提供 HTTPS 服务器图片位置：`https://vvcsclbb.com/photos/Originals/`、`https://vvcsclbb.com/photos/Previews/`、`https://vvcsclbb.com/photos/Thumbnails/`。2026-09-23 逐一以 HEAD 核对 70×3 个 URL：全部返回 HTTP 200 与 `image/jpeg`，Content-Length 与本地同名文件字节数一致，无缺图。资源实现方案据此改为三类图片都从服务器读取，不再新增图片分包或压缩副本。最终仍需在微信开发者工具核对合法域名与加载表现。

微信[页面分享回调文档](https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html)说明：页面只有定义 `onShareAppMessage` 才会显示右上角“转发”；定义 `onShareTimeline` 才显示朋友圈入口。相册页实现这两个回调，并按需要调用[显示分享菜单接口](https://developers.weixin.qq.com/miniprogram/dev/api/share/wx.showShareMenu.html)。分享标题、缩略图及章节参数均从相册数据生成，不将原图文件放入分享卡片。

## 菜谱入口默认方案

原 6 页与 4 个 tabBar 页面保留。默认首页改为相册，菜谱导航只在原 tab 页面显示。`vvdc` 放相册目录底部，单击进入原找菜页；菜谱导航增加返回相册入口。旧菜谱分享链接默认保留直达，用户若要求只能通过 vvdc 进入，再设计入口检查。

## 已采用的默认选择

未收到关于早期视觉稿、照片顺序或旧菜谱分享直达的变更要求，按最新 FoldAlbum 版本和保留旧分享直达执行。如需改变，请在实施前指出。
