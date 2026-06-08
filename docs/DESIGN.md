---
name: RewriteFlow
description: AI text refiner — paste a draft, get a faithful rewrite, paragraph by paragraph
colors:
  oxford-blue: "#002147"
  oxford-blue-hover: "#003366"
  oxford-soft: "#7da7d9"
  oxford-deep: "#0b1320"
  paper: "#fdfbf7"
  ink-black: "#1a1a1a"
  mat: "#f3efe6"
  dark-bg: "#16181c"
  dark-paper: "#1e2127"
  dark-paper-2: "#23272f"
  dark-border: "#313742"
  gray-50: "rgb(253 251 247)"
  gray-100: "rgb(245 243 238)"
  gray-200: "rgb(232 230 223)"
  gray-300: "rgb(214 212 204)"
  gray-400: "rgb(168 165 156)"
  gray-500: "rgb(122 119 108)"
  gray-600: "rgb(89 86 78)"
  gray-700: "rgb(64 61 54)"
  gray-800: "rgb(38 37 34)"
  gray-900: "rgb(26 26 26)"
  gray-950: "rgb(10 10 10)"
typography:
  display:
    fontFamily: "EB Garamond, Georgia, 'Times New Roman', serif"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Crimson Text, Georgia, 'Times New Roman', serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "IBM Plex Mono, ui-monospace, Menlo, monospace"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "0.14em"
    textTransform: "uppercase"
rounded:
  bezel-outer: "12px"
  bezel-inner: "6px"
  button: "6px"
  field: "6px"
  card: "8px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  page-top: "7rem"
components:
  button-primary:
    backgroundColor: "{colors.oxford-blue}"
    textColor: "#ffffff"
    typography: "{typography.label}"
    rounded: "{rounded.button}"
    padding: "0.85rem 1.75rem"
    note: "Inverts to outlined (white bg, oxford text) on hover; scale(0.985) on press."
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.gray-600}"
    typography: "{typography.label}"
    rounded: "{rounded.button}"
    padding: "0.5rem 0.85rem"
  bezel:
    backgroundColor: "{colors.mat}"
    border: "1px solid {colors.gray-300}"
    rounded: "{rounded.bezel-outer}"
    padding: "7px"
    note: "Outer mat board; frames an inset .bezel-inner surface."
  bezel-inner:
    backgroundColor: "#ffffff"
    border: "1px solid {colors.gray-200}"
    rounded: "{rounded.bezel-inner}"
    note: "Inset surface with a top bevel highlight and an ink-tinted recess."
  field:
    backgroundColor: "#ffffff"
    textColor: "{colors.gray-900}"
    border: "1px solid {colors.gray-300}"
    rounded: "{rounded.field}"
    padding: "0.75rem 1rem"
    focusRing: "0 0 0 3px rgb(var(--accent-rgb) / 0.16)"
---
# Design System: RewriteFlow

## 1. Overview

**Creative North Star: "The Archival Desk."**

RewriteFlow is the disciplined surface where a draft gets checked, refined, and returned in different words, without ceremony. The interface borrows from the editorial and archival tradition: a matted document on a desk, heritage serif type for reading, and a mono "instrument label" voice for the controls and readouts around the work. The design exists to disappear; the user's text (input and output) is always the largest, most prominent thing on screen.

The system commits to a single identity hue (Oxford Blue), a serif reading face paired against a mono label face on a deliberate contrast axis, opaque surfaces with real borders, and motion that conveys state and nothing else. It explicitly rejects the gradient-soup, glassmorphic "AI tool" template.

**Key characteristics**
- **Precise:** honest states, tabular numerals, legible progress, predictable affordances.
- **Trustworthy:** one accent used sparingly, no decorative noise, calm feedback.
- **Focused:** single-task layout; the text is the hero; the tool gets out of the way.

## 2. Colors

A restrained palette anchored on one identity hue. Oxford Blue carries every "active / committed / in-progress" signal; everything else is a paper-tinted neutral ramp that reads warm without going sterile-gray.

### Identity

- **Oxford Blue** (`#002147`): the single identity hue. Primary buttons, active nav and filter states, focus rings, progress fill, and accent labels. Solid enough to fill a button and pass AA with white text.
- **Oxford Blue Hover** (`#003366`): hover/pressed shift (light mode). Primary buttons additionally invert to outlined (white fill, oxford text) on hover.
- **Oxford Soft** (`#7da7d9`): the dark-mode accent — the *same* hue lifted to read on dark surfaces. Drives `--accent` and every alpha ring in `.dark`. Not a second color.
- **Oxford Deep** (`#0b1320`): Oxford pushed near-black; the dark-mode background of the auth identity panel.

### Surfaces

- **Paper** (`#fdfbf7`): light page background. Warm off-white, not clinical white.
- **Mat** (`#f3efe6` / dark `#1b1e24`): the outer "mat board" of the double-bezel.
- **Inner surface** (`#ffffff` / dark `#1e2127`): the inset document surface.
- **Ink** (`#1a1a1a`): default body text in light mode.
- **Dark ramp:** `--dark-bg #16181c`, `--dark-paper #1e2127`, `--dark-paper-2 #23272f`, `--dark-border #313742`. Tinted noir, never dead black.

### Neutral ramp

`--gray-50` … `--gray-950`, lightness mirroring Tailwind gray, hue nudged toward warm paper. Stored in `:root` as space-separated RGB channels so the same values feed both Tailwind utilities (`text-gray-700`, `bg-gray-800/60`) and the raw component CSS. `.label` defaults to `gray-700` (~10.5:1 on paper); `.label-muted` to `gray-600` (~7:1).

**Implementation.** The ramp and accent are channel-backed: `tailwind.config.js` reads `rgb(var(--gray-500) / <alpha-value>)`, and `--accent-rgb` is the channel form so focus rings are a true alpha of the identity hue. `.dark` reassigns `--accent-rgb` to Oxford Soft once, and it cascades into `--accent` and every ring.

### Named rule

**The One Voice Rule.** Oxford Blue is the only chromatic color in the system. The only other hues are inherited, contextual: error/destructive red (delete confirm, error borders, Sonner toasts). No second brand accent, no category colors, no color-coding by rewrite mode. The accent's rarity is the point.

## 3. Typography

Three faces, each with a distinct job — this is a register where serif reading type earns its place.

- **Display — EB Garamond** (600, line-height 1.08, tracking −0.015em, `text-wrap: balance`): page titles and the marketing taglines. Often set italic at hero scale (`text-5xl`–`text-6xl`).
- **Body — Crimson Text** (400, 1.0625rem, line-height 1.6): all reading prose — the input draft, the rewritten output, history previews, helper text. This is the hero content face.
- **Label — IBM Plex Mono** (`.label`, 500, uppercase, tracking 0.14em, `tabular-nums`): the "instrument" voice — field labels, word/char counts, timestamps, button text, nav links, progress readouts. The mono is the deliberate contrast axis against the two serifs.

### Named rule

**The Contrast-Axis Rule.** Hierarchy comes from *role contrast* (serif reading vs. mono instrument) and weight/size/case, not from piling on families. Display and body are both serifs but at genuinely different jobs and scales; the mono labels keep the UI chrome legibly separate from the prose. Don't introduce a fourth family or a geometric sans.

## 4. Elevation & Surfaces

**The Double-Bezel.** The signature surface is a matted document: an outer mat board (`.bezel`: `--mat` background, 1px `--mat-edge`, 12px radius, 7px padding "reveal") framing an inset inner surface (`.bezel-inner`: opaque white / dark-paper, 1px edge, 6px radius, a top bevel **highlight** and a faint ink-tinted **recess**). Depth reads from the frame and bevel, not a drop shadow.

- **Shadows are tinted, not black:** `--shadow-sm/md/lg` carry the ink/identity hue (e.g. `rgba(0,33,71,…)`), so elevation stays cohesive with the palette.
- **Interactive bezels** (`.bezel-interactive`) lift 2px and shift their border toward the accent on hover; `:focus-within` shows the accent ring.
- `.card` remains as a flat alias of the inner surface for anything not using the full bezel.

### Named rule

**The Framed-Surface Rule.** Surfaces are opaque and framed. No glassmorphism, no backdrop-blur, no frosted glass. The mat + bevel does the separation work; the tinted shadow is reinforcement, not the primary cue.

## 5. Components

### Buttons
- **Primary** (`.btn-primary`): Oxford fill, white mono uppercase label, 6px radius, 0.85rem×1.75rem padding. Hover **inverts** to white fill + oxford text; press is `scale(0.985)`. Dark mode fills with Oxford Soft (text `#0b1320`) and inverts to outlined. Disabled = 50% opacity, no color change.
- **Ghost** (`.btn-ghost`): transparent, gray-600 mono label, hover deepens text + adds a faint tint. Reset, theme toggle, sign-out.

### Fields (`.field`)
- White / dark-paper background, 1px gray-300 / dark-border, 6px radius, Crimson Text at 1.0625rem. Focus shifts the border to the accent with a 3px accent-alpha ring (0.16); textarea panels echo this at `:focus-within` (0.14) via `.panel-glow`.
- `TextField` wraps `.field` with a bound `<label>` and inline error (`aria-invalid` + `aria-describedby` + **red border** + message). `PasswordField` adds a self-managing show/hide toggle. The history search uses the bare `.field`.
- **Cascade note:** component classes live in `@layer components`; Tailwind utilities (`@layer utilities`) are ordered after, so utilities on the same element win (e.g. the red error border, an active link's `text-white`). Keep custom component CSS inside `@layer components` — unlayered rules silently beat every utility and reintroduce contrast bugs.

### Navigation
- Fixed top bar (`z-sticky`), translucent-free `bg-paper` / `bg-ink-bg`, 1px bottom border that appears on scroll. **Pages offset content with `pt-28`** so the fixed bar never overlaps the page heading.
- Links sit in a pill group. **Active** = Oxford fill + white text (the one "selected" pattern, shared with history filter chips). **Inactive** = gray-600 mono, hover deepens. Labels: "Workspace", "History" (match the page headings).
- A skip link (`#main-content`) is the first focusable element; both `<main>` targets are `tabIndex={-1}` so focus lands there. Mobile uses a hamburger panel with 44px touch targets.

### Mode selector (rewrite style)
- Trigger styled as a form control (bezel-inner), chevron rotates on open. Opens upward (`bottom-full`) as a bezel panel; each option is icon + label + description.
- **Keyboard:** `role="listbox"` / `role="option"`; opens on Arrow keys from the trigger; Arrow Up/Down, Home/End move focus between options; Escape closes and restores focus to the trigger; Tab closes. Selected option is focused on open.

### Progress bar
- 8px track (gray-200 / dark ink-raised), Oxford fill animated by width only (`ease-out-quint`, 0.4s). Status text "Rewriting paragraph X of Y" with `aria-live="polite"`; percentage in accent, `tabular-nums`. Full `role="progressbar"` ARIA.

### History card
- A bezel-interactive surface (one level of containment — never a card inside a card). Header row = mode chip + timestamp + truncated source + word counts; expand reveals a two-column Original / Rewritten preview. Reuse loads the draft back into the workspace; delete uses an inline two-step confirm (not a modal), with focus moved to the confirm button.

## 6. Motion

- **Stateful only.** Entrances, menu open/close, paragraph arrival, copy-confirmed, progress width. No ambient float, drift, shimmer, or glow.
- **Timing:** 150–400ms, `--ease-out-quint` / `--ease-out-expo`. No bounce, no elastic.
- **Reduced motion is enforced in two places:** the CSS `@media (prefers-reduced-motion: reduce)` block neutralizes CSS animation/transition, and `<MotionConfig reducedMotion="user">` in `App.jsx` makes every Framer Motion animation (page fades, card stagger, dropdown, progress width) honor the OS setting. Both are required — the CSS block alone does not cover JS-driven motion.

## 7. Do's and Don'ts

### Do
- Use Oxford Blue as the sole chromatic accent; rarity is identity.
- Keep custom component CSS inside `@layer components` so utilities can override it.
- Use the double-bezel for primary surfaces; one level of containment only.
- Use `tabular-nums` on all numeric readouts; `text-wrap: balance` on headings, `pretty` on prose.
- Offset fixed-nav pages with `pt-28`; make skip-link targets focusable (`tabIndex={-1}`).
- Give the mode selector (and any listbox) full keyboard support: arrows, Home/End, Escape.
- Respect reduced motion in **both** CSS and Framer (`MotionConfig`).
- Keep copy plain and direct ("Rewrite deleted", "Signed out", "Passwords do not match"). One vocabulary across inline errors and toasts.

### Don't
- Don't use gradients, gradient text, glassmorphism, or backdrop-blur on surfaces.
- Don't add a second accent or category colors.
- Don't write component CSS outside `@layer` (it silently overrides utilities and breaks active-state contrast and error borders).
- Don't load decorative assets from third-party hosts; inline an SVG grain instead.
- Don't let the theme leak into the *words* — the Archival Desk metaphor lives in pixels (serifs, mat, mono labels), not in jargon like "expunge" or "passcode".
- Don't use ambient motion, bounce/elastic easing, or em dashes in UI copy.
- Don't add "AI"/"Powered by AI" badges or sparkle icons.
- Don't nest cards/bezels.
