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

## 页面与照片

页面现在有四个章节：照片封面、双照片倒计时、婚礼信息、三照片邀约收尾。原第二页已经移除，“我们结婚啦”整合到封面，邀约正文整合到收尾。深蓝与象牙白统一各章，页脚使用共享的 `SectionFooter.vue`，图片使用共享的 `WeddingPhoto.vue`。

倒计时仍以北京时间 `2026-10-11 20:00` 为目标，每秒更新，到时归零；页面从后台恢复时校正时间。婚礼信息包含日期、时间、地点、完整地址和高德地图搜索入口。

每章使用 `100dvh` 最小高度（回退至 `100svh` / `100vh`）。使用自由滚动和原生页脚锚点平滑翻页；短屏、横屏或放大文字时，内容可以撑高页面。桌面保持居中的邀请函版面，最大宽度 560px。

根页面不启用 `scroll-snap-type`：iOS Safari 在手动滚动后，根滚动吸附可能打断锚点跳转，表现为“下一页 / 回到封面”无响应或滚动后弹回，见 [WebKit 272079](https://bugs.webkit.org/show_bug.cgi?id=272079)。保留原生链接及减少动态效果设置下的即时跳转，不依赖定时器或触摸事件补偿。手机回归时应检查：连续翻完四页 → 回封面 → 手动上下滑动至地址栏收缩 → 再点页脚，包含再次点击 URL 中已有的同一锚点。

图片配置位于 `src/config/photos.ts`，包含替代文本、各尺寸资源及裁切位置；网页图片位于 `src/assets/images/photos/`。选自精修目录的照片如下：

| 资源名 | 原片 | 位置 |
| --- | --- | --- |
| cover | DSCF0063.jpg | 封面 |
| portrait | DSCF0130.jpg | 倒计时左图 |
| studio | DSCF0256.jpg | 倒计时右图 |
| panorama | DSCF0024.jpg | 婚礼信息横幅 |
| garden | DSCF0108.jpg | 收尾主图 |
| editorial | DSCF0293.jpg | 收尾右上 |
| closing | DSCF0347.jpg | 收尾右下 |

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

`index.html` 中图标使用相对路径，适配 `/wedding/` 等部署子目录。标题、简介、Open Graph 和 Twitter 卡片信息也在该文件维护；更改姓名、婚礼日期、时间或地点时，应与 `src/config/wedding.ts` 同步。分享缩略图继续使用 `public/share-cover.jpg`（300 × 300）；更换图片尺寸时同步更新 Open Graph 的宽高。公开地址与分享图片的绝对地址目前配置为 `https://vvcsclbb.com/wedding/`，更换域名或部署路径时一并更新。

## 构建和部署

```bash
npm run build
```

部署 `dist/` 目录中的全部内容。`vite.config.ts` 当前使用 `base: './'`，因此构建资源采用相对路径，可放到站点子路径下。

正式发布前，应通过 `npm run preview -- --host 127.0.0.1` 检查生产构建，并在真实手机上确认地图搜索结果、iOS Safari、Android Chrome 和微信内置浏览器的页面效果。具体托管平台、公开子路径和上传命令尚未确定，不包含在当前项目配置中。
