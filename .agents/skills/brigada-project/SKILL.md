---
name: brigada-project
description: Context, scope, and product philosophy for the Brigada project — a private, invite-only multi-site platform for a small friend group, hosted under *.brigada.mom. Use whenever the user is working anywhere in this repo, planning a new site or feature, deciding what belongs where across subdomains, reasoning about access/roles, weighing scope or simplicity tradeoffs, or asking "should we build X" questions. Trigger when the user mentions Brigada, any *.brigada.mom subdomain (auth, apps, me, admin, docs, wiki, ask, anon, watch, read, gym, find, shop, eats, wishlist, calendar, debt, utils, gallery, report), Davud (the Discord bot), or the group-friend-platform framing.
---

# Brigada — Project Context

This is a business/product context skill, not a tech skill. Use it to understand **what Brigada is, who it's for, and what kind of decisions fit the project** before you make implementation choices. For stack-specific guidance, defer to the other skills in this repo (Hono, Prisma, Better Auth, Turborepo, shadcn, etc.).

The canonical, longer-form description lives at `.docs/BRIGADA.md`. Read it when you need full detail. This file is the short, durable summary.

---

## What Brigada is

**Brigada** is a private digital home for a single friend group of roughly **10–15 people**. It's a small constellation of websites — each living under its own `*.brigada.mom` subdomain — that together act as an "operating system" for the group: their social feed, wiki, polls, film club, book club, gym tracker, location map, marketplace, calendar, debt tracker, wishlists, photo gallery, weekly digest, and more.

Instead of scattering group life across a dozen public platforms (Reddit, Goodreads, Splitwise, Google Photos, Letterboxd, Yelp…), Brigada brings it all under one roof — **built for this group and only this group**.

It is **not**: a startup, a SaaS, a public product, a multi-tenant platform, a marketplace, a community tool sold to other groups. There is no growth target, no monetization, no public roadmap. The "user base" is fixed and known by name.

---

## Core principles (these drive most decisions)

1. **One identity across everything.** A single login (Discord OAuth via Better-Auth) shared across all subdomains via multi-domain cookies. You sign in once, you're in everywhere.
2. **Approval-gated.** Signing in ≠ being let in. New accounts land in a **pending** state with no role; an owner or admin must promote them to `member` before any site opens.
3. **A single front door.** Only `auth.brigada.mom` is reachable from outside. Every other site authenticates through it.
4. **One site, one job.** Each subdomain owns exactly one purpose and doesn't duplicate another's. The wiki is not the social feed; the debt tracker is not the calendar. This separation is load-bearing — it's what keeps each site small enough to build solo.
5. **Internal-only by design.** No public profiles, no SEO, no strangers, no anonymous browsing, no email/password, no registration flow. If you're not in the group, you can't see anything.
6. **Lean infrastructure.** Single application server, a cron server (for the weekly report and similar), and the Davud Discord bot, serving multiple lightweight clients. **No microservice sprawl.** Build for 10–15 people, not for scale.
7. **Discord is the chat layer.** Brigada deliberately does **not** build a chat website. Chat is hard to do well and securely, and the group already lives on Discord. Davud (the bot) bridges Discord back into Brigada's infrastructure.
8. **Real-time where it matters.** Location check-ins, the calendar, and similar live features update instantly. Most other things don't need realtime — don't add it just because.

---

## Roles (the access ladder)

Each role inherits everything below it.

- **(pending)** — account exists, no site access. Awaiting approval.
- **member** — full day-to-day experience: post, comment, react, check in, list items, RSVP, etc.
- **moderator** — member + admin panel access; moderates content and users.
- **admin** — moderator + assigns roles, manages moderators, configures sites.
- **owner** — admin + manages admins themselves; final say on platform-critical config.

When designing any feature, ask: **which role can do this?** Default to `member`; gate moderation/configuration to `moderator`/`admin`/`owner` via the admin panel (`admin.brigada.mom`).

---

## The websites (and what each one is *for*)

Grouped the way the docs group them — these groupings matter when deciding where a new feature belongs.

### Core & Identity (the foundation)
- **`brigada.mom`** — the flagship social feed (Reddit-shaped, personal-flavored). Posts, comments, reactions, local profile.
- **`auth.brigada.mom`** — the one public door. Single "Continue with Discord" button. Reads `redirect_uri`, shares session via multi-domain cookies.
- **`apps.brigada.mom`** — the directory; one page listing every site so nobody has to memorize subdomains.
- **`me.brigada.mom`** — your cross-platform profile/dashboard. Distinct from the `brigada.mom` profile, which is local to the social site.
- **`admin.brigada.mom`** — the control room. Gated by role.
- **`docs.brigada.mom`** — the **user** manual (not developer docs). How to actually use each site.

### Knowledge & Expression
- **`wiki.brigada.mom`** — wiki crossed with Medium. Collections, tags, categories, authored feel. The group's permanent brain.
- **`ask.brigada.mom`** — polls, surveys, questions with deep configuration, live analytics, rich results.
- **`anon.brigada.mom`** — the only anonymous corner. Confessions, hot takes, anon Q&A. Anonymity is the product.

### Clubs & Hobbies
- **`watch.brigada.mom`** — film/TV club (Letterboxd-shaped) with group watch sessions. **TMDB primary**, Letterboxd RSS enrichment optional, OMDb as fallback only.
- **`read.brigada.mom`** — book club with synced reading progress and per-chapter threads (no spoilers ahead of where you are). **Open Library primary**, Google Books fallback.
- **`gym.brigada.mom`** — workouts/PRs are competitive/leaderboard; **meal logging stays personal/private by default**.

### Stuff, Places & Logistics
- **`find.brigada.mom`** — real-time shared map of who's checked in where.
- **`shop.brigada.mom`** — friends-only marketplace (tiny eBay).
- **`eats.brigada.mom`** — group-curated Yelp for cafés/restaurants/bars. (`shop` sells *things*; `eats` reviews *places*.)
- **`wishlist.brigada.mom`** — wishlists + Secret Santa. **Critical invariant:** when someone claims a gift off your list, you must not see that it's claimed. **Enforce hidden-claim logic at the data layer, not just the UI** — surprises stay surprises.
- **`calendar.brigada.mom`** — shared real-time calendar. Source of truth for single events.
- **`debt.brigada.mom`** — Splitwise for the group; bill splitter + debt tracker.

### Tools & Meta
- **`utils.brigada.mom`** — utility belt (random picker, wheel, team/bracket generator, converters, calculators, plus group-specific tools like the **hydration coefficient (hydco)** and **PC-parts ranking**).
- **`gallery.brigada.mom`** — permanent, organized photo/video archive. Designed to **pull media automatically from every other site** into one central library. Every app writes image refs to a central media store; gallery is the unified view.
- **`report.brigada.mom`** — the **weekly digest**, generated by cron. Aggregates the week's activity across every other app: stats, highlights, who-did-what, leaderboard movements. **Highest-leverage site of the lot** — it draws value *out of* every other app and gives quiet members a reason to come back.

---

## Davud — the Discord bot

There is **no `chat.brigada.mom`**, and there won't be. Chat is hard to do well/securely, and Discord already does it. **Davud** is the custom bot that bridges Discord and Brigada:

- **Notifications** — approval requests, calendar reminders, debt updates, replies, poll closings. This **replaces any need for a custom email or notification system**. Default to "Davud DMs you on Discord" before designing an email pipeline or in-app notification center.
- **Commands** — run Brigada actions from Discord: post/answer on `ask`, check `find`, browse `shop`, search `wiki`, RSVP on `calendar`, etc.
- **Infra-aware** — wired into Brigada's auth and sites, so he acts with full knowledge of who's who.

When a new site is added, **plan its Davud surface alongside it** (what notifications? what commands?).

---

## How to make decisions in this project

When the user asks for a feature, plan, or architecture choice, use these as your defaults:

- **Does this duplicate another site's job?** If yes, move it to the site that already owns that job, or push back on adding it at all. The one-site-one-job rule is what keeps the project shippable.
- **Is this for 10–15 people or for "users"?** Don't reach for patterns that exist to serve scale (sharding, multi-tenancy, complex caching, rate limiting beyond the basics, microservices, queue infra, k8s). Boringly simple wins.
- **Could Davud do this instead of a new UI?** Notifications, lightweight commands, and "remind me" style features almost always live in Davud, not in a new screen.
- **Could the weekly `report` surface this instead of a live screen?** For passive "look back at what happened" features, the cron-generated digest is often a better home than a new live view.
- **Does this need realtime?** Only `find`, `calendar`, and live group features genuinely do. Most things don't.
- **Is this gated correctly?** Public = nothing. Approved member = the default. Moderation/admin/config = admin panel only.
- **Does it expose anyone outside the group?** If yes, it's wrong. There is no public surface beyond `auth.brigada.mom`'s sign-in button.
- **Where does the media go?** If a feature produces images/videos, they should write into the central media store so `gallery` can surface them automatically.

---

## Anti-patterns (things to push back on)

- Building a chat feature inside any site. Send them to Discord / Davud.
- Adding email/password, registration forms, email verification, or "magic links." Discord OAuth is the only path in.
- Public read access "just for SEO" or "just for sharing a link." There is no public surface.
- Microservices, service meshes, queues, k8s. The infra is one app server + one cron server + Davud.
- Cross-site feature duplication ("let's add a mini-calendar to the wiki," "let's add comments to the gallery before the social site has them"). Each site owns one job.
- Designing features for hypothetical future members or hypothetical public release. The group is fixed and known.
- Hiding sensitive logic only in the UI layer (especially `wishlist` claim status). Enforce invariants at the data layer.

---

## What this skill is *not*

Not a stack reference. For tech-specific guidance use the corresponding skill:

- **Auth** → `better-auth-best-practices`
- **API/server** → `hono`
- **DB schema / migrations / CLI** → `prisma-cli`, `prisma-database-setup`
- **DB queries** → `prisma-client-api`
- **Monorepo / pipelines** → `turborepo`
- **UI components** → `shadcn`, `frontend-design`, `web-design-guidelines`
- **React/Next perf** → `vercel-react-best-practices`, `vercel-composition-patterns`
- **Logging** → `review-logging-patterns`, `analyze-logs`

Use **this** skill to decide *what* to build and *where it belongs*. Use those skills to decide *how* to build it.
