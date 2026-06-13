# meetbud

Self-hosted meeting intelligence — meetbud joins your calls (via Recall.ai), records and
transcribes them, and produces AI summaries with action items.

> **Phase 1** delivers the full handoff UI (Vue) plus the project scaffolding. The backend is a
> bare NestJS skeleton — no domain APIs or schema yet.

## Stack

| Area     | Tech                                                                  |
| -------- | --------------------------------------------------------------------- |
| Monorepo | pnpm workspaces, Node 24 (pinned via `mise`)                          |
| Frontend | Vue 3 + Vite + TypeScript, Vue Router, Pinia, Tailwind v4, daisyUI v5 |
| Backend  | NestJS 11 + TypeScript                                                |
| Infra    | Postgres + Redis (Docker Compose)                                     |
| Tooling  | Prettier (no semicolons, single quotes, 2-space)                      |

## Layout

```
apps/
  app/   Vue 3 SPA  (port 5173)
  api/   NestJS API (port 3000, prefix /api)
docker-compose.yml   Postgres + Redis only
mise.toml            Node + pnpm versions
```

The app and api run **locally** via pnpm. Only stateful services (db, redis) run in Docker.

## Getting started

```bash
# 1. Install the pinned toolchain (Node 24 + pnpm) — first time only
mise install

# 2. Install dependencies
pnpm install

# 3. Start infra (Postgres + Redis)
pnpm infra:up

# 4. Run both apps (parallel)
pnpm dev
#   app → http://localhost:5173
#   api → http://localhost:3000/api/health
```

Run them individually with `pnpm dev:app` / `pnpm dev:api`.

The API reads `apps/api/.env` (copy from `.env.example`).

## Notes on the UI port

The UI is a pixel-faithful port of the Claude Design handoff prototype (React + daisyUI v4) to
Vue 3 + daisyUI v5. Decisions made during the port:

- **Theming** — the prototype's runtime "Tweaks" panel was dropped. Accent (sky), font (Manrope),
  density (comfortable) and dark tone (slate) are baked into `src/assets/styles/app.css`. Only the
  light/dark toggle remains live (plus the in-place sidebar and notes-layout toggles).
- **Data** — all screens run on mock data (`src/data/*`); there are no backend calls yet.
- **State** — Pinia stores (`auth`, `ui`, `recordings`) persist to `localStorage`, mirroring the
  prototype's behavior.

## Scripts

| Command           | Description                   |
| ----------------- | ----------------------------- |
| `pnpm dev`        | Run app + api in parallel     |
| `pnpm build`      | Build all workspaces          |
| `pnpm format`     | Format the repo with Prettier |
| `pnpm infra:up`   | Start Postgres + Redis        |
| `pnpm infra:down` | Stop infra                    |
