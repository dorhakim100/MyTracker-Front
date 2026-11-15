## Problem Statement

The calorie card shows today only. There is no way to see calories eaten on earlier days, whether those days landed in an acceptable range, or which goal was active at the time. Goals already have a start, an end, a daily calorie target, and a target of lose, maintain, or gain. The activity slide already shows that kind of history for steps and burned calories. Eaten calories are not part of it.

## Solution

Tapping the dashboard calorie card opens the same full activity slide, fed by a new intake page. Week, month, 3 months, and year, paging, the ring, the streak, and the cards stay as they are. Each bar carries the acceptable range for the goal active on its days, drawn as a colored band. A Lose, Maintain, or Gain tag follows the goal the ring is showing. The edit icon on the card still opens the calorie editor.

Steps and burned calories keep the slide and the chart they have now. A bar with no range still uses the single goal line.

## User Stories

**Must-have**

1. As a user, I want to tap the dashboard calorie card and open my intake history, so that I can see what I ate over time. The edit icon still opens the calorie editor and does not open the history.
2. As a user, I want the same frames, paging, ring, live streak, streak card, list, and loading states as the activity slide, so that intake feels like the other history screens. The streak is the intake streak. The ring shows the page average of logged days, or the selected bar. Its second number is the calorie target of the selected bar, or of the last day of the page when nothing is selected.
3. As a user, I want an acceptable range on the chart, so that I can see whether a day landed on target. The range is that day’s calorie goal ± 200. A day inside the range is a hit. A one-day bar shows the existing ribbon medal when it hits, with the existing calories medal icon on it. The medal is a light gold. When the picker color is yellow, the medal uses a cream face and a darker brown-gold rim so it stays separate from the yellow bar. Grouped bars do not show the medal. A grouped bar’s range is the average of the daily goals inside it, ± 200, and its color is the target on the last day of that bar. One timeframe can show more than one range.
4. As a user, I want the burned-calories history to use the fire icon from the health banner, so that the calories medal icon belongs to eaten calories. Steps keep their medal icon. The gold medal is shared. Yellow is the only picker color with its own medal colors.
5. As a user, I want a Lose, Maintain, or Gain tag beside the ring, so that I know which goal I am looking at. The tag matches the goal the ring is using. Each target has its own color, and that color paints the tag and the band. Lose is `#0891b2` in light mode and `#86d6ea` in dark mode. Maintain is `#1d4ed8` and `#93c5fd`. Gain is `#6d28d9` and `#c4b5fd`. Tag text and the band edge use the solid color. The tag fill and the band fill mix that color into the canvas. The bars stay on the user’s accent color.
6. As a user, I want an unlogged day to stay empty, so that a missed log is not drawn as zero calories eaten. It is left out of the average and the on-target count, and it is not a hit. A finished day outside the range breaks the streak. An in-progress day never breaks the streak. Landing inside the range extends it.
7. As a user, I want a day with no goal to leave the screen intact, so that a gap does not crash the slide. That day has no band and no tag. This case should not happen, because the app asks for a goal on first use.
8. As a Hebrew or English user, in light or dark mode, I want the slide and the tags to follow the app’s language and color mode. The tag labels are the existing Lose, Maintain, and Gain labels.

**Nice-to-have**

9. As a user, I want these tags on other screens later. This version only shows them on the intake slide. The component is built so those screens can use it without a new tag.

## Implementation Decisions

### Libraries

- MUI Chip, wrapped once. The wrapper owns the target label, the light and dark colors, and the fill. No new UI kit.
- The existing Recharts bar chart draws the band. No second chart library.

### Modules

- A goal tag. It takes a target and renders that target’s label and color.
- An intake page from the backend, separate from the health-activity page. It returns a page the slide can render: frames, bars, cards, average, on-target count, total, both streaks, and paging. Each bar also carries its low, its high, and its target. The server applies the range, the goal active that day, unlogged days, and the streak rules.
- The bar chart. A bar with a range draws that bar’s colored band. A bar without a range keeps the single goal line, the medal rule, and the current layout.
- The activity slide. Intake opens it and shows the tag with the ring. Steps and burned calories pass no tag and no ranges.
- The dashboard calorie card. Tapping the card opens the slide. The edit icon still saves the calorie goal.

### Direction

- The dashboard ring still shows today’s calories against the current goal.
- The intake streak is separate from the steps streak and the burned-calorie streak.
- Shared pieces change only by accepting the optional range and target. Callers that omit them keep their current behavior.

## Testing Decisions

No automated tests.

## Out of Scope

- The Edit Menu calorie ring.
- The steps chart, burned calories, and any change to how those pages load or draw.
- Macros history.
- Placing the tags on other screens in this version.
- Replacing the dashboard ring’s today value with the history.

## Further Notes

The band is the place that shows every range in the timeframe. The ring and the tag show one goal: the selected bar, or the last day of the page. A grouped bar can cover two targets. Its color comes from the last day, and its low and high come from the average of the daily goals, ± 200.
