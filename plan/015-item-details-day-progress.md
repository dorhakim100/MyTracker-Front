# Plan: ItemDetails Day Progress Preview

> Source PRD: ItemDetails Day Progress (GitHub issue)

## Architectural decisions

- **Prefs**: New boolean `showDayProgress` on `Prefs` (default `false`). Persist via existing `setPrefs` / IndexedDB. Toggled only from ItemDetails (not PreferencesCard).
- **Day source**: Always `selectedDay` macros + `user.currGoal` for goals. Hide switch when `noEdit`, or missing user / selectedDay / currGoal.
- **Donut only**: Macro gram labels (`Macros`) stay composition of `editItem.totalMacros` in both modes.
- **Baseline vs diff**: Baseline = current day totals. Diff = full item on add; on edit = `edited − original`. Positive blink = add wedge; negative blink = shrink zone inside solid fill. Same fill hex + subtle opacity pulse.
- **Center**: Baseline kcal + signed delta (e.g. `+550`) + existing `out of` goal. No `+0` / no blink when diff is zero.
- **Beyond macros**: If projected protein/carbs/fat/calories exceeds any goal, ItemDetails preview ring segments use **projected** P/C/F calorie shares (local UI only). Danger-colored icon + short label (“Beyond macros”); reserved fixed-height slot so layout does not jump.
- **Goals immutable**: `MacrosDistribution` always receives/displays goal values. Going past goals must **never** update `currGoal` or change Dashboard distribution.
- **Reuse**: Extend `MacrosDonut` with optional preview/blink props; pure calculator module for baseline/diff/projected/`isBeyondMacros`.
- **Tests**: None (manual QA).
- **i18n**: EN + HE for switch label, warning, any new strings.

---

## Phase 1: Prefs + Day progress switch

**User stories**: Prefer day view; persist choice; hide when cannot edit macros/calories; existing composition when off.

### What to build

Add `showDayProgress` end-to-end (type, defaults, get/set prefs merge). Under the ItemDetails donut, minimal “Day progress” + `CustomIOSSwitch`. On → existing progress mode: pale goal ring + solid fill from `selectedDay` sums vs `currGoal`; center baseline / `out of` goal. Off → today’s composition donut. No blink/delta yet.

### Acceptance criteria

- [ ] Pref defaults false; toggle persists and restores on reopen
- [ ] Switch hidden for `noEdit` / missing user-day-goal
- [ ] Off path identical to current ItemDetails donut
- [ ] On path matches Dashboard-style progress for the selected day (no preview layer)
- [ ] Macro labels still show item grams

---

## Phase 2: Pending change preview (add path)

**User stories**: See blinking add fill; center shows signed kcal delta; updates live with serving/custom edits.

### What to build

Pure preview calculator + MacrosDonut blink layer (same hex, subtle pulse) for positive diff. Wire add flows so solid = day baseline, blink = item contribution. Center: baseline + `+N` + `out of` goal.

### Acceptance criteria

- [ ] Changing servings/macros updates blink and delta live
- [ ] Blink visually distinct from pale + solid (animation only)
- [ ] Zero item contribution → no blink, no `+0`
- [ ] Dashboard / MacrosDistribution unchanged

---

## Phase 3: Edit signed diff

**User stories**: Edit increase shows add blink; decrease blinks shrink zone; no double-counting.

### What to build

When `editMealItem` is present, baseline = current day (including that log); diff = edited − original. Positive/negative blink placement as agreed.

### Acceptance criteria

- [ ] Increase → blink beyond solid fill
- [ ] Decrease → blink on portion that will be removed
- [ ] Unchanged edit → no blink / no delta
- [ ] Add path behavior from Phase 2 unchanged

---

## Phase 4: Beyond macros warning + projected ring

**User stories**: Understand mix changed when past goals; short danger warning; no UI jump; goals never mutate.

### What to build

When projected exceeds any goal: recompute **ItemDetails preview** pale segments from projected shares; reserved warning row (danger icon + “Beyond macros”); fills still relative to that local ring. Do not write goals; do not change MacrosDistribution inputs.

### Acceptance criteria

- [ ] Overshoot updates ItemDetails ring percentages from projected values only
- [ ] Warning uses danger color; reserved height prevents jump
- [ ] Under goal → goal-based ring, warning slot empty but reserved (in progress mode)
- [ ] `currGoal` / MacrosDistribution still show goal distribution only
