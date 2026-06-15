# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Self-hosted meeting intelligence: meetbud joins calls (via Recall.ai), records/transcribes them, and produces AI summaries with action items. pnpm-workspace monorepo with two apps:

- `apps/app` — Vue 3 SPA (port 5173), the user-facing UI
- `apps/api` — NestJS 11 API (port 3000, all routes under `/api`)

The README describes the original "Phase 1" state (bare backend, all-mock frontend). That is **out of date** — the API now has real auth/profile/users/meetings domains, and the frontend is being wired to it. Trust the code over the README.

## Commands

Run from the repo root unless noted. Node 24 + pnpm 10 are pinned via `mise` (`mise install` first time).

```bash
pnpm infra:up            # start Postgres + Redis + Mailpit (Docker) — required before api
pnpm dev                 # run app + api in parallel
pnpm dev:app             # app only
pnpm dev:api             # api only
pnpm build               # build all workspaces
pnpm format              # prettier --write across the repo
pnpm infra:down          # stop infra
```

API-specific (run in `apps/api`):

```bash
pnpm prisma:migrate      # prisma migrate dev (create/apply migrations)
pnpm prisma:generate     # regenerate the Prisma client after schema edits
pnpm db:seed             # seed admin user (prisma/seed.ts)
pnpm test                # unit tests (*.spec.ts under src/)
pnpm test -- auth.service # run a single unit suite by path/name fragment
pnpm test:e2e            # e2e tests (test/*.e2e-spec.ts)
```

> e2e tests boot the real `AppModule` and hit a live Postgres + Redis — `pnpm infra:up` must be running. Only `MailService` is faked (see `apps/api/test/helpers.ts`).

The API needs `apps/api/.env` (copy `.env.example`). Docker host ports are intentionally offset (Postgres 5433, Redis 6380, Mailpit SMTP 1026 / UI 8026) to coexist with other local instances — env files already point at these.

## Formatting

Prettier: no semicolons, single quotes, 2-space (`.prettierrc`). Applies to `.ts`/`.vue`/`.js`/`.json`/`.md`/`.yaml`.

## API architecture

NestJS, feature-module per domain (`auth`, `profile`, `users`, `meetings`), all registered in `app.module.ts`. Shared infra lives in `src/common` (`redis`, `mail`) and `src/prisma`. Env is validated at boot by `config/env.validation.ts` (class-validator) — add new required vars there.

**Auth is passwordless OTP + JWT rotation:**
- `requestCode` emails a 6-digit code; the hash is stored in Redis with a TTL, plus per-email try-count and resend-cooldown keys. Unknown emails silently no-op (anti-enumeration). See `auth/auth.service.ts`.
- `verify` exchanges code → access + refresh token pair. `TokenService` (`auth/token.service.ts`) signs both, and tracks valid refresh-token `jti`s in Redis (`refresh:<userId>:<jti>` + a `refresh-set:<userId>` set) so tokens can be rotated on use and revoked en masse on logout.

**Guards are global** (registered as `APP_GUARD` in `auth/auth.module.ts`, JWT first then roles). Consequently:
- Every route is authenticated **by default**. Mark public endpoints with `@Public()` (`auth/decorators/public.decorator.ts`).
- Restrict by role with `@Roles('admin')` on a controller or handler (`auth/decorators/roles.decorator.ts`); `RolesGuard` enforces it.
- Get the caller via `@CurrentUser()` → `AuthUser` (`{ userId, role }`).

**Response shaping:** Prisma rows are never returned directly. `src/common/shaping/*` converts entities into the API's wire shape (e.g. `shapeMeeting`, `shapeUser`, `shapePerson`) — derived fields like `durationMin`, `initials`, `color` are computed here. When adding/changing an endpoint's output, update or add a shaper rather than leaking the Prisma model.

**Data model** (`apps/api/prisma/schema.prisma`): `User`/`UserPreference`, and the meetings domain `Meeting` → `Participant`, `Recording`, `TranscriptSegment`, `Summary` (`Summary.content` is JSON holding keyPoints/actionItems/decisions/topics). Enums drive status/platform/role. Tables are snake_cased via `@@map`.

## Frontend architecture

Vue 3 + Vite + TypeScript, Vue Router, Pinia, Tailwind v4 + daisyUI v5. `@/` aliases `src/`.

- **API client** (`src/lib/api.ts`): a thin `fetch` wrapper. It auto-attaches the bearer token, and on a 401 transparently calls `/auth/refresh` once (de-duped via a shared promise) and retries; persistent 401 triggers `onAuthFailure`. It takes auth callbacks via `configureApi` instead of importing the store — this deliberately breaks the store→api→store circular dependency. Use `apiGet/apiPost/apiPatch/apiDelete`.
- **Auth store** (`src/stores/auth.ts`) calls `configureApi` to wire tokens, persists `accessToken`/`refreshToken`/`user` to localStorage (pinia-plugin-persistedstate), and exposes a local-only `roleOverride` for the prototype's role-switch demo (does not hit the server).
- **Routing** (`src/router/index.ts`): a global `beforeEach` enforces `meta.public` (redirect to login when signed out) and `meta.admin` (redirect non-admins). Views are lazy-loaded; authenticated views nest under `AppShell`.
- Some screens still render mock data from `src/data/*`; domain stores (`meetings`, `recordings`) are the live path. Check which a view uses before changing data flow.

## Conventions

- TypeScript throughout; API is strict NestJS DI — inject services via the constructor, validate inputs with DTO classes (`*/dto/*.dto.ts`) + class-validator; the global `ValidationPipe` whitelists and rejects unknown fields.
- Tests live beside source as `*.spec.ts` (unit) and in `apps/api/test/*.e2e-spec.ts` (e2e).
