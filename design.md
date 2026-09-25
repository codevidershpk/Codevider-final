# Codevider Design System

This file is the source of truth for the site's visual language. Tokens live in `app/globals.css`, which has a `:root` (light) section and a `.dark` section. This document says what each token means and when to use it.

> **Status:** the target system. Some of the current CSS still uses the old `--home-*`, `--dash-*` and `--accent-*` names. See [Migration](#migration).

---

## Principles

1. Use a semantic token rather than a raw value.
2. Use an existing token rather than creating a new one.
3. A new token needs a distinct semantic purpose.
4. Component tokens are allowed when a component genuinely differs from the rest of the site.
5. Typography uses the type scale.
6. Layout uses the spacing scale. Intentionally fluid sections are the exception.
7. Colours describe roles, not appearances. `--text-muted` is a good name; `--blue-gray-700` and `--light-blue-card-bg` are not.
8. Border radius has a small, controlled scale.
9. Add a breakpoint where a layout breaks. Don't add one because a round number looks tidy.
10. A repeated value becomes a token only when the repetition represents a design relationship.

**Naming.** Tokens are named for the concept, not for the page that first needed them. `--home-*` is being retired for that reason.

---

## Colour

```
COLOR
├── brand      --brand-blue, --brand-blue-hover, --brand-blue-deep, --brand-mint (+ -soft)
├── semantic   --accent, --accent-bg, --accent-border, --success, --warning, --error, --info, --focus-ring, --on-brand
├── surface    --bg, --surface, --surface-raised, --surface-muted, --surface-tint
├── text       --text-heading, --text-body, --text-muted, --text-subtle
└── border     --border, --border-subtle
```

| Token | Light | Dark |
|---|---|---|
| `--brand-blue` | `#2469ff` | `#7a9feb` |
| `--brand-blue-hover` | `#1852e6` | `#91b2ef` |
| `--brand-mint` | `#32fcb6` | `#76f9d3` |
| `--text-heading` | `#0a1020` | `#e8eaef` |
| `--text-body` | `#3a4356` | `#a8b0c0` |
| `--text-muted` | `#4f596d` | `#9aa1ae` |
| `--text-subtle` | `#647089` | `#858ea1` |
| `--bg` | `#ffffff` | `#11131c` |
| `--surface` | `#ffffff` | `#1c1f2a` |
| `--surface-muted` | `#f3f7ff` | `#181b24` |
| `--surface-tint` | `#e7f0ff` | `#1c2030` |
| `--border` | `#c4d2e8` | `rgba(255,255,255,.09)` |
| `--border-subtle` | `#dae4f4` | `rgba(255,255,255,.07)` |
| `--success` | `#12c99a` | `#43cfbd` |
| `--warning` | `#c2410c` | `#f3c03e` |

**Rules**
- The text hierarchy must always hold: heading > body > muted > subtle, in both themes. In the current dark theme, muted is brighter than body, which breaks this. The dark column above fixes it by swapping the two values.
- On any brand fill, text uses `--on-brand` (`#fff`). This is required for AA contrast.
- Filled CTAs in dark mode keep a vivid blue (`#1852e6`) rather than the softened `--brand-blue`.
- **Component tokens** sit in their own group and are used only by that component. Examples: `--dash-bar-track`, `--pod-pm/fe/qa/be`, and the hero dashboard's vivid blues.
- **Hardcoded hex:** replace repeated UI colours with tokens first. One-off illustration or decorative colours may stay inline, with a comment.

---

## Spacing

### Base scale (4px)

`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96`

Tailwind equivalents: `1 · 2 · 3 · 4 · 6 · 8 · 12 · 16 · 24`.

Use the base scale for component gaps, padding and margins. Values off the scale (for example `0.4rem`, `1.15rem` or `0.375rem`) should move to the nearest step unless there is a clear reason not to.

### Fluid layout tokens

| Token | Value | Replaces | Use |
|---|---|---|---|
| `--page-gutter` | `clamp(16px, 5vw, 72px)` | `--home-inline` | Left/right page padding |
| `--section-y` | `clamp(36px, 6vw, 88px)` | `--home-section-y` | Vertical padding of a section |
| `--section-y-tight` | `clamp(28px, 4.5vw, 68px)` | `--home-section-y-tight` | Compact sections |
| `--section-gap` | `clamp(2.75rem, 5vw, 4rem)` | `--home-stack` | Space between major blocks in a section |
| `--section-gap-sm` | `clamp(1.75rem, 3.5vw, 2.5rem)` | `--home-stack-sm` | Space between smaller blocks |
| `--content-gap` | `clamp(0.75rem, 1.5vw, 1rem)` | `--home-content-gap` | Gaps between items |
| `--card-padding` | `clamp(1.25rem, 2.5vw, 1.75rem)`, or `clamp(12px, 3vw, 1.5rem)` below 640px | `--home-inset`, `--home-inset-lg` | Padding inside cards |
| `--card-padding-compact` | `1rem` | ad-hoc `1rem 1.15rem`, `0.75rem 1rem` | Small or side cards |

### Header and page hero

| Token | Value | Notes |
|---|---|---|
| `--header-height` | the real header height | Measure it; don't guess |
| `--header-offset` | `calc(var(--header-height) + 1rem)`, currently equal to `clamp(5.5rem, 10vw, 6.5rem)` | Used for `scroll-margin-top` and anchor landing |
| `--page-hero-pt` | `clamp(6.5rem, 12vw, 9rem)` | Top padding of an inner-page hero |
| `--page-hero-pb` | `clamp(4rem, 8vw, 6rem)` | Bottom padding of an inner-page hero |

---

## Layout widths

| Token | Value | Use |
|---|---|---|
| `--container-wide` | `72rem` | Main container: `max-width: min(var(--container-wide), 100%)` |
| `--content-prose` | `65ch` | Article body and long copy |
| `--content-narrow` | `42ch` | Intro copy and short leads |

Intentional reading widths such as 860px or 920px for article layouts, and the `16ch` limit on hero titles, are allowed as component values. Anything close to an existing token should use the token.

## Breakpoints

| Name | Width | Media query |
|---|---|---|
| sm | 640px | `max-width: 639px` |
| md | 768px | `max-width: 767px` |
| lg | 1024px | `max-width: 1023px` |
| xl | 1280px | — |
| navbar | 936px | Navigation only (`--breakpoint-navbar`) |

The 1023px and 1024px breakpoints are merged into lg (use `max-width: 1023px`). The one-off 899px breakpoint should move to md or lg unless a layout genuinely breaks there.

---

## Typography

- **Sans (body):** Alexandria, via `--font-sans` / `--sans`
- **Serif (headings):** Libre Baskerville, weight 400, via `--font-heading` / `--heading`
- **Mono:** `ui-monospace, Consolas, monospace`
- **Root size:** 18px, or 16px at 1024px and below. Line height 145%. Body letter spacing is 0.18px and is set on `body` only.

Type tokens are in `rem`, so they scale with the root size.

| Token | Size | Font | Notes |
|---|---|---|---|
| `--fs-display` | `clamp(3.25rem, 8vw, 4.75rem)` | serif | Home hero only |
| `--fs-h1` | `clamp(2.25rem, 5.5vw, 3.5rem)` | serif | Page titles, letter spacing about -0.03em |
| `--fs-h2` | `clamp(1.75rem, 4.2vw, 2.5rem)` | serif | **The** section heading. Replaces the roughly 8 variant clamps. |
| `--fs-h3` | `clamp(1.125rem, 2vw, 1.25rem)` | serif or sans | Card and step titles |
| `--fs-body` | `1rem` | sans | |
| `--fs-lead` | `clamp(1rem, 1.4vw, 1.125rem)` | sans | Intro paragraphs |
| `--fs-body-sm` | `0.875rem` | sans | Card copy and metadata |
| `--fs-caption` | `0.75rem` | sans | Labels and fine print |
| `--fs-eyebrow` | `0.75rem` | sans | Weight 600, uppercase, 0.14em letter spacing, 22×2px leading rule |

**Rules**
- Typography uses the type tokens. Arbitrary `font-size: 13px` / `14px` / `15px` values are not allowed; map them to `--fs-body-sm` or `--fs-caption`.
- Pixel values are fine for borders (`1px`) and component-specific decorative dimensions (for example the eyebrow rule).
- Headings keep fluid `clamp()` sizing. The problem is having several clamps for one role, not using clamps.

---

## Radius

| Token | Value | Use |
|---|---|---|
| `--radius-xs` | 4px | Code, tags, tiny UI |
| `--radius-sm` | 8px | Inputs, small controls |
| `--radius-md` | 12px | Media and small cards |
| `--radius-lg` | 16px | Cards |
| `--radius-xl` | 24px | Feature cards and large panels |
| `--radius-full` | 9999px | Pills, buttons, avatars |

Current values map as follows: 6px goes to xs or sm, 10px and 11px go to sm or md, 14px goes to md or lg, 20px goes to lg or xl, and 999px goes to full.

---

## Elevation

The shadows are tinted blue, and that is part of the brand, so keep it.

| Token | Use |
|---|---|
| `--shadow-sm` | Resting cards and controls |
| `--shadow-md` | Hovered cards and popovers |
| `--shadow-lg` | Dashboards, toasts and floating panels (replaces `--dash-shadow` and `--dash-toast-shadow`) |
| `--glow-brand` | Primary CTA glow: `0 6px 18px rgba(36,105,255,.32)` in light mode, none in dark mode |

Component names must not define elevation tokens.

## Motion

| Token | Value |
|---|---|
| `--dur-fast` | 150ms, for press and transform |
| `--dur-normal` | 200ms, for colour, shadow and hover |
| `--dur-slow` | 300ms, for reveals |
| `--ease-out` | `ease-out` |

Always respect `prefers-reduced-motion`. Don't add bounce, spring or float effects.

---

## Components

### Buttons

| Variant | Class | Look |
|---|---|---|
| Primary | `.btn-primary` (currently `.home-brand-btn`) | Pill, `--brand-blue` fill, `--on-brand` text, `--glow-brand` |
| Secondary | `.btn-secondary` (currently the misnamed `.home-ghost-btn`) | Pill, transparent or surface background, blue text, `--accent-border` border |
| Ghost | `.btn-ghost` (only where needed) | Transparent, no border, blue or text colour, tint on hover |

Shared: `--radius-full`, weight 500–600, `--fs-body-sm`, padding `12px 20px`, and a visible `--focus-ring` outline with a 2px offset.

### Cards

There is one base card plus controlled variants. Don't create a new card family for every page.

- **`.card` (base):** `--surface` background, `1px solid --border-subtle`, `--radius-lg`, `--shadow-sm`, `--card-padding`.
- **`.card--compact`:** `--card-padding-compact`, `--radius-md`.
- **`.card--interactive`:** on hover, lift by 2px, use `--shadow-md`, and apply a `--dur-normal` transition.
- **`.card--feature`:** `--radius-xl`, with border-glow / accent treatment.

Mapping: `surface-card` becomes the base; `stat-card`, `blog-related-card` and `career-job-card` become compact and/or interactive; `home-ecard` becomes feature; `blog-card` becomes interactive. Variants control padding, hover and layout. The base controls background, border, radius and shadow.

### Eyebrow

Uses `--fs-eyebrow` and brand-blue text with a 22×2px rule in front (`::before`). The `--center` modifier centres it.

---

## Migration

Work in this order, one PR per step, with visual checks in both themes:

1. Add the new tokens to `globals.css` and alias the old names to them (for example `--home-inline: var(--page-gutter)`). No visual change.
2. Fix the dark-mode text hierarchy.
3. Replace repeated hardcoded values: the hero padding, the header offset and the container width.
4. Collapse the type scale (section headings, and px font sizes mapped to tokens).
5. Collapse radius values onto the scale.
6. Buttons: rename, and make secondary a real outline style.
7. Cards: base plus variants.
8. Replace repeated hex colours with tokens.
9. Remove the old aliases once nothing references them.
