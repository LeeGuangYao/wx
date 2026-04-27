# Repository Guidelines

## Project Structure & Module Organization
This repository contains three main areas:

- `notes/`: the active notes app. Backend code lives in `notes/src/` with a layered flow of `routes/ -> controllers/ -> services/ -> db/`. Runtime entry points are `notes/server.js` and `notes/src/app.js`.
- `notes/client/`: Vue 3 + Vite frontend source. Build artifacts are emitted to `notes/public/`, which Express serves in production. Treat `notes/public/` as generated output.
- `dream-site/`: standalone static landing page with `index.html`, `styles/`, `scripts/`, and `assets/`.
- `docs/`: design and planning notes.

## Build, Test, and Development Commands
Run app commands from `notes/` unless noted otherwise:

- `npm install`: install backend dependencies and the nested client dependencies.
- `npm run dev`: start Express with `nodemon` and the Vite dev server together.
- `npm start`: run the backend on `PORT` from `.env` (`3175` by default).
- `npm run build`: build `notes/client/` into `notes/public/`.
- `npm run migrate`: create or update the SQLite schema in `data/notes.db`.
- `python3 -m http.server 8000` from `dream-site/`: quick local preview for the static site.

## Coding Style & Naming Conventions
Use Node.js 18+. Follow existing style per area: backend files use CommonJS, semicolons, and 2-space indentation; the Vue/Vite client uses ES modules, Vue SFCs, and concise camelCase helpers such as `fetchNotes` or `saveNote`. Keep filenames lowercase with role-based suffixes like `note.service.js`, `note.controller.js`, and `note.route.js`.

## Testing Guidelines
There is no first-party automated test suite yet. Before opening a PR, run `npm run build`, `npm run migrate`, and manually verify note CRUD flows through `npm run dev`. If you add tests, place backend tests near the feature under `notes/src/` or create a dedicated `notes/tests/` directory, and name them `*.test.js`.

## Commit & Pull Request Guidelines
Recent history uses short subjects such as `update` and `修改接口调用`. Keep commits small and single-purpose, but make subjects more specific when possible, for example `fix note save debounce` or `调整移动端编辑区布局`. PRs should include a short summary, affected paths, manual verification steps, linked issues when available, and screenshots for UI changes in `notes/client/` or `dream-site/`.

## Configuration Tips
Copy `notes/.env.example` when setting up locally. Do not hardcode `PORT` or `DB_PATH`; read both through `notes/src/config/index.js`.
