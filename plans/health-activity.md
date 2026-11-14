# Plan: Health activity

> Source PRD: `plans/prd-health-activity.md`

## Flow

For the developer. Read this section. Everything below is for the agent.

The steps and calories banners open one full slide. The user moves through week, month, 3 months, and year, sees the average or a selected bar, the streak for that page, and a list of the same values. Each health source keeps its own days, and the selected source wins.

1. Current week — either banner opens this week, with the ring, the chart, the day cards, and the statistics loading.
2. History, merge, and week paging — turning a source on saves its full history, week paging and the page streak work, and every page response includes `liveStreak`.
3. Month, 3 months, and year — those frames, their bars, their cards, and their paging.

- `liveStreak` is on every page response and is never shown.
- The selected source wins when it is above zero. A zero or a gap uses another source. A day is zero only when every source has nothing.
- The dashboard keeps reading today the way it does now.
- The value ring is the app’s existing circular progress. MUI’s circular progress is only the chart spinner.

---

## Architectural decisions

- **Routes**: no new app route. One full slide dialog. The steps banner and the calories banner are the only entries. Distance and floors do not open it. The person is the logged-in user whose health is connected on this device, never a trainee.
- **Repos**: the page is computed in MyTracker-Back. The slide, the chart, and the phone read live in MyTracker-Front. Both change. The existing Google today snapshot, its cron, and the health socket stay. The banners keep using them.
- **HTTP** (auth cookie, same as the other health reads). `userId` is the logged-in user.
  - `GET /api/health/activity?userId=&metric=steps|calories&frame=week|month|quarter|year&end=`
  - `POST /api/health/activity/days` saves phone days.
  - `POST /api/health/activity/backfill` starts a Google history pull and returns immediately.
  - `end` is an Israel date (`YYYY-MM-DD`) for week, month, and quarter. For year it is a four-digit year. Omit it for the page that contains today.
- **Time**: every stored date and every page bound uses `Asia/Jerusalem`, through the existing Israel date key. Do not add a date library. Do not use the server’s local zone for these bounds. A day starts at Israel midnight. Future days are never included.
- **Activity day** (stored): one document per user, Israel date, and vendor.
  - `{ userId, date, vendor, steps, calories }`
  - `vendor` is `google` or `native`. A later source is a new vendor id, not a new collection.
  - Unique on `userId + date + vendor`.
  - `steps` and `calories` are integers. `calories` is the burned number that vendor already shows on the banner: Google total calories, phone active calories. Do not switch the phone to total calories.
  - A successful read stores a zero. Do not store days before that vendor’s oldest returned sample. Inside the read range, a missing day is stored as zero.
  - Distance and floors are not stored.
- **Merge** (read time, not stored): for one date, take every vendor row.
  - The selected vendor wins when its value is above zero.
  - Otherwise any other vendor above zero wins. If more than one is above zero, use the greatest.
  - Otherwise the merged value is zero. A date with no rows is also zero when that date is inside the page.
  - The selected vendor is `google` when the user prefers Google, and `native` otherwise. The same prefs the banner already uses.
- **Goals**:
  - Steps: `details.dailyStepsGoal`, or the existing default of 10000.
  - Calories: the current `dailyCalories`, plus 500 when the aim is `lose`, minus 500 when the aim is `gain`, otherwise unchanged. If there is no calorie goal, the goal is 0, nothing counts as a hit, and the ring percent is 0.
  - A day hits when its merged value is greater than or equal to that goal.
- **Streak**: one function, two anchors. Both are on every page response. The slide renders `streak` and does not render `liveStreak`.
  - `streak` is anchored on the last day of the page. `liveStreak` is anchored on today. Neither is clipped to the bars.
  - If the anchor is today and today missed, today does not count and does not break the run. Count backward from yesterday.
  - Any other miss ends the run. The anchor day itself, when it is not an unmet today, must be a hit or the streak is 0.
  - Walk backward through merged days until a miss. The number can be longer than the page.
- **Page window**, oldest bar first. `end` is never after today.
  - `week`: the 7 days ending on `end`.
  - `month`: the 30 days ending on `end`.
  - `quarter`: 13 Sunday–Saturday weeks. The last week runs from the Sunday of `end` through `end`, so it has 1 to 7 days. The 12 weeks before it are full. Paging moves by 13 of those weeks.
  - `year`: January through December of that year. Months that have not started are omitted. The current month runs through today.
  - Previous is disabled when the previous window contains no stored vendor rows. Next is disabled when the window already contains today. Back-to-today is disabled when the window already contains today.
- **Page payload** (computed):
  - `{ metric, frame, end, goal, axisHeight, average, goalDays, total, streak, liveStreak, canGoPrevious, canGoNext, canGoCurrent, bars[], cards[] }`
  - `axisHeight` is the larger of `goal` and the tallest bar. When both are 0, it is 1.
  - `average` is the sum of merged daily values divided by the elapsed days in the window, rounded to an integer. `total` is that sum. `goalDays` counts hits. Grouped bars do not change the divisor: a quarter still divides by its days, not by 13.
  - `bars[]`: `{ start, end, value, goalHit }`. `value` is the daily average of that bar’s own days, rounded to an integer. `goalHit` is true only for a one-day bar that hit.
  - `cards[]` uses the same fields. Week cards are the seven days. Month cards group the 30 days forward by 7, so the last card is the remaining 2 days. Quarter cards match the 13 bars. Year cards match the months. A grouped card’s `goalHit` is false.
  - The server sends dates and numbers. The client formats every label.
- **Services / store**: no new Redux module. The slide holds the metric, the frame, the end, the payload, the loading flag, and the selected bar. Activity HTTP sits next to the existing health service. Vendors are two jobs behind one client interface: save all available days, and refresh today and yesterday. Google’s save runs on the server. The phone’s save is read on the device and posted. A later vendor implements those two jobs only.
- **UI**:
  - Reuse the full slide dialog, skeletons, the footprints and fire glyphs, and the line-chart clear control. Export the slide with suspense. Colocate English and Hebrew. Dark mode through `html.dark-mode`. Picker color from the existing tokens. No new UI kit.
  - The value ring is the app’s `CircularProgress` (the Statistics week ring). Pass the percent, the number, and `isLoading`. Do not use MUI’s `CircularProgress` for that ring. MUI’s `CircularProgress` is only the centered spinner in the chart area, the same one the muscle chart uses while its data loads.
  - One bar chart wraps Recharts. The page does not import Recharts. Props are the bars, the goal, the axis height, the selected index, and an optional goal icon. The domain max is `axisHeight * 1.15`. A goal line sits at `goal`. The default icon is a check. The icon renders only when `goalHit` is true.
  - Focus reuses the line-chart scrub. A light haptic fires when the focused bar changes and when the frame changes, not on first paint. The X shows only while a bar is selected.
  - Week axis labels are the weekday’s first character in the user’s language. Month axis labels are day numbers, thinned to the chart width. Quarter labels are the month name on the first bar of each month. Year labels are the short month name.
  - Loading matches Statistics. The ring uses its skeleton. The summary, the streak, and the cards are skeletons. The chart area is the centered spinner. On arrival the chart mounts and the bars animate up. A background save does not return a visible page to skeletons. Changing frame or page does.
- **Libraries**: Recharts is already in the app. No second chart library. No date library.
- **Out of scope in every phase**: showing `liveStreak`, a day frame, distance and floors, a new vendor, changing the banner’s today read, raw samples, trainee activity, tests.

---

## Phase 1: Current week

**User stories**: 1, 3, 4, 9, 10

### What to build

The steps banner opens the slide on calories’ sibling metric `steps`, with the footprints glyph. The calories banner opens it on `calories`, with the fire glyph. Both are a full slide. Closing it returns to the dashboard. The other two banners stay as they are.

The client asks the active vendor to save the current Israel week, then requests `frame=week` with `end` omitted. Google’s week save is a server read of those 7 days into activity days. The phone read uses the existing aggregated day query for steps and calories over those 7 days, fills a missing day with zero, and posts `{ vendor: 'native', days }`. One vendor is enough for this slice. The merge rules still run.

The slide shows only the week frame. The app’s `CircularProgress` shows `average` against `goal` (the arc caps at 100, the number is the raw average). It is not MUI’s spinner. Under it, the goal-day count and the total. The chart shows the seven bars, the goal line, the buffered top, and the goal icon on hits. The streak card shows `streak`, including the zero state. The list shows the seven day cards, with the icon on hits. Selecting a bar, or scrubbing to one, replaces the ring number with that bar’s value and the summary with that day’s label. The X clears it.

While the request is in flight, show the statistics loading. `liveStreak` is present on the payload and unused. Other frames are not offered yet. Week paging controls can render disabled.

### Acceptance criteria

- [ ] Both banners open the matching metric, and distance and floors do not.
- [ ] The current week renders from stored days, with zeros for missing days inside that week.
- [ ] The ring, the summary, selection, the goal icon, the goal line, and the 15% headroom match the page payload.
- [ ] Loading uses the ring skeleton, card skeletons, and the chart spinner, then the bars animate in.
- [ ] The payload includes `streak` and `liveStreak`. Only `streak` is visible.
- [ ] English and Hebrew, both color modes, and the picker color all follow the app.

---

## Phase 2: History, merge, and week paging

**User stories**: 2, 6, 7, 8

### What to build

Turning a vendor on starts a full history save in the background and returns control immediately. This runs every time, not once: Google connected or switched on, phone permission granted, or phone health switched on. Re-enabling after a gap runs the full pull again.

Google walks backward in the chunks that API allows: 90 days for steps, 14 days for total calories, following the rollup page token. Ranges are Israel civil dates. Stop when a whole chunk comes back empty. Upsert every date from the oldest returned sample through yesterday. The ongoing refresh writes only today and yesterday for the active vendor, including when the slide opens. The existing today snapshot and socket stay on their current path. That same Google today fetch also upserts today’s Google activity day so the slide does not drift, without changing the banner.

The phone reads aggregated steps and calories from the oldest data the platform will give through yesterday, fills gaps inside that span with zero, and posts them. Add `READ_HEALTH_DATA_HISTORY` and request it with the other health permissions so Android can see past the default 30 days before the first grant. The plugin’s current authorization does not include that permission. Today and yesterday still refresh from the phone when it is the active vendor.

Week paging uses `end`. Previous, next, and back-to-today follow the disabled flags. The streak walks outside the seven bars. `liveStreak` uses today as its anchor and stays hidden. A selected vendor above zero wins. Its zero or its gap uses the other vendor when that value is above zero.

A save that finishes while the week is already on screen refreshes the payload without skeletons.

### Acceptance criteria

- [ ] Enabling either vendor saves its full history in the background, including after it was off.
- [ ] Today and yesterday refresh from the active vendor. Older stored days stay put.
- [ ] Google above zero beats the phone. A Google zero shows the phone when the phone is above zero. Both empty counts as zero.
- [ ] Week paging cannot pass today, and it cannot move into a window with no stored rows.
- [ ] The streak card can show a run longer than 7 days. `liveStreak` is on the payload and not in the UI.
- [ ] An unmet today does not break either streak.

---

## Phase 3: Month, 3 months, and year

**User stories**: 2, 5

### What to build

The filter offers week, month, 3 months, and year. Changing it requests that frame, vibrates, clears the selection, and shows the loading state. Paging uses the same flags and the same end cursor. Back-to-today returns to the omitted `end`.

Month bars are the 30 days, slim, with day numbers thinned to the width. Its cards are four 7-day averages and one 2-day average, grouped forward from the first day. Quarter bars are the 13 weeks, medium, with a month name where the month changes. The last week is short when `end` is not Saturday. Its cards match those bars. Year bars and cards are the started months, each the daily average of that month’s elapsed days, with the short month name under the bar.

The ring, the summary, the goal line, the icon rule, the streak, and `liveStreak` stay as they are. Grouped bars and grouped cards never show the goal icon. Selecting one shows that bar’s daily average.

### Acceptance criteria

- [ ] Month, quarter, and year page, and each stops at today and before a window with no stored rows.
- [ ] Month cards are four weeks plus a 2-day remainder. Quarter has 13 week bars, the last one short when the end is mid-week. Year omits months that have not started.
- [ ] A grouped value is the average of its own elapsed days. The page average still divides by days.
- [ ] The goal icon appears on day bars and day cards only.
- [ ] Changing frame shows loading, then the bars animate in. `liveStreak` remains unused.
