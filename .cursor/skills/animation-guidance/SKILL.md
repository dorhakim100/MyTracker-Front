---
name: animation-guidance
description: >-
  Required before implementing any code in this repo. Guide subtle, purposeful
  UI animations that improve UX without feeling excessive — visible enough to
  notice, restrained enough to stay polished. Use when adding motion,
  transitions, enter/exit effects, hover feedback, loaders, theme changes, or
  reviewing animated UI.
---

# Animation Guidance

## Rule

Subtle animations are welcomed, as long as they're not too much, but still visible enough to make the user have better UX.

## Goal

Motion should **clarify** what changed (feedback, continuity, hierarchy) — not decorate. The user should feel the interface respond without waiting on it or getting distracted.

## Sweet spot

| Too little | Just right | Too much |
| ---------- | ---------- | -------- |
| Instant hard cuts that feel broken | Short ease; clear cause → effect | Long, bouncy, looping, or everywhere |
| No feedback on click / open / save | One motion per interaction | Staggered cascades on every list item |
| Theme snap that feels like a bug | Theme cross-fade / var ease (existing ThemeModeSync) | Parallax, glow pulses, endless micro-animations |

**Target duration:** usually **150–350ms** for UI chrome; up to **~400ms** for larger surfaces (panels, theme). Avoid >500ms unless storytelling is the point.

**Easing:** prefer `ease` / `ease-out` for enters; avoid elastic/bounce unless the product voice clearly calls for it.

## Prefer

- CSS transitions / keyframes in component SCSS (repo default)
- Feedback on: open/close, expand/collapse, success/error appear, button press, route/panel enter
- Opacity + small transform (`translateY` 4–8px, `scale` 0.98→1) — not flying across the screen
- Reuse existing motion (e.g. theme View Transitions) before inventing a second system
- `prefers-reduced-motion: reduce` → shorten or disable non-essential motion

## Avoid

- Animating everything on the page at once (especially `transition` on `*`)
- Continuous loops that aren’t loaders
- Large layout thrash (animating `width`/`height`/`top`/`left` when transform/opacity work)
- Competing motions on the same interaction
- Motion that delays the primary action (user must wait to click)

## Performance

- Prefer **one** composited approach (opacity/transform, View Transitions, or CSS-var interpolation on `html`) over per-node transition lists
- Don’t reintroduce broad `html.theme-transition *` style rules — they lag

## Checklist

- [ ] Does this motion explain a state change?
- [ ] Is it noticeable without being flashy?
- [ ] Duration ≤ ~350ms for typical UI?
- [ ] Reduced-motion respected?
- [ ] Still readable / on-brand in light and dark mode?

## With other skills

- `senior-ux` — motion supports hierarchy; doesn’t become the design
- `simple-readable` — simplest CSS that achieves the effect
- `respect-manual-code` — don’t restyle developer motion unless asked
- `conventions` — keep animation styles in the component’s `styles/` SCSS
