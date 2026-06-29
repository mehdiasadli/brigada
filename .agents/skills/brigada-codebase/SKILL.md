---
name: brigada-codebase
description: File-by-file map of the Brigada monorepo — every app, every package, what each file does, how they connect. Use whenever the user is working in this repo and you need to find where something lives, what a file is for, which package owns a concern, or how a piece of code fits into the larger structure. Trigger on questions like "where is X", "what does this file do", "which package handles Y", "how does the server talk to the web", "where should this new code go", or when navigating apps/server, apps/web, or any packages/* directory.
---

# Brigada — Codebase Map

The Brigada repo is a **Turborepo monorepo managed with Bun**. Two apps (`apps/server`, `apps/web`) consume eight internal packages (`packages/*`). For *what the project is* and product/scope decisions, see the `brigada-project` skill. For *how to write code* in this repo, see `brigada-conventions` and `brigada-design-system`.

---

## Repo root

| Path | Purpose |
|---|---|
| `package.json` | Workspaces config (`apps/*`, `packages/*`), shared dep **catalog** (zod, hono, better-auth, react, tailwind…), root scripts (`dev`, `build`, `db:*`, `check`). Bun 1.3.14, ESM. |
| `turbo.json` | Turborepo task pipeline: `build` (depends on `^build`, outputs `dist/**` + `.next/**`), `dev` (persistent, no cache), `db:*` tasks. |
| `biome.json` | Formatter + linter. **Tab indent, double quotes, organize-imports on save.** Tailwind class sorting enabled (`clsx`, `cva`, `cn`). |
| `tsconfig.json` | Extends `@brigada/config/tsconfig.base.json`. |
| `lefthook.yml` | Git hooks. |
| `bun.lock` / `bunfig.toml` | Bun lockfile + config. |
| `.docs/BRIGADA.md` | Canonical product description — read it for the *what/why*. |
| `.agents/skills/` | Repo-local agent skills (this file lives here). `.claude/skills/` mirrors via symlinks. |

---

## Apps

### `apps/server` — the Hono backend

The **single application server** that fronts everything. Runs on Bun.

| File | Purpose |
|---|---|
| `src/index.ts` | The whole server. Builds a `Hono<EvlogVariables>` app: `evlog()` middleware → Better-Auth user identification middleware → CORS (allowed origins = `getDomains("client")`) → mounts Better-Auth at `/api/auth/*` → mounts oRPC `RPCHandler` at `/rpc` and `OpenAPIHandler` at `/api-reference` (with Zod-to-JSON-Schema converter). `GET /` → "OK". Exports `app` as default for Bun. |
| `package.json` | Depends on `@brigada/api`, `@brigada/auth`, `@brigada/db`, `@brigada/env`, `@brigada/utils`. Scripts: `dev` (`bun run --hot`), `build` (`tsdown`), `compile` (bun's standalone binary build). |
| `tsdown.config.ts` | Production build config. |
| `.env` | Local secrets (gitignored). |

Server runs on Bun + Hono. **No business logic lives here** — all procedures live in `@brigada/api`. This file's only job is to wire the handlers together.

### `apps/web` — the Next.js client

The first Brigada site (`brigada.mom` flagship). Next 16 + React 19 (with React Compiler) + TanStack Query.

| File | Purpose |
|---|---|
| `src/app/layout.tsx` | Root layout. Loads Geist Sans + Geist Mono via `next/font`, wraps children in `<Providers>`. `suppressHydrationWarning` for theme. |
| `src/app/page.tsx` | Home page. Currently a stub — just renders `<ModeToggle />`. |
| `src/app/favicon.ico` | Favicon. |
| `src/components/providers.tsx` | Client-side `Providers` wrapper. Delegates to `AppProvider` from `@brigada/ui` and passes the query client. |
| `src/components/mode-toggle.tsx` | Sun/Moon button that toggles `next-themes` theme. |
| `src/utils/orpc.ts` | The oRPC + TanStack Query setup: `createQueryClient()` (with toast-on-error), the singleton `queryClient`, `RPCLink` (credentials: include, forwards SSR headers), the typed `client: AppRouterClient`, and `orpc = createTanstackQueryUtils(client)`. **This is the only place the client talks to the server.** |
| `src/lib/auth-client.ts` | Better-Auth React client (`authClient`). Configured with `multiSessionClient` + `inferAdditionalFields<typeof auth>` so the client sees the same custom fields (role, username) as the server. |
| `src/lib/evlog.ts` | evlog logger setup for the web app. |
| `src/proxy.ts` | Next middleware exporting `proxy = evlogMiddleware()` for `/api/:path*`. |
| `src/index.css` | One-liner: `@import "@brigada/ui/globals.css";` — all real styles live in the UI package. |
| `components.json` | shadcn config for this app. `style: base-lyra`, `baseColor: neutral`, components alias `@/components`, utils → `@brigada/ui/lib/utils`, ui → `@brigada/ui/components`. |
| `next.config.ts` | Next config. |
| `postcss.config.mjs` | PostCSS / Tailwind v4 config. |
| `instrumentation.ts` | Next instrumentation hook. |
| `package.json` | Depends on `@brigada/api`, `@brigada/auth`, `@brigada/ui`, `@brigada/env`. Dev port: **3001**. |

---

## Packages

### `packages/api` — the oRPC router

Type-safe API layer shared by server (mounts it) and web (calls it). Currently a skeleton.

| File | Purpose |
|---|---|
| `src/router.ts` | `appRouter` (currently `{}`) and the exported types `AppRouter`, `AppRouterClient`. **This is the file you compose feature routers into.** |
| `src/procedures.ts` | Defines `publicProcedure = o` and `protectedProcedure = publicProcedure.use(requireAuth)`. `requireAuth` throws `ORPCError("UNAUTHORIZED")` if no session, otherwise injects `userId` into context. |
| `src/context.ts` | `createContext({ context })` reads the Better-Auth session from request headers and returns `{ auth: null, session }`. Exports `Context` type. |
| `src/o.ts` | Just `export const o = os.$context<Context>()` — the base oRPC builder. |

**Feature routers will live under `src/routers/{feature}/{router,queries,mutations,utils}.ts`** (see `brigada-conventions`).

### `packages/auth` — Better-Auth instance

| File | Purpose |
|---|---|
| `src/index.ts` | `createAuth()` builds the Better-Auth instance: Prisma adapter (postgres), Discord-only social provider with scopes (`email`, `identify`, `guilds`, `guilds.members.read`, `guilds.channels.read`, `dm_channels.messages.write`), additional user fields (`role`, `username`), cross-subdomain cookies (`domain: APP_DOMAIN`, prefix `brigada_`), plugins `multiSession()` + `openAPI()`. Exports `auth = createAuth()`. |
| `package.json` | Has a `generate` script that runs `@better-auth/cli generate` against this file and writes to `../db/prisma/schema/auth.preview.prisma` (used to diff against the real `auth.prisma`). |

### `packages/db` — Prisma 7 + Postgres

| File | Purpose |
|---|---|
| `src/index.ts` | `createPrismaClient()` uses `@prisma/adapter-pg` against `env.DATABASE_URL`. Also exports a default singleton `prisma`. |
| `prisma/schema/schema.prisma` | Generator config (`prisma-client`, ESM, **Bun runtime**) and the postgres datasource. |
| `prisma/schema/auth.prisma` | Better-Auth models: `User` (with `username` + `image` + email-verified), `Session`, `Account`, `Verification`. Snake_case table names via `@@map`. |
| `prisma/generated/` | Generated client + per-model files. **Do not edit.** |
| `prisma.config.ts` | Prisma 7 config file. |
| `package.json` | Scripts: `db:push`, `db:generate`, `db:migrate`, `db:studio`. Runs `prisma generate` on postinstall. |

### `packages/env` — typed env vars (t3-env)

| File | Purpose |
|---|---|
| `src/server.ts` | `@t3-oss/env-core` schema. Server vars: `NODE_ENV`, `DATABASE_URL`, `BETTER_AUTH_SECRET` (min 32), `BETTER_AUTH_URL`, `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`. |
| `src/web.ts` | `@t3-oss/env-nextjs` schema. Client vars: `NEXT_PUBLIC_SERVER_URL`. |

Subpath exports `./server` and `./web` — always import the right one.

### `packages/schemas` — centralized Zod schemas

**The single source of truth for all input/output schemas** — consumed by `@brigada/api` (server), `@brigada/auth`, and client code. Currently empty (only `src/index.ts`). Feature schemas go under `src/{feature}/{queries,mutations,types}.ts` where `types.ts` exports `z.infer`'d TypeScript types. See `brigada-conventions`.

### `packages/ui` — the shared UI library

The shadcn `base-lyra` component set + design tokens, built on **Base UI** primitives + **Tailwind v4**.

| Path | Purpose |
|---|---|
| `src/styles/globals.css` | All design tokens. `@import "tailwindcss"` + `tw-animate-css` + `shadcn/tailwind.css`. Defines OKLCH `:root` and `.dark` token sets (green primary at `oklch(0.527 0.154 150°)`), radius scale (sm/md/lg/xl/2xl/3xl/4xl from `--radius: 0.625rem`), and base layer (border, cursor on buttons, sans body). |
| `src/lib/utils.ts` | `cn(...inputs)` = `twMerge(clsx(inputs))`. |
| `src/components/button.tsx` | Built on `@base-ui/react/button`, **rounded-none**, variants `default/outline/secondary/ghost/destructive/link`, sizes `xs/sm/default/lg/icon/icon-xs/icon-sm/icon-lg`. `cva`-based. |
| `src/components/input.tsx` `card.tsx` `label.tsx` `checkbox.tsx` `dropdown-menu.tsx` `skeleton.tsx` `sonner.tsx` | shadcn primitives. |
| `src/components/providers/app-provider.tsx` | The composite client provider: `ThemeProvider` → `NuqsAdapter` → `QueryClientProvider` → children + `ReactQueryDevtools` + `Toaster`. Takes a `queryClient` prop. Every Brigada client app wraps in this. |
| `src/components/providers/theme-provider.tsx` | Wraps `next-themes` with `attribute="class"`, `defaultTheme="system"`. Adds a `ThemeHotkey` that toggles dark/light on plain "d" keypress (skipped when typing in inputs/textarea/contenteditable). |
| `components.json` | shadcn config for adding new components into this package. |
| `postcss.config.mjs` | PostCSS / Tailwind v4 config for the package. |

**Subpath exports:** `./globals.css`, `./lib/*`, `./components/*`, `./hooks/*`, `./postcss.config`. Consumers import like `@brigada/ui/components/button` and `@brigada/ui/lib/utils`.

### `packages/utils` — shared helpers and constants

| File | Purpose |
|---|---|
| `src/constants/config.ts` | `APP_NAME = "Brigada"`, `APP_SLUG = "brigada"`, `APP_TLD = "mom"`, `APP_DOMAIN = "brigada.mom"`. |
| `src/constants/applications.ts` | The **subdomain registry**. Defines `appVariants = ["client", "server", "bot"]`, `subdomains = ["www", "auth", "admin"]` (more to come), the `apps` record (name/description/port/variant per subdomain), `createDomain`/`createLocalDomain` helpers, and `getDomains(...variants)` which returns the right URL list for the current `NODE_ENV`. **Used by auth (trustedOrigins) and server (CORS allowlist).** When adding a new `*.brigada.mom` site, register it here first. |

### `packages/config` — shared TypeScript base

| File | Purpose |
|---|---|
| `tsconfig.base.json` | The strict base TS config. `ESNext` target/module, `bundler` resolution, `verbatimModuleSyntax: true` (so `import type` is mandatory), `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`. `types: ["bun"]`. Every package extends this. |
| `package.json` | Empty private package — just a vehicle for the shared tsconfig. |

---

## Dependency graph (who imports whom)

```
apps/server  ──► @brigada/api ──► @brigada/auth ──► @brigada/db
             ├─► @brigada/auth                  └─► @brigada/utils
             ├─► @brigada/db
             ├─► @brigada/env (server)
             └─► @brigada/utils

apps/web     ──► @brigada/api (types only via AppRouterClient)
             ├─► @brigada/auth (types only via inferAdditionalFields<typeof auth>)
             ├─► @brigada/ui
             └─► @brigada/env (web)

@brigada/api ──► @brigada/auth, @brigada/db, @brigada/env
@brigada/auth──► @brigada/db, @brigada/env, @brigada/utils
@brigada/db  ──► @brigada/env
@brigada/utils──► @brigada/env (server)
@brigada/schemas ──► @brigada/env  (future: source of truth for input/output Zod)
@brigada/ui  ──► (no internal deps)
@brigada/env ──► (no internal deps)
@brigada/config──► (no internal deps; consumed only via tsconfig extends)
```

The dep graph **must stay acyclic** and roughly funnel-shaped: leaf packages (`env`, `config`, `ui`, `schemas`) → mid packages (`db`, `utils`, `auth`) → `api` → apps.

---

## Where new code goes (quick lookup)

| If you're adding… | …it lives in |
|---|---|
| A new `*.brigada.mom` site | New entry in `packages/utils/src/constants/applications.ts` first, then a new `apps/{slug}` Next app following the `apps/web` template. |
| A new oRPC procedure | `packages/api/src/routers/{feature}/{router,queries,mutations,utils}.ts`. Compose into `packages/api/src/router.ts`. |
| A Zod schema for a procedure | `packages/schemas/src/{feature}/{queries,mutations}.ts`. Types in `packages/schemas/src/{feature}/types.ts` via `z.infer`. |
| A new database model | `packages/db/prisma/schema/*.prisma`. Run `bun db:generate` + `bun db:migrate`. |
| A shared UI component | `packages/ui/src/components/{name}.tsx`. Or add via shadcn into this package using its `components.json`. |
| A route-specific component (web) | Colocated: `apps/web/src/app/{route}/_components/{name}.tsx`. See `brigada-conventions`. |
| A shared web component | `apps/web/src/components/{name}.tsx`. |
| A new env var | Add to the right schema in `packages/env/src/{server,web}.ts`. |
| An auth-related setting | `packages/auth/src/index.ts`. Re-run `bun --filter @brigada/auth generate` if it affects DB schema, then sync `packages/db/prisma/schema/auth.prisma`. |
| A utility constant | `packages/utils/src/constants/{name}.ts`. |
| A logger or middleware | evlog is wired in `apps/server/src/index.ts` and `apps/web/src/proxy.ts` + `src/lib/evlog.ts`. See `review-logging-patterns`. |

---

## Tech stack (where it shows up)

- **Bun 1.3.14** — package manager + runtime for `apps/server` and Prisma client generator.
- **Turborepo** — task orchestration via `turbo.json`. See `turborepo` skill.
- **TypeScript ESNext** with `verbatimModuleSyntax` — strict, type-only imports required.
- **Hono** (`apps/server/src/index.ts`) — HTTP framework. See `hono` skill.
- **oRPC** (`packages/api/*`, `apps/server/src/index.ts`, `apps/web/src/utils/orpc.ts`) — type-safe RPC + OpenAPI handler.
- **Better-Auth 1.6.11** (`packages/auth`) — Discord-only OAuth, multi-session, cross-subdomain cookies. See `better-auth-best-practices` skill.
- **Prisma 7** + `@prisma/adapter-pg` (`packages/db`) — Postgres ORM, ESM, Bun runtime. See `prisma-cli` / `prisma-client-api` / `prisma-database-setup` skills.
- **Next.js 16** + React 19 + React Compiler (`apps/web`).
- **TanStack Query 5** (`apps/web/src/utils/orpc.ts`).
- **Tailwind v4** + **shadcn `base-lyra`** + **Base UI** (`packages/ui`). See `shadcn` skill.
- **lucide-react** — icon set.
- **nuqs** — URL state.
- **sonner** — toasts (wired via `Toaster` in `AppProvider`).
- **next-themes** — light/dark via class strategy.
- **evlog 2.18.1** — logging on server (`evlog/hono`, `evlog/better-auth`) and web (`evlog/next` middleware). See `review-logging-patterns` / `analyze-logs`.
- **Zod 4** — schemas (centralized in `@brigada/schemas`).
- **t3-env** — typed env vars.
- **Biome 2.4** — formatter + linter.

---

## Things that don't exist yet (but the structure plans for)

- Most `*.brigada.mom` sites (only `www`/`auth`/`admin` registered, only `web` built; rest of the constellation per `brigada-project` is still TBD).
- The Davud Discord bot (`bot` variant exists in `appVariants` but no app folder yet).
- The cron server (planned for the weekly `report`).
- Feature routers in `@brigada/api` (router is `{}` for now).
- Schemas in `@brigada/schemas` (package is empty).
- Any data model beyond Better-Auth's `User`/`Session`/`Account`/`Verification`.
