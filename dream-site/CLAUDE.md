# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Static single-page landing site (Chinese-language, "DREAM. — 人因梦想而伟大"): one `index.html`, plain CSS, and vanilla JavaScript. **No build step, no package manager, no tests.** Third-party libraries (GSAP, ScrollTrigger, tsParticles) are loaded from jsDelivr CDN directly in `index.html`.

## Running locally

Open `index.html` directly in a browser, or serve the directory over HTTP (the CDN `<script>` tags require network access; `file://` works but some browsers restrict certain features):

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

There is no lint, build, or test command — this is intentional.

## Architecture

The page is organized as sequential full-viewport sections (`hero → why → reality → method → time → ending`), each with a matching anchor in the top nav. Scroll-linked animations and entrance reveals are driven by GSAP + ScrollTrigger; the hero particle field uses tsParticles.

### JS module pattern

All scripts are IIFEs that attach named initializers to a shared global namespace:

- `window.App.initParticles` — `scripts/particles.js`
- `window.App.initHero` — `scripts/hero.js`
- `window.App.initTimeline` — `scripts/timeline.js`
- `window.App.initScroll` — `scripts/scroll.js`
- `scripts/main.js` — bootstraps cursor, method tabs, smooth anchors, then calls each `App.init*` if present

**Load order in `index.html` matters**: third-party CDN scripts must precede the `scripts/*.js` files, and `main.js` must come last because it orchestrates the others. When adding a new module, follow the same pattern: IIFE that assigns `window.App.initX = function() {...}`, then invoke it from `main.js#boot`.

Every initializer guards against missing globals (`typeof gsap === "undefined"`) and missing DOM targets so partial failures degrade gracefully. Preserve this — never assume GSAP/ScrollTrigger/tsParticles is available.

### Motion & accessibility conventions

- Respect `prefers-reduced-motion`: `hero.js` skips the floating loop, `particles.js` reduces particle count and disables movement when reduced motion is set. Any new animation must follow this pattern.
- The custom cursor (`.cursor`) is disabled on coarse/no-hover pointers (`matchMedia("(hover: none), (pointer: coarse)")`) — see `main.js#initCursor`.
- Hover-trigger targets for the cursor ring are enumerated by selector in `main.js`: `a, button, [data-card], [data-step], .method__step, .reality-card`. Update that list when adding new interactive elements.

### Styles

Two stylesheets, loaded in order: `styles/base.css` (design tokens as CSS variables on `:root`, reset, nav, hero, cursor, grid overlay) and `styles/sections.css` (per-section layout). Design tokens (colors `--bg-*`, `--text-*`, `--accent-a/b/c`, gradients, spacing, radii, typography stacks) are defined once in `base.css:1-26` — reuse them rather than hard-coding hex values.

### Timeline SVG

`#timelineCurve` and `#timelineArea` in `index.html` are hand-authored SVG paths. `timeline.js` uses `getTotalLength()` + `stroke-dashoffset` scrubbing to draw the curve as the user scrolls. If the path `d=""` changes, no JS change is needed — `getTotalLength()` re-derives it. The three node positions (`translate(...)`) and label `left/right` percentages are positioned manually to match the curve; keep them in sync when editing the path.
