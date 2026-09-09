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

不要把固定婚礼信息直接写入组件。修改后至少执行 `npm run test` 和 `npm run build`。

## 更换封面

封面固定使用：

```text
src/assets/images/wedding-cover.jpg
```

直接用新的 JPEG 覆盖同名文件即可，无需修改组件。替换图片必须方向正常，并在 360、375、390、412、430 px 五个宽度下检查人物裁切、文字可读性和页面横向溢出。必要时只调整 `src/components/HeroSection.vue` 中的 `--hero-image-y`。

当前封面使用 `DSCF0063.jpg` 的项目内副本，保留原始构图与色彩，按比例缩小并压缩至 1500×2000，文件约 576 KB。原图未修改。分享缩略图 `public/share-cover.jpg` 使用同一张照片，尺寸为 300×300。

页面围绕照片的天空蓝与婚纱白设计，依次为照片封面、邀约、婚礼信息和照片收尾。四屏统一使用 `100dvh` 最小高度（回退至 `100svh` / `100vh`），通过原生滚动吸附停在页首；底部文字可点击翻页。横屏或放大文字时，允许内容撑高页面，以保留完整信息和导航按钮。

## 构建和部署

```bash
npm run build
```

部署 `dist/` 目录中的全部内容。`vite.config.ts` 当前使用 `base: './'`，因此构建资源采用相对路径，可放到站点子路径下。

正式发布前，应通过 `npm run preview -- --host 127.0.0.1` 检查生产构建，并在真实手机上确认地图搜索结果、iOS Safari、Android Chrome 和微信内置浏览器的页面效果。具体托管平台、公开子路径和上传命令尚未确定，不包含在当前项目配置中。
