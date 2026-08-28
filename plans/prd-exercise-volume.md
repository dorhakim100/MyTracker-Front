## Problem Statement

On exercise details, “top weight” and “top reps” are taken independently. A session with 100 kg × 5 and 80 kg × 10 shows 100 kg and 10 reps — a set that never happened. The progress chart has the same flaw: it always picks the heaviest set, even when viewing by reps. There is also no way to see session volume (total work) over time.

## Solution

Each day is represented by one **paired** set: the best set for the selected View by, never mixed numbers from two sets. View by gains **Volume**, which plots session total `Σ(weight × reps)` as `1300 kg`. The past-sessions table keeps the same two columns and uses the same pick rule (Volume behaves like Weight). Scrubbing the chart shows the main value plus the other metric, except volume which shows only the total.

## User Stories

**Must-have**

1. As a lifter, I want top weight and top reps on a session to come from the **same set**, so that I am not shown a combination I never lifted.
2. As a lifter viewing by weight, I want the heaviest set of that day (highest reps if weight ties), so that the table and chart match the set I care about for load.
3. As a lifter viewing by reps, I want the highest-rep set of that day (highest weight if reps tie), so that the table and chart match the set I care about for reps.
4. As a lifter, I want View by to include **Volume**, so that I can see total work across sessions.
5. As a lifter viewing by volume, I want the chart point to be session total `Σ(weight × reps)`, so that more sets or more load both move the line.
6. As a lifter viewing by volume, I want the readout to show only that total with a kg suffix (e.g. `1300 kg`), so that volume is a pure calculation.
7. As a lifter viewing by weight, I want the chart readout to show `100 kg · 5 reps`, so that I see the paired set while I scrub.
8. As a lifter viewing by reps, I want the chart readout to show `10 reps · 80 kg`, so that I see the paired set while I scrub.
9. As a lifter, I want the table’s Date / Top weight / Top reps column order to stay fixed, so that switching View by does not reshuffle the layout.
10. As a lifter viewing by volume, I want the table to still use weight-as-main for which set is highlighted, so that volume does not invent a third pair of table numbers.
11. As a lifter, I want changing View by to update **both** the chart and the table, so that the screen tells one story.
12. As a lifter, I want the default View by to stay Weight, so that the screen behaves as it does today until I switch.
13. As a Hebrew-locale user, I want Weight / Reps / Volume labels translated, so that View by is readable in both languages.
14. As a lifter, I want expanded table rows (every set that day) to stay unchanged, so that I can still inspect the full session.
15. As a developer, I want a single best-set helper used by chart and table, so that pairing rules cannot drift.

**Nice-to-have**

16. As a lifter, I want an empty day or missing actuals to skip that point rather than show `0`, so that gaps stay honest.
17. As a lifter, I want the chart to keep today’s range controls and interpolation, so that volume/weight/reps all share the same time window.
18. As a lifter, I want no second visible chart line for the secondary metric, so that the graph stays one series.

## Implementation Decisions

- Add a small **best-set picker**: given a day’s sets and a main metric (`weight` | `reps`), return the single set with the highest main actual; on a tie, highest secondary actual. Volume maps to `weight` for this picker (table + volume’s “top weight” if ever needed).
- Add a **session volume** helper: sum of `weight.actual × reps.actual` for that day’s sets. Chart-only.
- **SetsTable** takes `mainValue`: `'weight' | 'reps' | 'volume'`. Collapsed row cells use the picker (`volume` → `weight`). Headers and column order stay Date / Top weight / Top reps. Expand/notes behavior unchanged.
- **Exercise details** owns View by with stable keys (`weight` | `reps` | `volume`), not translated strings. Default `weight`. Pass `mainValue={viewBy}` into the table. Chart series: one point per day from the picker (weight/reps) or session volume (volume).
- Chart readout uses the existing LineChart `formatReadout` (no LineChart API change). Weight/reps: main · secondary with units. Volume: `{total} kg` only. Remove the dummy transparent second dataset.
- Copy: add a Volume string next to existing exercise View-by labels (both locales). Do not add a new UI kit or package. Reuse CustomSelect and LineChart.
- No schema, API, or Redux changes. No persistence of View by.
- No automated tests unless explicitly requested.

## Testing Decisions

No automated tests unless explicitly requested. Manual check: a day with `100×5` and `80×10` shows `100 / 5` on Weight (and Volume table), `80 / 10` on Reps; volume chart point is `1300 kg`; readout pairing and Hebrew labels; expanded rows still list every set; weight chart elsewhere unchanged.

## Out of Scope

- Weight chart, dashboard charts, or other LineChart consumers
- Showing volume as a table column
- Estimated 1RM or other composite rankings
- Persisting View by
- Drawing a second chart line for the secondary metric
- Backend/API changes
- Automated tests and Storybook

## Further Notes

The wow moment is opening a mixed session and seeing honest pairing, then flipping to Volume and watching total work — not a fake 100 kg × 10.

**Libraries:** MUI CustomSelect + existing LineChart. No new package. No extra CustomMui wrapper (one-off View by on this screen).
