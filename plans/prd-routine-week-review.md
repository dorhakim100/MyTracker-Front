## Problem Statement

When editing a routine from week 2 on, each set stacks last week's expected number above an "Actual" label and the editable pickers. Last week's actual is never shown, so the label sits on the row being edited. The set number and done checkbox float over those values. The exercise card also gives no sense of how hard the selected week is for that exercise.

## Solution

When a previous week exists, each set shows last week as a read-only MUI table: Expected and Actual rows, Reps / Weight / RPE-or-RIR columns. The existing pickers stay underneath, labeled Next week. The set number and done checkbox sit together on the start side. On routine edit, each exercise card shows a small hardness gauge beside the exercise info. The needle is the average planned intensity of every set on the selected week. Session logging, week 1, and save behavior stay as they are.

## User Stories

**Must-have**

1. As a trainer editing week 2 or later, I want last week as a table of expected vs actual, so that I can compare the plan to what was done before I write next week.
2. As a trainer, I want those table cells to stay fixed while I edit next week, so that last week does not move with the pickers.
3. As a trainer, I want a missing last-week set to show N/A in that cell, so that a new set is obvious.
4. As a trainer, I want the editable pickers labeled Next week, so that I know which row I am changing.
5. As a trainer, I want the set number and done checkbox grouped on the start side, so that they no longer sit on top of the values.
6. As a trainer, I want add set, delete set, mark done, swipe, and the pickers to keep working, so that this is a layout change.
7. As a lifter in a live session, I want the editor to stay a single row of pickers, so that logging does not gain a previous-week table.
8. As a trainer on week 1 or a new workout, I want no previous-week table, so that an empty comparison is not shown.
9. As a trainer on the dashboard, I want the same table, headers, and delete control, so that the wide layout does not break.
10. As a trainer, I want a small hardness gauge beside the exercise name and muscles, so that I see that exercise's intensity without losing the text width.
11. As a trainer, I want the needle to be the average planned intensity of all sets on the selected week, so that it matches the week I am editing.
12. As a trainer, I want RPE used as-is and RIR converted (0→9.4, 1→8.25, 2→7.75, 3→7, 4→6.5, 5→5.5), so that both effort styles share one scale.
13. As a trainer, I want sets with no effort value, and RIR above 5, left out of the average, so that a missing or out-of-range value does not fake a score.
14. As a trainer, I want the needle to follow picker edits on the selected week, so that changing next week updates the gauge.
15. As a lifter opening session stats, I want the big and small gauges to look and behave as they do today, so that moving the gauge does not change the recap.
16. As a Hebrew or English user, I want Expected, Actual, and Next week in both languages, so that the table matches the app.

**Nice-to-have**

17. As a lifter in a live session, I want no gauge on the exercise card, so that logging stays focused on the sets.
18. As a user with reduced motion, I want the needle to skip the elastic overshoot, so that the small gauge stays calm.

## Implementation Decisions

- Presentation only inside the existing exercise editor and exercise card. No new service, store, or API.
- Previous-week table uses MUI Table (the same primitives the sets table already uses). Rows: Expected, Actual. Columns: Reps, Weight, RPE or RIR. Values come only from the previous week's instructions.
- Next week is the current picker row. Picker writes, debounce, add/remove set, and mark-done stay unchanged. Session mode (no previous week) stays a single picker row.
- Set number and done checkbox are a start-side rail when the table is shown. Dashboard headers and the dashboard delete control stay.
- Hardness gauge moves to a shared component with the same `size`, `actualRpe`, and `accuracy` props. Session stats updates its import only. The card uses `size="small"` and passes no accuracy (the small size already hides the center number).
- Intensity is a small pure average over the selected week's sets: RPE `expected`, or RIR `expected` converted with the recap midpoints. Skip sets with neither, and skip RIR above 5. If nothing remains, pass a null needle.
- Gauge appears on routine edit only, beside the exercise info, narrow enough that the name and muscles keep most of the row. Phone and dashboard both.
- Copy lives next to the editor (Expected, Actual, Next week) in English and Hebrew. Colors stay on existing tokens. Dark mode stays `html.dark-mode`.

## Testing Decisions

No automated tests unless explicitly requested. Check by hand: week 2+ routine edit (phone and dashboard), week 1, live session, and session stats big and small gauges.

## Out of Scope

- Changing how sets are saved, debounced, or marked done.
- Showing last week's table during a live session.
- Showing the gauge on the live session card.
- Accuracy percent on the exercise card.
- Recalculating session-stats recap numbers on the client.

## Further Notes

Libraries: MUI Table already in the app. `react-gauge-component` stays inside the existing gauge. No new dependency and no second UI kit.
