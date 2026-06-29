# Brigada

## Overview

**Brigada** is a private digital home for our friend group — a small constellation of websites, each living under its own `*.brigada.mom` subdomain, that together act as a kind of "operating system" for the group. Instead of scattering our lives across a dozen public platforms (Reddit for posts, Goodreads for books, Splitwise for debts, Google Photos for pictures), Brigada brings all of it under one roof, built for us and only us.

Every site shares **one identity, one login, and one set of members**. The whole platform is **internal-only**: nobody outside Brigada can get in. Access is invite-shaped by design — you sign in with Discord, and an owner or admin has to approve you before any door opens. There are no public profiles, no SEO, no strangers. Just the group.

Each website owns exactly one job that no other site duplicates. The social feed doesn't try to be a wiki; the wiki doesn't try to be a poll engine; the debt tracker doesn't try to be a calendar. That separation keeps every piece simple, focused, and easy to build solo.

## Architecture & Principles

- **One identity across everything.** Authentication is handled by **Better-Auth** using **Discord OAuth only** — no passwords, no email verification, no registration flow to maintain. If you're in our Discord and you've been approved, you're in.
- **Approval-gated access.** Signing in is not the same as being let in. A new account starts with **no role** and can't reach any site until an owner or admin approves it (see [Roles](#roles)).
- **A single front door.** Only one subdomain (`auth.brigada.mom`) is reachable from the outside world; every other site authenticates _through_ it. Sessions are shared across all subdomains via multi-domain cookies, so you log in once and you're logged in everywhere.
- **Real-time where it matters.** Location check-ins, the calendar, and similar live features update instantly rather than waiting on refreshes.
- **Lean infrastructure.** This is a 10–15 person platform, not a startup — so the backend stays deliberately simple: a **single application server**, a **cron server** for scheduled work (e.g. the weekly report), and the **Davud Discord bot**, all serving **multiple lightweight clients**. No microservice sprawl, no over-engineering.
- **Discord is the chat layer.** We deliberately don't build a chat website (it's hard to do well and securely, and Discord already does it). We bridge Discord back into our own infrastructure through Davud (see [Discord Bot — "Davud"](#discord-bot--davud)).

## Roles

Roles form a simple ladder — each rung includes everything below it and adds more power. When someone first signs in with Discord, they land in a **pending** state with **no role at all**: they exist, but they can't access any `*.brigada.mom` site until an owner or admin approves them. Approval promotes them to `member`, and they're in.

| Role          | Inherits  | Can do                                                                                                                                                                 |
| ------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **(pending)** | —         | Nothing yet — account exists but is awaiting approval. No site access.                                                                                                 |
| **member**    | —         | The default approved user. Access every website; create posts, comments, reactions, articles, events, polls, listings, check-ins, etc. The full day-to-day experience. |
| **moderator** | member    | Access the admin panel; moderate and manage content and users — posts, articles, polls, listings, and member behavior.                                                 |
| **admin**     | moderator | Manage the platform more deeply — assign roles, manage moderators, configure site-level settings.                                                                      |
| **owner**     | admin     | Top of the ladder — control the project's most critical configuration and manage admins themselves. The final say.                                                     |

## Websites

> _Core & Identity — the foundation every other site depends on._

### brigada.mom

The flagship — a **social platform for the group**, closest in shape to Reddit but with a far more personal touch. A central feed of posts, member profiles, comments, reactions, and the everyday back-and-forth that makes a friend group feel alive. This is where the group _talks at large_: shares moments, drops links, starts threads, and reacts to each other. Note that the profile here is local to `brigada.mom` only — the cross-platform identity lives at `me.brigada.mom`.

### auth.brigada.mom

The **single front door** to all of Brigada, and the only site reachable from outside. It's intentionally barebones: one page, one button — **"Continue with Discord."** Because we authenticate purely through Discord OAuth, there's nothing to manage here — no passwords, no email verification, not even a registration form. It reads a `redirect_uri` query parameter to send you back to whichever site you were trying to reach, and uses multi-domain cookies (via **Better-Auth**) to share your session across every `*.brigada.mom`. Every other site delegates its login to this one.

### apps.brigada.mom

The **directory** of Brigada. With this many sites, nobody's expected to memorize every subdomain — so this single page lists them all, with each site's name, purpose, description, icon, and link. If you forget where something lives, you start here.

### me.brigada.mom

Your **centralized, cross-platform profile** — the one place that knows you across _all_ of Brigada, not just one site. Unlike the `brigada.mom` profile (which is local to the social platform), this is your personal hub: your unified identity, your activity across every app, and your stats within the group. Each member sees only their own. Think of it as your Brigada dashboard.

### admin.brigada.mom

The **control room**. A panel for managing the platform end to end — users, social posts, wiki articles, polls, marketplace listings, and more. Gated to `moderator`, `admin`, and `owner` roles, with each role unlocking progressively more control as defined in [Roles](#roles).

### docs.brigada.mom

The **user manual** — non-technical by design. Rather than developer docs, this explains _how to actually use_ each site: walkthroughs, tips, hidden features, and showcases of the tools across the platform. The place a new member goes to learn the ropes.

---

> _Knowledge & Expression — places to share what you know, think, and ask._

### wiki.brigada.mom

Our members love sharing articles, knowledge, and experiences — so this is a **wiki crossed with Medium**. Like Wikipedia, it's a living, collaborative knowledge base; unlike Wikipedia, it adds **collections, tags, and categories** and a more authored, personal feel. Part encyclopedia, part blog — the group's permanent, searchable brain.

### ask.brigada.mom

A genuinely **comprehensive poll, survey, and question platform**. Members post nothing but questions, surveys, and polls — but with deep configuration: multiple question types, advanced options, response tracking, live analytics, and rich results. When you want the group's _opinion_ in a structured, measurable way, this is the tool.

### anon.brigada.mom

The one place with **no names attached**. An anonymous board for confessions, unfiltered hot takes, and anonymous Q&A. Anonymity _is_ the product here — it's the only corner of Brigada where what you say isn't tied back to who you are, which makes it the right home for the things people won't post under their own profile.

---

> _Clubs & Hobbies — the things we actually do together, each with its own data and rituals._

### watch.brigada.mom

A **film & TV club** — Letterboxd for the group, plus collaborative watch sessions. Members log, rate, and review what they watch, build watchlists, and schedule group viewings. The standout feature: during a session, the site can surface **a movie nobody present has seen yet**. Built on **TMDB** as the primary data source (free, rich metadata and imagery, watch-provider info), with optional **Letterboxd enrichment** — members can link their Letterboxd username and import their watched history via public RSS, so we get the cross-referencing without depending on Letterboxd's hard-to-get API. OMDb stays as a fallback only.

### read.brigada.mom

A **book club** — Goodreads for the group, but solving the problem our old reading project had: people falling out of sync. Members pick a group read, track **synced reading progress**, and discuss in **per-chapter threads** (no spoilers ahead of where you are). Powered by the **Open Library API** (free, broad coverage), with **Google Books** as a fallback for covers and descriptions where Open Library comes up thin.

### gym.brigada.mom

A **fitness and meal tracker** with a competitive streak. The structured side — **workouts, gym sessions, and PRs** — is numeric and comparable, so members can stack their progress against each other on leaderboards (most-improved, session streaks, lift targets). The **meal-logging** side stays more personal and private by default, so food never turns into a public scoreboard. The PR and session comparisons are the social heart of it; the nutrition tracking is for you.

---

> _Stuff, Places & Logistics — the practical machinery of group life._

### find.brigada.mom

A **real-time location map**. A friend group this size, it's genuinely useful to know who's around — at home, at a café, out at a movie. Members **check in** wherever they are, and it shows up live on a shared map. Spontaneous hangouts start here.

### shop.brigada.mom

A **tiny eBay for the group**. When a member wants to sell something, no need to go to a public marketplace — list the item with photos, description, and price, and other members can browse and buy. An internal, trusted, friends-only marketplace.

### eats.brigada.mom

A **Yelp for the group** — a curated map of cafés, restaurants, and bars that members rate and recommend. It answers the eternal question "where should we eat?" with the group's own collective taste rather than strangers' reviews. Where `shop` sells _things_, `eats` reviews _places_.

### wishlist.brigada.mom

**Wishlists plus secret gifting.** Members maintain lists of things they'd love to receive, and the site doubles as a Secret Santa / gift coordinator. The key mechanic: when someone claims a gift off your list, **you can't see that it's been claimed** — the hidden-claim logic is enforced at the data layer, not just hidden in the UI, so surprises stay surprises.

### calendar.brigada.mom

A **shared calendar** for the group, fully real-time. Members create events, invite others, RSVP, and see everything laid out together. For single events it's the source of truth; the rest of the logistics tools orbit around it.

### debt.brigada.mom

A **debt tracker and bill splitter**. The group hits a café, bar, or restaurant, one person fronts the bill — now they enter the total, set the shares, and everyone sees exactly what they owe and to whom. No more "I'll get you next time" math. A friends-only Splitwise.

---

> _Tools & Meta — utilities for the group, and infrastructure for the platform itself._

### utils.brigada.mom

The group's **utility belt** — a single home for all the little tools that don't deserve their own subdomain. Decision-makers (random picker, wheel spinner, "who pays" roulette, team/bracket generator), plus converters, calculators, and reference tools. A natural place to also host our purpose-built group tools — like the **hydration coefficient (hydco)** table and the **PC-parts ranking** — as interactive widgets rather than static pages.

### gallery.brigada.mom

The group's **shared photo & video archive** — think Google Photos for Brigada. Rather than living only in the `brigada.mom` feed (which is ephemeral by nature), media here is **permanent and organized**, ideally **pulled automatically from across every other site** into one central library: tagged by source app, grouped by event or hangout, and resurfaced with "on this day" memories. The cleanest way to build it: every app writes its image references to a central media store, and `gallery` is simply the unified view over all of them.

### report.brigada.mom

The **weekly Brigada digest** — and the highest-leverage site of the lot, because it pulls value _out of_ every other app. A cron job aggregates the week's activity across the entire platform into one auto-generated recap: stats, highlights, who-did-what, notable posts, leaderboard movements, the group's ups and downs. It's the productized, multi-source evolution of the BRIGADA report tool — except now the inputs are our own clean app databases instead of a chat export. It gives even quiet members a reason to come back every week.

## Discord Bot — "Davud"

You may have noticed there's no `chat.brigada.mom`. That's deliberate, for two reasons: (1) building a chat platform that's genuinely good _and_ secure is hard, and (2) we simply don't need to — **Discord already does it**, and the group already lives there.

The cost of leaning on an external chat platform is that we lose the tight integration with our own infrastructure. **Davud**, our custom Discord bot, is how we win that back. He's the bridge between Discord and Brigada — letting the group act on the platform without ever leaving the chat, and letting the platform reach the group without us building a separate notification or email system. What Davud handles:

- **Notifications.** New approval requests, calendar reminders, debt updates, replies, poll closings — all delivered straight to Discord. This replaces the need for any custom notification or email system entirely.
- **Infrastructure integration.** Davud is wired into our own authentication and our own sites, so he acts with full awareness of who's who and what's where.
- **Commands for the websites.** Run Brigada actions from Discord — e.g. post or answer on `ask`, check who's where on `find`, browse or list on `shop`, search the `wiki`, RSVP on the `calendar`, and more.
- **…and room to grow.** As the platform expands, Davud expands with it — every new site can expose a slice of itself through him.
