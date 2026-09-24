# 婚礼邀请 H5

李光耀与方紫薇的移动端婚礼邀请页。项目使用 Vue 3、TypeScript、Vite 和 SCSS，构建产物是可部署到静态站点子路径的 `dist/` 目录。

## 本地运行

需要 Node.js 和 npm。首次使用先安装依赖：

```bash
npm install
npm run dev
```

常用检查命令：

```bash
npm run test
npm run typecheck
npm run build
npm run preview -- --host 127.0.0.1
```

## 更新内容

婚礼日期、时间、人物、地点、地址和页面文案统一维护在：

```text
src/config/wedding.ts
```

不要把固定婚礼信息直接写入组件。按照修改范围执行定向验证；全项目测试、类型检查或构建只在明确需要时执行。

通过 URL 查询参数选择场次：

- 默认链接 `https://vvcsclbb.com/wedding/`：2026 年 10 月 11 日（星期日）中午 12:00，扬州中青国际酒店(市政府店)。
- 商水链接 `https://vvcsclbb.com/wedding/?venue=shangshui`：2026 年 10 月 2 日（星期五）中午 12:00，河南省周口市商水县富商路桑尼贝尔连锁酒店(商水富商路店)。

只有 `venue=shangshui` 才切换到商水场次；缺少、为空或未知的 `venue` 值都使用默认场次，微信附加的其他参数不影响选择。查询参数放在 `#` 锚点之前；翻页和刷新会保留查询参数。封面日期、婚礼详情、星期、倒计时和所有导航入口使用同一份选中配置。

商水酒店坐标来源为[携程酒店 104721675](https://hotels.ctrip.com/hotels/104721675.html)，地址为富商路与汝阳路交叉口东 100 米。2026-09-14 读取的 `hotelPositionInfo` 使用百度 BD-09（经度 `114.612645`、纬度 `33.572104`），按 [coordtransform 的 BD-09 → GCJ-02 算法](https://github.com/wandergis/coordtransform)转换为 GCJ-02（经度 `114.606259`、纬度 `33.565783`），供高德导航与腾讯地图位置页使用。

## 背景音乐

使用 Arden Coley 的《Gentle Heartbeat》，用户提供的 MP3 文件副本位于 `src/assets/audio/gentle-heartbeat.mp3`，曲目信息见同目录 `README.md`。音频通过 Vite 打包为本地静态资源，适配部署子路径，无需依赖第三方音乐外链。

`BackgroundMusic.vue` 在页面挂载时尝试有声自动播放并循环播放，翻页时不会重建播放器。浏览器拒绝有声自动播放时，会在访客首次点击、触摸或按键时重试，开始播放后移除监听；音频加载失败时保持静音。不显示播放、暂停、音量等控件，组件卸载时停止播放。页面打开后能否立即出声由访问者的浏览器策略决定。

## 页面与照片

页面共五屏，顺序为：封面、初见心动、朝夕相伴、余生有你、婚礼信息。全部 20 张照片均保留：封面 1 张、三页相册各 6 张、婚礼信息 1 张。相册分组位于 `src/config/albumPages.ts`，复用原有照片资源；每个页面的标题下都有一句简短描述。

首页婚纱照铺满整屏，标题、信封、姓名和日期悬浮在照片上；信封位于标题下方的天空区域，并针对短屏缩小以避开人脸。信封使用暖白折纸、香槟金双环封印和细金线，通过 SVG 与 CSS 绘制，不需要额外 UI 库。点击后播放开封动画并进入第二页；未拆信时禁止离开首页。每次新打开或刷新均回到未开启的首页，即使地址包含旧锚点；同一个存活页面从地图返回时保留当前状态。

整屏翻页由 `useInvitationPager.ts` 与 `utils/paging.ts` 统一控制，支持鼠标滚轮、单指纵向滑动、方向键、PageUp/PageDown、空格和页脚链接；Home/End 可到首尾页。轮滚阈值为 60px，同一手势的惯性尾部不再触发翻页，停顿超过 220ms 后视为新手势；页面过渡约 600ms，开封约 950ms。短屏或文字放大导致内容超出时，在当前页面内部滚动，到达边界后用新的向外手势翻页。封面未开启时也能查看其自身溢出的内容。

页面高度优先读取未缩放状态下的 `visualViewport.height`，回退至 `innerHeight`，随视口变化更新；浏览器放大手势不会触发翻页。三页相册分别使用全宽横幅配双竖照、左侧高竖照配错落小图、深色影集配倾斜竖照的独立排版。每页挑选一张横图铺满宽度，并调整焦点位置保留人脸；其他照片保留原始比例。横屏使用各自的紧凑布局。桌面保持居中的邀请函版面，最大宽度 560px。内部链接由翻页控制器接管，不依赖根页面的滚动吸附或原生锚点平滑滚动。

倒计时以选中场次的北京时间为目标（默认 `2026-10-11 12:00`，商水 `2026-10-02 12:00`），每秒更新，到时归零，页面恢复前台时校正时间。最后一页展示日期、照片、倒计时、时间、酒店与完整地址；“开始导航”按钮位于酒店地址下方。`#countdown` 和 `#navigation` 在请柬开启后兼容定位到婚礼信息页。导航继续复用 `utils/navigation.ts`：手机浏览器尝试唤起高德导航并保留网页回退，微信和桌面浏览器直接打开腾讯地图位置页。

兼容性实现参考 [MDN VisualViewport](https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport)、[触摸手势控制](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/touch-action) 和 [inert](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/inert)。当前已在内置 Chromium 预览中检查 390×844、320×568 和 844×390 的布局、拆信锁定、滚轮整页翻动、图片重入和末页刷新回首页；触摸和减少动态效果的控制逻辑有自动化测试。真实 iOS Safari、Android Chrome、微信浏览器仍需设备回归：特别检查地址栏收缩、旋转屏幕、双指缩放、滑动惯性、短屏内部滚动及地图返回。

2026-09-11 新增相册从用户授权的 `F:\婚纱照\方紫薇` 目录中 71 张精修照片精选 16 张，原片保持不变。配置和替代文本集中在 `src/config/album.ts`，资源在 `src/assets/images/album/`，均使用原始构图比例：

| 相册章节 | 精选原片（展示顺序） |
| --- | --- |
| 山间誓言 | DSCF0017、DSCF0011、DSCF0049、DSCF0058 |
| 窗边时光 | DSCF0164、DSCF0147、DSCF0229、DSCF0159 |
| 纯白心动 | DSCF0273、DSCF0253、DSCF0262、DSCF0257 |
| 光影相伴 | DSCF0298、DSCF0314、DSCF0356、DSCF0352 |

新增相册图片由原始 JPEG 以 Pillow 转换：先校正 EXIF 方向、转换为 sRGB，再用 Lanczos 缩放；提供长边 960px / 1600px 的 WebP（质量 80、方法 6）和 1600px 渐进 JPEG 回退（质量 87、4:4:4），移除原片元数据。32 个 WebP 文件合计约 1.99 MiB，16 个 JPEG 回退合计约 3.91 MiB；浏览器只选取合适的一档，所有相册照片均懒加载。图像宽高和 `srcset` 描述使用实际资源尺寸，包括非标准横图比例。

全部 20 张照片通过 `WeddingPhoto.vue` 统一处理动效，翻页完成且图片加载后播放；封面使用 4.8 秒缓慢缩放，全宽横幅使用 2.4 秒渐入，其余照片使用约 1.4 秒的渐显、轻微缩放（0.96 → 1）及左右飞入，错峰 0–240ms。图片完全离开后重置，返回页面时重新播放；`active` 属性防止图片在翻页途中提前播完。除封面和三张全宽横幅外，图片完整显示；动画仅使用 `transform` / `opacity`；页面隐藏时暂停，卸载时清理观察器与监听。加载失败、缺少 IntersectionObserver 时静态展示；开启 `prefers-reduced-motion` 时照片、开封和翻页均即时完成。设计参考 [web.dev 动画性能指南](https://web.dev/articles/animations-guide)、[MDN 减弱动画设置](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion) 和 [Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)。

图片配置位于 `src/config/photos.ts`，包含替代文本、各尺寸资源及裁切位置；网页图片位于 `src/assets/images/photos/`。选自精修目录的照片如下：

| 资源名 | 原片 | 位置 |
| --- | --- | --- |
| cover | DSCF0063.jpg | 封面 |
| portrait | DSCF0130.jpg | 相册开头左图 |
| studio | DSCF0256.jpg | 相册开头右图 |
| panorama | DSCF0024.jpg | 婚礼信息横幅 |
| garden | DSCF0108.jpg | 原邀约主图，当前不展示 |
| editorial | DSCF0293.jpg | 原邀约右上，当前不展示 |
| closing | DSCF0347.jpg | 原邀约右下，当前不展示 |

每张提供长边 960px / 1600px 两档 WebP（质量 85，编码方法 6，使用 sharp YUV 转换）及 1600px 渐进 JPEG 回退（质量 90、4:4:4）。竖图实际宽度分别为 720px / 1200px，横幅宽度分别为 960px / 1600px；`srcset` 使用实际宽度。图片已校正 EXIF 方向、转换为 sRGB 并去掉拍摄元数据。保留原片，网页版本采用适合屏幕显示的缩放和高质量有损编码，并非逐像素无损。

2026-09-11 针对低带宽轻度压缩了当前使用的 14 张 WebP，保持两档分辨率：960px 档合计约 535 → 402 KiB，1600px 档约 1177 → 904 KiB，两档资源总体积减少约 23.7%。当前睁眼封面的大图约 201 → 145 KiB，减少约 27.9%。封面从 `output/imagegen/cover-eyes/cover-eyes-open-master.png` 母版生成，其余从现有高质量 JPEG 生成；JPEG 回退保留原质量，后续重新编码应继续使用母版或高质量来源，避免反复压缩 WebP。已对照压缩前的同尺寸裁片检查人脸、婚纱与花瓣细节，没有发现明显偏色或压缩伪影。

浏览器按显示尺寸和像素密度选择其中一档，上述两档合计不是单次访问下载量；支持 WebP 时不会下载 JPEG 回退。封面优先加载，其余使用原生懒加载和异步解码。

旧封面 `src/assets/images/wedding-cover.jpg` 和已有分享缩略图 `public/share-cover.jpg` 保留不变；页面现通过 `photos.ts` 使用新资源，当前网页封面为 `photos/cover-eyes-open-*` 和 `photos/cover-eyes-open.jpg`，更换时以 `photos.ts` 中的实际引用为准。替换后检查人物裁切、文字可读性和横向溢出。

## 网站图标与分享信息

网站图标选自精修目录的 `DSCF0273.jpg`（白色婚纱双人合照）。在校正方向后的 4678 × 3509 原片上，从左上角 `(1240, 400)` 裁取 2160 × 2160 的方形区域，再以 Lanczos3 缩小；保留原片人物与色彩，不使用生成式重绘。输出为 sRGB，并移除拍摄元数据：

- `public/favicon.ico`：包含 16、32、48px 三档，供浏览器标签和书签使用。
- `public/favicon-32x32.png`：32px PNG 图标。
- `public/favicon-192x192.png`：192px PNG 图标，供较大尺寸的图标展示使用。
- `public/apple-touch-icon.png`：180px 手机主屏幕收藏图标。

`index.html` 中图标使用相对路径，适配 `/wedding/` 等部署子目录。标题、Open Graph 和 Twitter 卡片信息在该文件维护；更改姓名时应与 `src/config/wedding.ts` 同步。静态简介使用不含场次的通用邀请文案，避免不执行 JavaScript 的分享抓取器读取错误日期或酒店。`src/main.ts` 在页面启动时从选中配置同步四处简介，并生成保留查询参数、去掉翻页锚点的 `og:url` 和 canonical；因此静态 HTML 不写死默认场次链接。分享平台的具体卡片样式与缓存仍以实际平台为准，当前没有接入微信 JSSDK。分享缩略图继续使用 `public/share-cover.jpg`（300 × 300）；更换图片尺寸时同步更新 Open Graph 的宽高。分享图片的绝对地址目前使用 `https://vvcsclbb.com/wedding/`，更换域名或部署路径时一并更新。

## 构建和部署

```bash
npm run build
```

部署 `dist/` 目录中的全部内容。`vite.config.ts` 当前使用 `base: './'`，因此构建资源采用相对路径，可放到站点子路径下。

正式发布前，应通过 `npm run preview -- --host 127.0.0.1` 检查生产构建，并在真实手机上确认地图搜索结果、iOS Safari、Android Chrome 和微信内置浏览器的页面效果。具体托管平台、公开子路径和上传命令尚未确定，不包含在当前项目配置中。
