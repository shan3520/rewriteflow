---
name: RewriteAI
description: AI-powered plagiarism remover — paste text, get a faithful rewrite
colors:
  editors-green: "#10b981"
  editors-green-fill: "#047857"
  editors-green-fill-hover: "#065f46"
  editors-green-light: "#34d399"
  slate-wash-50: "#f8fbf9"
  slate-wash-100: "#f1f5f3"
  slate-wash-200: "#e4e8e6"
  slate-wash-300: "#d1d6d3"
  slate-wash-400: "#9ea4a1"
  slate-wash-500: "#6e7370"
  slate-wash-600: "#505653"
  slate-wash-700: "#3d423f"
  slate-wash-800: "#262927"
  slate-wash-900: "#161918"
  slate-wash-950: "#060807"
typography:
  heading:
    fontFamily: "DM Sans, system-ui, -apple-system, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "normal"
  body:
    fontFamily: "DM Sans, system-ui, -apple-system, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.625
    letterSpacing: "normal"
  label:
    fontFamily: "DM Sans, system-ui, -apple-system, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "0.025em"
  caption:
    fontFamily: "DM Sans, system-ui, -apple-system, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.editors-green-fill}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "10px 24px"
    typography: "{typography.body}"
  button-primary-hover:
    backgroundColor: "{colors.editors-green-fill-hover}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.slate-wash-500}"
    rounded: "{rounded.md}"
    padding: "6px 14px"
    typography: "{typography.caption}"
  card-surface:
    backgroundColor: "#ffffff"
    textColor: "{colors.slate-wash-900}"
    rounded: "{rounded.lg}"
    padding: "16px"
  card-surface-dark:
    backgroundColor: "{colors.slate-wash-900}"
    textColor: "#ffffff"
    rounded: "{rounded.lg}"
    padding: "16px"
  input-field:
    backgroundColor: "{colors.slate-wash-50}"
    textColor: "{colors.slate-wash-900}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
  chip-active:
    backgroundColor: "#ecfdf5"
    textColor: "{colors.editors-green-fill}"
    rounded: "{rounded.sm}"
    padding: "6px 12px"
  chip-inactive:
    backgroundColor: "transparent"
    textColor: "{colors.slate-wash-500}"
    rounded: "{rounded.sm}"
    padding: "6px 12px"
---
# Design System: RewriteFlow

## 1. Overview

**Creative North Star: "The Writing Workspace"**

The Writing Workspace is the disciplined surface where work gets checked, refined, and polished without ceremony. RewriteFlow's interface is a focused environment for writers, professionals, and creators who care about one thing: getting trustworthy, high-quality reworded text back fast. The design exists to disappear. Every surface, color, and animation serves the user's text — nothing else.

The system is built on restraint. One font family. One accent hue. Opaque surfaces with real borders. Motion that conveys state, never decoration. The visual language borrows from the editorial tradition: clean document pages, careful precision, and a quiet confidence. It explicitly rejects the gradient-soup, glassmorphic "AI tool" template that signals machine-generated output.
...
- **Don't** use emoji as UI elements or decorative icons. The product serves professional users; emoji can undermine trust in a precision tool.
The density is calibrated for a product-register application: compact but not cramped, with consistent affordances and predictable behavior across every screen. The user's text (input and output) is always the largest, most prominent element on screen. UI chrome stays secondary.

**Key Characteristics:**
- **Precise:** Honest states, tabular numbers, legible progress, predictable affordances
- **Trustworthy:** One accent used sparingly, no decorative noise, calm feedback
- **Focused:** Single-task layout, the text is the hero, tool disappears into the task

## 2. Colors

A restrained, emerald-anchored palette built for trust. One accent hue used at ≤10% of any screen; the rest is a warm-cool tinted neutral scale that reads as professional without falling into sterile corporate gray.

### Primary

- **Editor's Green** (#10b981): The identity hue. Used for focus rings, active states, progress fills, and the accent chip on the "Rewritten Text" panel label. At 500 saturation it signals attention without shouting. Never used as a background fill under text — that's what the darker fills are for.
- **Editor's Green Fill** (#047857): The accessible solid fill for primary buttons and strong interactive elements. White text on this background passes WCAG AA at 5.5:1. This is the color of commitment: "Rewrite", "Create account", "Sign in".
- **Editor's Green Fill Hover** (#065f46): The hover/pressed state of the fill. Feedback through a color shift, not a lift or a glow.
- **Editor's Green Light** (#34d399): The dark-mode accent for focus rings, progress fills, and active labels. Compensates for the lower perceived brightness of dark surfaces.

### Neutral

The neutral scale is tinted toward the brand emerald (OKLCH hue ≈ 162.5°, chroma ≤ 0.008). Lightness values mirror Tailwind's gray so contrast ratios are unchanged; only the hue shifts for cohesion.

- **Slate Wash 50** (#f8fbf9): Light-mode page background. Clean but not clinical — the green tint prevents sterile-gray.
- **Slate Wash 100** (#f1f5f3): Input field backgrounds in light mode.
- **Slate Wash 200** (#e4e8e6): Borders, dividers, card edges in light mode.
- **Slate Wash 300** (#d1d6d3): Scrollbar thumb resting state, secondary borders.
- **Slate Wash 400** (#9ea4a1): Placeholder text, disabled icons, tertiary content.
- **Slate Wash 500** (#6e7370): Body metadata, secondary labels, timestamps.
- **Slate Wash 600** (#505653): Dark-mode scrollbar hover, secondary text emphasis.
- **Slate Wash 700** (#3d423f): Dark-mode card borders, separator lines.
- **Slate Wash 800** (#262927): Dark-mode card borders, input borders.
- **Slate Wash 900** (#161918): Dark-mode card backgrounds, surface containers.
- **Slate Wash 950** (#060807): Dark-mode page background. Near-black with just enough green to avoid dead gray.

**Implementation.** The eleven steps live as space-separated RGB channels in `:root` (`--gray-50` through `--gray-950` in `index.css`) and are the single source of truth. `tailwind.config.js` references them as `rgb(var(--gray-500) / <alpha-value>)`, so the JSX utilities (`bg-gray-50`, `text-gray-500`, `bg-gray-800/60`) and the raw component CSS (`.card`, `.field`, scrollbar, page background) read the same values, and Tailwind's `/opacity` modifiers keep working. Change a neutral once and it updates everywhere. The accent follows the same pattern: `--accent-rgb` is the channel form (so the focus ring is a true alpha of the identity hue), `--accent` the solid form.

### Named Rules

**The One Voice Rule.** Editor's Green is the only chromatic color in the system. Every other hue (error red, delete-hover red) is inherited from the component library (Sonner toasts) and kept to their native context. If a new feature needs color, it uses Editor's Green or a tonal neutral. No second accent. No category colors. The accent's rarity is the point.

## 3. Typography

**Body Font:** DM Sans (with system-ui, -apple-system, sans-serif fallback)

**Character:** One family carries the entire interface. DM Sans is a humanist sans-serif with optical sizing — warm enough to avoid clinical sterility, precise enough for an editorial tool. No display font: headings are distinguished by weight (700) and tighter leading (1.2), not a second typeface.

### Hierarchy

- **Heading** (700, 1.5rem / 24px, line-height 1.2): Page titles only — "Plagiarism Remover", "Rewrite History", "Welcome back", "Create account". Balanced wrapping via `text-wrap: balance`.
- **Body** (400, 0.875rem / 14px, line-height 1.625): All prose content — input text, output paragraphs, descriptions, form helper text. Max line length is constrained by panel width, not an explicit `ch` cap.
- **Label** (600, 0.75rem / 12px, line-height 1.5, tracking 0.025em, uppercase): Section identifiers — "Original Text", "Rewritten Text", "Original", "Rewritten". All uppercase labels use consistent `tracking-wide` (0.025em) and `font-semibold` (600).
- **Caption** (400, 0.75rem / 12px, line-height 1.5): Metadata — word counts, character counts, timestamps, mode badges. Tabular figures (`tabular-nums`) on all numeric data to prevent horizontal jitter.
- **Interactive** (500, 0.875rem / 14px): Button labels, mode selector text, nav links. Medium weight distinguishes clickable from static without competing with headings.

### Named Rules

**The One Family Rule.** DM Sans is the only font loaded. No display font, no monospace, no serif. Hierarchy is built from weight (400 → 500 → 600 → 700), size (12px → 14px → 24px), and case (sentence vs. uppercase), not from font switching. This eliminates a network request and keeps the typographic identity singular.

## 4. Elevation

The system is flat by default. Depth is conveyed through tonal layering (background vs. card surface) and real borders, not shadows. Shadows exist but are deliberately quiet — ambient, not structural.

### Shadow Vocabulary

- **Card rest** (`0 1px 2px rgba(13, 26, 20, 0.04), 0 2px 6px rgba(13, 26, 20, 0.04)`): A barely-visible lift. The green-tinted RGBA keeps the shadow cohesive with the neutral scale. Used on all `.card` surfaces in light mode.
- **Card rest (dark)** (`0 1px 2px rgba(0, 0, 0, 0.25)`): Slightly heavier in dark mode to compensate for lower ambient contrast. Still quiet.
- **Dropdown** (`shadow-lg` via Tailwind): The mode selector dropdown is the only elevated element that uses a visible shadow. It needs the lift because it overlays content.

### Named Rules

**The Flat-By-Default Rule.** Surfaces are opaque cards with real borders. No glassmorphism, no backdrop-blur, no frosted glass. The border does the separation work; the shadow is ambient reinforcement, not the primary depth cue. If a new component needs depth, use a border first; add a shadow only if the border alone doesn't resolve the layering.

## 5. Components

Tactile and precise. Firm surfaces, crisp edges, minimal ornament. Every element earns its space.

### Buttons

- **Shape:** Gently curved edges (12px radius). Consistent across all button variants.
- **Primary:** Editor's Green Fill (#047857) background, white text, 600 weight, 10px 24px padding. Feedback through a color shift to the hover fill (#065f46), not a lift or a glow.
- **Press:** A small, fast scale-down (`scale(0.98)`) confirms the click. Tactile without flourish.
- **Focus:** 2px solid outline in Editor's Green Fill, 2px offset. Visible and functional.
- **Disabled:** 50% opacity, `cursor: not-allowed`. No color change — the opacity alone signals unavailability.
- **Ghost:** Transparent background, Slate Wash 500 text, hover shifts to stronger text color + subtle tinted background. Used for Reset, theme toggle, and secondary nav actions.

### Cards / Containers

- **Corner Style:** Generously curved (16px radius). Consistent across all cards.
- **Background:** Opaque white (#ffffff) in light mode, Slate Wash 900 (#161918) in dark mode. No transparency, no glass.
- **Border:** 1px solid Slate Wash 200 (light) / Slate Wash 800 (dark). The border is the primary depth cue.
- **Shadow:** Ambient only (see Elevation). The card class is the single source of truth for surface treatment.
- **Internal Padding:** 16px standard, 20px for prose-heavy sections (expanded history panels, text areas), 32px for auth cards.

### Inputs / Fields

- **Style:** Slate Wash 50 background, Slate Wash 200 border, 12px radius. The slightly tinted background distinguishes inputs from the page surface without a heavy border.
- **Primitive:** The `.field` class owns the shared chrome (full width, 12px radius, hairline border, 14px text, muted placeholder, focus ring). Background, padding, text color, and border color stay as utilities, so one class serves both the tinted auth inputs and the white history search bar. Replaces the former `.input-glow`.
- **Components:** `TextField` (label + `.field` input + optional inline error: `aria-invalid`, `aria-describedby`, red border, message) and `PasswordField` (adds a self-managing show/hide toggle) wrap the primitive for the auth forms; both live in `components/ui/`. The history search uses the bare `.field` class directly.
- **Focus:** Border shifts to Editor's Green, with a 3px functional ring (`rgb(var(--accent-rgb) / 0.18)`, an alpha of the accent). A ring, not a glow: structural feedback, not decoration.
- **Panel focus-within:** Textarea panels use a subtler ring (`0.14` opacity) on `:focus-within`, providing container-level feedback without competing with the field focus.
- **Error:** Border shifts to red-300 (light) / red-700 (dark). Paired with a red error message below the field.

### Chips / Filters

- **Active:** Pale emerald background (`emerald-100` / `emerald-950/40` dark), Editor's Green Fill text. The same accent treatment as active nav links — consistent "selected" affordance.
- **Inactive:** Transparent background, Slate Wash 500 text, hover adds a subtle neutral background.
- **Shape:** 8px radius, 6px 12px padding. Smaller corners than cards — chips are denser elements.

### Navigation

- **Structure:** Sticky top bar, 56px height (h-14), max-width 7xl centered. White / Slate Wash 900 background with a 1px bottom border.
- **Active link:** Editor's Green text + pale emerald background tint. The same visual treatment as active chips — one "selected" pattern across the entire app.
- **Inactive link:** Slate Wash 600 text, hover shifts to stronger text + subtle neutral background.
- **Mobile:** Hamburger toggle reveals a dropdown panel with `menuDown` animation (translateY from -6px). Links use 44px minimum touch targets.
- **Separator:** 1px vertical divider between nav links and utility actions (theme toggle, logout).

### Mode Selector

- **Trigger:** Styled as a form control, not a button — Slate Wash 50 background, 200 border, 12px radius. Hover shifts border to emerald. Includes a chevron rotation on open.
- **Dropdown:** Opens upward from the trigger (`bottom-full`). White / Slate Wash 900 background, 16px radius, visible shadow. Each option shows an icon + label + description.
- **Keyboard:** Full arrow-key navigation, Home/End, Escape to close and restore focus to trigger. ARIA `listbox` / `option` roles with `aria-selected`.
- **Animation:** `menuIn` — opacity + translateY(4px) + scale(0.98) to 1. 150ms, quint easing. Brisk and functional.

### Progress Bar

- **Track:** 8px height, Slate Wash 100 background, full-round radius.
- **Fill:** Editor's Green (#10b981), animated width via `ease-out-quint` over 400ms. The width IS the state — nothing else moves.
- **Dark mode fill:** Editor's Green Light (#34d399) for visibility against the dark track.
- **Status text:** "Rewriting paragraph X of Y…" with `aria-live="polite"`. Percentage in Editor's Green, `tabular-nums`, bold.

## 6. Do's and Don'ts

### Do:

- **Do** use Editor's Green as the sole chromatic accent. Rarity is identity.
- **Do** use opaque cards with real borders for all surface separation. The border does the work.
- **Do** use `tabular-nums` on all numeric displays (word counts, char counts, progress percentages) to prevent horizontal jitter.
- **Do** apply `text-wrap: balance` to all headings for even line breaks.
- **Do** keep uppercase labels at `font-semibold` (600) and `tracking-wide` (0.025em) everywhere — never `font-bold` at this size.
- **Do** animate state changes (menu open, paragraph arrive, copy confirmed) and nothing else.
- **Do** respect `prefers-reduced-motion` with a thorough global override.
- **Do** provide 44px minimum touch targets on coarse-pointer devices via the `tap-target` utility.
- **Do** use `safe-area-inset-*` padding for notched/rounded devices.

### Don't:

- **Don't** use gradient backgrounds, gradient text, or multi-color fills. "Generic gradient-soup AI SaaS" is the primary anti-reference — avoid it by name.
- **Don't** use glassmorphism, backdrop-blur, frosted glass, or any transparency effect on surfaces. Cards are opaque. Always.
- **Don't** use more than one font family. DM Sans carries everything.
- **Don't** add a second accent color. No secondary hue, no category colors, no color-coding by mode. Editor's Green is the only voice.
- **Don't** use ambient motion (float, drift, shimmer, pulse, particle effects). Animation is earned by state change.
- **Don't** use `border-left` wider than 1px as a colored stripe or accent marker.
- **Don't** use emoji as UI elements or decorative icons. The product serves academic users; emoji undermines trust.
- **Don't** add "AI" badges, "Powered by AI" labels, or sparkle icons on the main interface. The user knows it's AI-powered. Saying it again signals "template."
- **Don't** use Syne, Inter, or any saturated "AI product" typeface. If DM Sans is ever replaced, the replacement must be chosen deliberately, not reflexively.
- **Don't** use hero-metric templates, numbered section markers, or card grids as landing page patterns. This is a product, not a marketing page.
- **Don't** nest cards inside cards. One level of containment maximum.
