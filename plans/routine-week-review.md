# Plan: Routine week review

> Source PRD: [prd-routine-week-review.md](./prd-routine-week-review.md)

## Architectural decisions

- **Routes**: no new routes. Routine edit, live session, and session stats stay where they are.
- **Key models**: no schema or API changes. Previous-week cells read the prior week's instructions only. The editable row is still the selected week's sets.
- **Services / store**: no new service or Redux module. Picker writes, debounce, add/remove set, and mark-done stay on their current paths.
- **Libraries**: MUI Table for the previous-week comparison (same table primitives the sets table already uses). The existing gauge library stays inside the hardness gauge. No new package, no second UI kit.
- **Gauge**: shared component with the same size, actual RPE, and accuracy props. Session stats only changes its import. The exercise card uses the small size and passes no accuracy.
- **Intensity**: average of every set on the selected week. RPE expected as-is. RIR expected converted 0→9.4, 1→8.25, 2→7.75, 3→7, 4→6.5, 5→5.5. Skip a set with neither, and skip RIR above 5. Null needle when nothing remains.
- **Where it shows**: previous-week table only when a previous week exists (routine edit, including dashboard). Gauge only on routine edit, beside the exercise info, narrow so the text keeps most of the width. Live session stays a single picker row and has no card gauge.
- **Dark mode / i18n**: `html.dark-mode` and existing color tokens. Expected, Actual, and Next week live next to the editor in English and Hebrew.

---

## Phase 1: Previous-week table

**User stories**: 1, 2, 3, 4, 5, 6, 7, 8, 9, 16

### What to build

On routine edit from week 2 on, each set replaces the stacked expected/actual lines with a read-only table: Expected and Actual rows, Reps, Weight, and RPE or RIR columns. Those cells do not change while the user edits. A missing last-week set shows N/A. The existing pickers sit under the table, labeled Next week. The set number and done checkbox sit together on the start side. Add, delete, mark done, swipe, and picker save keep working. Week 1 and a new workout show no table. A live session stays a single picker row. Dashboard keeps its headers and delete control, with the same table when a previous week exists.

### Acceptance criteria

- [ ] Week 2+ routine edit shows last week's expected and actual in a table, and editing Next week does not change those cells
- [ ] A set that did not exist last week shows N/A
- [ ] The editable row is labeled Next week and still saves through the existing picker path
- [ ] Set number and done checkbox are grouped on the start side
- [ ] Add set, delete set, mark done, and swipe still work
- [ ] Week 1 and live session show no previous-week table; the session editor is still one picker row
- [ ] Dashboard shows the same table plus its existing headers and delete control
- [ ] Expected, Actual, and Next week exist in English and Hebrew

---

## Phase 2: Exercise intensity gauge

**User stories**: 10, 11, 12, 13, 14, 15, 17, 18

### What to build

The hardness gauge moves to a shared component. Session stats keeps the same big gauge (accuracy in the center) and the same small gauge on each exercise row. On routine edit, each exercise card shows the small gauge beside the exercise info, narrow enough that the name and muscles keep most of the width. The needle is the average planned intensity of all sets on the selected week, and it updates when those pickers change. The live session card has no gauge. Reduced motion still skips the elastic needle.

### Acceptance criteria

- [ ] Session stats big and small gauges look and behave as they do today
- [ ] Routine edit shows a small gauge beside the exercise info; the name and muscles keep most of the row, on phone and dashboard
- [ ] The needle is the average of that week's sets: RPE as-is, RIR converted with the recap midpoints
- [ ] Sets with no effort value, and RIR above 5, are left out; no usable sets leaves the needle empty
- [ ] Changing a Next week effort picker moves the needle
- [ ] The live session card has no gauge
- [ ] Reduced motion skips the elastic overshoot
