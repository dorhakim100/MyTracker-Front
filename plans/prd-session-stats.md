## Problem Statement

Finishing a workout is a dead end. The app marks the session finished, kills the rest timer, and shows nothing about how long it took, how hard it felt, how close it was to the plan, or whether anything was a personal record. The user cannot reopen that recap later. Session duration is not stored (the existing timer is rest between sets and resets every set). Mid-session add/edit has two bugs: Add set / Add exercise is delayed by a 4s debounce (it only “saves” after leaving the page), and a first-time exercise logged from a live session stores sets that Exercise Details hides until the exercise is added again from Edit routine (`isNew` blocks the graph and table).

## Solution

When the user finishes a session (Finish button, more-options, or completing every set), a **large** `CustomAlertDialog` opens with a session recap: duration, a big Radial Elastic hardness gauge (accuracy % inside), volume vs plan, sets done, vs last time this workout, then an exercise list (image, name, small gauge, accuracy beside it, PR badges). The same dialog reopens from session more-options once stats exist.

Backend stores only what cannot be derived: a `stats` document with `timeFrames`. Session gets `statsId`. Duration, hardness, accuracy, volume, PRs, and vs-last are aggregated on read from sets, instructions, and those frames. Live session Add exercise / Add set save immediately; picker edits still debounce. First-time sets always show on Exercise Details. Mid-session add still updates the next Edit routine.

## User Stories

**Must-have**

1. As a lifter, I want a recap modal when I finish a session, so that the end of the workout feels like a result, not a blank screen.
2. As a lifter, I want the recap in a **large** alert (almost full screen), so that duration, gauges, and the exercise list fit without a cramped confirm dialog.
3. As a lifter, I want existing alerts to stay **small**, so that delete/confirm dialogs do not suddenly grow.
4. As a developer, I want `CustomAlertDialog` to accept `type: small | medium | large` (default small), so that size is explicit and reusable.
5. As a lifter, I want to see **how long** the session took, so that duration is part of the recap.
6. As a lifter, I want duration to survive finish → start again the same day, so that multiple work blocks add up instead of overwriting.
7. As a lifter, I want a time window to open when I complete **any** set (not only set 1 of exercise 1) while none is open, so that skipping around still starts the clock.
8. As a lifter, I want Finish to close that window, so that rest after the workout is not counted.
9. As a lifter, I want finishing by completing every set to open the same recap, so that I am not stuck because the rest timer is gone and the Finish control is disabled.
10. As a lifter, I want Finish on the **bottom button** and in **more-options**, so that finish is obvious and also available in the menu.
11. As a lifter, I want **no Finish icon** in the session header, so that the header matches Exercise Card (more-options + expand).
12. As a lifter, I want **expand/collapse all** to stay a header icon, so that I can open exercises without opening a menu.
13. As a lifter, I want more-options to include Finish, Session statistics (only if stats exist), and Delete, so that secondary actions live in one place.
14. As a lifter, I want Session statistics to reopen the **same** large recap, so that I can look again after closing it.
15. As a lifter, I want a **big** Radial Elastic next to duration for the whole workout, so that hardness is the hero.
16. As a lifter, I want that gauge’s **needle** to show how hard it felt (actual RPE, RIR converted), so that Easy / Working / Hard matches the work.
17. As a lifter, I want the **number inside** the big gauge to be plan **accuracy %**, not the RPE number, so that I see how well I hit expected vs actual.
18. As a lifter, I want each exercise row to use the **same** gauge component at **small** size, so that workout and exercise hardness look like one system.
19. As a lifter, I want the small gauge’s accuracy % **beside** it, so that the number stays readable.
20. As a lifter, I want exercise rows to show image + marquee title, so that names that overflow still read.
21. As a lifter, I want Easy 5–7, Working 7–8.5, Hard 8.5–10 on the arc (three colors from theme tokens), so that the gauge matches the app, not the library demo.
22. As a lifter, I want accuracy text **not** tinted by the arc color, so that a perfect hard set does not look like a failure.
23. As a lifter, I want 100% accuracy only when expected weight, reps, and RPE/RIR all match actual, so that “perfect” means the plan was followed.
24. As a lifter, I want that 100% split **40% RPE/RIR, 40% weight, 20% reps**, so that load and effort matter more than a single extra rep.
25. As a lifter, I want near-misses to get **partial** credit, so that 1 kg or 1 rep off does not zero that slice.
26. As a lifter, I want weight error counted in **jumps** by planned-weight stage (1–10 → 1 kg … 301+ → 6 kg), so that 1 kg on a deadlift is not scored like 1 kg on laterals, and 1 kg is not 1%.
27. As a lifter, I want 4 jumps to empty the weight slice, 1 RPE = 1 jump (4 to empty the RPE slice), 1 rep = 1 jump (4 to empty the reps slice), so that all three pieces decay the same way.
28. As a lifter, I want missing expected fields skipped and the rest rescaled to 100%, so that a set without RPE still has a fair score.
29. As a Hebrew or English user, I want recap copy in colocated locals, so that the modal matches the rest of the app.
30. As a lifter, I want **volume vs plan**, **sets done** (e.g. 18/20), and **vs last time this workout** under the big gauge, so that work and progress sit with duration.
31. As a lifter, I want PRs for **weight** and **volume** (enum type, same section, different badges), so that I can tell them apart and we can add types later.
32. As a lifter, I want a weight PR when the heaviest **done** set I have ever logged for that exercise lives on **this session’s date**, so that the recap matches all-time best, not a stored snapshot.
33. As a lifter, I want a volume PR when the highest `weight × reps` **done** set for that exercise lives on this session’s date, so that volume PRs are per set, like weight.
34. As a lifter, I want both badges on the exercise row when both fire (`position: absolute`), so that a double PR is visible.
35. As a lifter, I want first-time logging of an exercise to count as a PR, so that a new lift is celebrated.
36. As a developer, I want PRs and other recap numbers **computed on read**, not stored, so that we do not duplicate sets data.
37. As a developer, I want a `stats` collection with `timeFrames: [{ from, to }]` (ISO) plus `sessionId` / `userId`, and `session.statsId`, so that duration is the only new persisted fact.
38. As a developer, I want GET stats to aggregate the full recap (duration, gauges, accuracy, volume, sets, vs-last, PRs, per-exercise rows), so that the client renders, it does not recompute history.
39. As a trainer viewing a trainee’s day, I want the same recap, so that I see what they saw.
40. As a lifter, I want Add **set** and Add **exercise** on a live session to save immediately (no debounce), so that I do not have to change page for it to stick.
41. As a lifter, I want weight/reps/RPE/RIR picker edits to **keep** debounce, so that spinning the picker does not spam the API.
42. As a lifter, I want adding an exercise mid-session to still appear on the **next Edit routine**, so that the template stays in sync (today’s behavior).
43. As a lifter logging an exercise for the first time from a live session, I want Exercise Details graph and sets table to show those sets, so that I do not have to add it again from Edit routine just to see history.
44. As a developer, I want Exercise Details to fetch by `exerciseId` even when `isNew` is true, so that `isNew` is only an empty-state hint, not a fetch gate.
45. As a lifter, I want light and dark mode to use existing tokens and `html.dark-mode`, so that the recap is not a different product.
46. As a lifter, I want the Radial Elastic to use a short elastic needle motion (not the library’s 3s default), so that open feels alive without dragging.

**Nice-to-have**

47. As a lifter, I want `medium` alert size used somewhere later, so that the three sizes stay a real scale (unused in v1 except the prop existing).
48. As a lifter with reduced motion, I want the needle to skip elastic overshoot, so that the recap stays calm.
49. As a lifter, I want an empty gauge/accuracy state when a set or session has no usable expected/actual, so that we do not show a fake 0% or a stuck needle.

## Implementation Decisions

### Libraries

- **Existing CustomMui:** `CustomAlertDialog` (extend with `type`), `CustomOptionsMenu`, `CustomButton`. `MarqueeText` for exercise names.
- **New small lib:** `react-gauge-component` — Radial Elastic (`type="radial"`, `pointer.elastic`, `animationDelay: 0`). Why not MUI: no radial elastic gauge. Why not in-repo circular progress: wrong shape and no needle + sub-arcs.
- **Wrapper:** one feature hardness-gauge cmp with `size: big | small`, not a CustomMui (single feature). Theme tokens for the three arc colors; no neon/glow.
- No second UI kit. No new chart package.

### Frontend conventions

- Recap + gauge: own folders, SCSS, colocated `locals/eng.json` + `heb.json`, `withSuspense` on exported feature cmps.
- Colors only via existing theme tokens. Dark mode: `html.dark-mode &`.
- Session header more-options follows Exercise Card (MoreHoriz + flat icon).

### Data

- **Stored (`stats`):** `sessionId`, `userId`, `timeFrames: [{ from: ISO, to: ISO | null }]`. Session: `statsId`.
- **Not stored:** duration total, RPE average, accuracy, volume, sets ratio, vs-last, PRs — derived on GET.
- Open frame: first `isDone: true` on any set while no open `to: null` frame (create stats + set `statsId` if needed). Close frame: finish. Resume: new frame.
- Display times as `HH:mm`; store ISO.

### Accuracy (done sets)

- 40% RPE/RIR (RIR midpoints: 0→9.4, 1→8.25, 2→7.75, 3→7, 4→6.5, 5→5.5; skip >5 for hardness average; compare converted RPE for accuracy).
- 40% weight: `|actual − expected| / jumpSize(expected)`; 0 jumps = full slice; 4 jumps = 0.
- Jump size by planned weight: 1–10 → 1; 11–25 → 2; 26–40 → 2.5; 41–70 → 3; 71–110 → 3.5; 111–150 → 4; 151–200 → 4.5; 201–250 → 5; 251–300 → 5.5; 301+ → 6 (kg).
- 20% reps: 1 rep = 1 jump; 4 jumps = 0.
- Missing expected: drop that slice, rescale remaining to 100%.
- Workout % = average of set scores. Exercise % = average of that exercise’s done sets.
- Needle = actual RPE (session or exercise average), scale 5–10, bands 7 / 8.5 / 10.

### PRs (`PrType = 'weight' | 'volume'`)

- Weight: heaviest done set for `userId` + `exerciseId` across history; if that set’s session date is this session → PR.
- Volume: highest `weight.actual × reps.actual` done set; same date rule.
- First time logging the exercise counts. Same exercise can have two items/badges.

### Other recap numbers

- Duration = sum of closed frames (`to − from`).
- Volume vs plan: `Σ(actual weight × actual reps)` vs `Σ(expected weight × expected reps)` for the session.
- Sets done: done / planned.
- Vs last: this session volume vs previous session of the same `workoutId` (omit if none).

### APIs (backend)

- Upsert stats / open or close timeFrame (from set-done and finish).
- GET aggregated recap by session (or `statsId`).
- Session read includes `statsId`.

### Live-session bugs (in scope)

- Debounce **off** only for Add set and Add exercise; picker `updateExercise` stays debounced; flush on unmount still OK.
- Exercise Details: do not skip `useSets` / graph query when `isNew === true`.
- Keep mid-session add writing the workout so the next Edit routine includes the exercise.

### Frontend modules

- Extend `CustomAlertDialog`.
- Session recap feature cmp (large dialog body).
- Hardness gauge wrapper (`react-gauge-component`).
- `WorkoutSession` header/menu/finish + timeFrame calls.
- `session` / `stats` services and types.
- Exercise Details `isNew` fetch gate; ExerciseEditor debounce on add-set path.

### Backend modules

- `stats` model + service (persist frames; aggregate recap).
- Session `statsId`.
- Set-done / finish hooks to open/close frames.

No Redux stats dump required: fetch recap on finish and on reopen. Timer Redux stays rest-only.

## Testing Decisions

No automated tests unless explicitly requested. Manual: finish opens large recap; reopen from more-options; two timeFrames after finish-and-resume; accuracy 100% on exact match; jump-stage weight off; dual PR badges; Add set/exercise persist without leaving the page; first-time exercise details show sets; existing small alerts unchanged; both color modes.

## Out of Scope

- Calories, muscle pie charts, letter grades, e1RM, rest-quality, time under tension
- Reps-only PR type (volume already includes reps)
- Snapshotting PRs (they follow current all-time best on this date)
- Backfilling stats for sessions finished before this feature
- Changing Edit-routine debounce
- Stopping mid-session add from updating the routine template
- New general-purpose UI kit
- Automated tests and Storybook unless asked

## Further Notes

The wow moment is finish → large recap: needle in the hardness band, % for plan accuracy, PRs on the rows.

RIR midpoints and jump tables belong in one backend helper used by aggregation so the client does not fork the math.

**Libraries:** `react-gauge-component` (Radial Elastic). CustomAlertDialog / CustomOptionsMenu / CustomButton / MarqueeText. No CustomMui for the gauge.
