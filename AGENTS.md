# AGENTS.md

## Workspace layout

Six independent projects under one git repo. No root `package.json` or shared tooling. Each project has its own `CLAUDE.md` — read it before editing.

| Directory | What | Stack |
|---|---|---|
| `notes/notes/` | Notes/备忘录 app | Express 4 + SQLite + Vue 3 (Vite build, Tiptap npm) |
| `ccapi/` | 食记 backend | Express 4 + SQLite + multer |
| `chanchan/` | WeChat Mini Program | WeChat Cloud Dev (miniprogram + cloud functions) |
| `dream-site/` | Static landing page | Vanilla HTML/CSS/JS, GSAP CDN, no build |
| `claudeHistory Viewer/` | Claude CLI history viewer | Python 3 stdlib HTTP server + inline HTML |
| `opencodeHistory/` | OpenCode CLI session manager | Python 3.9+, SQLite, zero external deps, optional fzf |

**Gotchas**:
- The notes app is at `notes/notes/` (double-nested), not `notes/`. The outer `notes/` directory also holds `docs/` and this file.
- `notes/notes/CLAUDE.md` and `notes/notes/PROJECT_CONTEXT.md` are **stale** — they say "Tiptap CDN, no build step" but the frontend now uses Vite (`client/`). Ignore them when they conflict with this file.
- `notes/AGENTS.md` is a separate older AGENTS.md that is superseded by this one.
- `opencodeHistory/` is not git-tracked yet.

## Per-project commands

### notes/notes/
```bash
npm install           # postinstall also runs cd client && npm install
npm run dev           # concurrently: nodemon (backend :3175) + vite dev (client :5175, proxies /api → :3175)
npm start             # production (node server.js)
npm run build         # cd client && vite build → notes/notes/public/
npm run migrate       # SQLite schema migration (also auto-runs on startup)
```
- `public/` is generated output from Vite build — do not edit directly.
- PM2 config at `ecosystem.config.cjs` for production deployment.
- Frontend (`client/`) is ESM (`"type": "module"`); backend is CommonJS.

### ccapi/
```bash
npm install
npm run dev           # nodemon
npm start
npm run migrate       # also auto-runs on startup
npm run normalize-urls   # fix image URL format in DB
```

### chanchan/
Requires **WeChat DevTools** — no CLI build. Upload cloud functions via `uploadCloudFunction.sh` or DevTools UI.

### dream-site/
```bash
python3 -m http.server 8000   # no build step, no package manager
```

### claudeHistory Viewer/
```bash
python3 claude-history-server.py   # serves at http://localhost:7734
```

### opencodeHistory/
```bash
./opencode-history serve [-p 7780]  # web frontend (default port 7780)
./opencode-history index            # build/update session index
./opencode-history list             # list sessions
./opencode-history search <query>   # search sessions
python3 -m pytest tests/            # run tests (from opencodeHistory/)
```

## Shared architecture: ccapi & notes backends

Both `ccapi/` and `notes/notes/` backends share the same patterns. Violating these is the most common agent mistake:

- **Layered**: `route → controller → service → db`. SQL only in service layer; controllers must not contain SQL or business logic.
- **better-sqlite3 is synchronous** — never `await` db calls. Service functions don't need `async`.
- **No ORM** — keep raw SQL. Don't introduce Sequelize/Prisma.
- **Unified response format**: always use `src/utils/response.js` (`ok()` / `fail()`). Never hand-craft `{code, message, data}`.
- **Config via `.env`**: never hardcode `PORT`, `DB_PATH`, `BASE_URL`, etc. Read through `src/config/index.js`.
- **CommonJS** throughout backend — no ESM (`import`/`export`).
- **Node.js ≥ 18**.

### ccapi-specific pitfalls
- `image_urls` is a **JSON string** in SQLite — `JSON.parse` on read, `JSON.stringify` on write. Use existing `hydrate()`.
- multer upload field name is fixed as **`images`** (`upload.array('images')`).
- Route order matters: `/meal/list` must precede `/meal/:id` in `meal.route.js`.
- Deleting a meal also deletes local image files — path traversal defense is in `meal.service.remove`.
- **Caipu module uses a different response format**: `/api/caipu/*` returns `{code: 200, msg, result}` (aligned with 天行 API style), NOT the standard `{code: 0, message, data}`. See `ccapi/RECIPE_API.md`.

## Testing

No automated test suite in `notes/`, `ccapi/`, `chanchan/`, `dream-site/`, or `claudeHistory Viewer/`. Manually verify via `npm run dev` before changes. `opencodeHistory/` has pytest tests — run `python3 -m pytest tests/` from that directory.

## Commit style

Keep commits small and single-purpose. Prefer specific subjects (`fix note save debounce`, `调整移动端编辑区布局`) over generic `update`.
