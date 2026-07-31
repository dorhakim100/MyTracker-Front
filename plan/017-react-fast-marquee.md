# Plan: React Fast Marquee Text Component

## Goal
Add `react-fast-marquee` and create a reusable component that shows a one-line string, waits 3 seconds, then scrolls **only when text overflows**. Direction follows app language (RTL for Hebrew, LTR otherwise).

## Decisions
1. Scroll only when overflow.
2. Reusable cmp only — no wiring into screens yet.
3. Mobile-first: no hover pause. Continuous loop. Default speed.
4. API: `<MarqueeText>Some title</MarqueeText>` (`children: string`).

## Steps
1. ~~Install `react-fast-marquee`.~~
2. ~~Create `src/components/MarqueeText/MarqueeText.tsx` + `styles/MarqueeText.scss`.~~
3. ~~Import SCSS in `main.scss`.~~
4. ~~Measure overflow via ResizeObserver; Marquee only when overflowing; `delay={3}`.~~
5. ~~Direction from `prefs.lang === 'he'` (`right` / `left`), wrap track in `dir="ltr"` to avoid library RTL bug.~~

## Usage
```tsx
<MarqueeText>Some long title that may overflow</MarqueeText>
```
