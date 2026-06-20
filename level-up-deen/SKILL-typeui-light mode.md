# Design System — Agent Instructions

This skill describes the visual design language for all UI output. Every component, layout, and page should follow the design specs in the module files below. These describe *what the design looks like* — you choose how to implement the styles.

## Style
A playful educational interface inspired by [Root Square Academy](https://rootsquare.academy/) — mint-green classroom surfaces, forest-green ink, sky-blue links, stacked fan cards (three-layer pile with hover fan), and white sticker-panels for modals. All headings use the expressive [DynaPuff](https://fonts.google.com/specimen/DynaPuff) display face; body, labels, and button text use Geist. All filled buttons share one gradient recipe (face + border ring + glow shadow) using the forest-green brand ramp (#3AAD72 → #195736). Panels use hard offset sticker shadows. Mint sections carry a layered mesh pattern (radial dots, grid, diagonal stripes, fine dot field) mapped to forest-green ink tokens. Hand-drawn doodle graphics accent key moments. Light mode reads like a bright study board; dark mode like a chalkboard at night.

## Before Writing Any Code

1. **Read every module that applies.** For a landing page, read at minimum: `layout.md`, `typography.md`, `colors.md`, `buttons.md`, `cards.md`, `shadows.md`, `radius.md`, `borders.md`. Do NOT write any component markup until you have loaded all relevant modules.

## Critical Rules

- **Stay stack-agnostic.** This design system is technology-agnostic. Do not assume or hardcode any specific stack, framework, or styling library. The rules, colors, and styles must be implementable with any technology.

- **Tokens are AGNOSTIC design tokens, NOT utility classes:** The tokens defined in the `.md` files (like `neutral-primary-soft`, `heading`, `border-default`) are abstract design system tokens, NOT literal class names. Do not assume any predefined class exists — map each token to your project's styling layer yourself.

- **Cards are stacked fans.** Every card is a three-layer pile (front face + two rotated `::before`/`::after` duplicates) with 4px ink borders and square corners. Hover fans the stack open (5° rotate). See `cards.md`. Modals/large panels use the separate sticker-panel treatment (2px border, 16px radius).

- **Rounded controls, square cards.** Border-radius defaults to 16px for panels and modals; 0 for stacked cards; 7px for buttons. Pills and dots may use full radius.

- **All filled buttons share one gradient recipe.** Dual-layer diagonal gradient (face + border ring) in brand greens; `shadow-button` glow; hover removes shadow + 80% opacity. Ghost/Disabled are flat exceptions. See `buttons.md`.
- **Panels use sticker shadows.** White sticker-panels use `shadow-sticker` (−2px 3px 0 brand-strong). Buttons never use sticker shadows.

- **Section pattern is layered mesh.** All `neutral-primary-soft` sections use the four-layer mesh (base dots/grid + `::before` diagonal stripes + `::after` fine dots). Content sits at z-index 3. Accent bands stay flat. See `layout.md`.

- **Drawn graphics accent, not wallpaper.** Hand-drawn doodles (cartoon characters, math symbols, arrows, stars) sit at section edges or beside headings — low opacity or partial crop. They reinforce the anime/educational mood; they never replace real content or cover text.

- **Cross-reference modules.** A panel containing buttons must satisfy both `cards.md` AND `buttons.md`.
- **Dark mode is automatic.** The CSS custom properties resolve differently in light/dark via `@media (prefers-color-scheme: dark)` (or a `data-theme` attribute). Never manually swap colors.
- **Every interactive element needs hover, focus, and disabled states** — defined in the relevant module. Focus uses a visible 2px outline offset from the control.
- **Use semantic HTML:** proper heading hierarchy (`h1`→`h6`), `<button>` for actions, `<a>` for navigation, ARIA attributes where needed.

## Module Index

### Foundation (read first for any UI work)
- [colors.md](colors.md) — all background, text, and border color tokens
- [typography.md](typography.md) — heading scale, paragraphs, labels, links
- [layout.md](layout.md) — spacing rhythm, containers, layered mesh section pattern, drawn graphics
- [radius.md](radius.md) — border-radius scale
- [shadows.md](shadows.md) — elevation tokens
- [borders.md](borders.md) — border widths and styles

### Components
- [buttons.md](buttons.md) — unified gradient buttons (all variants), sizes, states
- [button-group.md](button-group.md) — grouped button structure
- [cards.md](cards.md) — stacked fan cards, media slot, hover fan interaction
- [inputs.md](inputs.md) — form controls, labels, states
- [alerts.md](alerts.md) — alert variants
- [badges.md](badges.md) — badge variants, sizes, dismissible chips
- [lists.md](lists.md) — list components
- [avatars.md](avatars.md) — avatar variants, sizes, indicators
- [icon-shapes.md](icon-shapes.md) — icon containers
- [content.md](content.md) — grid system, responsiveness

### Complex Components
- [accordion.md](accordion.md) — accordion variants
- [dropdown.md](dropdown.md) — dropdown menus
- [modals.md](modals.md) — dialog panels (sticker modals)
- [tabs.md](tabs.md) — tab navigation
- [tables.md](tables.md) — table structure
- [pagination.md](pagination.md) — pagination components
- [sidebars.md](sidebars.md) — sidebar navigation
- [radios-checkboxes-toggle.md](radios-checkboxes-toggle.md) — selection controls
- [tooltips-popovers.md](tooltips-popovers.md) — tooltips and popovers

# Accordion

> Dependencies: `colors.md`, `radius.md`

## Core Specs

- **Wrapper:** full width, 2px border (border-default color), 16px radius — clips first/last item corners
- **Item separator:** 1px bottom border (border-light) on every item except last

## Trigger (Button)

- **Layout:** flex, space-between, full width
- **Padding:** 20px horizontal, 16px vertical
- **Font:** Geist, 14px, medium weight (500)
- **Text color:** heading
- **Background:** bg-panel
- **Hover:** neutral-secondary-soft background
- **Focus:** 2px offset outline, brand-medium color
- **Transition:** colors, 150ms
- **Open state:** neutral-secondary-soft background

## Panel (Content)

- **Padding:** 20px horizontal, 16px vertical
- **Background:** neutral-primary-soft (mint tint inside white shell)
- **Top border:** 1px, border-light
- **Font:** Geist, 14px, body color, 1.6 line-height

## Chevron Icon

- Size: 16x16px
- Color: body-subtle
- Closed: 0deg rotation
- Open: 180deg rotation
- Transition: transform, 150ms

## Variants

### Default (Collapse)
One panel open at a time. Items stacked inside a single shared bordered/rounded wrapper (white sticker shell).

### Separated Cards
Each item is independent — has its own 2px border, 16px radius, and shadow-sticker. 8px bottom margin between items. No shared outer border.

### Always Open
Multiple panels can expand simultaneously. Same styling as Default.

### Flush
No outer border. Trigger and panel have transparent backgrounds. Only bottom border dividers between items. Use inside white sticker-panels that already provide a background.

## States

| State | Trigger appearance |
|---|---|
| Closed | heading text, bg-panel background |
| Open | heading text, neutral-secondary-soft background |
| Hover | neutral-secondary-soft background |
| Focus | 2px brand-medium offset outline |
| Disabled | fg-disabled text, not-allowed cursor, no hover/focus |

# Alerts

> Dependencies: `colors.md`, `radius.md`

## Core Specs

- **Padding:** 16px
- **Radius:** 16px (base)
- **Border:** 2px
- **Font:** Geist
- **Heading:** 16px, medium weight (500)
- **Body:** 14px, normal weight, 1.6 line-height
- **Shadow:** shadow-sticker-sm (optional, for prominent alerts)

## Variants

### Brand
- **Background:** brand-softer
- **Border:** border-brand
- **Text:** fg-success-strong

### Success
- **Background:** success-soft
- **Border:** border-success
- **Text:** fg-success-strong

### Danger
- **Background:** danger-soft
- **Border:** border-danger
- **Text:** fg-danger-strong

### Warning
- **Background:** warning-soft
- **Border:** border-warning
- **Text:** fg-warning

### Info
- **Background:** neutral-primary-medium
- **Border:** border-brand-light
- **Text:** fg-info (sky blue)

# Avatars

> Dependencies: `colors.md`, `radius.md`

## Core Specs

- **Circular shape:** fully rounded (9999px)
- **Rounded square shape:** 16px radius
- **Default size:** 40x40px
- **Image fit:** cover
- **Border:** 2px, border-default (sticker framing)

## Sizes

| Size | Dimensions | Radius |
|---|---|---|
| Extra Small | 18x18px | 4px |
| Small | 24x24px | 8px |
| Base | 32x32px | 16px |
| Large | 44x44px | 16px |
| XL | 56x56px | 16px |
| 2XL | 64x64px | 16px |

## Bordered Avatar

- 2px border in border-default color
- Shadow: shadow-sticker-sm (optional for featured profiles)

## Stacked Avatars

- Displayed in a row (flex)
- Each avatar: 40x40px, fully rounded, 2px border in border-buffer color
- Overlap: -16px negative margin on all except first

### Stacked Counter
- Same size as avatars (40x40px), fully rounded
- Background: brand-strong, text: white, Geist 12px, medium weight
- Same overlap margin as other avatars

## Avatar with Text

- Flex row, 10px gap between avatar and text
- Avatar: 40x40px, fully rounded, cover fit, 2px border-default
- Name: Geist, heading color, medium weight
- Subtitle: 14px, body-subtle color

# Badges

> Dependencies: `colors.md`, `radius.md`

## Core Specs

- **Border:** 1px (2px for promotional sticker badges)
- **Default radius:** 8px
- **Pill radius:** 9999px
- **Font:** Geist, 500 (medium)
- **Shadow:** shadow-sticker-sm on promotional badges only

## Sizes

| Size | Font size | Horizontal padding | Vertical padding |
|---|---|---|---|
| Default (small) | 12px | 6px | 2px |
| Large | 14px | 8px | 4px |

## Variants

### Brand
- **Background:** brand-softer
- **Border:** border-brand-subtle
- **Text:** fg-success-strong (forest green)

### Alternative (Neutral Soft)
- **Background:** neutral-primary-soft
- **Border:** border-default
- **Text:** heading

### Gray (Neutral Medium)
- **Background:** neutral-secondary-medium
- **Border:** border-default
- **Text:** heading

### Danger
- **Background:** danger-soft
- **Border:** border-danger-subtle
- **Text:** fg-danger-strong

### Success
- **Background:** success-soft
- **Border:** border-success-subtle
- **Text:** fg-success-strong

### Warning
- **Background:** warning-soft
- **Border:** border-warning-subtle
- **Text:** fg-warning

### Dark
- **Background:** dark
- **Border:** transparent
- **Text:** white

### Sticker (promotional)
- **Background:** bg-panel
- **Border:** 2px, border-default
- **Text:** heading color
- **Radius:** sticker (32px)
- **Shadow:** shadow-sticker
- **Transform:** optional −5° to −14° rotation for hero callouts

## Pill Badges

Use 9999px radius instead of 8px on any variant.

## Badges with Icons

- Icon size (default): 12x12px
- Icon size (large): 14x14px
- Icon spacing: 4px margin next to label

## Icon-only Badge

Square shape — equalize dimensions to 24x24px, 8px radius, no horizontal text padding.

## Dismissible Badges

Badge content + a close button. Close button hover backgrounds per variant:

| Variant | Close button hover background |
|---|---|
| Brand | brand-soft |
| Alternative | neutral-tertiary |
| Gray | neutral-quaternary |
| Danger | danger-medium |
| Success | success-medium |
| Warning | warning-medium |

## Dot / Notification Badge

- Positioned absolutely: -4px top, -4px right
- Size: 12x12px, fully rounded
- 2px border in border-buffer color
- Background: danger

# Borders

## Width Scale

| Context | Width |
|---|---|
| Default (inputs, inner controls) | 1px |
| Panels, buttons, modals, emphasis | 2px |
| Cards (face, back layers, media slot) | 4px (`border-card`) |
| Accent band edges (top/bottom) | 2px |

## Rules

- Use solid borders by default
- White sticker-panels always use **2px** `border-default` (#222 light / forest green dark)
- All filled buttons use **2px transparent border** + gradient border ring (see `buttons.md`) — never a flat `border-default` on buttons
- Green accent band sections use **2px** `border-brand` on top and bottom edges only
- Dashed borders only for special cases like file dropzones or "drawn" sketch frames
- Components in the same family must use matching border widths
- Never mix 1px and 2px borders within a single panel component

## Usage

| Context | Width |
|---|---|
| White sticker-panels / modals | 2px, border-default |
| Stacked cards (face, layers, media) | 4px, border-default |
| All filled buttons | 2px transparent + gradient border ring (see `buttons.md`) |
| Inputs / selects / textareas | 1px default; 2px on focus or error |
| Green accent band sections | 2px top + 2px bottom, border-brand |
| Inner dividers within panels | 1px, border-light |
| Modals / dialogs | 2px, border-default on the panel shell |

# Button Groups

> Dependencies: `buttons.md`, `colors.md`, `radius.md`

## Core Specs

- **Wrapper:** inline-flex, 7px radius (`radius-cta`)
- **Children overlap:** -2px left margin on all except first button (shares 2px gradient borders)
- **Every button in the group** keeps its own full gradient style and `shadow-button` — the wrapper adds no extra shadow or border

## Anatomy

### Wrapper
- Display: inline-flex
- Radius: 7px
- No wrapper shadow, no wrapper border

### First Button
- 7px radius on inline-start side only, 0 on inline-end
- Full gradient + individual shadow per `buttons.md`

### Middle Button(s)
- No radius (0 on all corners)
- Full gradient + individual shadow

### Last Button
- 7px radius on inline-end side only, 0 on inline-start
- Full gradient + individual shadow

### All buttons except first
- -2px left margin to overlap gradient borders

## Rules

- Every button in a group follows the complete gradient recipe from `buttons.md` — no flat fills, no sticker shadows, no stripped-down group styling
- Icon-only buttons: 16x16px icon, match height of text buttons
- Hover on any segment: that button loses its glow and hits 80% opacity independently

# Buttons

> Dependencies: `colors.md`, `radius.md`, `shadows.md`, `typography.md`

## Core Specs (every filled button — all variants)

**Every filled button** on the site uses the same control recipe: a diagonal brand-green face gradient, a matching gradient border ring, label text with a subtle text shadow, and a soft forest-green glow beneath. Only the four gradient stops, text color, and shadow variable change per variant. Ghost and Disabled are the sole exceptions.

- **Layout:** inline-flex, content centered
- **Radius:** 7px (`radius-cta` — see `radius.md`)
- **Border:** 2px solid transparent (visible border = dual-background gradient border technique)
- **Face (inner fill):** diagonal gradient (~140deg) from `button-fill-start` → `button-fill-end`, applied to the padding box
- **Border ring (outer):** diagonal gradient (~143deg) from `button-border-start` → `button-border-end`, applied to the border box
- **Text:** Geist, 18px, medium weight (500), line-height 20px, `--button-text-shadow`
- **Shadow:** `shadow-button` (`--button-shadow` — forest-green glow from `brand-strong`)
- **Padding:** 10px vertical, 40px horizontal (base size)
- **Cursor:** pointer
- **Transition:** all properties, 300ms
- **Box sizing:** border-box

### Brand default gradient stops (from `colors.md`)
| Stop | Token | Light | Dark |
|---|---|---|---|
| Face start | `button-fill-start` / `brand` | #3AAD72 | #3AAD72 |
| Face end | `button-fill-end` / `brand-strong` | #195736 | #1A5433 |
| Border start | `button-border-start` / `brand-medium` | #58C78E | #58C78E |
| Border end | `button-border-end` / `brand-strong` | #195736 | #195736 |

### Hover (all filled variants)
- **Shadow:** none (glow removed)
- **Opacity:** 80%

### Focus (all filled variants)
- **Ring:** 2px offset outline in the variant's `button-border-start` color

### Active (all filled variants)
- **Opacity:** 80%
- **Shadow:** none

### Reference implementation (agnostic — map tokens to your styling layer)

```css
.button {
  background:
    linear-gradient(140.14deg, var(--button-fill-start) 15.05%, var(--button-fill-end) 114.99%) padding-box,
    linear-gradient(142.51deg, var(--button-border-start) 8.65%, var(--button-border-end) 88.82%) border-box;
  border-radius: 7px;
  border: 2px solid transparent;
  text-shadow: var(--button-text-shadow);
  box-shadow: var(--button-shadow);
  padding: 10px 40px;
  line-height: 20px;
  cursor: pointer;
  transition: all 0.3s;
  color: var(--white);
  font-family: var(--font-body); /* Geist */
  font-size: 18px;
  font-weight: 500;
}

.button:hover {
  box-shadow: none;
  opacity: 0.8;
}
```

Never hardcode raw hex in product code — map `--button-fill-start`, `--button-fill-end`, `--button-border-start`, `--button-border-end`, and `--button-shadow` per variant.

## Sizes

| Size | Font size | Horizontal padding | Vertical padding |
|---|---|---|---|
| Extra small | 12px | 12px | 6px |
| Small | 14px | 20px | 8px |
| Base (default) | 18px | 40px | 10px |
| Large | 18px | 48px | 12px |
| Extra large | 20px | 56px | 14px |

All sizes keep the same gradient angles, dual-layer technique, and hover behavior.

## Variants

Each variant remaps the four gradient stops and shadow. The structure is identical.

### Brand (primary — default green ramp)
- **Face:** `brand` (#3AAD72) → `brand-strong` (#195736)
- **Border:** `brand-medium` (#58C78E) → `brand-strong` (#195736)
- **Text:** white
- **Shadow:** `--button-shadow`

### Secondary (lighter green ramp)
- **Face:** `brand-medium` (#58C78E) → `brand` (#3AAD72)
- **Border:** `brand-soft` (#C0F0D6) → `brand` (#3AAD72)
- **Text:** white
- **Shadow:** `--button-shadow`

### Tertiary (white-to-mint — nav/secondary CTAs like the site)
- **Face:** `neutral-primary` (#FFFFFF) → `neutral-primary-soft` (#EDF5E9)
- **Border:** `neutral-secondary-strong` (#A8DDBE) → `border-default` (#222222)
- **Text:** `body` (#0F0F0F)
- **Shadow:** `--button-neutral-shadow`
- **Text shadow:** none on Tertiary (dark ink on light face)

### Success
- **Face:** `success` (#1A5433) → `success-strong` (#195736)
- **Border:** `success-medium` (#C0F0D6) → `success` (#1A5433)
- **Text:** white
- **Shadow:** `--button-shadow`

### Danger
- **Face:** `danger` (#C70036) → `danger-strong` (#A50036)
- **Border:** `danger-medium` (#FFE4E6) → `danger` (#C70036)
- **Text:** white
- **Shadow:** `--button-danger-shadow`

### Warning
- **Face:** `warning` (#FFD500) → `warning-strong` (#BA6832)
- **Border:** `warning-medium` (#FFEFC2) → `warning-strong` (#BA6832)
- **Text:** `dark-strong` (#050505)
- **Shadow:** `--button-warning-shadow`

### Dark
- **Face:** `dark` (#0F0F0F) → `dark-strong` (#050505)
- **Border:** `gray` (#9BA1A5) → `dark` (#0F0F0F)
- **Text:** white
- **Shadow:** `--button-neutral-shadow`

### Ghost (exception — no gradient, no shadow)
- **Background:** transparent
- **Border:** transparent
- **Text:** heading color (or `fg-brand` for link-style ghost)
- **Hover:** `neutral-secondary-soft` background
- **Focus ring:** 2px offset outline, `brand-medium` color
- **No gradient, no shadow, no text-shadow**

### Disabled (exception — no gradient, no shadow)
- **Background:** `disabled` token (flat)
- **Border:** 2px, `border-light`
- **Text:** `fg-disabled` color
- **Cursor:** not-allowed
- **No hover, no focus, no gradient, no shadow**

## Icons in Buttons

- Icon size: 16x16px
- Spacing: 8px gap between icon and label
- Layout: inline-flex, vertically centered
- Icons inherit button text color

## Rules

- **Never mix styles.** Every filled button uses the gradient recipe above — no flat fills, no sticker shadows, no separate border color.
- Brand is the default. When only one action exists, use Brand.
- Tertiary matches the site's white pill CTAs ("Talk to Us", "Find me my tutor") — same gradient structure, light face ramp, dark text.
- Ghost and Disabled are the only non-gradient exceptions.

# Cards

> Dependencies: `colors.md`, `radius.md`, `shadows.md`, `borders.md`, `typography.md`

## Core Specs — Stacked Fan Cards

Every card is a **three-layer stacked fan**: a front face plus two identical duplicate layers behind it (`::before` and `::after`), each rotated slightly to look like loose sheets piled on the mint desk. Depth comes from the offset layers — **not** from box-shadow. Inspired by a stacked-polaroid / flash-card interaction pattern.

### Stack wrapper (outer container)
- **Width:** 55% of parent (max-width 400px) — scales down in grids; full width on mobile when alone
- **Position:** relative
- **Transition:** 250ms ease on transform
- **Interactive stacks:** `cursor: pointer` when the card is clickable

### Front card (main face)
- **Aspect ratio:** 3 / 2
- **Background:** `bg-panel`
- **Border:** 4px solid `border-default` (see `borders.md` — `border-card` width)
- **Radius:** 0 (`radius-stacked` — square corners; intentional exception for this card family)
- **Position:** relative
- **Padding:** 5% inline, 5% top, 15% bottom (extra room below the media for title/body)
- **Transition:** 150ms ease
- **No box-shadow** on the card face or layers

### Back layers (`::before` and `::after` on the front card)
Two pseudo-element duplicates sit **behind** the front face and create the fan stack.

Shared layer rules:
- **Content:** empty (decorative depth only)
- **Display:** block, `position: absolute`
- **Size:** 100% width and height of the front card
- **Background:** `bg-panel` (same as front)
- **Border:** 4px solid `border-default`
- **Radius:** 0 (`radius-stacked`)
- **Transform origin:** center center
- **Z-index:** −1 (always behind the front face)
- **Transition:** 150ms ease
- **Top / left:** 0

| Layer | Resting transform |
|---|---|
| `::before` | `translateY(-2%) rotate(-6deg)` |
| `::after` | `translateY(2%) rotate(6deg)` |

### Card media (image / illustration slot)
- **Width:** 100% of the card content area
- **Aspect ratio:** 1 / 1
- **Border:** 4px solid `border-default`
- **Background:** `neutral-secondary-medium` (placeholder when no image)
- **Position:** relative
- **Images inside:** `display: block`, `max-width: 60%`, centered horizontally in the media slot
- **Object fit:** cover when filling the slot; decorative doodles may use `max-width: 60%` per `layout.md`

### Card body (below media)
- **Title:** Geist, 20px desktop / 16px mobile, semibold (600), `heading` color
- **Body:** Geist, 14px–16px, `body` color, 1.6 line-height
- **Spacing:** 8px–16px between media and title

## Card-over-Section Color Rule

- Page/section background: `neutral-primary-soft` (mint)
- All card faces and back layers: `bg-panel` with `border-default` ink border
- On green accent bands (`bg-accent-band`): cards keep `bg-panel` faces — the stack reads as white sheets on green
- **Never** use `bg-accent-band` as a card background

## Hover & Interaction (interactive cards)

When the **stack wrapper** is hovered (or focused-within for keyboard):

| Element | Transform |
|---|---|
| Stack wrapper | `rotate(5deg)` |
| Front card `::before` | `translateY(-2%) rotate(-4deg)` |
| Front card `::after` | `translateY(2%) rotate(4deg)` |

- **Transition:** stack 250ms ease; layers 150ms ease
- **No** background color change on hover — motion only
- **Focus-visible:** 2px offset outline on the stack wrapper in `brand-medium` color

### Static card (non-interactive)
- Same visual stack at rest — no hover rotation
- `cursor: default`
- No focus ring

### Clickable card
- Entire stack wrapper is the hit target
- Wrap in `<a>` or `<button>` with appropriate semantics, or use `role="link"` / `role="button"` with keyboard support
- Optional `:active` — scale stack to 98% for a brief press feel

## Layout in Grids

- Each card in a grid gets its **own** stack wrapper — never share one stack across multiple content items
- **Gap: 32px** between every card — both `gap`, `row-gap`, and `column-gap` must be 32px in flex and grid layouts. Required so the 5° hover fan and rotated back layers do not overlap adjacent cards.
- Never use 24px or 16px gaps in card grids — 32px is the floor for this card family
- Mobile: stack may go `width: 100%` with `max-width: 400px`, centered; vertical gap between stacked cards remains **32px**

## Accent Band Sections (not cards)

Full-bleed green bands remain section backgrounds, not card variants:
- Background: `bg-accent-band`
- Border: 2px top + 2px bottom, `border-brand`
- White stacked cards float inside the band

## Reference implementation (agnostic — map tokens to your styling layer)

```css
.card-stack {
  width: 55%;
  max-width: 400px;
  transition: 0.25s ease;
}

.card-stack:hover {
  transform: rotate(5deg);
}

.card-stack:hover .card::before {
  transform: translateY(-2%) rotate(-4deg);
}

.card-stack:hover .card::after {
  transform: translateY(2%) rotate(4deg);
}

.card {
  aspect-ratio: 3 / 2;
  border: 4px solid var(--border-default);
  background-color: var(--bg-panel);
  position: relative;
  transition: 0.15s ease;
  padding: 5% 5% 15% 5%;
}

.card::before,
.card::after {
  content: "";
  display: block;
  position: absolute;
  height: 100%;
  width: 100%;
  border: 4px solid var(--border-default);
  background-color: var(--bg-panel);
  transform-origin: center center;
  z-index: -1;
  transition: 0.15s ease;
  top: 0;
  left: 0;
}

.card::before {
  transform: translateY(-2%) rotate(-6deg);
}

.card::after {
  transform: translateY(2%) rotate(6deg);
}

.card-media {
  width: 100%;
  border: 4px solid var(--border-default);
  background-color: var(--neutral-secondary-medium);
  aspect-ratio: 1 / 1;
  position: relative;
}

.card-media img {
  display: block;
  max-width: 60%;
}
```

Never hardcode raw hex in product code — use tokens from `colors.md`.

## Motion Tokens (CSS custom properties)

| Variable | Value | Role |
|---|---|---|
| `--card-stack-hover-rotate` | 5deg | Stack wrapper hover rotation |
| `--card-layer-rotate-before` | −6deg | Back layer 1 at rest |
| `--card-layer-rotate-after` | 6deg | Back layer 2 at rest |
| `--card-layer-rotate-before-hover` | −4deg | Back layer 1 on stack hover |
| `--card-layer-rotate-after-hover` | 4deg | Back layer 2 on stack hover |
| `--card-layer-translate` | 2% | Vertical offset for layer fan |

## Rules

- **Every card** uses the three-layer stacked fan — no flat single-border cards, no `shadow-sticker` on cards
- Border width is always **4px** (`border-card`) on face, layers, and media slot
- Corners are **square** (`radius-stacked` = 0) for all card surfaces
- Depth = rotated duplicate layers, not box-shadow
- Decorative doodles may sit inside the media slot at `max-width: 60%`
- Modals and large dialog panels are **not** cards — they follow `modals.md` (sticker-panel treatment)
- Pricing tiers, feature grids, team cards, testimonials — all use this same stacked spec
- Card grids always use **32px gap** between items (see Layout in Grids above)

# Color Tokens

A playful educational palette drawn from [Root Square Academy](https://rootsquare.academy/): mint-green page surfaces, forest-green ink, sky-blue links, white sticker-panels, and bright green accent bands. Light mode reads like a sunlit study board; dark mode like a forest chalkboard at night.

## Background Tokens

### Neutral
| Token | Light | Dark |
|---|---|---|
| neutral-primary-soft | #EDF5E9 | #0D1A14 |
| neutral-primary | #FFFFFF | #111F18 |
| neutral-primary-medium | #E3FFF0 | #1A3326 |
| neutral-primary-strong | #DBF3DE | #1F3D2C |
| neutral-secondary-soft | #DBF3DE | #142A1E |
| neutral-secondary | #C0F0D6 | #1A3326 |
| neutral-secondary-medium | #BAE8CC | #224A35 |
| neutral-secondary-strong | #A8DDBE | #2A6B45 |
| neutral-tertiary-soft | #C0F0D6 | #1A3326 |
| neutral-tertiary | #A8DDBE | #224A35 |
| neutral-tertiary-medium | #8FD4AB | #2A6B45 |
| neutral-quaternary | #7BC99A | #347A52 |
| quaternary-medium | #66BD88 | #3D8F5E |
| gray | #9BA1A5 | #6B7A72 |

### Brand (forest + bright green — the signature ramp)
| Token | Light | Dark |
|---|---|---|
| brand-softer | #E3FFF0 | #0F2419 |
| brand-soft | #C0F0D6 | #1A3D2A |
| brand | #3AAD72 | #3AAD72 |
| brand-medium | #58C78E | #2D8F5E |
| brand-strong | #195736 | #58C78E |

### Status
| Token | Light | Dark |
|---|---|---|
| success-soft | #DBF3DE | #0F2419 |
| success | #1A5433 | #3AAD72 |
| success-medium | #C0F0D6 | #1A3D2A |
| success-strong | #195736 | #58C78E |
| danger-soft | #FFF1EB | #2E1410 |
| danger | #C70036 | #FF6B8A |
| danger-medium | #FFE4E6 | #4A1A12 |
| danger-strong | #A50036 | #FF8FA8 |
| warning-soft | #FFF8E1 | #2E2110 |
| warning | #FFD500 | #FFD500 |
| warning-medium | #FFEFC2 | #46341A |
| warning-strong | #BA6832 | #FFBF46 |

### Section / Panel surfaces (sticker-board specific)
These power the educational sticker metaphor: mint page backdrop, white panels, green accent bands, and code/math panes.
| Token | Light | Dark | Role |
|---|---|---|---|
| bg-accent-band | #3AAD72 | #195736 | Full-bleed green section bands (hero CTA, pricing highlight) |
| bg-panel | #FFFFFF | #111F18 | White sticker-panels pasted on the mint surface |
| menu-bar | rgba(255,255,255,0.89) | #111F18 | Fixed top navigation bar over mint background |
| button-tertiary | #EDF5E9 | #1A3326 | Tertiary face gradient end (mint) |
| code-bg | #195736 | #0A1510 | Code blocks / math formula panes |
| code-text | #E3FFF0 | #C0F0D6 | Code blocks / math formula foreground |
| section-pattern-base | #EDF5E9 | #0D1A14 | Section background under the layered mesh (same as neutral-primary-soft) |
| pattern-dot-large | rgba(25,87,54,0.08) | rgba(255,255,255,0.05) | Large radial dots — 40px grid |
| pattern-line | rgba(25,87,54,0.06) | rgba(255,255,255,0.03) | Orthogonal grid lines — 20px grid |
| pattern-diagonal | rgba(25,87,54,0.05) | rgba(255,255,255,0.03) | 45° diagonal stripe overlay |
| pattern-dot-small | rgba(25,87,54,0.10) | rgba(255,255,255,0.07) | Fine radial dots — 60px grid |

### Section Pattern Overlay (CSS custom properties — layered mesh on sections)
| Variable | Light | Dark |
|---|---|---|
| `--pattern-dot-large-size` | 40px | 40px |
| `--pattern-grid-size` | 20px | 20px |
| `--pattern-dot-small-size` | 60px | 60px |
| `--pattern-diagonal-opacity` | 0.8 | 0.8 |
| `--pattern-dot-small-opacity` | 0.6 | 0.6 |
| `--pattern-diagonal-stripe` | 10px | 10px |

### Button Gradient Tokens (all filled buttons — same dual-layer technique)
Every filled button variant uses a face gradient + border-ring gradient. Values below are the **Brand** ramp (forest green from [Root Square Academy](https://rootsquare.academy/)). Other variants remap these four stops — see `buttons.md`.

| Token | Light | Dark | Maps to |
|---|---|---|---|
| button-fill-start | #3AAD72 | #3AAD72 | `brand` — face gradient start |
| button-fill-end | #195736 | #1A5433 | `brand-strong` — face gradient end |
| button-border-start | #58C78E | #58C78E | `brand-medium` — border ring start |
| button-border-end | #195736 | #195736 | `brand-strong` — border ring end |

### Button Shadow & Text (CSS custom properties — all filled buttons)
| Variable | Light | Dark |
|---|---|---|
| `--button-shadow` | 8px 8px 20px 0px rgba(25, 87, 54, 0.35) | 8px 8px 20px 0px rgba(25, 87, 54, 0.50) |
| `--button-text-shadow` | 1px 1px 1px rgba(0, 0, 0, 0.25) | 1px 1px 1px rgba(0, 0, 0, 0.40) |
| `--button-neutral-shadow` | 8px 8px 20px 0px rgba(15, 15, 15, 0.20) | 8px 8px 20px 0px rgba(0, 0, 0, 0.40) |
| `--button-danger-shadow` | 8px 8px 20px 0px rgba(199, 0, 54, 0.30) | 8px 8px 20px 0px rgba(199, 0, 54, 0.45) |
| `--button-warning-shadow` | 8px 8px 20px 0px rgba(186, 104, 50, 0.30) | 8px 8px 20px 0px rgba(255, 213, 0, 0.35) |

### Panel Sticker Shadow (CSS custom properties — panels/modals only, NOT cards or buttons)
| Variable | Light | Dark |
|---|---|---|
| `--sticker-shadow-color` | rgb(25, 87, 54) | rgb(58, 173, 114) |
| `--sticker-shadow-offset` | −2px 3px 0px 0px | −2px 3px 0px 0px |
| `--inset-highlight` | rgba(255,255,255,0.72) | rgba(255,255,255,0.10) |

### Utility
| Token | Light | Dark |
|---|---|---|
| dark | #0F0F0F | #0A1510 |
| dark-strong | #050505 | #050505 |
| disabled | #DBF3DE | #1A3326 |

### Accent (theme-switchable hues; green is the default brand)
| Token | Value (same both modes) |
|---|---|
| purple | #8B58DD |
| sky | #0099FF |
| teal | #2F9B7A |
| pink | #D94A6E |
| cyan | #06B6D4 |
| fuchsia | #B03990 |
| indigo | #55308C |
| orange | #BA6832 |

## Text Color Tokens

### Base
| Token | Light | Dark |
|---|---|---|
| white | #FFFFFF | #FFFFFF |
| black | #0F0F0F | #0F0F0F |
| heading | #195736 | #E3FFF0 |
| body | #0F0F0F | #C0F0D6 |
| body-subtle | #364D37 | #8FD4AB |

### Brand
| Token | Light | Dark |
|---|---|---|
| fg-brand-subtle | #58C78E | #58C78E |
| fg-brand | #0099FF | #33ADFF |
| fg-brand-strong | #007ACC | #66C2FF |

### Status
| Token | Light | Dark |
|---|---|---|
| fg-success | #195736 | #58C78E |
| fg-success-strong | #1A5433 | #8FD4AB |
| fg-danger | #BE123C | #FF6B8A |
| fg-danger-strong | #881337 | #FF8FA8 |
| fg-warning-subtle | #BA6832 | #FFD500 |
| fg-warning | #8A4A08 | #FFBF46 |
| fg-disabled | #9BA1A5 | #6B7A72 |

### Informational / Accent
| Token | Light | Dark |
|---|---|---|
| fg-yellow | #FFD500 | #FFD500 |
| fg-info | #0099FF | #33ADFF |
| fg-purple | #7242BB | #BB93FF |
| fg-purple-strong | #55308C | #D0B3FF |
| fg-cyan | #2F8A8A | #7FB8B8 |
| fg-indigo | #55308C | #A78FB5 |
| fg-pink | #C03A6A | #E59AB0 |
| fg-lime | #1A5433 | #58C78E |

## Border Color Tokens

Sticker chrome leans on thick ink borders — near-black (`#222`) for white panels, forest green (`brand-strong`) for green surfaces. Default UI borders use forest green at reduced emphasis.

| Token | Light | Dark |
|---|---|---|
| border-dark | #0F0F0F | #E3FFF0 |
| border-buffer | #EDF5E9 | #0D1A14 |
| border-buffer-medium | #DBF3DE | #142A1E |
| border-buffer-strong | #C0F0D6 | #1A3326 |
| border-muted | #DBF3DE | #142A1E |
| border-light-subtle | #C0F0D6 | #1A3326 |
| border-light | #A8DDBE | #224A35 |
| border-light-medium | #8FD4AB | #2A6B45 |
| border-default-subtle | #7BC99A | #2A6B45 |
| border-default | #222222 | #195736 |
| border-default-medium | #195736 | #2A6B45 |
| border-default-strong | #0F0F0F | #58C78E |
| border-success-subtle | #C0F0D6 | #1A3D2A |
| border-success | #1A5433 | #3AAD72 |
| border-danger-subtle | #FFE4E6 | #4A1A12 |
| border-danger | #BE123C | #FF6B8A |
| border-warning-subtle | #FFEFC2 | #46341A |
| border-warning | #BA6832 | #FFD500 |
| border-brand-subtle | #C0F0D6 | #1A3D2A |
| border-brand-light | #58C78E | #3AAD72 |
| border-brand | #195736 | #58C78E |
| border-dark-subtle | #364D37 | #2A6B45 |
| border-purple | #8B58DD | #8B58DD |
| border-orange | #BA6832 | #BA6832 |

## Semantic Usage Rules

- **Page surface vs. cards vs. panels:** `neutral-primary-soft` (#EDF5E9 mint) is the default page/section background. **Cards** use the stacked fan pattern (`cards.md`) — 4px `border-default`, no box-shadow. **Panels/modals** use `bg-panel` with 2px `border-default` and `shadow-sticker`.
- **Accent bands:** `bg-accent-band` (bright green) is for full-bleed section highlights only — never a card/panel surface. Bands carry 2px `border-brand` top/bottom edges.
- **Section pattern:** Mint sections use the layered mesh pattern (`pattern-dot-large`, `pattern-line`, `pattern-diagonal`, `pattern-dot-small` on `section-pattern-base`) — see `layout.md`. Never on accent bands, cards, or panels.
- Top menu bar: `menu-bar` background, 2px `border-default` bottom edge.
- **All filled buttons** use the same dual-layer gradient technique (face + border ring), `shadow-button`, `--button-text-shadow`, hover → shadow removed + 80% opacity. Brand variant maps to `button-fill-start`/`button-fill-end`/`button-border-start`/`button-border-end` (green ramp). See `buttons.md`.
- Headings: `heading` color (forest green light / mint cream dark). Display headings may be uppercase.
- Body text: `body` color. Captions/meta: `body-subtle`.
- Links / CTAs: `fg-brand` (sky blue), underlined.
- Default borders on panels: `border-default` (#222 light / forest green dark).
- Status borders match intent: success → border-success, danger → border-danger, warning → border-warning.
- Code / math panes: `code-bg` background with `code-text` foreground.
- Disabled: `disabled` background + `fg-disabled` text.

## Prohibited

- No raw hex/rgb values in component code — always use design tokens.
- No brand green text color for long-form paragraphs (use `body`).
- No accent text tokens (fg-purple, etc.) for body copy or navigation.
- Do NOT use `bg-accent-band` as a card/panel surface — it is a section band only. Content lives on `bg-panel` or mint surfaces.
- No manual light/dark value swapping — let the CSS custom properties handle it.
- No sticker shadows on buttons or cards — buttons use `--button-shadow`; cards use rotated layers; panels use `shadow-sticker`.
- No soft glassmorphism or heavy blur on surfaces — panels are opaque, bordered, and sticker-shadowed.

# Content & Grid System

> Dependencies: `layout.md`, `typography.md`

## Containers

| Type | Max width | Horizontal padding |
|---|---|---|
| Standard | 1200px | 48px (desktop), 24px (mobile) |
| Internal (reading) | 768px | — (45–75 char line length) |

## Vertical Padding

| Breakpoint | Vertical padding |
|---|---|
| Mobile | 48px |
| Tablet (≥768px) | 64px |
| Desktop (≥1024px) | 88px–96px for hero/feature sections |

## Grid System

Mobile-first with flexible desktop configurations.

| Context | Gap |
|---|---|
| Card grids (stacked fan cards) | **32px** (required — row and column) |
| Standard content (non-card) | 32px |
| Compact widgets/metadata | 16px |

### Responsive Columns

| Breakpoint | Columns |
|---|---|
| Mobile (default) | 1–2 |
| Small/Tablet (≥640px) | 2–4 |
| Desktop (≥1024px) | 3–12 |

Full support for 6, 7, 8, 9+ column grids where needed.

## Breakpoints

| Name | Width |
|---|---|
| Small | 640px |
| Medium | 768px |
| Large | 1024px |
| Extra large | 1200px |
| 2x Extra large | 1536px |

## Section Background (conceptual)

| Section type | Base color | Pattern |
|---|---|---|
| Default content | section-pattern-base / neutral-primary-soft | layered mesh (dots + grid + diagonal + fine dots) |
| Hero-adjacent intro | section-pattern-base | layered mesh |
| Feature / methodology (mint) | section-pattern-base | layered mesh |
| Feature (green band) | bg-accent-band | none |
| Pricing / card grids | section-pattern-base | layered mesh |
| Final CTA | section-pattern-base | layered mesh |
| Green highlight band | bg-accent-band | none |

## Rules

- Card grids: **32px** gap always — never tighten for mobile; the hover fan needs the space
- Always design mobile-first
- Use layout shifts (column → row) to accommodate horizontal space
- Section content wrapper: `position: relative; z-index: 3` above pattern overlays
- Lists: 24px indentation, 8px vertical gap between items
- Body copy: Geist 16px, 1.6 line-height
- All interactive links follow fg-brand (sky blue) underline/hover protocol
- Drawn graphics sit at z-index 3+ alongside content

# Dropdown

> Dependencies: `colors.md`, `radius.md`, `shadows.md`, `inputs.md`

## Core Specs

### Chevron Icon
- Size: 16x16px
- Spacing: 6px left margin, -2px right margin
- Color: inherits from trigger button

### Menu Container
- Background: bg-panel
- Border: 2px, border-default
- Radius: 16px (base)
- Shadow: shadow-sticker + shadow-md
- Z-index: elevated above content

### Menu List
- Padding: 8px
- Font: Geist, 14px, body color, medium weight (500)

### Menu Item
- Layout: inline-flex, vertically centered, full width
- Padding: 8px horizontal, 8px vertical
- Radius: 8px (default)
- Hover: neutral-secondary-soft background, heading text
- Transition: colors, 150ms

## Trigger Sizes

| Size | Font size | Horizontal padding | Vertical padding |
|---|---|---|---|
| Small | 14px | 12px | 8px |
| Base | 14px | 16px | 10px |
| Large | 16px | 20px | 12px |

## Icon-only Trigger

- Padding: 8px
- Min size: 44x44px
- Icon: 20x20px

## Variants

### Default
- Menu width: 176px, items have 8px radius

### With Divider
- Top border (border-light) between child groups, skip first group

### With Header
- Header padding: 16px horizontal, 12px vertical
- Bottom border: border-light
- Name: heading color, 14px, semibold weight
- Email: body-subtle color, 14px, truncated

### With Icons
- Icon before label: 16x16px, 8px right margin, body-subtle color
- On hover, icon color changes to heading

### With Checkbox / Radio
- Inputs: 16x16px, 4px radius, focus ring in brand-soft
- Helper text: 12px, body-subtle color, 2px top margin

### With Search
- Search input at top of menu following `inputs.md` specs
- Left icon: 12px left padding, input 36px left padding

### Scrollable
- Max height: 192px, vertical scroll overflow

## States

| State | Appearance |
|---|---|
| Focused trigger | 2px offset outline, brand-medium color |
| Hover item | neutral-secondary-soft background, heading text |
| Active/open item | neutral-secondary-medium background, heading text |
| Disabled item | fg-disabled text, not-allowed cursor, no pointer events |

# Icon Shapes

> Dependencies: `colors.md`, `radius.md`

## Core Specs

- Box sizing: border-box
- Icon must be perfectly centered (inline-flex, centered both axes)
- Circle: fully rounded (9999px)
- Rounded square: 16px radius (MD/LG/XL), 8px radius (XS/SM)
- Sticker containers: 2px border-default + shadow-sticker-sm

## Sizes

| Size | Container | Icon |
|---|---|---|
| XS | 24x24px | 14x14px |
| SM | 32x32px | 16x16px |
| MD | 40x40px | 20x20px |
| LG | 48x48px | 24x24px |
| XL | 56x56px | 28x28px |

## Color Variants

### Brand
- Shape: rounded square (8px radius)
- Background: brand-softer
- Border: 1px, border-brand-subtle
- Icon color: fg-success-strong (forest green)

### Gray
- Shape: rounded square
- Background: neutral-secondary-soft
- Border: 1px, border-light
- Icon color: body-subtle

### Danger
- Shape: circle
- Background: danger-soft
- Icon color: fg-danger-strong

### Success
- Shape: circle
- Background: success-soft
- Icon color: fg-success-strong

### Warning
- Shape: circle
- Background: warning-soft
- Icon color: fg-warning

### Sticker (featured)
- Shape: rounded square, 16px radius
- Background: bg-panel
- Border: 2px, border-default
- Shadow: shadow-sticker-sm
- Icon color: heading

# Inputs

> Dependencies: `colors.md`, `radius.md`

## Core Specs

- **Display:** block, full width
- **Radius:** 8px (default)
- **Border:** 1px, border-default-medium; 2px on focus
- **Background:** bg-panel (white) or neutral-primary (white)
- **Shadow:** none at rest; shadow-xs on focus (optional)
- **Font:** Geist, 14px, body color
- **Padding:** 12px horizontal, 10px vertical
- **Placeholder:** body-subtle color
- **Transition:** border-color, box-shadow — 200ms

## Label

- Display: block
- Font: Geist, 14px, medium weight (500), heading color
- Margin bottom: 8px
- Label `htmlFor` must match the input `id`

## States

### Default
- Border: 1px, border-default-medium
- Background: bg-panel

### Hover
- Border: border-default-strong

### Focus
- No default browser outline
- Border: 2px, border-brand
- Optional ring: 1px offset, brand-soft color

### Success
- Border: 2px, border-success
- Focus ring: 1px, success color

### Error / Danger
- Border: 2px, border-danger
- Focus ring: 1px, danger color

### Disabled
- Background: disabled
- Text: fg-disabled
- Cursor: not-allowed

## Input with Icons

- Icon size: 16x16px
- Icon color: body-subtle
- Container: relative positioned wrapper
- Start icon: absolutely positioned left, 12px left padding — input gets 36px left padding
- End icon: absolutely positioned right, 12px right padding — input gets 36px right padding
- Icons vertically centered within the wrapper

## Rules

- Every input must have a unique `id`
- Every label must have a matching `htmlFor`
- Padding: 12px horizontal, 10px vertical unless overridden for icon variants
- No arbitrary hex or hardcoded colors
- Inputs inside white sticker-panels inherit the panel's 2px outer border — input borders remain 1px

# Layout & Spacing

## Spacing Rhythm

Base unit: **8px**. All spacing values should be multiples of 8px.

| Context | Value |
|---|---|
| Section vertical padding | 88px–96px |
| Section header → content | 48px or 56px |
| Heading → paragraph | 16px |
| Container horizontal padding | 48px (desktop), 24px (mobile) |
| Flex/grid row gap | 16px |
| Card grid gap | **32px** (required — row and column; stacked cards fan 5° on hover) |
| Wide component grid gap | 32px |
| Column layout gap | 48px |

## Container

Standard section container: max-width 1200px, centered, 48px horizontal padding on desktop (24px on mobile).

Every major section wraps content in this container. Section content must sit **above** the pattern overlays (`position: relative; z-index: 3`).

## Content Composition Order

Inside each section, follow this order:
1. Heading (`h1`–`h3`)
2. Leading paragraph
3. Normal paragraph(s)
4. Lists, CTA links, or component grids

## Section Pattern

Each section has:
- 88px–96px vertical padding
- A background treatment (see below)
- A centered container (max-width 1200px)
- A section header area with 48px bottom margin
- Section content below — always layered above decorative backgrounds

## Background Treatment

### Patterned sections (default — all `neutral-primary-soft` sections)

Every standard mint section uses a **layered mesh pattern**: large dots + orthogonal grid on the base, then diagonal stripes and fine dots via pseudo-element overlays. Inspired by a technical graph-paper / starfield texture, remapped to forest-green ink on mint (light) and soft white on deep green (dark).

#### Section shell (pattern carrier)
- **Width / height:** 100% of the section
- **Background color:** `section-pattern-base` (same as `neutral-primary-soft`)
- **Position:** relative
- **Overflow:** hidden (clips pattern edges cleanly)

#### Base layer (on the section shell itself)
Three stacked background images on one element:

| Layer | Type | Token | Size |
|---|---|---|---|
| 1 | Radial dots (centered) | `pattern-dot-large` | `40px 40px` (`--pattern-dot-large-size`) |
| 2 | Horizontal grid lines | `pattern-line` | `20px 20px` (`--pattern-grid-size`) |
| 3 | Vertical grid lines | `pattern-line` | `20px 20px` (`--pattern-grid-size`) |

#### Overlay `::before` — diagonal stripes
- **Content:** empty pseudo-element, full width/height, absolute, top 0, left 0
- **Background:** `repeating-linear-gradient(45deg, transparent, transparent var(--pattern-diagonal-stripe), pattern-diagonal var(--pattern-diagonal-stripe), pattern-diagonal calc(var(--pattern-diagonal-stripe) * 2))`
- **Z-index:** 1
- **Opacity:** `--pattern-diagonal-opacity` (0.8)

#### Overlay `::after` — fine dot field
- **Content:** empty pseudo-element, full width/height, absolute, top 0, left 0
- **Background:** `radial-gradient(circle, pattern-dot-small 1px, transparent 1px)`
- **Background size:** `60px 60px` (`--pattern-dot-small-size`)
- **Z-index:** 2
- **Opacity:** `--pattern-dot-small-opacity` (0.6)

#### Content stacking
- Inner container and all section content: `position: relative; z-index: 3`
- Pattern must never reduce text contrast — if readability suffers, lower overlay opacities before removing the pattern

### Reference implementation (agnostic — map tokens to your styling layer)

```css
.section {
  width: 100%;
  background-color: var(--section-pattern-base);
  background-image:
    radial-gradient(
      circle at 50% 50%,
      var(--pattern-dot-large) 1px,
      transparent 0
    ),
    linear-gradient(var(--pattern-line) 1px, transparent 0),
    linear-gradient(90deg, var(--pattern-line) 1px, transparent 0);
  background-size:
    var(--pattern-dot-large-size) var(--pattern-dot-large-size),
    var(--pattern-grid-size) var(--pattern-grid-size),
    var(--pattern-grid-size) var(--pattern-grid-size);
  position: relative;
  overflow: hidden;
}

.section::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent var(--pattern-diagonal-stripe),
    var(--pattern-diagonal) var(--pattern-diagonal-stripe),
    var(--pattern-diagonal) calc(var(--pattern-diagonal-stripe) * 2)
  );
  z-index: 1;
  opacity: var(--pattern-diagonal-opacity);
}

.section::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(
    circle,
    var(--pattern-dot-small) 1px,
    transparent 1px
  );
  background-size: var(--pattern-dot-small-size) var(--pattern-dot-small-size);
  z-index: 2;
  opacity: var(--pattern-dot-small-opacity);
}

.section-content {
  position: relative;
  z-index: 3;
}
```

Never hardcode raw hex in product code — use tokens from `colors.md`.

### Sections WITHOUT the pattern
- **Green accent bands:** `bg-accent-band` only — flat, 2px `border-brand` top/bottom, no mesh
- **Inside cards, panels, modals, tables:** pattern does not propagate — those surfaces are solid `bg-panel` or mint tint
- **Hero with full-bleed illustration:** optional flat `neutral-primary-soft` if the mesh competes with artwork (document the exception per page)

### Green accent bands
- Background: `bg-accent-band` (#3AAD72)
- Full-bleed width, 2px `border-brand` top and bottom edges
- No layered mesh
- White text or stacked fan cards float on top

## Drawn Graphics (anime / educational accents)

Hand-drawn illustration elements reinforce the playful study-board mood. Rules:

- **Placement:** Section edges, corners, or beside headings — never centered over body copy
- **Style:** Loose ink outlines, flat fills, cartoon proportions. Match `heading` color and `fg-brand` accents
- **Subjects:** Math formulas, π symbols, pencils, stars, doodle arrows, friendly cartoon characters
- **Scale:** 80px–240px depending on section; partially cropped at viewport edges is encouraged
- **Opacity:** Full opacity for hero illustrations; 40%–70% for ambient section doodles
- **Z-index:** 3 or higher — same layer as content, never behind the mesh overlays
- **Quantity:** 1–3 graphics per section maximum; zero on dense data tables, forms, and settings pages

## Motion & Animation

- Prefer CSS-native: `transition`, `animation`, `@keyframes`
- All filled buttons: on `:hover`, remove glow shadow and fade to 80% opacity
- Stacked cards: fan open on hover (see `cards.md`)
- Reserve scroll-triggered transitions for hierarchy moments

## Backgrounds & Visual Depth

- Standard sections: layered mesh on mint (`section-pattern-base`)
- Content depth: stacked fan cards + sticker panels for modals
- Green accent bands break the rhythm between patterned mint sections
- Pattern overlays are decorative only — must not compete with headings or body copy

## Must

- All sections: consistent 88px–96px vertical padding
- All containers: max-width 1200px, centered, responsive horizontal padding
- Section headers: 48px or 56px bottom margin
- All `neutral-primary-soft` sections use the layered mesh pattern unless explicitly exempted
- Section content always at `z-index: 3` above pattern pseudo-elements
- Card grids: **32px** gap (row and column) — never less, including on mobile
- Layouts readable on desktop and mobile

# Lists

> Dependencies: `colors.md`

## Core Specs

- Item spacing: 16px vertical gap between list items
- Font: Geist
- Text: body color

## List Icons

- Size: 20x20px
- Prevent squishing: no shrink
- Spacing: 6px right margin between icon and text
- Active/featured icon: fg-brand color (sky blue) or fg-success-strong (forest green)
- Neutral icon: body-subtle color
- Optional: hand-drawn-style bullet icons (star, checkmark doodle) in heading color

## Inactive / Disabled Items

Strikethrough text with body-subtle color decoration on the list item.

## Pattern

Vertical flex list with 16px gap. Each item is a flex row with centered alignment — icon (20x20, no-shrink, 6px right margin) followed by a span of body-colored Geist text.

## Feature Lists (marketing)

- Use forest-green checkmark or star doodle icons
- Item text: 16px–18px Geist, heading or body color
- On green accent bands: white text and white/light icons

# Modals

> Dependencies: `colors.md`, `radius.md`, `shadows.md`, `buttons.md`, `inputs.md`

Dialog panels follow the sticker-panel metaphor — a white panel with thick ink border and hard offset shadow, floating over a dimmed mint classroom.

## Core Specs

### Overlay (Backdrop)
- Fixed, covers full screen
- Z-index: 40
- Background: dark-strong at 80% opacity (#000c)
- No backdrop blur (keep the educational flatness)

### Content Container (Dialog Panel)
- Background: bg-panel
- Border: 2px, border-default
- Radius: 24px (large sticker panel)
- Shadow: shadow-sticker + shadow-xl
- Padding: 32px horizontal, 48px vertical (desktop); 24px all sides (mobile)

## Anatomy

### Header
- Bottom border: 1px, border-light
- Title: Geist, 20px, semibold (600), heading color
- Close button: Ghost variant from `buttons.md`, 8px padding
- Optional: small hand-drawn doodle icon beside title (24px, heading color)

### Body
- Vertical padding: 24px
- Vertical spacing between elements: 24px
- Text: Geist, 16px, 1.6 line-height, body color

### Footer
- Top border: 1px, border-light
- Action buttons follow `buttons.md` — Brand for primary, Tertiary or Secondary for cancel (same gradient recipe)
- Primary action right-aligned; secondary left of primary

## Variants

### Default (Information)
Standard header + body + footer with Brand + Tertiary/Secondary gradient buttons.

### Pop-up (Confirmation)
Centered text, prominent icon or doodle illustration, reduced padding:
- Body: 24px padding, text centered
- Icon/illustration: centered, 16px bottom margin, 48x48px minimum, heading color

### Form Modal
Body contains inputs following `inputs.md`. Vertical spacing between form elements: 16px. Form sits inside the white sticker panel — inputs use 1px borders.

## Rules

- Backdrop covers full screen with fixed positioning
- Content: bg-panel background, 24px radius, shadow-sticker + shadow-xl
- Header/Footer separated by border-light dividers (1px)
- Close button must be present and functional
- Accessibility: `role="dialog"`, implement focus trap in code
- Dark mode automatic via token system
- Modals are dialog windows, not glassy overlays

# Pagination

> Dependencies: `colors.md`, `radius.md`

## Container

Font: Geist, 14px. Items displayed as flex with -1px overlap for seamless borders.

## Pagination Item

- Layout: flex, centered both axes
- Size: 36x36px (or 40x40px)
- Text: body color, medium weight (500)
- Background: bg-panel
- Border: 2px, border-default
- Shadow: shadow-sticker-sm
- Hover: neutral-secondary-soft background, heading text
- Focus: 2px offset outline, brand-medium color
- Overlap: -1px left margin

## Previous / Next Buttons

- Horizontal padding: 12px, height: 36px
- First item: 8px radius on inline-start side
- Last item: 8px radius on inline-end side

## Active Page Item

- Text: fg-brand color (sky blue)
- Background: neutral-secondary-medium
- Border: 2px, border-brand
- Hover text: fg-brand (stays same)

## Rules

- Display as flex with -1px child overlap for seamless borders
- Items: bg-panel background, border-default border, body text
- Active: fg-brand text, neutral-secondary-medium background
- First item: rounded start, Last item: rounded end
- All items need hover and focus states

# Radios, Checkboxes & Toggles

> Dependencies: `colors.md`, `radius.md`

## Checkbox

- Size: 16x16px
- Radius: 4px (sm)
- Border: 2px, border-default-medium
- Background: bg-panel
- Focus ring: 2px offset outline, brand-medium color
- Checked: brand background, white checkmark, border-brand

### Disabled
- Border: border-light
- Text: fg-disabled

## Radio

- Size: 16x16px
- Radius: fully rounded
- Border: 2px, border-default-medium
- Background: bg-panel
- Focus ring: 2px offset outline, brand-medium color
- Checked: border-brand, indicator: brand fill

### Disabled
- Border: border-light-medium
- Text: fg-disabled

Group all radio items under the same `name` attribute.

## Toggle

### Track
- Fully rounded
- Background: neutral-quaternary
- Border: 2px, border-light
- Focus-within ring: 2px offset outline, brand-medium color
- Checked track: brand background, border-brand
- Disabled track: neutral-tertiary background

### Thumb
- Fully rounded
- Background: white
- Border: 2px, border-default
- Shadow: shadow-sticker-sm

### Disabled
- Track: neutral-tertiary background
- Label: fg-disabled text

## Rules

- All selection inputs must have `id` matching label `htmlFor`
- Focus states use brand-medium offset outline for each control type
- Disabled states: no hover/focus interaction
- Labels: Geist, 14px, body color

# Border Radius

| Token | Value | Default usage |
|---|---|---|
| base | 16px | Panels, modals, section stickers |
| stacked | 0 | Stacked fan cards (face, back layers, media slot) — square corners |
| cta | 7px | All filled buttons (every variant) |
| default | 8px | Inputs, badges, dropdown items, small controls |
| sm | 4px | Checkboxes, inline code chips, tiny elements |
| sticker | 32px | Rotated hero sticker badges and promotional callouts |
| full | 9999px | Pills, avatars (circular), toggles, dot indicators |

## Rules

- 16px is the default radius for panels and modals (white sticker surfaces)
- 0 (`stacked`) is mandatory for all stacked fan cards — square corners on face, layers, and media
- 7px (`cta`) is the default for all filled buttons
- 8px (`default`) is for inputs and smaller controls
- Never use sharp 0–3px corners — this system is rounded and friendly, not retro-OS sharp
- `sticker` large radius is for rotated promotional badges only — not for stacked cards
- Radius must be consistent within each component family

# Shadows

Hard offset sticker shadows replace soft blurs as the primary depth mechanism. Extracted from [Root Square Academy](https://rootsquare.academy/) compiled styles.

| Token | CSS value |
|---|---|
| shadow-button | `var(--button-shadow, 8px 8px 20px 0px rgba(25 87 54 / 0.35))` |
| shadow-button-neutral | `var(--button-neutral-shadow, 8px 8px 20px 0px rgba(15 15 15 / 0.20))` |
| shadow-button-danger | `var(--button-danger-shadow, 8px 8px 20px 0px rgba(199 0 54 / 0.30))` |
| shadow-button-warning | `var(--button-warning-shadow, 8px 8px 20px 0px rgba(186 104 50 / 0.30))` |
| shadow-sticker | `var(--sticker-shadow-offset, -2px 3px 0px 0px) var(--sticker-shadow-color, rgb(25 87 54))` |
| shadow-sticker-sm | `-1px 2px 0px 0px var(--sticker-shadow-color, rgb(25 87 54))` |
| shadow-card | `0 4px 8px rgb(0 0 0 / 0.25)` |
| shadow-2xs | `0 1px rgb(0 0 0 / 0.05)` |
| shadow-xs | `2px 2px 2px 0 rgb(0 0 0 / 0.26)` |
| shadow-sm | `0 2px 4px 0 rgb(0 0 0 / 0.12)` |
| shadow-md | `0 4px 8px rgb(0 0 0 / 0.25)` |
| shadow-lg | `0 8px 16px rgb(0 0 0 / 0.20)` |
| shadow-xl | `0 12px 24px rgb(0 0 0 / 0.30)` |
| shadow-inset-highlight | `inset -2.58px -2.58px var(--inset-highlight, rgb(255 255 255 / 0.72))` |

## Component Mapping

| Component type | Token |
|---|---|
| All filled buttons (Brand, Secondary, Tertiary, status) | shadow-button / shadow-button-neutral / shadow-button-danger / shadow-button-warning — removed on hover |
| Sticker panels, promotional badges | shadow-sticker |
| Small controls, badges, nav pills | shadow-sticker-sm or shadow-xs |
| Stacked fan cards | none — depth from rotated `::before` / `::after` layers (see `cards.md`) |
| White panels (non-card) | shadow-card (optionally combined with shadow-sticker for hero panels) |
| Inputs at rest | shadow-xs or none |
| Dropdowns, popovers | shadow-md |
| Modals, high-priority overlays | shadow-xl + shadow-sticker on the panel |
| Green accent band content floating above | shadow-card |

## Rules

- **All filled buttons** use `shadow-button` (or variant shadow); hover removes the glow and drops to 80% opacity.
- **Sticker shadow** applies to white panels only — a hard offset cast in `brand-strong` green. Never on buttons.
- Use only these tokens — no custom box-shadow values
- Never combine `shadow-sticker` with `shadow-card` on the same element unless one is on `:hover` only
- `:active` pressed state: remove or zero-out sticker shadow and translate element 2px down + 1px right
- `shadow-inset-highlight` is optional on green accent surfaces only — never on white buttons
- Never use shadow-xl for dense list items or body containers
- Hover on interactive sticker elements: optionally deepen sticker offset by 1px (e.g. −3px 4px)

# Sidebars

> Dependencies: `colors.md`, `radius.md`, `typography.md`, `badges.md`, `alerts.md`

## Core Specs

- Background: neutral-primary-soft (mint) or bg-panel (white sticker variant)
- Right border: 2px, border-default (for left-sidebar); left border for right-sidebar
- Width: 256px

## Anatomy

### Outer Container
Hidden on mobile, visible at small breakpoint. Needs a toggle/trigger for mobile.

### Inner Wrapper
- Full height, vertical scroll overflow
- Padding: 12px horizontal, 16px vertical

### Navigation List
- Vertical spacing: 8px between items
- Font: Geist, medium weight (500)

### Navigation Item
- Layout: flex, vertically centered
- Padding: 8px horizontal, 8px vertical
- Text: heading color
- Radius: 8px (default)
- Hover: neutral-secondary-soft background
- Transition: colors, 150ms
- Icon: 20x20px, body-subtle color, hover → heading color, 75ms transition
- Label: 12px left margin from icon

### Active Item
- Background: neutral-secondary-medium
- Text: fg-brand (sky blue) or heading color with 2px left border in brand

### Separator
- 16px top padding, 16px top margin
- Top border: 1px, border-light
- 8px vertical spacing below

### Bottom CTA / Card
- Padding: 16px
- Top margin: 24px
- Radius: 16px (base)
- Background: brand-softer
- Border: 2px, border-brand-subtle
- Shadow: shadow-sticker-sm
- Can also use any alert variant from `alerts.md`

## Rules

- Responsive: hidden on mobile with a trigger mechanism
- Icons: 20x20px, body-subtle color (hover: heading color)
- Multi-level menus: indent with 44px left padding
- Spacing follows 8px grid
- Only neutral, brand, or status tokens — no arbitrary colors
- White sticker sidebar variant: bg-panel background with 2px border-default right edge

# Tables

> Dependencies: `colors.md`, `radius.md`, `shadows.md`

## Wrapper

- Horizontal scroll overflow
- Background: bg-panel
- Radius: 16px (base) — tables are panels, not stacked fan cards
- Border: 2px, border-default
- Shadow: shadow-sticker

## Table Element

- Full width, left-aligned text (right-aligned for RTL)
- Font: Geist, 14px, body color

## Table Head

- Font: 14px, body color, medium weight (500)
- Background: neutral-secondary-soft (mint tint)
- Bottom border: 1px, border-default
- Cell padding: 24px horizontal, 12px vertical

## Table Body

- Row background: bg-panel
- Row bottom border: 1px, border-light (omit on last row to avoid doubling with wrapper border)
- Row hover: neutral-secondary-soft background (optional)
- Row header: medium weight, heading color, no-wrap
- Cell padding: 24px horizontal, 16px vertical

## Rules

- Wrapper must have horizontal scroll overflow for responsive scrolling
- Last row: omit bottom border to avoid doubling with wrapper border
- Row headers: always `scope="row"` for semantic structure
- Hover on rows is optional
- No section mesh pattern inside tables — solid panel surface only
- No arbitrary hex codes — use token colors only

# Tabs

> Dependencies: `colors.md`, `radius.md`, `shadows.md`

## Core Specs

- Font: Geist, 14px, medium weight (500), body color
- Transitions: all properties, 200ms

## Variants

### 1. Underline (Default)

**Wrapper:** bottom border, border-default

**Tab Item:**
- Padding: 16px horizontal, 16px vertical
- Bottom border: 2px, transparent
- Top corners: 8px radius
- Transition: colors, 150ms

| State | Appearance |
|---|---|
| Active | fg-brand text (sky blue), border-brand bottom border |
| Inactive | transparent bottom border; hover → heading text, border-default-strong bottom border |
| Disabled | fg-disabled text, not-allowed cursor |

### 2. Pills

**Tab Item:**
- Padding: 16px horizontal, 10px vertical
- Radius: 8px (default)
- Font weight: medium (500)
- Transition: all, 200ms

| State | Appearance |
|---|---|
| Active | Full Brand gradient button style from `buttons.md` (green face + border ring + shadow-button) |
| Inactive | body text; hover → neutral-secondary-soft background, heading text |
| Disabled | fg-disabled text, not-allowed cursor |

### 3. Full Width

Children overlap with -1px left margin on all except first.

**Tab Item:**
- Full width, centered text
- Padding: 16px horizontal, 16px vertical
- Background: bg-panel
- Border: 2px, border-default
- Transition: colors, 150ms
- Hover: neutral-secondary-soft background, heading text

| State | Appearance |
|---|---|
| Active | neutral-secondary-medium background, fg-brand text |
| First item | rounded start (8px) |
| Last item | rounded end (8px) |

## Tabs with Icons

- Icon size: 16x16px or 20x20px
- Spacing: 8px right margin
- Layout: inline-flex, centered
- Icons inherit the text color of the tab state

# Tooltips & Popovers

> Dependencies: `colors.md`, `radius.md`, `shadows.md`

## Tooltips

### Core Specs
- Padding: 12px horizontal, 8px vertical
- Font: Geist, 14px, medium weight (500)
- Radius: 8px (default)
- Shadow: shadow-sticker-sm
- Transition: opacity, 300ms

### Dark (Default)
- Background: dark (#0F0F0F)
- Text: white
- Border: 2px, border-dark

### Light
- Background: bg-panel
- Text: heading color
- Border: 2px, border-default

## Popovers

### Core Specs
- Background: bg-panel
- Radius: 16px (base)
- Shadow: shadow-sticker + shadow-md
- Border: 2px, border-default
- Transition: opacity, 300ms

### Header / Title
- Padding: 12px horizontal, 8px vertical
- Background: neutral-secondary-soft
- Bottom border: 1px, border-light
- Font: Geist, 14px, medium weight (500), heading color

### Body / Content
- Standard: 12px horizontal, 8px vertical padding; 14px, body color
- Rich: 16px padding; 14px, body color

## Arrows

- Size: 8x8px rotated 45deg
- Border: matches parent border color
- Color must match the background of the tooltip/popover variant

## Rules

- Tooltips: 8px radius, sticker shadow
- Popovers: 16px radius, sticker-panel treatment
- Dark tooltips: dark background, white text
- Light tooltips/popovers: bg-panel + 2px border-default
- Arrows match parent background color

# Typography

> Dependencies: `colors.md`

## Font Families

All fonts are free on [Google Fonts](https://fonts.google.com/).

| Role | Family | Fallback | Notes |
|---|---|---|---|
| Display & headings (`h1`–`h6`) | **[DynaPuff](https://fonts.google.com/specimen/DynaPuff)** | cursive, sans-serif | Expressive, cute, rounded display face — all heading levels |
| Body / UI / labels | **Geist** | system-ui, sans-serif | Clean geometric sans for paragraphs, labels, navigation, buttons |
| Code / math / metadata | **Geist Mono** | ui-monospace, monospace | Formulas, code snippets, stat labels |

Configure all three at the app level. Never override with a different family inside components.

## Core Rules

- **All headings (`h1`–`h6`):** DynaPuff, heading text color
- **`h1`:** DynaPuff, regular weight (400), uppercase optional for hero display
- **`h2`–`h6`:** DynaPuff, regular (400) or medium (500) — avoid heavy bold; the face is already expressive
- **Body copy:** Geist, regular weight (400), body text color — never use brand/link blue for paragraphs longer than one sentence
- **Button labels:** Geist (not DynaPuff) — see `buttons.md`
- **Semantic HTML:** Use `h1`–`h6` in order, never skip levels

## Heading Scale

### Desktop

| Element | Font | Size | Weight | Line-height | Letter-spacing | Margin-bottom |
|---|---|---|---|---|---|---|
| `h1` | DynaPuff | 72px | 400 | 1.0 | 0 | 24px |
| `h2` | DynaPuff | 56px | 400 | 1.1 | — | — |
| `h3` | DynaPuff | 43px | 400 | 1.15 | — | — |
| `h4` | DynaPuff | 36px | 400 | 1.2 | — | — |
| `h5` | DynaPuff | 28px | 500 | 1.25 | — | — |
| `h6` | DynaPuff | 20px | 500 | 1.3 | — | — |

`h1` may be uppercase (`text-transform: uppercase`) on hero/marketing blocks. `h2`–`h6` use normal casing.

### Responsive

| Element | Tablet (≥768px) | Mobile (default) |
|---|---|---|
| `h1` | 56px | 44px |
| `h2` | 44px | 36px |
| `h3` | 36px | 28px |
| `h4` | 30px | 24px |
| `h5` | 24px | 20px |
| `h6` | 18px | 18px |

Mobile-first: start with mobile sizes, scale up at tablet and desktop breakpoints.

Never reduce line-height below 1.0 for any heading.

## Paragraphs

### Leading Paragraph
- Font: Geist
- Size: 18px
- Weight: 400 (regular)
- Color: body (or heading color when placed directly under a display `h1` on mint surfaces)
- Line-height: 1.25–1.4
- Max width: ~70 characters

### Normal Paragraph
- Font: Geist
- Size: 14px–16px (16px for long-form; 14px for UI-adjacent copy)
- Weight: 400
- Color: body
- Line-height: 1.6–1.7
- Max width: ~65 characters

### Small Supporting Copy
- Font: Geist
- Size: 14px
- Weight: 400
- Color: body-subtle
- Line-height: 1.6
- Use only for helper text, legal text, captions, metadata.

## UI Labels

| Context | Font | Size | Weight |
|---|---|---|---|
| Button labels | Geist | 18px (base CTA) | 500 (medium) |
| Input labels | Geist | 14px | 500 (medium) |
| Captions / meta / badges | Geist | 12px or 14px | 500 (medium) |
| Nav links | Geist | 14px | 500 (medium) |

Do not apply paragraph line-height (1.7) to control labels. Do not set DynaPuff on buttons — headings only.

## Links

- **Inline links:** Same size as surrounding text (Geist), fg-brand color (#0099FF), underline, hover → no underline
- **CTA links:** fg-brand color, medium weight (500), underline, hover → no underline

## Code & Math

- Font: Geist Mono
- Size: 14px (inline), 13px–14px (blocks)
- Color: code-text on code-bg backgrounds; heading color on mint surfaces
- Background (inline): brand-softer with 4px radius
- Line-height: 1.5

## Emphasis

- `<strong>` for high-priority emphasis in body text (Geist semibold 600)
- `<em>` for tone emphasis only, not visual hierarchy
- All-caps only for short labels and optional `h1` hero treatment: uppercase, 0.4px letter-spacing, 12px or 14px (Geist medium)

## Dark Mode

Hierarchy stays identical. Only color tokens change (automatic via CSS custom properties). Font families, sizes, weights, and spacing remain constant.