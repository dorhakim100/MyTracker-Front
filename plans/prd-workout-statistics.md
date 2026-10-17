## Problem Statement

The workouts page has a Statistics button and nowhere for it to go. A lifter cannot see whether this week’s plan was completed, which days were trained, or how work is spread across the muscle groups the app already uses. Personal records exist only inside a single session recap, so a record from earlier in the week is easy to miss.

## Solution

Statistics opens a full slide. The top shows the seven days of the chosen window, a ring of finished workouts against the weekly plan, and any weight or volume records in that window. Under that, a short list of deeper pages starts with Muscle distribution.

Muscle distribution is its own slide. A radar chart shows how completed sets split across the ten body-diagram groups. Choosing a group, or leaving them all selected, updates the cards underneath from data already loaded. Routines and Exercises open the existing detail pages when there is something to show.

The server accepts a timeframe id and resolves the dates. A previous period can be returned later. This version asks only for the selected period.

## User Stories

**Must-have**

1. As a lifter, I want Statistics to open a full slide, so that the week and the deeper pages have room.
2. As a lifter, I want seven day cards for this week (Sunday–Saturday, Israel time) or the last seven days (today and the six days before it), so that I can switch the window.
3. As a lifter, I want that choice remembered on this device for the person I am viewing, so that I do not reset it every visit. The first visit is This week.
4. As a lifter, I want today in my picker color, a finished workout marked, and days still ahead shown disabled, so that the strip reads as a week rather than a set of buttons.
5. As a lifter, I want a ring of finished workouts over the sum of weekly targets on my active routines, so that I can see if the plan was met. The ring stops at full, and the label can read past the target.
6. As a lifter, I want weight and volume records from that window listed under the ring, so that I can open the existing exercise details for that lift. The list is absent when there are none.
7. As a lifter, I want a card-style row for Muscle distribution, so that the list can gain more pages later without a new layout.
8. As a lifter, I want a radar of the ten body-diagram groups for This Week, 7D, 30D, Year, or All, so that I can see balance. The page opens on This Week. Changing the range loads again. Choosing a muscle does not.
9. As a lifter, I want the header to name the selected muscle, or All Muscles, so that I know what the cards describe. A close icon, or a second tap on the selected spoke, returns to All Muscles. Each change vibrates and the selection stays until the next tap.
10. As a lifter, I want Routines, Exercises, Volume, and Sets for that selection, so that the chart and the numbers agree. Routines and Exercises open a page only when the count is above zero, then the existing routine or exercise details.
11. As a lifter, I want a set to count only through its primary muscles, so that a chest press does not inflate triceps. Forearms and hip adductors stay off the chart.
12. As a trainer viewing a trainee, I want the same slides for that trainee, so that I see their week and their distribution.
13. As a Hebrew or English user, in light or dark mode, I want the slides to follow the app’s language, tokens, and picker color, so that this does not look like a separate product.

**Nice-to-have**

14. As a lifter, I want the previous period drawn on the radar and under the cards, so that I can compare. The chart and the server support it. This version leaves it off, with no switch.
15. As a lifter, I want more rows under Statistics, and more cards that open a page, so that the same list and card row can grow.

## Implementation Decisions

### Libraries

- **Already in the app:** slide dialogs, the select, the list, buttons, circular progress, the on-device store, the stats service, routine details, and exercise details.
- **New small library:** Recharts, for the radar only. MUI in this repo has no radar chart. One radar component wraps it. Pages pass groups, a selection, colors, and an optional previous series.
- No second UI kit.

### Modules

- A statistics slide: week strip, ring, record list, and the page list. Week choice is stored per viewed user. No new store module. State stays on the slide.
- A card variant of the existing list: larger rows, a small gap, and an unpadded trailing icon.
- A muscle-distribution slide: range controls, one load for every group, local selection.
- A stat-card row. A card opens a page only when it is given an action.
- Two thin slides for the routines and exercises behind a count, using data already loaded.
- One muscle map for the ten groups, their aliases, and a light and dark color each. The same map is applied on the server while reading. Exercise documents are not updated.
- A timeframe resolver on the server. A range id becomes Israel dates. A flag can include the previous window. The default is the selected period only.
- Two reads on the existing stats API: the week summary, and the muscle distribution for one timeframe, including the lists the drill-in slides need.

### Direction

- A finished workout is the session the app already treats as finished. Empty workouts stay out of the ring and off the day marks. Their records still appear in the list.
- The weekly target is the sum of `timesPerWeek` on active routines, for both week modes.
- The radar shape is each group’s share of completed sets. The busiest group reaches the outer ring. Volume is the existing sum of actual weight times actual reps.
- A set whose primary muscles fall in two groups counts on both spokes. With nothing selected, sets and volume count that set once. Routines and exercises stay distinct either way.
- Secondary muscles never receive the set.
- The chart range is not saved. It is independent of the week strip.
- Existing exercise filters stay as they are. Mismatches between those filters, the ten groups, and the strings stored on exercises are recorded, not migrated.

## Testing Decisions

No automated tests.

## Out of Scope

- Writing or migrating exercise documents.
- Changing the exercise explorer filters to the ten groups.
- A control that turns the previous period on.
- Any statistics page besides Muscle distribution.
- Saving the chart range.
- Counting empty workouts toward the ring.
- A duration card.
- The six groups in the reference screenshot.
- The other workouts-page buttons that still open the exercise explorer.

## Further Notes

The reference screenshot is the interaction model: a radar, a period control, and cards under it. The axes are this app’s ten body-diagram groups.

Year is the last 365 days, including today, matching the existing charts. All has no start date.
