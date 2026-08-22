# Plan: Line Chart Interaction UX

> Source PRD: inlined below (GitHub issue could not be created — `gh` is not authenticated on this machine)

## Architectural decisions

- **Consumers**: WeightChart and ExerciseDetails only. Existing props stay backward compatible (`onLineClick`, `baseline`, `secondData`, `interpolateGaps`, `isDisplayPoints`).
- **New optional props**: controlled `selectedIndex`, `showReadout`, `formatReadout`, dismiss via readout X.
- **Scrub value** always comes from the main series. Baseline tap may still report `isBaseline`. Moving average must not steal the value.
- **Dots**: show when there are at most 31 x-slots and the value is non-null. Longer ranges: line + active point only. No downsampling.
- **Default selection**: last real (non-null) main-series index on load and when data or range changes. WeightChart has no X and always stays on a point. Built-in readout X clears selection.
- **Haptics**: existing light impact, only when the selected index changes.
- **Modules**: a scrub hook (gesture / index / haptic / density), a presentational readout, and the Chart.js LineChart shell.

---

## Problem Statement

Focusing a point on the shared line chart is unreliable. The floating tooltip closes on finger-up, skips interpolated days, and fights WeightChart’s header. Taps often do nothing on native because a touch is treated as a drag. Scrubbing loses to page scroll. Haptics fire on a time throttle instead of on point changes. The chart reads as a decorative line rather than a way to observe each day’s value, and drawing a dot on every day of 3M–ALL would smear.

## Solution

Replace the Chart.js hover tooltip with a sticky Apple Health-style scrubber: a vertical guide, an enlarged active point, and a value that stays put after you lift your finger. Horizontal scrubbing locks page scroll; a mostly-vertical swipe still scrolls. Light haptic ticks only when the selected day changes. Show dots on ranges with at most 31 days; on longer ranges keep daily resolution but draw only the line plus the focused point. WeightChart keeps its existing header. ExerciseDetails gets an optional built-in readout with an X to dismiss.

## User Stories

1. As a user, I want the focused point’s value to stay visible after I lift my finger, so I can actually read it.
2. As a user, I want to dismiss the built-in readout with an X, so I can return to an unfocused chart.
3. As a WeightChart user, I want my existing kg/date header to keep working, so the upgrade does not take away my current readout.
4. As a user, I want a vertical guide on the selected day, so I know which point I am looking at.
5. As a user, I want the selected point to be visually larger, so I can see it on the line.
6. As a user on a ~1-month range, I want dots on logged days, so I can see where data exists.
7. As a user on 3M / 6M / 1Y / ALL, I want a line without overlapping dots, so the chart stays readable.
8. As a user on dense ranges, I still want to scrub day-by-day, so I can inspect any day including estimated or empty days.
9. As a WeightChart user, I want to still land on interpolated days and see estimated weight, so gap behavior does not change.
10. As a user, I want tapping a point to select it, not only dragging, so focus is consistent.
11. As a user, I want dragging horizontally across the chart to track the nearest day smoothly, so focusing while moving is consistent.
12. As a user, I want the page to stop scrolling once I am scrubbing horizontally, so the selection does not jump.
13. As a user, I want a vertical swipe on the chart to still scroll the page if I have not committed to a scrub, so the chart is not a scroll trap.
14. As a native user, I want a light haptic each time the selected day changes, so I can feel the ticks.
15. As a native user, I do not want haptics while my finger stays on the same day, so feedback is not noisy.
16. As a user, I want selection to reset to the latest real point when I change range, so header and crosshair stay aligned.
17. As a WeightChart user, I want the crosshair to match the header’s selected day on load, so they are not out of sync.
18. As an ExerciseDetails user, I want a built-in value and date readout when I focus a point, so I can observe the data without a tooltip.
19. As a user, I do not want a floating Chart.js tooltip, so labels do not appear and disappear inconsistently.
20. As a user, I want interpolated or gap days to not show a rest-state dot, so dots mean logged data when dots are shown.
21. As a developer consuming the chart, I want existing props to keep working, so other screens do not break.
22. As a WeightChart user, I want baseline and moving average unchanged, so this is an interaction upgrade not a visual redesign.
23. As a mouse user, I want to click to select and see the same sticky selection as touch.
24. As a user, I want the guideline to appear on click as well as drag.
25. As an ExerciseDetails user, dismissing the readout should clear the crosshair.
26. As a WeightChart user, I never see an X on the header, so always-selected behavior remains.
27. As a user, I want hit-testing to use x-position, so I do not have to hit a tiny dot.
28. As a user with no data, I want the chart not to crash or show a stuck readout.
29. As a user, I want the moving-average and baseline lines not to steal the selected value from the main series, except when I explicitly tap the baseline.
30. As a dashboard (mouse) user, hover should not fight the sticky selection.

## Implementation Decisions

- Disable the Chart.js tooltip and chart.js hover events; the component owns pointer interaction.
- Extract a scrub hook for pointer-to-index, horizontal vs vertical lock, and haptic-on-index-change.
- Optional built-in readout for consumers without a header; WeightChart passes no readout and stays controlled via selected index + `onLineClick`.
- Density cap of 31 x-slots owns rest-state dots, even if a consumer requested points on a dense range.
- Last real (non-null) main-series index is the default after load and data/range changes.
- No new native haptic APIs; reuse light impact.
- No automated tests this pass.

## Testing Decisions

- No new tests this pass (explicitly declined).
- A good later test would assert external behavior of the scrub helpers (index mapping, haptic-on-change, density cap, last-real-point) without a canvas.

## Out of Scope

- Goal band / per-point goal coloring
- Downsampling longer ranges
- Redesigning WeightChart header or range controls
- New Capacitor haptic APIs
- Automated tests

## Further Notes

`7D` exists on the range type but is not shown in the range controls. Unchanged.

---

## Phase 1: Reliable scrub on WeightChart

**User stories**: 4, 5, 10, 11, 12, 13, 14, 15, 19, 21, 23, 24, 27, 29

### What to build

A shared scrubber: tap and drag select a day, tooltip is gone, crosshair and enlarged active point follow, haptic only when the day changes, horizontal scrub locks scroll, vertical swipe still scrolls. WeightChart’s existing header still receives `onLineClick`.

### Acceptance criteria

- [ ] Chart.js tooltip never appears.
- [ ] Tap selects a day (crosshair + `onLineClick`).
- [ ] Drag tracks the nearest day by x; haptic fires only when the index changes.
- [ ] Horizontal scrub does not scroll the page; a vertical swipe still can.
- [ ] Baseline, moving average, interpolated estimated weight, and `onLineClick` signature still work.

---

## Phase 2: Density-aware dots

**User stories**: 6, 7, 8, 20

### What to build

Rest-state dots only when there are at most 31 x-slots, and only on non-null / non-interpolated days. Denser ranges keep daily data but draw a line plus the focused point.

### Acceptance criteria

- [ ] 1M shows dots on logged days; gap/interpolated days have no rest-state dot.
- [ ] 3M / 6M / 1Y / ALL draw a line without a field of overlapping dots.
- [ ] The focused point stays visible at every range.
- [ ] Daily resolution is unchanged (no weekly/monthly downsampling).

---

## Phase 3: Selection lifecycle + header sync

**User stories**: 1, 16, 17, 26

### What to build

Selection survives finger-up. On load and range/data change, select the last real point. WeightChart passes a controlled selected index so the header and crosshair match. No X on WeightChart.

### Acceptance criteria

- [ ] Finger-up leaves crosshair and header on the same day.
- [ ] Opening the chart / changing range puts both on the latest logged day.
- [ ] WeightChart header UI is unchanged aside from staying in sync.

---

## Phase 4: Built-in readout for ExerciseDetails

**User stories**: 2, 18, 25, 28

### What to build

Optional readout above the canvas (large value, subtitle, X). Enable it on ExerciseDetails. Dismiss clears selection. WeightChart does not render a second readout.

### Acceptance criteria

- [ ] Exercise progress chart shows value + date/label while a point is selected.
- [ ] X clears readout and crosshair.
- [ ] WeightChart does not render a second readout.
- [ ] Empty series does not crash or leave a stuck label.
