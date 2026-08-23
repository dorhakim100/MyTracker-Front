---
name: senior-ux
description: >-
  Required before implementing any code in this repo. Apply senior UX/UI
  judgment when creating or styling components, pages, and MUI wrappers.
  Produces clear, intentional enterprise UI that avoids generic AI slop and
  works in both light and dark mode. Use when building UI, styling, CustomMui,
  layouts, forms, empty/loading states, theming, or reviewing visual design.
---

# Senior UX / UI

Think like a senior product designer embedded on a frontend team — not a Dribbble generator.

## Mindset

- Clarity over decoration. Judges and users should understand the screen in under 3 seconds.
- One primary action per view. Secondary actions quieter.
- Hierarchy: brand/product context → page purpose → content → actions.
- Consistency with existing CustomMui + SCSS tokens beats one-off cleverness.
- Enterprise / PlainID context: trust, density control, readable data, accessible controls.
- Dark mode is first-class: every screen/cmp must look intentional in both light and `html.dark-mode` (prefs → ThemeModeSync → MUI).

## Anti-slop (never default to these)

- Purple-on-white / purple-to-indigo gradients
- Inter / Roboto / Arial / generic system-only stacks as the "design"
- Glow effects, glassmorphism piles, rounded-full pill clusters
- Card spam (border + shadow + radius on everything)
- Floating badges, promo chips, and decorative icon rows with no job
- Identical "AI dashboard" layouts (stat strip + 3 cards + sidebar)

## Do instead

- Commit to **one** visual direction and execute it with restraint
- Use MUI + CustomMui as the system; customize via theme + SCSS, not random one-offs
- Dark mode via CSS vars + `html.dark-mode &` in SCSS; never invent a parallel theme path
- Typography: purposeful hierarchy (size/weight/color), not font novelty for its own sake
- Spacing rhythm from a small scale (4/8); align columns; avoid accidental gaps
- States that feel designed: loading, empty, error, success, disabled, focus
- Motion: follow `.cursor/skills/animation-guidance/SKILL.md` — subtle but noticeable; clarifies feedback, not decoration
- Forms: labels, validation placement, keyboard flow, destructive actions confirmed

## Component checklist (before shipping UI)

- [ ] Primary action obvious?
- [ ] Can this reuse CustomMui / existing cmp?
- [ ] SCSS in component `styles/` + imported in `main.scss`?
- [ ] Dark mode: uses CSS vars / `html.dark-mode &` — verified in both modes?
- [ ] Empty + loading + error considered?
- [ ] Looks intentional next to existing screens (not a different product)?

## Figma

When Figma MCP is available: implement the design system and spacing from the file. Do not "reinterpret" into AI aesthetics. If no Figma, match existing app screens first; invent only within that language.
