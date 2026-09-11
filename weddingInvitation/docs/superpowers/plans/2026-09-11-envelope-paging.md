# Envelope and Five-Screen Invitation Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task in the current workspace. The user requested a plan followed by implementation.

**Goal:** Add an elegant opening envelope and reliable full-screen paging while preserving all 20 photos in five screens.

**Architecture:** A fixed viewport contains five translated panels. A small paging state machine owns the opening lock and transition lock; a Vue composable adapts wheel, touch, keyboard, links, viewport changes and reduced motion. Three album screens show six uncropped photos each; the cover and wedding details each retain their existing photo.

**Tech Stack:** Existing Vue 3, TypeScript, SCSS, Vite and Vitest; no new runtime dependencies.

**Spec:** User requests in this conversation on 2026-09-11, including the correction from eleven pages to four or five pages; the concrete specification is recorded below.

## Global Constraints / Specification

- Exactly five screens: cover, three photo collages of six photos, wedding details with countdown and navigation below the hotel address.
- Preserve all 20 currently displayed photos and the confirmed wedding information.
- Reload/new entry always starts at the sealed cover, even with an old hash. Returning from a map in the same live page preserves state.
- Place a small ivory-and-gold envelope with a deep blue seal below “我们结婚啦”, outside the photo so it cannot cover faces. Clicking opens it and advances one page. Before that, all paging inputs are locked.
- Each screen fills the usable viewport. Wheel/touch gestures advance at most one page, with keyboard and visible links as alternatives.
- Short screens and enlarged text can scroll within the current panel; a fresh outward gesture at its edge changes pages. Preserve pinch zoom.
- Replay photo entrances on each page entry, use contained images for collages, and respect reduced motion.
- Add one short description below each page title.
- Keep existing user changes; do not commit or publish as part of this request.

## Task 1: Paging behavior and album allocation

**Files:** `src/utils/paging.ts`, `src/utils/paging.spec.ts`, `src/config/albumPages.ts`, `src/config/albumPages.spec.ts`.

**Interfaces:** `InvitationPager(total)` exposes `index`, `previousIndex`, `phase`, `opened`, `beginOpening()`, `finishOpening()`, `goTo(index)`, `settle()`. `WheelGesture.feed(delta, now, consumed)` returns -1, 0 or 1. `canScrollWithin(scrollTop, scrollHeight, clientHeight, direction)` resolves overflow ownership. `albumPages` contains three `PhotoChapter` records with six photos each.

- [x] Write behavior tests for sealed/opening locks, repeated input during transitions, bounds, two separate wheel gestures versus inertia, scroll ownership, and all 18 album photos appearing exactly once.
- [x] Run `npm test -- src/utils/paging.spec.ts src/config/albumPages.spec.ts`; confirm missing implementation fails.
- [x] Implement state transitions: `sealed -> opening -> turning(index=1) -> idle`; only idle/unlocked state can turn. Accumulate wheel deltas to 60px and consume each gesture until a 220ms quiet gap.
- [x] Run those tests and confirm they pass.

## Task 2: Full-screen shell and envelope

**Files:** `src/composables/useInvitationPager.ts`, `src/components/InvitationEnvelope.vue`, `src/components/HeroSection.vue`, `src/components/SectionFooter.vue`, `src/App.vue`, `src/assets/styles/global.scss`.

**Interfaces:** `useInvitationPager(viewportRef, ids)` returns reactive `pager`, `height`, `openEnvelope()`, `goTo(index)`, `onLinkClick(event)`. It calls the state machine from Task 1 and attaches/removes DOM listeners on mount/unmount. `InvitationEnvelope` receives `opening/opened` and emits `open`.

- [x] Render five panels at `height: var(--viewport-height)` and translate the track by `-index * height`; use a 600ms transition with timeout completion and immediate reduced-motion completion.
- [x] Set first entry to `#cover`, intercept internal links without native anchor scrolling, guard hash changes, and isolate inactive panels with inert plus visibility and pointer-event fallbacks.
- [x] Handle wheel, single-finger vertical touch, arrows/PageUp/PageDown/Space/Home/End. Ignore editable targets, modified links, horizontal gestures and pinch zoom; let overflow content consume its own gesture.
- [x] Read visual viewport height only at scale 1, fall back to innerHeight, and settle transitions on resize. Clean up timers, listeners and observers.
- [x] Build a semantic envelope button: gold-lined ivory folds, blue wax seal, lifted letter and opening flap. Open once then advance; display a clear locked footer hint before opening.

## Task 3: Photos, descriptions and responsive layout

**Files:** `src/components/PhotoAlbumSection.vue`, `src/components/WeddingDetailsSection.vue`, `src/components/CountdownSection.vue`, `src/components/WeddingPhoto.vue`, `src/config/wedding.ts`, `src/types/wedding.ts`.

**Interfaces:** Sections receive `active` for photo entrances; album additionally receives `chapter`, `page`, `nextHref` and `previousHref`. `WeddingPhoto` adds optional `active` and `fit: 'cover' | 'contain'` while retaining its existing load, observer and reduced-motion safeguards.

- [x] Use a six-photo collage in each album screen, two columns on portrait phones and three columns in landscape, `object-fit: contain`, and finite available grid height.
- [x] Gate each photo animation on its panel being active after a turn, reset on exit, alternate gentle horizontal entrances and fades with short staggered delays.
- [x] Add “一封请柬，邀你共赴我们的幸福。” to the cover and “这一刻，想与你一同珍藏。” to wedding details; album descriptions live with their page configuration.
- [x] Compact details spacing to keep the countdown, address and navigation visible in normal phone heights; retain inner scrolling for short-height/zoom cases.

## Task 4: Verification and documentation

**Files:** `README.md`, this plan.

- [x] Run `npm test` and `npm run build` using installed Node 24; check diffs for whitespace errors.
- [x] Browser check: deep hash reload starts sealed, wheel and keyboard cannot bypass, click envelope opens and advances, next/previous links work, each wheel/touch gesture moves one screen, photo animations replay, all 20 images load.
- [x] Inspect portrait and landscape screenshots, image containment, overflow and hotel navigation placement. Check reduced-motion and overflow fallback through logic tests and browser evidence where available; distinguish device simulation from real phone validation.
- [x] Update README with five-screen architecture, input handling, photo behavior and manual mobile checks; record completed checks here.

## Self-review

All six requested behaviors and the five-page correction map to the tasks above. The navigation helper and countdown calculations remain unchanged. No photo assets need regenerating.

## Verification results

- Initial paging/allocation tests failed because implementations were absent, then passed after implementation.
- Added input-adapter tests for short sealed-cover scrolling, opening delay, reduced motion, touch edge ownership and pinch cancellation. The two sealed-cover overflow tests reproduced the independent review finding, then passed after the fix.
- Independent read-only review found the sealed-cover overflow issue; it is fixed. No other concrete correctness findings were reported.
- Chromium browser checks: all panels equal viewport height at 390×844, 320×568, 844×390; no horizontal document overflow; 1/6/6/6/1 image allocation. Sealed wheel/End cannot leave cover; opening goes to page 2; a large wheel gesture advances once; all six animations replay on returning to an album; landscape collages use three columns; overflowing landscape details can scroll to the navigation button; reloading from the last page returns to a sealed cover.
- Real-device Safari/WeChat touch and browser chrome behavior remain manual release checks; viewport simulation is not a substitute for device testing.
