# Plan: Calorie intake

> Source PRD: `plans/prd-calorie-intake.md`

## Flow

For the developer. Read this section. Everything below is for the agent.

The dashboard calorie card opens intake history in the same slide as steps and burned calories. The user starts on this week, then pages through earlier weeks, then month, 3 months, and year. Each bar shows the acceptable range for the goal that was active then. The edit icon still edits the calorie goal. Steps and burned calories stay as they are.

1. This week — the card opens the current week, with a band on each day, the goal tag, and the medal on a day inside its range.
2. Week paging and the streak — earlier weeks, the live streak, and today never breaking a run.
3. Month, 3 months, and year — those frames, with one band per grouped bar.

- The range is that day’s calorie goal ± 200. A day inside it is a hit.
- An unlogged day is an empty bar and is left out of the average.
- An in-progress day never breaks the streak.
- Lose, Maintain, and Gain are cyan, blue, and purple. Dark mode uses a lighter hex of the same color.
- A hit uses the existing ribbon medal. Intake puts the calories medal icon on it. Burned calories puts the health banner’s fire icon on it. The medal is a light gold, with a darker rim when the picker color is yellow.
- The dashboard ring still shows today’s calories against the current goal.

---

## Architectural decisions

- **Routes**: no new app route. The dashboard calorie card opens one full slide. The Edit Menu ring does not. Steps and burned calories keep their own entry and are not given a tag or a band.
- **Repos**: the page is computed in MyTracker-Back from existing food days and goals. The slide, the chart, the tag, and the card live in MyTracker-Front. Both change. No new stored collection.
- **HTTP** (auth cookie, same as the other day reads). `userId` is the logged-in user.
  - `GET /api/day/intake?userId=&frame=week|month|quarter|year&end=`
  - `end` is an Israel date (`YYYY-MM-DD`) for week, month, and quarter. For year it is a four-digit year. Omit it for the page that contains today.
  - This is not `health/activity`. That route stays steps and burned calories. Opening intake does not save or backfill a health vendor.
- **Time**: every page bound uses `Asia/Jerusalem`, through the existing Israel date key. Do not add a date library. Future days are never included.
- **Goal for a day**: a goal covers an Israel date when that date is on or after the Israel date of `startDate`, and on or before the Israel date of `endDate`. An undefined `endDate` means the goal is still open. If two goals cover one date, the later `startDate` wins. If none covers it, the selected goal still applies from its start onward, because the app keeps using that goal after its end date. If that also misses, the day has no goal.
- **Range**: `rangeLow = max(0, dailyCalories - 200)`, `rangeHigh = dailyCalories + 200`. The center sent as `goal` is `dailyCalories`. A day with no goal omits `rangeLow`, `rangeHigh`, and sends `goal: 0`, `target: null`.
- **Logged**: a food day with at least one log is logged. Its `value` is that day’s calorie total, rounded to an integer. No day document, or a day with no logs, is unlogged: `logged: false`, `value: 0`. A logged total of 0 is still logged.
- **Hit**: a logged day whose value is inside its own range, inclusive. An unlogged day is not a hit. A day with no goal is not a hit. `goalHit` is true only for a one-day bar that hit. Grouped bars and grouped cards are never a hit.
- **Streak**: one function, two anchors, separate from the steps streak and the burned-calorie streak. Both are on every page and both are shown. `streak` is anchored on the last day of the page. `liveStreak` is anchored on today. Neither is clipped to the bars.
  - A hit adds one and the walk continues.
  - A finished unlogged day, or a finished logged day outside its range, ends the run.
  - A day with no goal adds nothing and does not end the run.
  - If the anchor is today and today is not a hit, today adds nothing and does not end the run. Count backward from yesterday. This includes today over the range, today under the range, and today unlogged.
  - Any other anchor must itself be a hit, or that streak is 0.
- **Average**: sum of logged values in the window, divided by the count of logged days, rounded to an integer. Unlogged days are not in the divisor. No logged days means average 0. `total` is that sum. `goalDays` counts one-day hits in the window. Grouped bars do not change the divisor.
- **Page window**, oldest bar first. `end` is never after today. Same windows as health activity.
  - `week`: the 7 days ending on `end`.
  - `month`: the 30 days ending on `end`.
  - `quarter`: 13 Sunday–Saturday weeks. The last week runs from the Sunday of `end` through `end`. The 12 weeks before it are full.
  - `year`: January through December of that year. Months that have not started are omitted. The current month runs through today.
  - Previous is disabled when every day before this window is unlogged. Next is disabled when the window contains today. Back-to-today is disabled when the window contains today.
- **Page payload**:
  - `{ frame, start, end, goal, target, axisHeight, average, goalDays, total, streak, liveStreak, canGoPrevious, canGoNext, canGoCurrent, bars[], cards[] }`
  - `goal` and `target` are the last day of the page. They are what the ring and the tag show when no bar is selected.
  - `axisHeight` is the larger of the tallest bar, the tallest `rangeHigh`, and `goal`. When all are 0, it is 1.
  - `bars[]` and `cards[]`: `{ start, end, value, logged, goalHit, goal, target, rangeLow?, rangeHigh? }`. A grouped bar’s `value` is the average of its own logged days, rounded. No logged days means `value: 0` and `logged: false`. Its `goal` is the average of the daily calorie targets inside it, rounded, and its range is that average ± 200, low clamped at 0. Its `target` is the target of the last day in the bar. If that day has no goal, the bar has no range and `target: null`.
  - Week cards are the seven days. Month cards group the 30 days forward by 7, so the last card is the remaining 2 days. Quarter cards match the 13 bars. Year cards match the months.
  - The server sends dates and numbers. The client formats every label.
- **Services / store**: no new Redux module. The slide holds the frame, the end, the payload, the loading flag, and the selected bar. Intake HTTP sits next to the existing day service. The activity slide takes a source. `activity` keeps today’s vendor refresh and `health/activity`. `intake` calls the intake page only.
- **Chart**: the same bar chart. A bar with `rangeLow` and `rangeHigh` draws a band in that bar’s slot, under the bar, from low to high, in that bar’s target color. When any bar has a range, the single goal line is not drawn. When none do, the goal line and the domain stay as they are. The domain max stays `axisHeight * 1.15`. The medal still renders only when `goalHit` is true. An unlogged bar has no height.
- **Medal**: the existing ribbon medal, shared by steps, burned calories, and intake. Its face, ribbon, and edge are light gold: face `#f8e7b0`, ribbon `#e0b44a`, edge `#a67c2d`, in both color modes. The glyph on it stays the user’s accent color. When the picker color is yellow, the face is cream `#fff8ee`, the ribbon and edge are `#7a5420`, and the glyph uses `#7a5420`, so the badge stays separate from the yellow bar. No other picker color gets its own medal.
- **Hit icon**: intake uses the existing calories medal icon. Burned calories uses the fire icon the health banner already uses. Steps keeps its medal icon.
- **Tag**: one MUI Chip wrapper. It takes `lose`, `maintain`, or `gain`. Labels are the existing goal labels. No new copy for the three words. Text and the band edge use the solid hex. The tag fill and the band fill mix that hex into the canvas at 16% in light mode and 28% in dark mode.
  - Lose `#0891b2` / `#86d6ea`
  - Maintain `#1d4ed8` / `#93c5fd`
  - Gain `#6d28d9` / `#c4b5fd`
  - The hex lives in the existing color variables. Dark mode swaps them under `html.dark-mode`. Bars stay on the user’s accent.
- **Ring**: the app’s existing circular progress. The number is the selected bar’s value, or the page average. The second number is the selected bar’s `goal`, or the page `goal`. The arc is that value over that goal, capped at 100. No goal means no second number and no tag. Selecting a bar, or scrubbing to one, uses that bar. The clear control returns to the page goal and target.
- **Card**: the dashboard calorie card opens the slide. The edit control calls `preventDefault` and `stopPropagation`, then opens the editor it already opens. A card with no open handler does not navigate. That is the Edit Menu ring.
- **Libraries**: MUI Chip and the Recharts chart already in the app. No new package. No date library.
- **Out of scope in every phase**: the Edit Menu ring, steps, burned calories, macros history, tags on other screens, replacing the dashboard’s today ring, tests.

---

## Phase 1: This week

**User stories**: 1, 2 (current week), 3 (day bars), 4, 5, 6 (current page), 7, 8, 9 (the component only)

### What to build

The dashboard calorie card opens the intake slide. The title is the existing calories label, not the burned-calories label. Closing it returns to the dashboard. The edit icon still opens the calorie editor and does not open the slide. The Edit Menu ring has no open handler.

The client requests `frame=week` with `end` omitted. It does not touch a health vendor. The slide shows only the week frame. Paging controls render disabled.

The ring, the summary, the streak card, the seven day cards, selection, and the statistics loading match the activity slide. The summary still reads the on-target count and the total. An unlogged card shows no number and no icon. A hit card shows the goal icon.

The chart draws seven day bands. A day inside its range shows the existing ribbon medal, colored gold, with the calories medal icon on it. The goal line is absent on this chart. Steps keep their medal icon. Burned calories keep the goal line and use the health banner’s fire icon on the same gold medal. Yellow is the only picker color with a different medal treatment.

The tag sits with the ring and follows the selected day, or the last day of the week. Its color matches that day’s band. Light and dark use the hexes above. Hebrew and English use the existing goal labels.

A day with no goal renders with no band and no tag. The rest of the week still renders.

### Acceptance criteria

- [ ] The dashboard card opens this week of eaten calories. The edit icon only edits the goal. The Edit Menu ring does not open the slide.
- [ ] Each day with a goal shows its own ±200 band in that goal’s color. A one-day hit shows the medal. An unlogged day is an empty bar and is missing from the average.
- [ ] The tag and the ring’s second number follow the selected day, or the last day of the week.
- [ ] Steps and burned calories still show the single goal line and do not show a tag. Burned calories shows the fire icon. The medal is gold, and yellow uses the darker rim.
- [ ] Loading uses the ring skeleton, card skeletons, and the chart spinner, then the bars animate in.
- [ ] A missing goal does not blank the slide.
- [ ] English and Hebrew, and both color modes, follow the app.

---

## Phase 2: Week paging and the streak

**User stories**: 2 (week paging, both streaks), 6

### What to build

Week paging uses `end`. Previous, next, and back-to-today follow the disabled flags. Previous stops when every earlier day is unlogged. Next and back-to-today stop on a window that contains today.

The streak walks outside the seven bars. `streak` is the run at the last day of the page, so a past week shows the run as it stood then. `liveStreak` stays anchored on today while paging. Both are visible. The flame in the filter is `liveStreak`. The streak card is `streak`.

A finished day outside its range, including a finished day with no logs, ends the run. Today never ends it. Today adds one only when today’s intake is inside today’s range. A day with no goal is skipped.

Changing week clears the selection, shows loading, and animates the new bars. The tag and the bands follow the new page.

### Acceptance criteria

- [ ] Week paging cannot pass today, and it cannot move past the oldest logged day.
- [ ] The streak card can show a run longer than 7 days, and a past week shows the run at the end of that week.
- [ ] The live streak stays on today while paging.
- [ ] An in-progress day does not break either streak, even when today’s intake is already above the range.
- [ ] A finished unlogged day breaks the run. A logged day inside its range extends it.

---

## Phase 3: Month, 3 months, and year

**User stories**: 2 (those frames), 3 (grouped bars)

### What to build

The filter offers week, month, 3 months, and year. Changing it requests that frame, clears the selection, and shows loading. Paging uses the same flags and the same end cursor. Back-to-today returns to the omitted `end`.

Month bars are the 30 days, each with its own band. Its cards are four 7-day groups and one 2-day group. Quarter bars are the 13 weeks. Year bars are the started months. A grouped bar’s value is the average of its logged days. Its band is the average of its daily calorie targets, ± 200. Its color is the target of the last day in that bar. Grouped bars and grouped cards never show the medal.

The ring, the tag, the streak, and `liveStreak` stay on the same rules. Selecting a grouped bar shows that bar’s average, its center goal, and its tag. The chart can show more than one band color in one frame. Steps and burned calories still have no ranges.

### Acceptance criteria

- [ ] Month, quarter, and year page, and each stops at today and before a window with no logged days.
- [ ] Month cards are four weeks plus a 2-day remainder. Quarter has 13 week bars. Year omits months that have not started.
- [ ] A grouped band uses the average goal ± 200 and the last day’s target color. A one-day band is unchanged.
- [ ] The medal appears on day bars and day cards only.
- [ ] Steps and burned calories still use the single goal line.
