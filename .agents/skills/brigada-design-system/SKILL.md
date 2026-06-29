---
name: brigada-design-system
description: Visual design language for Brigada — the brutalist/sharp/dense aesthetic, typography, sizing/spacing/radius scale, and component shape & feel rules. Use whenever you build, restyle, or review any UI in this repo; whenever you choose component sizes, spacing, fonts, or border-radius; whenever you add a new shadcn component and need to know how it should look in Brigada's house style. Trigger when the user says "design", "style", "look", "feel", "size", "spacing", "rounded", "radius", "typography", "font", "tailwind", asks "is this on-brand", or works on anything visual.
---

# Brigada — Design System (v1)

Brigada's UI is **brutalist, sharp, and dense.** Small text, no rounded corners on interactive elements, tight spacing, neutral grays with a green accent. The feel is **software, not marketing** — closer to a terminal or a dev tool than a SaaS landing page.

This v1 codifies **typography, the sizing/spacing/radius scale, and component shape & feel rules.** Color tokens (the OKLCH set in `packages/ui/src/styles/globals.css`), per-site theming, and icon-usage rules will land in later rounds — until then, defer to what's already in `globals.css`.

For _how to add a new shadcn component_ into `packages/ui`, see the `shadcn` skill. For _accessibility review_, see `web-design-guidelines`. For _broader visual direction beyond Brigada_, see `frontend-design`.

---

## 1. The tone in one paragraph

Brigada looks like a tool the group runs, not a product sold to anyone. Controls are small (`h-8`, `text-xs`), corners are square (`rounded-none` on every interactive element), the page is dense, and color is restrained — a near-monochrome neutral palette with **one green** doing all the accent work. There's no glassmorphism, no soft shadows, no gradients, no animated splash. Hover and focus states are immediate and crisp, not soft fades. If a screen feels "polished and marketing-y," it's wrong.

---

## 2. Component shape & feel

These are the rules that define the aesthetic. They apply across every site and every component.

### Square corners (`rounded-none`)

- **Every interactive control is `rounded-none`.** Buttons, inputs, checkboxes, dropdowns, popovers, dialogs, cards, tabs, badges — sharp corners.
- The radius scale **exists** in `globals.css` (`--radius: 0.625rem` with `sm/md/lg/xl/2xl/3xl/4xl` derivatives) but is **not** the default. It's reserved for genuine exceptions where a single rounded element solves a specific visual problem (e.g. a circular avatar uses `rounded-full`). Treat reaching for the radius scale as a deliberate, justifiable choice — not the default.
- **Avatars are the one common exception**: circular (`rounded-full`).

### One green, neutral everything else

- Primary, accent, and focus states all use the same green: `oklch(0.527 0.154 150°)` light / `oklch(0.448 0.119 151°)` dark, surfaced via the `--primary` / `--accent` tokens.
- Everything else is neutral gray (`--background`, `--foreground`, `--muted`, `--border`, `--input` tokens). Do not introduce new hues without checking — the restraint is a feature.
- **Destructive** is the only other coloured token (`--destructive`, red-orange). Use only for genuinely destructive actions, not for "high priority" or warnings.

### Borders, not shadows

- **No soft shadows for elevation.** Surfaces are distinguished by background tokens and `--border`, not by `box-shadow`.
- The single allowed shadow is whatever shadcn's overlay components (dropdown menus, popovers) inherit by default — don't add more.

### Immediate state transitions

- The base `Button` uses `transition-all` — keep it, but durations stay short (Tailwind's default `150ms` is fine; do not stretch). No `duration-500` "marketing" animations.
- Focus state: a **1px ring** in the primary/destructive token (`focus-visible:ring-1`) plus border colour change. No glow, no 4px ring.

### Disabled, invalid, ARIA states

- `disabled:opacity-50 disabled:pointer-events-none` — already in the Button base. Match this pattern in any new control.
- `aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20` — match this for inputs/textareas/selects.

### Cursor

- The global base layer sets `cursor: pointer` on every non-disabled `button` and `[role="button"]` or checkboxes, inputs etc. Do not override.

### When adding a new shadcn component

1. Add via the `shadcn` skill's flow into `packages/ui/src/components/`.
2. **Open the generated file and remove every `rounded-*` class** (replace with `rounded-none`) on the root and any sub-parts — except an avatar/round-by-purpose component.
3. Check default sizing matches the size scale below (`h-8` for default control height).
4. Replace any soft `shadow-*` with reliance on `--border` and background tokens.
5. Make sure `transition-all` is present on interactive states but no duration overrides.

---

## 3. Sizing, spacing, and radius scale

### Control sizes

The `Button` (`packages/ui/src/components/button.tsx`) defines the canonical sizes. Every interactive control should match these heights:

| Size                                       | Height                                    | Padding      | Text          | When to use                                                                                       |
| ------------------------------------------ | ----------------------------------------- | ------------ | ------------- | ------------------------------------------------------------------------------------------------- |
| `xs`                                       | `h-6`                                     | `px-2`       | `text-xs`     | Inline-with-text controls, very dense toolbars. Rare.                                             |
| `sm`                                       | `h-7`                                     | `px-2.5`     | `text-xs`     | Table-row actions, in-list controls, dense forms.                                                 |
| **`default`**                              | **`h-8`**                                 | **`px-2.5`** | **`text-xs`** | **Default for everything else** — page buttons, form submits, dropdown triggers, primary actions. |
| `lg`                                       | `h-9`                                     | `px-2.5`     | `text-xs`     | Rare. Use only for a single hero CTA per page, if at all.                                         |
| `icon` / `icon-sm` / `icon-xs` / `icon-lg` | `size-8` / `size-7` / `size-6` / `size-9` | —            | —             | Square icon-only buttons; match the analogous text size.                                          |

**Inputs match button height by size.** A `Default` input is `h-8`, a `sm` input is `h-7`. Same for selects, date pickers, etc. — controls in the same row must share a height.

**Default is the everyday size.** Reach for `sm`/`xs` only in genuinely dense contexts (tables, toolbars). Reach for `lg` essentially never — Brigada does not have hero CTAs.

### Gap & padding scale

Tailwind v4's default spacing scale (`1` = `0.25rem`) is the source. Pragmatic defaults:

| Use                                    | Class                                                            |
| -------------------------------------- | ---------------------------------------------------------------- |
| Gap between adjacent controls in a row | `gap-1.5` (`0.375rem`) — matches the Button's internal `gap-1.5` |
| Gap between a label and its control    | `gap-1`                                                          |
| Padding inside a control               | `px-2.5` (default), `px-2` (sm), `px-3` (lg)                     |
| Section padding inside a card          | `p-4`                                                            |
| Page gutter (mobile)                   | `px-4`                                                           |
| Page gutter (desktop)                  | `px-6`                                                           |
| Vertical rhythm between sections       | `space-y-4` for tight, `space-y-6` for breathing room            |

**Bias toward tight.** When in doubt between two spacings, pick the smaller. The density is the point.

### Radius scale

The CSS exposes the scale even though we rarely use it. Available tokens (`globals.css`):

| Token          | Computed (with `--radius: 0.625rem`) |
| -------------- | ------------------------------------ |
| `--radius-sm`  | `0.375rem`                           |
| `--radius-md`  | `0.5rem`                             |
| `--radius-lg`  | `0.625rem`                           |
| `--radius-xl`  | `0.875rem`                           |
| `--radius-2xl` | `1.125rem`                           |
| `--radius-3xl` | `1.375rem`                           |
| `--radius-4xl` | `1.625rem`                           |

**Don't use the scale by default.** It's there for the genuine exception (a marketing-style card on a docs site? An avatar mask?). Standard components stay `rounded-none`.

### Icon sizing

Inside controls, icons are auto-sized by the Button's selector (`[&_svg:not([class*='size-'])]:size-4` on default, `size-3` on xs, `size-3.5` on sm). **Do not pass a size to the icon yourself** — let the parent button rule apply. Only override when the icon stands alone (then `size-4` is the default for body-text inline icons; `size-5` for a section header).

---

## 4. Typography

### Font families

Two fonts, both from `next/font/google`, loaded once in `apps/web/src/app/layout.tsx`:

- **`Geist Sans`** — UI, body, headings. Everything except code.
- **`Geist Mono`** — code, numeric tables, monospace contexts (token displays, debt amounts, gym stats, kbd shortcuts).

The CSS aliases in `packages/ui/src/styles/globals.css`:

```css
--font-heading: var(--font-sans);
--font-sans: var(--font-sans);
```

**`--font-heading` is deliberately the same as `--font-sans`.** Brigada uses one face for everything. No second display font, no serif headings. The single-typeface choice contributes to the software/utility feel.

### Sizes & weights

| Use                                                  | Class                               | Notes                                                                                               |
| ---------------------------------------------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------- |
| **UI controls** (buttons, inputs, dropdowns, labels) | `text-xs` (12px)                    | This is the default UI size. The Button's `text-xs` is _not_ a per-button choice — it's the system. |
| Body / paragraph text                                | `text-sm` (14px)                    | One step up from UI controls.                                                                       |
| Secondary text, metadata, hints                      | `text-xs` + `text-muted-foreground` | Same size as UI, dimmed colour.                                                                     |
| Subsection heading                                   | `text-sm font-medium`               | Same size as body, just bolder.                                                                     |
| Section heading                                      | `text-base font-medium` (16px)      | One step up from body.                                                                              |
| Page title                                           | `text-lg font-medium` (18px)        | The biggest text on most pages.                                                                     |
| Hero / display                                       | `text-xl` to `text-2xl`             | Rare — Brigada doesn't really do hero text.                                                         |

**Weights:** `font-normal` (400) is the default. **`font-medium` (500) is the strongest weight we use.** Avoid `font-semibold` and `font-bold` — they break the restraint.

### Numbers and code

- Money (`debt.brigada.mom`), gym stats (`gym.brigada.mom`), token displays, and anything that benefits from columnar alignment uses **`font-mono`** (Geist Mono).
- Inline code in user-facing copy: `font-mono text-xs bg-muted px-1`.
- Don't use mono for paragraph text "for style." Reserve it for content that's _actually_ code-like or numeric.

### Line-height & letter-spacing

- Use Tailwind defaults (`leading-normal`, no `tracking`) for everything. The Geist family looks correct as-is at our sizes.
- The body has `antialiased` set on the root (`apps/web/src/app/layout.tsx`) — leave it.

---

## 5. Putting it together — a concrete example

A typical form row in Brigada:

```tsx
<div className="flex items-center gap-1.5">
  <Label className="text-xs">Title</Label>
  <Input className="h-8" /> {/* h-8 to match default button */}
  <Button size="default">Save</Button>
</div>
```

- Same height across controls (`h-8`).
- Same text size (`text-xs`).
- Square corners on every element.
- Tight gap (`gap-1.5`).
- One green action button (`default` variant uses `bg-primary`).

A toolbar over a dense table:

```tsx
<div className="flex items-center gap-1">
  <Button size="sm" variant="ghost">
    <Filter />
  </Button>{" "}
  {/* icon auto-sizes to size-3.5 */}
  <Button size="sm" variant="ghost">
    New
  </Button>
  <Button size="sm" variant="outline">
    Export
  </Button>
</div>
```

- `sm` is fine here — dense toolbar context.
- `ghost` for actions that aren't primary; `outline` for secondary actions.

---

## What's not in v1 (coming later)

- **Color tokens** — the full OKLCH semantics (background/foreground/card/muted/popover/accent/destructive/border/input/ring/chart/sidebar) and per-purpose usage rules. For now: read `packages/ui/src/styles/globals.css` and follow the existing component code.
- **Icons** — Lucide is the sole library; sizing rules and usage patterns will be codified later.
- **Light/dark theming pattern** — the `next-themes` setup is in place (`d`-key hotkey, `class` strategy, `defaultTheme="system"`); detailed component-authoring rules around dark mode come later.
- **Per-site visual differences** — whether each `*.brigada.mom` gets an accent variation or all share one identical theme is still TBD.
- **Motion language** — animation curves, durations, when to animate.
- **Empty / loading / error states** — illustration policy, copy tone, skeleton patterns.
