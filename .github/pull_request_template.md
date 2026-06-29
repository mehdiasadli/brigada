<!--
  PR title must follow Conventional Commits — it's linted in CI.
  Examples:
    feat(web): add invite flow
    fix(server): handle empty cookie header
    chore(deps): bump hono to 4.9
    refactor(api): split posts router
-->

## Summary

<!-- What changed, in 1–3 lines. -->

## Why

<!-- The motivation: what problem this solves, what user need it serves, or what
     follow-up it unblocks. Skip if obvious from the title. -->

## Type of change

- [ ] ✨ Feature — new user-facing capability
- [ ] 🐛 Fix — corrects broken behavior
- [ ] ♻️ Refactor — internal change, no behavior diff
- [ ] ⚡ Performance — measurable speed/size win
- [ ] 🎨 UI / styling — visual-only change
- [ ] 🧱 Chore / infra — tooling, deps, CI, config
- [ ] 📝 Docs
- [ ] 💥 Breaking change (fill the section below)

## Scope

<!-- Tick everything this PR touches. Helps reviewers and future archaeology. -->

**Apps**

- [ ] `apps/web`
- [ ] `apps/server`

**Packages**

- [ ] `@brigada/api`
- [ ] `@brigada/auth`
- [ ] `@brigada/config`
- [ ] `@brigada/db`
- [ ] `@brigada/env`
- [ ] `@brigada/schemas`
- [ ] `@brigada/ui`
- [ ] `@brigada/utils`

**Other**

- [ ] Root / monorepo tooling (turbo, biome, lefthook, CI, etc.)
- [ ] `.github/` workflows or templates

## Test plan

<!-- How a reviewer can verify this works. Be concrete:
     - exact pages / routes touched
     - which procedures / queries to hit
     - edge cases covered
     Tick the boxes you actually ran locally. -->

- [ ]
- [ ]

**Automated checks**

- [ ] `bun check` (biome) passes
- [ ] `bun check-types` (turbo) passes
- [ ] `bun build` passes (only if this PR could affect build output)

## Screenshots / video

<!-- For any UI change. Drop before/after side-by-side when possible.
     Delete this section if the PR has no UI surface. -->

<details>
<summary>Before / After</summary>

|        | Before | After |
| ------ | ------ | ----- |
| Light  |        |       |
| Dark   |        |       |
| Mobile |        |       |

</details>

## Database / schema changes

<!-- Delete if the PR doesn't touch packages/db. Otherwise list:
       - which .prisma files changed
       - whether a migration is needed (`bun db:migrate`)
       - whether existing data needs backfilling
       - whether the change is forward- and backward-compatible during deploy -->

- [ ] No DB changes
- [ ] Schema changed; migration included
- [ ] Backfill / data migration required (described below)

## Breaking changes

<!-- Delete if none. Otherwise describe:
       - what breaks
       - who is affected (which app, which consumer)
       - the migration path / how to upgrade callers -->

## Related

<!-- Linked issues, prior PRs, design docs, Slack/Discord threads.
     Use "Closes #N" to auto-close issues on merge. -->

-

## Reviewer checklist

- [ ] PR title is a valid Conventional Commit
- [ ] Scope above is filled in
- [ ] No accidental changes to unrelated files
- [ ] No secrets, `.env` values, or personal info committed
- [ ] Public APIs (oRPC procedures, exported types, package exports) are still backward-compatible — or breaking changes are called out above
