# Product

## Register

product

# Product Requirements Document: RewriteFlow

## Target Audience
Professionals, content creators, students, and non-native English writers who want their own drafts to read better. They arrive with a draft (an article, a report, an email, a set of docs) and a goal: a clearer, better-fitting version of what they wrote, in a tone they chose, without losing anything that matters. Their context is task-focused; they care that meaning is preserved and that they can verify it.

## Core Value Proposition
RewriteFlow is an AI editor that rewrites text paragraph-by-paragraph with an LLM (Llama 3.3 70B via Groq), in a built-in style (Standard, Professional, Extensive, Clarified, Expressive) or a saved workflow of edits (fix grammar → tighten → formal → translate…), with length and tone adjustments. It streams live progress and then shows what changed: a word diff, readability before and after, and a meaning check that flags any number, name, link, citation or quote the rewrite dropped or invented. Rewrites export to .txt/.md/.docx, whole folders can be processed in batch (in the browser or with the CLI), and everything is saved to a searchable history. Auth is email/password via Supabase.

Success: a user pastes text, picks a style or workflow, and quickly gets a faithful rewrite they can verify at a glance, with honest progress feedback along the way, and can find and reuse any past rewrite or workflow without friction.

## Brand Personality

Precise and trustworthy. Calm, credible, accurate. The product should feel like a careful editor that quietly does a good job, not a hype machine. Voice is clear and direct with no marketing inflation. Confidence is conveyed through restraint: legible states, predictable behavior, and an interface that gets out of the way of the user's writing. Three words: precise, trustworthy, focused.

## Anti-references

- **Generic gradient-soup AI SaaS** — the interchangeable purple/teal-gradient, glassmorphic "AI tool" template that signals machine-generated. This is the primary thing to avoid.
- **Cluttered enterprise dashboard** — dense, corporate, toolbar-heavy, intimidating. Too much chrome around a simple task.
- **Toy-like / emoji-heavy** — childish, decorated with emoji and bright primaries; undermines trust for academic use.
- **Sterile corporate gray** — lifeless, all-gray, zero personality. Clean but cold and forgettable.

## Design Principles

1. **The tool disappears into the task.** Restraint over decoration. Nothing on screen competes with the user's text. Remove anything that exists only to look impressive.
2. **The text is the hero.** The user's writing (input and output) is the most important element on every screen; UI chrome stays quiet and secondary.
3. **Earn trust through precision.** Every state (progress, errors, word counts, empty states) is honest, legible, and predictable. The interface never surprises the user about what is happening to their work.
4. **One confident accent, not a rainbow.** A single emerald identity signals active/done/success, used sparingly and meaningfully, never as decoration. Avoid multi-hue gradients and category-color confetti.
5. **Calm, stateful motion.** Animation conveys state (loading, progress, reveal) and nothing else. No ambient float, drift, or glow performed for its own sake.

## Accessibility & Inclusion

Target: **WCAG 2.1 AA.** Body text meets 4.5:1 contrast (large text 3:1); placeholder text meets 4.5:1. All interactive elements are keyboard-operable with visible focus indicators and correct roles/labels. Form inputs are programmatically associated with labels. Both light and dark themes meet contrast independently. All motion respects `prefers-reduced-motion`, which matters here because the app uses progress/loading animation by design.
