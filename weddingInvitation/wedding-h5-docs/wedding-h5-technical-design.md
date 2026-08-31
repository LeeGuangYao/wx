# 婚礼请柬 H5 技术设计文档

> 项目：李光耀 & 方紫薇 婚礼请柬 H5
> 文档版本：v1.0
> 对应 PRD：`wedding-h5-prd.md`
> 目标执行者：Codex / 前端开发者

---

## 1. 技术目标

实现一个移动端优先、单页、长滚动的婚礼请柬 H5。

技术实现需要满足：

- 页面轻量；
- 结构简单；
- 数据与 UI 解耦；
- 一张临时婚纱照即可运行；
- 后续替换图片、姓名、时间、地址成本低；
- 不依赖 UI 组件库；
- 不为了简单动效引入大型动画库；
- 生产构建可直接部署为静态站点。

---

## 2. 技术栈

推荐固定为：

```text
Vue 3
Vite
TypeScript
SCSS
```

### 不使用

```text
Vue Router
Pinia
Element Plus
Ant Design Vue
Vant
Swiper
GSAP
第三方大型动画库
```

原因：当前只有一个页面、四个 Section、无复杂状态，不需要这些依赖。

---

## 3. 总体架构

```text
Browser
  ↓
App.vue
  ↓
Wedding Config
  ├── HeroSection
  ├── InvitationSection
  ├── WeddingDetailsSection
  └── ClosingSection
          ↓
      useReveal
          ↓
   IntersectionObserver

WeddingDetailsSection
  ↓ click
navigation.ts
  ↓
高德地图 URI API
```

核心思想：

- `App.vue` 只负责组合四个 Section。
- 所有婚礼基础数据集中到 `wedding.ts`。
- 每个 Section 只负责自己的展示。
- 滚动动画统一由 `useReveal` 处理。
- 地图 URL 构建单独放到 `navigation.ts`，不要写在 Vue 模板中。

---

## 4. 推荐项目结构

```text
wedding-invitation/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── public/
├── src/
│   ├── assets/
│   │   ├── images/
│   │   │   └── wedding-cover.jpg
│   │   └── styles/
│   │       ├── _tokens.scss
│   │       └── global.scss
│   ├── components/
│   │   ├── HeroSection.vue
│   │   ├── InvitationSection.vue
│   │   ├── WeddingDetailsSection.vue
│   │   └── ClosingSection.vue
│   ├── composables/
│   │   └── useReveal.ts
│   ├── config/
│   │   └── wedding.ts
│   ├── types/
│   │   └── wedding.ts
│   ├── utils/
│   │   └── navigation.ts
│   ├── App.vue
│   ├── main.ts
│   └── vite-env.d.ts
└── README.md
```

实际工程根目录固定为：

```text
/Users/liguangyao/Desktop/ai/wx/weddingInvitation
```

上面的 `wedding-invitation/` 仅表示项目根，不在实际目录中再创建同名嵌套目录。保留已有的 `wedding-h5-docs/` 和 `docs/`。

不要创建无实际职责的 `views`、`store`、`services`、`api` 等目录。

---

## 5. 图片资源处理

用户当前提供的临时图片：

```text
/Volumes/Cache/动漫lf/ff8f60868edc1b1ac965a5a3bf2d8fb9.jpg
```

Codex 在用户本机执行时，将图片复制到：

```text
src/assets/images/wedding-cover.jpg
```

可以执行：

```bash
mkdir -p src/assets/images
cp "/Volumes/Cache/动漫lf/ff8f60868edc1b1ac965a5a3bf2d8fb9.jpg" \
  src/assets/images/wedding-cover.jpg
```

约束：

- 不覆盖或修改原图片。
- 已授权对项目副本做简单处理：将画面旋转至正常方向并裁掉明显黑边，不做复杂修图或内容重构。
- 浏览器运行时不得引用 `/Volumes/...`。
- 如果 Codex 执行环境访问不到该文件，不允许自动从网络寻找替代婚纱照；应保留资源位置并明确报告图片未复制成功。
- 后续正式照片仍使用 `wedding-cover.jpg` 文件名即可，避免修改业务组件。

---

## 6. 数据模型

### `src/types/wedding.ts`

```ts
export interface WeddingCouple {
  groom: string
  bride: string
}

export interface WeddingVenue {
  name: string
  address: string
}

export interface WeddingCopy {
  heroEyebrow: string
  invitationEyebrow: string
  invitationTitle: string
  invitationLines: string[]
  detailsEyebrow: string
  closingTitle: string
  closingEyebrow: string
}

export interface WeddingConfig {
  couple: WeddingCouple
  dateISO: string
  dateShort: string
  dateSlash: string
  dateLong: string
  weekday: string
  time: string
  time24: string
  venue: WeddingVenue
  copy: WeddingCopy
}
```

保持数据模型简单。不要首版设计 CMS 式 schema。

---

## 7. 婚礼配置

### `src/config/wedding.ts`

```ts
import type { WeddingConfig } from '@/types/wedding'

export const weddingConfig: WeddingConfig = {
  couple: {
    groom: '李光耀',
    bride: '方紫薇',
  },
  dateISO: '2026-10-11',
  dateShort: '2026.10.11',
  dateSlash: '2026 / 10 / 11',
  dateLong: '2026年10月11日',
  weekday: '星期日',
  time: '晚上 6:00',
  time24: '18:00',
  venue: {
    name: '扬州狮子楼（瘦西湖店）',
    address: '扬州市广陵区柳湖路 8 号（扬师院东门内，近瘦西湖南门）',
  },
  copy: {
    heroEyebrow: 'WEDDING INVITATION',
    invitationEyebrow: 'OUR WEDDING',
    invitationTitle: '我们结婚啦',
    invitationLines: [
      '从此，两个人的故事',
      '要写成同一个名字。',
      '',
      '诚挚邀请您',
      '来见证我们的婚礼。',
    ],
    detailsEyebrow: 'WEDDING DAY',
    closingTitle: '期待与你相见',
    closingEyebrow: 'SEE YOU AT OUR WEDDING',
  },
}
```

姓名、时间、地点不得分散硬编码在多个 `.vue` 文件中。

---

## 8. 全局设计 Token

### `src/assets/styles/_tokens.scss`

```scss
:root {
  --wedding-bg: #f7f4ef;
  --wedding-surface: #ffffff;
  --wedding-text: #282522;
  --wedding-muted: #756e67;
  --wedding-line: rgba(40, 37, 34, 0.16);
  --wedding-overlay: rgba(0, 0, 0, 0.18);

  --page-gutter: 24px;
  --content-max-width: 360px;
  --page-max-width: 480px;

  --font-serif: 'Songti SC', 'STSong', 'Noto Serif SC', serif;
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
}
```

允许后续基于正式婚纱照调整颜色，但组件内不要重复定义主题色。

---

## 9. 全局样式

### `src/assets/styles/global.scss`

必须完成：

```scss
* {
  box-sizing: border-box;
}

html,
body,
#app {
  margin: 0;
  min-height: 100%;
}

html {
  background: var(--wedding-bg);
  -webkit-text-size-adjust: 100%;
}

body {
  overflow-x: hidden;
  color: var(--wedding-text);
  background: var(--wedding-bg);
  font-family: var(--font-serif);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

button,
a {
  -webkit-tap-highlight-color: transparent;
}

button {
  font: inherit;
}

img {
  display: block;
  max-width: 100%;
}
```

`main` 容器桌面端最大宽度建议 480px 并居中；手机端占满宽度。

---

## 10. `App.vue`

职责只有：

1. 读取 `weddingConfig`；
2. 引入婚纱照；
3. 按顺序组合四个 Section。

示意：

```vue
<script setup lang="ts">
import weddingCover from '@/assets/images/wedding-cover.jpg'
import HeroSection from '@/components/HeroSection.vue'
import InvitationSection from '@/components/InvitationSection.vue'
import WeddingDetailsSection from '@/components/WeddingDetailsSection.vue'
import ClosingSection from '@/components/ClosingSection.vue'
import { weddingConfig } from '@/config/wedding'
</script>

<template>
  <main class="wedding-page">
    <HeroSection :config="weddingConfig" :cover-src="weddingCover" />
    <InvitationSection :config="weddingConfig" />
    <WeddingDetailsSection :config="weddingConfig" />
    <ClosingSection :config="weddingConfig" />
  </main>
</template>
```

不要把所有 Section 写进一个超长 `App.vue`。

---

## 11. HeroSection

### Props

```ts
interface Props {
  config: WeddingConfig
  coverSrc: string
}
```

### DOM 语义建议

```text
<section>
  <img>
  <div overlay>
  <div content>
    eyebrow
    h1 新郎 & 新娘
    date
```

### 图片样式

```scss
.hero__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center var(--hero-image-y, 40%);
}
```

`--hero-image-y` 预留后续快速调节人物位置。

### 高度

```scss
min-height: 100vh;
min-height: 100svh;
```

### 首次入场动画

只用 CSS animation：

- 图片：`scale(1.03)` → `scale(1)`；
- 标题：opacity + translateY；
- 姓名和日期按 100～160ms 轻微错峰进入；
- 总时长控制约 1.2 秒。

不引入动画依赖。

---

## 12. InvitationSection

职责：只展示邀请文案。

Props：

```ts
interface Props {
  config: WeddingConfig
}
```

要求：

- 暖白背景；
- 内容居中；
- 上下留白充足；
- 正文使用 `invitationLines` 渲染；
- 空字符串渲染为段间距，而不是可见字符；
- 使用滚动 Reveal；
- 不增加图片。

---

## 13. WeddingDetailsSection

职责：显示所有实际婚礼信息和导航按钮。

推荐 DOM：

```text
section
├── eyebrow: WEDDING DAY
├── date group
│   ├── 2026年10月11日 · 星期日
│   └── 晚上 6:00
├── divider
├── venue group
│   ├── 扬州狮子楼（瘦西湖店）
│   └── 扬州市广陵区柳湖路 8 号（扬师院东门内，近瘦西湖南门）
└── button: 导航前往
```

时间、场地、按钮三层之间需要有明显的纵向间距，不要把整个区域做成密集表单。

---

## 14. 地图导航实现

首版采用高德地图 URI API 的搜索页面，不申请 Web Service Key，不做定位和路线计算。

### `src/utils/navigation.ts`

```ts
import type { WeddingVenue } from '@/types/wedding'

const AMAP_SEARCH_ENDPOINT = 'https://uri.amap.com/search'

export function createAmapSearchUrl(venue: WeddingVenue): string {
  const keyword = `${venue.name} ${venue.address}`
  const params = new URLSearchParams({
    keyword,
    view: 'map',
    src: 'wedding-invitation',
    callnative: '1',
  })

  return `${AMAP_SEARCH_ENDPOINT}?${params.toString()}`
}

export function openWeddingNavigation(venue: WeddingVenue): void {
  window.location.href = createAmapSearchUrl(venue)
}
```

### 设计原因

- 当前没有可靠经纬度，不要猜坐标。
- 使用“扬州狮子楼（瘦西湖店） 扬州市广陵区柳湖路 8 号（扬师院东门内，近瘦西湖南门）”组合关键词比只传场地名更容易消歧。
- 高德 URI Search 支持移动端和 PC；`callnative=1` 可在移动端尝试调起高德 App。
- 不需要前端申请地图 JS Key。
- 成功调起原生地图 App 不是硬性要求；地图 App、系统地图应用选择页或高德 H5 任一可用结果都满足首版导航降级目标。

### 后续升级

如果后续确认场地准确经纬度，可以从 `search` 升级为 `marker` 或路线 URI，但当前不要提前实现。

---

## 15. 滚动 Reveal

### `src/composables/useReveal.ts`

目标：统一控制 Section 内容进入可视区域时的动画。

推荐接口：

```ts
import type { Ref } from 'vue'

export function useReveal(target: Ref<HTMLElement | null>): void
```

实现规则：

1. `onMounted` 创建 `IntersectionObserver`；
2. `threshold` 建议约 `0.18`；
3. 首次进入后为目标元素增加 `is-visible`；
4. 动画只播放一次，然后 `unobserve`；
5. `onBeforeUnmount` 断开 observer；
6. 如果浏览器不支持 `IntersectionObserver`，直接显示内容，不允许隐藏；
7. `prefers-reduced-motion: reduce` 下直接显示或显著减少动画。

基础 CSS：

```scss
.reveal {
  opacity: 0;
  transform: translateY(16px);
  transition:
    opacity 640ms var(--ease-out),
    transform 640ms var(--ease-out);
}

.reveal.is-visible {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .reveal {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

不要实现通用动画系统，只解决当前四个 Section 的需求。

---

## 16. ClosingSection

职责：给页面提供安静、明确的结束。

展示：

```text
期待与你相见

李光耀 & 方紫薇

SEE YOU AT OUR WEDDING

2026.10.11
```

高度建议：

```scss
min-height: 72vh;
min-height: 72svh;
```

底部：

```scss
padding-bottom: max(40px, env(safe-area-inset-bottom));
```

---

## 17. 响应式策略

### 设计基准

优先基于：

```text
390 × 844
```

同时测试：

```text
360
375
390
412
430
```

### CSS 原则

- 不通过 JS 读取屏幕宽度做布局。
- 使用 `clamp()` 调整主要字号。
- 容器左右 padding 使用 20～28px 范围。
- 主内容最大宽度 360px。
- 整体页面最大宽度 480px。

示例：

```scss
.hero__names {
  font-size: clamp(28px, 8vw, 34px);
}

.section-title {
  font-size: clamp(26px, 7.2vw, 32px);
}
```

---

## 18. `index.html` 要求

必须包含正确 viewport：

```html
<meta
  name="viewport"
  content="width=device-width, initial-scale=1, viewport-fit=cover"
/>
```

建议标题：

```html
<title>李光耀 & 方紫薇 · Wedding Invitation</title>
```

首版不做复杂 SEO 和微信 JS-SDK 自定义分享。

### 子路径部署

最终页面部署在站点子路径下。首版在 `vite.config.ts` 使用相对资源基址：

```ts
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  plugins: [vue()],
})
```

这样 `dist/` 可在未最终确定名称的子路径中预览和部署。实际发布前仍需确认服务器上的公开子路径和静态文件映射。

---

## 19. 图片加载策略

由于封面是首屏 LCP 图片：

- 不对首屏婚纱照使用 `loading="lazy"`；
- 可以使用 `fetchpriority="high"`；
- 明确设置尺寸容器避免布局跳动；
- 后续正式图片确认后再做 WebP/AVIF 派生版本；
- 当前临时图只处理项目副本：允许旋转和裁掉明显黑边，源文件保持不变。

示意：

```html
<img
  :src="coverSrc"
  alt="李光耀与方紫薇的婚纱照"
  fetchpriority="high"
/>
```

---

## 20. 可访问性

必须满足：

- `<main>`、`<section>`、`<h1>` 等基础语义正确。
- 首屏新人姓名为唯一主标题 `h1`。
- 每个 Section 有可读标题或合理的 `aria-labelledby`。
- 导航按钮不小于约 44px 高。
- `:focus-visible` 有可见轮廓。
- `prefers-reduced-motion` 有处理。
- 图片有 `alt`。

---

## 21. 性能约束

首版目标：

- 不使用组件库。
- 不使用动画库。
- 不使用轮播库。
- 不发送业务 API 请求。
- 不加载视频。
- 不加载多张大图。
- 不依赖远程字体才能正常显示。

正式图片接入后建议：

- 手机端主图长边控制在合理范围；
- 结合视觉质量压缩；
- 生成现代格式；
- 保留 JPG fallback（如项目需要）。

---

## 22. 错误与降级处理

### 图片

如果临时本地图片复制失败：

- 构建前明确报错；
- 不下载随机网络图片；
- 不偷偷替换为模板素材。

### IntersectionObserver

不支持时：

- 所有内容直接显示。

### 地图

- 构建 URL 过程中只使用浏览器标准 `URLSearchParams`。
- 不猜经纬度。
- 用户点击后尽可能交给地图 App 或系统地图应用选择页处理。
- 无法调起原生应用时使用地图 H5，不把指定地图 App 的拉起成功率作为硬性验收项。

### 减少动态效果

系统启用减少动态效果时：

- 内容立即显示；
- 首屏图片不执行明显缩放。

### 旧浏览器

- 以视觉效果和核心动效为优先，不为扩大旧版本覆盖范围而降低已确认的页面效果。
- 不影响视觉时提供低成本回退，例如 `vh`、`IntersectionObserver` 缺失时直接显示、地图 H5 降级。
- 首版不引入 `@vitejs/plugin-legacy`；只有明确发现目标宾客设备无法打开页面时，才单独评估兼容改造。

---

## 23. 推荐开发顺序

Codex 按以下顺序执行，不要先做装饰性细节。

### Step 1：初始化项目

- 使用 Vite 创建 Vue + TypeScript 项目。
- 安装 Sass。
- 清理默认 Demo 代码。
- 确保 `npm run dev` 和 `npm run build` 正常。

### Step 2：准备图片

- 从指定 `/Volumes/...jpg` 复制到 `src/assets/images/wedding-cover.jpg`。
- 验证文件存在。
- 不修改原图。
- 将项目副本旋转到正常方向并裁掉明显黑边，保证临时图片可放入 Hero。

### Step 3：建立数据层

创建：

- `types/wedding.ts`
- `config/wedding.ts`

先把所有固定数据集中。

### Step 4：建立样式基础

创建：

- `_tokens.scss`
- `global.scss`

先完成基础背景、字体、布局宽度和 reset。

### Step 5：开发四个 Section

按顺序：

1. HeroSection
2. InvitationSection
3. WeddingDetailsSection
4. ClosingSection

每完成一个 Section，都在 390px 模拟器下检查一次。

### Step 6：组合 App

`App.vue` 只组合 Section，不加入业务实现细节。

### Step 7：实现导航

- 建立 `navigation.ts`。
- 使用场地名 + 地址构建搜索 URL。
- 按钮调用 `openWeddingNavigation`。

### Step 8：实现滚动动画

- 编写 `useReveal`。
- 接入 Section。
- 加入 reduced motion。

### Step 9：手机端适配

依次检查：

```text
360
375
390
412
430
```

检查姓名、地址、图片裁切、按钮和横向滚动。

### Step 10：最终构建验证

至少执行：

```bash
npm run build
```

构建失败不得交付。

---

## 24. 建议的最小测试

项目逻辑很少，不需要建立重型测试体系，但地图 URL 构建值得测试。

如果项目使用 Vitest，可增加：

```text
src/utils/navigation.spec.ts
```

核心验证：

1. URL 包含场地名；
2. URL 包含地址；
3. `callnative=1`；
4. `view=map`；
5. 中文通过 URLSearchParams 正确编码。

如果不引入 Vitest，则必须至少进行手工点击导航验证和生产构建验证。

---

## 25. Codex 实现时禁止事项

Codex 不得自行：

- 增加轮播；
- 增加音乐；
- 增加倒计时；
- 增加花瓣 / 粒子；
- 增加照片墙；
- 增加 RSVP；
- 增加登录；
- 增加服务端；
- 增加数据库；
- 增加状态管理；
- 增加路由；
- 增加组件库；
- 擅自替换用户婚纱照；
- 猜测场地经纬度；
- 修改已经确认的姓名、日期、时间、场地和地址；
- 因“高级感”把正文字号缩得难以阅读。

---

## 26. Codex 完成后的自检清单

### 内容

- [ ] 李光耀 & 方紫薇
- [ ] 2026.10.11
- [ ] 星期日
- [ ] 晚上 6:00
- [ ] 扬州狮子楼（瘦西湖店）
- [ ] 扬州市广陵区柳湖路 8 号（扬师院东门内，近瘦西湖南门）

### 结构

- [ ] 4 个 Section
- [ ] 单页滚动
- [ ] 无 Router
- [ ] 无 Pinia
- [ ] 无 UI 组件库

### 图片

- [ ] 本地图片已复制进项目
- [ ] 页面不引用 `/Volumes/...`
- [ ] 图片不变形
- [ ] 后续可直接替换 `wedding-cover.jpg`

### 视觉

- [ ] 暖白 / 深灰低饱和色
- [ ] 留白明显
- [ ] 手机字号清晰
- [ ] 无模板化婚庆特效

### 交互

- [ ] Reveal 正常
- [ ] reduced motion 正常
- [ ] 导航按钮可点击
- [ ] 地图搜索同时带场地和地址
- [ ] 无法调起地图 App 时可以进入地图 H5

### 兼容

- [ ] 360px 无横向滚动
- [ ] 375px 无横向滚动
- [ ] 390px 无横向滚动
- [ ] 412px 无横向滚动
- [ ] 430px 无横向滚动

### 构建

- [ ] `npm run build` 成功
- [ ] 浏览生产产物时无明显控制台错误

---

## 27. 最终交付预期

Codex 完成后应得到一个可以直接部署的静态 H5：

```text
打开链接
  ↓
看到婚纱照 + 李光耀 & 方紫薇 + 日期
  ↓
自然向下滚动
  ↓
看到邀请文案
  ↓
看到婚礼日期 / 时间 / 场地 / 地址
  ↓
点击导航前往
  ↓
地图搜索目标场地
  ↓
继续滚动
  ↓
看到简洁结尾
```

最终页面评价标准：

> 不是“功能是否足够多”，而是“照片是否突出、信息是否一眼能懂、排版是否舒服、手机端是否有婚礼请柬的质感”。
