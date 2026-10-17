# Plan: Workout statistics

> Source PRD: `plans/prd-workout-statistics.md`

## Flow

For the developer. Read this section. Everything below is for the agent.

Statistics on the workouts page opens a slide for the person being viewed. The lifter sees the week, how much of the plan is done, any records, and can open muscle distribution to see balance and the routines and exercises behind it.

1. Week strip — the slide opens on a real seven-day window, and the choice sticks.
2. Week progress and records — the ring and the record list show for that window, and a record opens the exercise.
3. Muscle distribution chart — a card opens the radar, ranges reload it, and choosing a muscle does not.
4. Distribution cards and drill-ins — the four numbers follow the selection, and Routines and Exercises open the existing details when there is something to show.

- The previous period is built and left off.
- Empty workouts never fill the ring or mark a day. Their records still show, and their logged sets still count on the chart.
- A set counts only through primary muscles. Forearms and hip adductors stay off.

---

## Architectural decisions

- **Routes**: no new app routes. Statistics, muscle distribution, and the two drill-ins are nested full slide dialogs. The workouts Statistics button is the only entry. The exercises and routines buttons on that page stay as they are.
- **HTTP** (auth cookie, same as the other stats reads). The viewed user is `forUserId`, the same id the workouts page already sends (`trainee` when a trainer is looking, otherwise the logged-in user). No new authorization layer.
  - `GET /api/stats/week?forUserId=&mode=thisWeek|last7`
  - `GET /api/stats/distribution?forUserId=&timeframe=thisWeek|7d|30d|year|all&includePrevious=false`
- **Time**: the server resolves every bound in `Asia/Jerusalem`, not the server’s zone and not UTC. Use the platform timezone API. Do not add a date library. A session falls on a day when the Israel calendar date of its stored `date` is that day.
  - `thisWeek`: Sunday 00:00 through Saturday end, the week that contains today. Sunday is the first day.
  - `last7` and `7d`: today and the six previous Israel dates.
  - `30d`: today and the 29 previous dates.
  - `year`: today and the 364 previous dates (365 dates).
  - `all`: no start. End is the end of today.
  - Previous window, only when `includePrevious` is true: the block of equal length immediately before. `all` ignores the flag and returns `previous: null`.
- **Week summary** (computed, not stored): `{ mode, days[7], done, target, records[] }`. Phase 1 may return `days` only; phase 2 adds `done`, `target`, and `records` on the same read.
  - `days[]` in order, oldest or Sunday at the start: `{ date, isToday, isFuture, hasWorkout }`. The client formats the weekday letter and the day number.
  - `hasWorkout` and `done` count a session only when it is finished (`statsId` or finished instructions) and its `workoutId` is a currently active routine. Empty workouts, sessions with no workout, and inactive routines do not count. Two finished sessions on one day count as two toward `done` and one mark.
  - `target` is the sum of `timesPerWeek` on the open instruction (`isDone: false`) of each active routine. A routine with no open instruction adds nothing. The same target is used for both week modes. `target` 0 does not divide; the ring stays empty and the label still shows the raw numbers.
  - `records[]`: `{ type: 'weight' | 'volume', exerciseId, name, image?, current }`. Same rule as the session recap, scoped to the window: the all-time best done set for that exercise (heaviest weight, or highest `weight.actual × reps.actual`) has its session inside the window. Empty-workout records are included. One row per record. Newest session first, then name.
- **Distribution** (computed, not stored): one payload for every group, so a muscle tap does not refetch.
  - `{ timeframe, groups[10], total, previous }`.
  - A counted set is `isDone`. The session does not have to be finished. Empty-workout sets count.
  - Volume of a set is `weight.actual × reps.actual`, missing numbers treated as 0. The set still counts.
  - Resolve the exercise from the catalog by `exerciseId`. Use `mainMuscles` only. If the catalog exercise is missing, skip the set. Do not read `secondaryMuscles` and do not fall back to `muscleGroups`.
  - Map each primary string through the alias list below. A set is attributed to every distinct group it hits. Forearms, hip adductors, and any other unmapped primary are dropped. A set that hits no group is excluded from the spokes and from `total`.
  - `groups[]` fixed order, clockwise from the top: chest, shoulders, back, biceps, triceps, abs, quads, hamstrings, glutes, calves. Each: `{ id, sets, volume, routines[], exercises[] }`. `sets` and `volume` may double-count a set that has two primary groups.
  - `total` counts each included set once: `{ sets, volume, routines[], exercises[] }`.
  - A routine is a distinct `workoutId` that had at least one included set. An empty workout adds no routine. Include `{ id, name }` only. A later deactivated routine still appears.
  - An exercise row is `{ exerciseId, name, image?, sets, volume }` for included sets, summed once per exercise inside that group (and once inside `total`).
  - `previous`, when requested, repeats the numeric fields only (`sets`, `volume`, and the four counts). No lists. When the flag is false or the range is `all`, `previous` is null. This page always sends false.
- **Muscle map** (read time, both sides of the alias list live on the server; the client only displays ids):
  - chest: chest, pectorals, pecs, pec, pectoral, pectoralis, upper chest, lower chest
  - shoulders: shoulders, shoulder, delts, delt, deltoids, deltoid, anterior delts, front delts, lateral delts, side delts, rear delts, posterior deltoid
  - triceps: triceps, tricep
  - back: back, lats, lat, latissimus, upper back, lower back, traps, trapezius, rhomboids, erector spinae, lumbar
  - biceps: biceps, bicep, brachialis
  - quads: quads, quad, quadriceps
  - glutes: glutes, glute, gluteus, butt
  - calves: calves, calf, gastrocnemius, soleus
  - hamstrings: hamstrings, hamstring
  - abs: abs, abdominals, core, obliques, serratus, lower abs
  - Match case-insensitively, hyphens as spaces. Do not write these back onto exercises.
  - In the server map, comment the filter names that are not chart groups: Forearms, Hip Adductors, and Lats / Upper Back / Lower Back (those three fold into back). Do not change the explorer filters or `body-parts`.
- **Services / store**: extend the existing stats HTTP service. No Redux module. Week mode is slide state, seeded from the on-device store and written back per viewed user id (`thisWeek` | `last7`, default `thisWeek`). The chart range is slide state, always starts at `thisWeek`, and is not saved. Selection is slide state, always starts at none.
- **UI**:
  - Reuse the slide dialog, select, list, button, and circular progress. Add a `card` variant to the list: taller rows, a small gap, trailing slot flush. Existing lists stay as they are.
  - One radar component wraps Recharts. Props are the ten values, an optional previous series, the selected id, and colors. The page does not import Recharts. Current polygon uses the user’s picker color. Each group has a light and a dark color, taken from the existing picker palette and defined once in the theme tokens. Those colors are the spoke labels and the selection header. All Muscles uses the normal text color.
  - A stat card opens a page only when it is given an action. Zero routines and zero exercises are not given one. Volume and sets never are.
  - Haptic is the same light impact the line chart uses, only when the selection actually changes. Not on first paint.
  - Colocated English and Hebrew locals, suspense on the exported slides, dark mode through `html.dark-mode`. Copy is not added to the central locale files.
  - The week strip is not a control. Today uses the picker color. Future days are disabled. A workout day gets one small mark. Weekday uses the narrow form in the user’s language, so English may repeat a letter. The strip follows the app direction.
- **Libraries**: Recharts is added in phase 3, radar only. No second UI kit. No gauge library. No new date library.
- **Out of scope in every phase**: exercise writes, explorer-filter changes, a previous-period switch, more statistics pages, saving the chart range, a duration card, tests.

---

## Phase 1: Week strip

**User stories**: 1, 2, 3, 4, 12, 13

### What to build

The Statistics button opens a new full slide instead of the exercise explorer. Title is Statistics. The slide asks for the week summary of the viewed user.

On first open, read the saved mode for that user. Missing or unreadable storage uses This week. Changing the select saves the mode and reloads. A failed save does not roll the select back.

Render seven cards from `days`. Each card is the narrow weekday letter and, under it, the day of the month. They are not buttons. Today uses the picker color. A future day looks disabled and has no mark. A day with `hasWorkout` gets a small mark. The select offers This week and Last 7 days.

While the summary loads, show a skeleton of the strip. A failed load uses the existing error toast.

The server adds the week read and the Israel date resolver for `thisWeek` and `last7`. `hasWorkout` follows the finished-active-routine rule above. `done`, `target`, and `records` can wait for phase 2.

### Acceptance criteria

- [ ] Statistics opens its own full slide. The exercises and routines buttons are unchanged.
- [ ] This week is Sunday through Saturday in Israel, including days still ahead. Last 7 days is today and the six days before it.
- [ ] The choice survives a reopen for that viewed user, and a trainer’s choice does not overwrite the lifter’s.
- [ ] Today, future days, and workout days match the rules above, in both languages and both color modes.
- [ ] Tapping a day does nothing. A failed load toasts and does not invent days.

---

## Phase 2: Week progress and records

**User stories**: 5, 6, 12

### What to build

Extend the same week read with `done`, `target`, and `records`. Do not add a second route.

Under the strip, a determinate circular progress shows `done/target`. The ring fills to 100% and no further. The label always shows the raw numbers, including `7/6` and `0/0`. The ring uses the picker color. Empty workouts do not increase `done` and do not add a day mark.

Under the ring, render `records` only when the list is non-empty. Each row is the exercise name, Weight or Volume, and the new value. Volume is suffixed the way the app already suffixes kilograms. Tapping a row opens the existing exercise details slide for that exercise (`exerciseId`, `name`, `image`). The details slide then loads history the way it already does.

Reload the summary when the week mode changes. Keep the strip behavior from phase 1.

### Acceptance criteria

- [ ] Three active routines at 2, 3, and 1 make a target of 6. Finished sessions of those routines in the window are the numerator.
- [ ] An empty workout in the window does not move the ring or mark the day. A record from it still appears.
- [ ] The ring caps at full while the label can pass the target. A target of 0 shows an empty ring and `done/0`.
- [ ] No records hides the block. A row opens exercise details.
- [ ] Switching the week mode reloads the ring and the records together with the strip.

---

## Phase 3: Muscle distribution chart

**User stories**: 7, 8, 9, 11, 13, 14, 15

### What to build

Add the distribution read, the server muscle map, and Recharts behind one radar component.

On the statistics slide, under the records, a card-variant list has one row: an image, Muscle distribution, a short description, and a small chevron that is not its own button. The row opens a full slide. The list variant leaves existing lists visually unchanged. The row object can gain siblings later. It does not navigate by itself beyond this one page.

The distribution slide loads `timeframe=thisWeek` and `includePrevious=false`. Range controls are This Week, 7D, 30D, Year, and All. This Week, Year, and All are translated. 7D and 30D stay those symbols. Changing the range refetches and clears the selection back to All Muscles. The range is not saved. Closing and reopening starts at This Week again.

The radar always draws ten spokes in the fixed order, including zeros. The domain max is the highest group `sets`, or 1 when every group is 0, so the web stays visible. The polygon uses the picker color. Spoke labels use each group’s light or dark token. Tapping a label or a spoke selects that group. Tapping it again, or the header’s close icon, clears it. Tapping another group replaces it. Each real change vibrates once.

The header sits above the radar. It reads the selected group’s name, or All Muscles. The close icon is rendered only while a group is selected.

The component accepts an optional previous series and scales the domain to the higher of the two maxima. This page does not pass one. The server returns `previous: null` unless `includePrevious=true`, and returns null for `all` even then. Do not add a switch.

While the distribution loads, skeleton the chart. A muscle tap does not. A failed load toasts.

Comment the known filter mismatches on the server map. Do not edit the explorer filters or any exercise document.

### Acceptance criteria

- [ ] The statistics list is one card row and opens the chart. Older lists look as they do today.
- [ ] Opening the chart loads This Week once. Changing the range loads again. Tapping a muscle does not.
- [ ] A chest press whose triceps are secondary moves only the chest spoke. A set with quads and glutes both primary moves both. A forearm-only set moves nothing.
- [ ] All Muscles has no close icon. A selected group shows the icon, and the icon and a second tap both clear it. The change vibrates.
- [ ] Both color modes, both languages, and the picker color are visible on the polygon and on today.
- [ ] Requesting the previous flag returns the previous window’s set counts. The slide never requests it.

---

## Phase 4: Distribution cards and drill-ins

**User stories**: 10, 12, 15

### What to build

Extend the same distribution payload with `volume`, `routines`, `exercises`, and `total`. Do not add a second route.

Under the radar, four cards in this order: Routines, Exercises, Volume, Sets. With no selection they read `total`. With a selection they read that group. Sets and volume in `total` count a two-group set once. The group cards count it on each group it belongs to.

Routines and Exercises receive an open action only when their count is above 0. Those cards show a small chevron and drop opacity slightly while pressed. Volume, Sets, and a zero count do not.

Routines opens a full slide listing the routines in that payload entry. Each row is the existing past-routine row (name, no start button, no options menu). Tapping it loads that workout through the existing workout read and opens the existing routine details. A failed load toasts and stays on the list.

Exercises opens a full slide of the exercise rows: image, name, set count, volume. Tapping one opens the existing exercise details, the same way a record does.

Both lists follow the current range and the current selection, from the payload already in memory. Changing the range refetches, then the cards and any open list follow the new payload. Changing the muscle updates the cards without a request. If a drill-in is open during a range change, close it.

### Acceptance criteria

- [ ] All Muscles shows distinct sets, volume, routines, and exercises. Selecting quads on a squat that is also glutes includes that set in quads and does not double it in All Muscles.
- [ ] A zero Routines or Exercises card has no chevron and does not open. A count above zero opens the matching list, then the existing details.
- [ ] Volume and Sets never open a page.
- [ ] An empty workout can raise sets and exercises and does not add a routine.
- [ ] Switching muscle is instant. Switching range reloads the cards from the new payload.
