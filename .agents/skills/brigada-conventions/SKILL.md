---
name: brigada-conventions
description: Code conventions for the Brigada repo — naming, file/folder structure, import & export style, and the oRPC procedure pattern. Use whenever you create, move, rename, or restructure code in this repo; whenever you write a new file and need to decide where it goes or what to call it; whenever you add an oRPC procedure or its Zod schemas; or when reviewing existing code for convention adherence. Trigger when the user asks "where should this go", "what do I name this", "is this the right import style", or anything about repo-wide conventions, formatting, or structure rules.
---

# Brigada — Code Conventions (v1)

The scope of this v1 is deliberately narrow: **naming, file/folder structure, imports & exports, and the oRPC procedure pattern.** Other conventions (workspace boundaries, error handling, comments, commit style) will be added in later revisions.

For *where files actually live today*, see `brigada-codebase`. For *what to build*, see `brigada-project`. Tech-specific style (Prisma queries, Hono middleware shape, shadcn components, etc.) lives in their dedicated skills.

The repo is formatted by **Biome 2.4** (`biome.json`): **tab indent, double quotes, organize-imports on save, Tailwind class sorting** in `clsx` / `cva` / `cn`. Most stylistic concerns are handled there — don't argue with the formatter, run `bun check` instead.

---

## 1. Naming

### Files

- **All filenames are `kebab-case`.** No exceptions for component files, hook files, route segments — everything is kebab.
  - `mode-toggle.tsx` ✅  `ModeToggle.tsx` ❌
  - `auth-client.ts` ✅
- **Hook files: `use-foo.ts`** (kebab), even though the exported hook is `useFoo`. The file matches the rest of the repo; the export matches React conventions.
  - `use-current-user.ts` exports `function useCurrentUser()` ✅
- **Component files use `.tsx`**, everything else `.ts`.
- **Route segments** (Next App Router) follow Next conventions: `page.tsx`, `layout.tsx`, `loading.tsx`, `_components/`, `route.ts`, etc. These are framework-defined and stay as Next wants them.
- **Prisma schemas: `{feature}.prisma`** inside `packages/db/prisma/schema/` (e.g. `auth.prisma`).

### Identifiers

- **Components & React hooks:** `PascalCase` / `useCamelCase` exports.
  - `export function ModeToggle()` / `export function useCurrentUser()`
- **Functions, variables, methods:** `camelCase`.
- **Types & interfaces:** `PascalCase`. Don't prefix with `I` (no `IUser`). Type aliases preferred over interfaces unless you specifically need declaration-merging.
- **Constants (true compile-time constants):** `SCREAMING_SNAKE_CASE`.
  - `APP_NAME`, `APP_DOMAIN`, `APP_SLUG`, `APP_TLD` in `packages/utils/src/constants/config.ts`.
- **`as const` arrays / lookup objects:** `camelCase` plural noun for the array, `PascalCase` for the derived type.
  - `export const appVariants = [...] as const; export type AppVariant = (typeof appVariants)[number];` ✅
- **Generic type parameters:** single uppercase letter (`T`, `K`, `V`) or `PascalCase` words (`TInput`, `TContext`) — never bare lowercase.

### Packages

- All internal packages are scoped: **`@brigada/{name}`** (lowercase, single-word when possible). The package's directory name is just `{name}` (no scope).
- App packages (`apps/server`, `apps/web`) are **unscoped** and have a plain `name` in their `package.json`.
- New package → new entry in the catalog (root `package.json`) only if a third-party dep is being shared.

### Routers, schemas, services

- Folder per feature: `{feature}` is `kebab-case`, **plural where the feature is a collection** (`posts`, `users`, `polls`), singular for non-collection concerns (`session`, `auth`).
- The four well-known file names inside a router/schema feature folder (`router.ts`, `queries.ts`, `mutations.ts`, `utils.ts`, `types.ts`) are reserved — don't add ad-hoc files at that level. If you need another file, name it descriptively and keep it scoped to the feature (e.g. `permissions.ts`).

---

## 2. File & folder structure

### `apps/web` — App-Router-colocated

The Next 16 app uses **strict route colocation**:

```
apps/web/src/
  app/                              ← all routes
    layout.tsx                       (root layout)
    page.tsx                         (home)
    {route}/
      page.tsx
      layout.tsx                     (optional)
      loading.tsx                    (optional)
      _components/                   ← route-only components, leading underscore
        {component-name}.tsx
      _hooks/                        ← route-only hooks (use-*.ts)
      _utils/                        ← route-only helpers
  components/                        ← components shared across ≥2 routes
  hooks/                             ← hooks shared across ≥2 routes
  lib/                               ← client integrations (auth-client, evlog, …)
  utils/                             ← cross-route helpers (orpc.ts lives here)
```

**Rules:**

- **Default to colocation.** A component used by exactly one route lives in that route's `_components/`. **Don't pre-promote** to `src/components/` "in case it's reused later."
- **Promote on second use.** When a second route needs the same component/hook, move it into `src/components/` (or `src/hooks/`) — that's the trigger.
- **The leading underscore (`_components`, `_hooks`, `_utils`) is required** — Next treats `_`-prefixed folders as private (not routable), which is exactly what we want for these.
- **No `lib/` inside route folders.** If a route needs framework integration, it almost certainly belongs in the global `src/lib/`.
- `src/utils/orpc.ts` is the **only** place the web app constructs the oRPC client. Import `orpc`, `client`, or `queryClient` from there.

### `packages/api` — feature-routered

```
packages/api/src/
  o.ts                              ← base oRPC builder (don't touch lightly)
  context.ts                        ← createContext / Context type
  procedures.ts                     ← publicProcedure, protectedProcedure
  router.ts                         ← composes all feature routers
  routers/
    {feature}/
      router.ts                     ← combines queries + mutations into one router; exports the result
      queries.ts                    ← service-layer query functions
      mutations.ts                  ← service-layer mutation functions
      utils.ts                      ← feature-specific helpers (optional)
```

- `queries.ts` and `mutations.ts` are **service files** — they contain the actual functions, written as oRPC procedures using `publicProcedure` / `protectedProcedure` from `../../procedures`.
- `router.ts` (feature-level) imports those functions and assembles them into a single router: `export const {feature}Router = { ...queries, ...mutations }`.
- Root `src/router.ts` imports each feature router and composes: `export const appRouter = { posts: postsRouter, users: usersRouter, ... }`.
- **No procedure logic in `router.ts`.** Router files are pure composition.
- Always import Zod schemas from `@brigada/schemas/{feature}/{queries|mutations}` — never inline a `z.object` in a procedure.

### `packages/schemas` — single source of truth for Zod

```
packages/schemas/src/
  {feature}/
    queries.ts                      ← input/output schemas for query procedures
    mutations.ts                    ← input/output schemas for mutation procedures
    types.ts                        ← z.infer'd TS types re-exported from the above
```

- **`@brigada/schemas` is the single source of truth.** Server (oRPC), client (forms, validation), and any shared logic all import from here. **Never duplicate a Zod schema** in the API or in a component.
- `types.ts` is for `z.infer`'d types and re-exports — e.g. `export type CreatePostInput = z.infer<typeof createPostInput>`. Use these types everywhere downstream; don't `z.infer` at the consumer site.
- Group schemas by procedure: `createPostInput`, `createPostOutput`, `listPostsInput`, etc. — name matches the procedure it serves.

### Other packages

- `packages/ui` — components flat under `src/components/`, hooks under `src/hooks/`, styles under `src/styles/`. Providers grouped under `src/components/providers/`.
- `packages/utils` — helpers grouped by purpose: `src/constants/`, future `src/{topic}/`.
- `packages/db`, `packages/auth`, `packages/env`, `packages/config` — flat. They're each focused enough to not need internal structure.

---

## 3. Imports & exports

### Always use the `@brigada/*` alias

**Both within a package and across packages**, use the package alias:

```ts
// ✅ Inside packages/ui/src/components/button.tsx
import { cn } from "@brigada/ui/lib/utils";

// ✅ Inside apps/web/src/components/providers.tsx
import { AppProvider } from "@brigada/ui/components/providers/app-provider";

// ❌ Relative paths within a package
import { cn } from "../lib/utils";
```

The benefits: one mental model (consumers and same-package code look identical), portable when a file moves, and consistent with how the workspace exports are declared in `package.json`.

**Exception:** files inside a single feature folder of `@brigada/api` or `@brigada/schemas` may use **short relative paths** to sibling files in the same feature folder (`./queries`, `./mutations`, `./utils`). Crossing out of the feature folder always uses the alias.

### Named exports by default

- **Default exports only when a framework requires them.** That is:
  - Next App Router files: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `template.tsx`, `default.tsx`, middleware, etc. (Next requires `export default`.)
  - The `apps/server/src/index.ts` `export default app` (Bun's entrypoint convention).
  - Anywhere else only if a third-party tool *requires* a default export.
- **Every other file: named exports.** Even single-export files. Especially components, hooks, and utility functions.

```ts
// ✅
export function Button(...) { ... }

// ❌
export default function Button(...) { ... }
```

### `import type` is mandatory

`verbatimModuleSyntax: true` is on in `tsconfig.base.json`. Type-only imports **must** use `import type`:

```ts
// ✅
import type { AppRouterClient } from "@brigada/api/router";
import { createORPCClient } from "@orpc/client";

// ✅ mixed: separate the value and type imports
import { type Context, createContext } from "@brigada/api/context";

// ❌
import { AppRouterClient } from "@brigada/api/router";  // tsc will error
```

### Import ordering: don't think about it

Biome's `assist.actions.source.organizeImports: on` sorts imports automatically. Don't hand-order. Just run `bun check` (which calls `biome check --write .`).

### Barrel files: avoid

Each package's `package.json` declares both a root export (`./src/index.ts`) and a subpath export (`./*` → `./src/*.ts`). **Always import from the most specific subpath** that gives you what you need:

```ts
// ✅
import { cn } from "@brigada/ui/lib/utils";
import { Button } from "@brigada/ui/components/button";
import { env } from "@brigada/env/server";

// ❌
import { cn, Button } from "@brigada/ui";   // forces a barrel re-export
```

A package's `src/index.ts` should re-export only what's genuinely "the package's single API surface" (often: nothing, or a single primary export). Don't sweep everything into it.

### Dependency declarations

- **Catalog deps** (`catalog:`) for any third-party package shared across more than one workspace. Pinned in the root `package.json` `workspaces.catalog`.
  ```json
  "zod": "catalog:",
  "hono": "catalog:"
  ```
- **Workspace deps** (`workspace:*`) for internal `@brigada/*` packages.
  ```json
  "@brigada/api": "workspace:*"
  ```
- A package-local-only dep stays declared directly (e.g. `tsdown` only in `apps/server`).

---

## 4. oRPC procedure pattern

The shape every procedure follows.

### Choosing a base procedure

- `publicProcedure` — no auth required. Use for `/api/auth/*`-adjacent endpoints, healthchecks, or features explicitly designed to work without a session (rare in Brigada).
- `protectedProcedure` — **the default for almost everything.** Throws `UNAUTHORIZED` if no session; injects `userId` and `session` into procedure context.

```ts
// packages/api/src/procedures.ts
export const publicProcedure = o;
export const protectedProcedure = publicProcedure.use(requireAuth);
```

### Writing a procedure

Inside `packages/api/src/routers/{feature}/queries.ts` or `mutations.ts`:

```ts
import { protectedProcedure } from "@brigada/api/procedures";
import { createPostInput, createPostOutput } from "@brigada/schemas/posts/mutations";

export const createPost = protectedProcedure
  .input(createPostInput)
  .output(createPostOutput)
  .handler(async ({ input, context }) => {
    // context.userId, context.session are guaranteed
    // ...service logic
  });
```

- **Always import schemas from `@brigada/schemas`.** Never inline a `z.object({...})` in a procedure file.
- **Always declare both `.input(...)` and `.output(...)`** for procedures that take input / return data. This keeps the OpenAPI schema accurate (the server exposes one via `OpenAPIHandler` at `/api-reference`).
- The procedure variable name **matches the schema name's stem** (`createPostInput` ↔ `createPost`).

### Composing a feature router

In `packages/api/src/routers/{feature}/router.ts`:

```ts
import * as queries from "./queries";
import * as mutations from "./mutations";

export const postsRouter = {
  ...queries,
  ...mutations,
};
```

Then in `packages/api/src/router.ts`:

```ts
import { postsRouter } from "./routers/posts/router";
import { usersRouter } from "./routers/users/router";

export const appRouter = {
  posts: postsRouter,
  users: usersRouter,
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
```

This gives the web client typed access via `orpc.posts.createPost.mutationOptions(...)` and `orpc.posts.list.queryOptions(...)`.

### Schema file shape

`packages/schemas/src/posts/mutations.ts`:

```ts
import { z } from "zod";

export const createPostInput = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1),
});

export const createPostOutput = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
});
```

`packages/schemas/src/posts/types.ts`:

```ts
import type { z } from "zod";
import type { createPostInput, createPostOutput } from "./mutations";

export type CreatePostInput = z.infer<typeof createPostInput>;
export type CreatePostOutput = z.infer<typeof createPostOutput>;
```

Consumers (forms, components, services) import the inferred types from `@brigada/schemas/posts/types` — they do not call `z.infer` themselves.

---

## What's not in v1 (coming later)

These conventions are intentionally not pinned yet — flag them when they come up, but don't assume a rule:

- **Workspace boundaries** — which package may import which (will likely codify what the dep graph in `brigada-codebase` already shows).
- **Error handling** — ORPCError taxonomy, when to throw vs. return, what shape errors take on the client.
- **Logging** — when to use evlog vs. console, what to log, log keys.
- **Comments / JSDoc** — currently follows the CLAUDE-default "comment only when the *why* is non-obvious."
- **Commit / branch / PR style.**
- **Test conventions** — no test framework wired in yet.
