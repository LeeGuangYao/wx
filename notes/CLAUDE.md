# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository structure

Three independent areas in one repo:

- **`notes/`** — Notes app (Vue 3 + Express + SQLite). Has its own `CLAUDE.md` with full detail.
- **`dream-site/`** — Static landing page (one `index.html`, vanilla CSS/JS, GSAP animations). Has its own `CLAUDE.md`.
- **`docs/`** — Design and planning documents.

## Notes app (`notes/`)

Run all commands from `notes/`:

```bash
npm install           # installs backend + client (postinstall hook)
npm run dev           # nodemon (backend :3175) + vite dev (client :5175, proxies /api → :3175)
npm start             # production: node server.js
npm run build         # vite build → notes/public/
npm run migrate       # run SQLite schema migration
```

### Architecture

- **Backend**: Express 4, CommonJS, layered `route → controller → service → db`. Entry: `server.js` → `src/app.js`.
- **Frontend**: Vue 3 + Tiptap in `client/` (Vite, ES modules). Build output goes to `public/`, which Express serves statically. SPA fallback routes non-API requests to `index.html`.
- **Database**: SQLite via better-sqlite3 (synchronous API — never `await` it). WAL mode. Schema in `src/db/migrate.js`.
- **Config**: All env vars read through `src/config/index.js`. Never hardcode `PORT` or `DB_PATH`.
- **Response format**: All API responses use `src/utils/response.js` helpers: `ok(data, msg?)` → `{code:0, message, data}`, `fail(msg, code?)` → `{code, message, data:null}`.

### Key constraints

- better-sqlite3 is synchronous — do not `await` db calls.
- No ORM — keep raw SQL in service layer only.
- Controller must not contain SQL or business logic.
- Frontend build is Vite-based; `public/` is generated output, do not edit directly.
- PM2 config exists at `ecosystem.config.cjs` for production deployment.

## Dream site (`dream-site/`)

No build step, no package manager, no tests. Open `index.html` in a browser or serve via `python3 -m http.server 8000`. See `dream-site/CLAUDE.md` for JS module pattern (IIFEs on `window.App`) and motion/accessibility conventions.

## Testing

No automated test suite. Manually verify CRUD flows via `npm run dev` before changes. If tests are added, place them under `notes/src/` or `notes/tests/` as `*.test.js`.

## Commit style

Keep commits small and single-purpose. Prefer specific subjects like `fix note save debounce` over generic `update`.
