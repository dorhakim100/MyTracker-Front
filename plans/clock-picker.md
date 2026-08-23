# Plan: ClockPicker

> Source PRD: [prd-clock-picker.md](./prd-clock-picker.md)

## Architectural decisions

- **Routes**: no new routes; existing dialogs and edit screens stay where they are.
- **Key models**: no schema or API changes. Convenience path still commits one number. Multi-column path commits a map of column name → number on Save.
- **Services / store**: no new Redux module. Weight, calories, and macros keep their existing domain writes, but only inside Save (not while spinning).
- **Libraries**: keep `react-mobile-picker` inside ClockPicker only. MUI + existing CustomButton for chrome. No new package, no second UI kit.
- **Wrapper**: ClockPicker is the only number-wheel wrapper. Convenience props stay for food, steps, rest, and exercise. Generalized N-column path + header/label slots + absolute and increment buttons for the other screens.
- **Commit model**: spinning is a local draft. Save writes domain state. Cancel restores the value from when the picker opened.
- **Flick**: on pointer-up, convert swipe speed into extra items, clamp to that column’s range, set the value so the existing snap animates to a farther number. Slow release stays nearby.
- **Haptics**: optional `value` on the existing drag-haptics hook. When passed, vibrate only if it changed. When omitted, keep distance-based ticks for list reorder.
- **Dark mode / i18n**: `html.dark-mode` only; reuse existing common Save/Cancel strings.

---

## Phase 1: iOS feel on existing ClockPicker

**User stories**: 2, 3, 4, 5, 6, 16, 17

### What to build

Existing ClockPicker screens (food servings, steps, rest, exercise) get iOS-like flick and honest haptics. A fast vertical release jumps many items and the wheel snaps there. A slow drag stays near the release point. The wheel cannot leave the first or last value. The phone ticks only when the selected number actually changes — rubber-banding at the ends is silent. List reorder keeps today’s distance-based ticks.

### Acceptance criteria

- [ ] Fast flick on an existing ClockPicker lands far from the start value (clamped to the column range)
- [ ] Slow drag still settles on a nearby value
- [ ] Dragging past min/max does not change the value and does not vibrate
- [ ] No haptic on pointer-down or pointer-up unless the number changed
- [ ] List drag-to-reorder haptics behave as they do today
- [ ] Food servings, steps, rest, and exercise still open, spin, save, and cancel as before

---

## Phase 2: Weight uses ClockPicker

**User stories**: 1 (partial), 7, 8, 13 (two columns), 14, 15 (partial), 18, 19

### What to build

Weight edit renders ClockPicker (whole + decimal) instead of the raw library. Save writes the combined kg value. Cancel discards the draft. Quick-set behavior stays absolute where the screen already has presets. This is the first consumer off the raw library; ClockPicker’s two-column convenience path is the one in use.

### Acceptance criteria

- [ ] Weight edit no longer imports the raw picker library
- [ ] Whole + decimal wheels match today’s range and display
- [ ] Save persists the combined weight; Cancel restores the opening value
- [ ] Light and dark remain readable
- [ ] Save/Cancel copy stays on existing common strings
- [ ] Existing ClockPicker dialogs from Phase 1 still work

---

## Phase 3: Calories uses ClockPicker

**User stories**: 7, 8, 10, 11, 13 (one column), 15 (partial)

### What to build

Calories edit renders ClockPicker: one column (existing step/range), increment ±400 buttons that clamp to min/max, and a header slot for the live kcal readout. Spinning only updates the draft UI. Save writes calories and the derived carb adjustment. Cancel discards. No live store/goal writes while the wheel is moving.

### Acceptance criteria

- [ ] Calories edit no longer imports the raw picker library
- [ ] ±400 adds/subtracts and clamps to the column min/max
- [ ] Header shows the live draft kcal while spinning
- [ ] Save writes calories/carbs once; Cancel leaves stored goal unchanged
- [ ] Existing absolute quick-set buttons on other ClockPickers still set (not increment)

---

## Phase 4: Macros uses ClockPicker

**User stories**: 1, 7, 8, 12, 13 (three columns), 15

### What to build

Macros edit renders ClockPicker with three columns and label slots for the carb/protein/fat banners. Save writes macros and derived calories. Cancel discards. After this phase, no file except ClockPicker imports the raw picker library.

### Acceptance criteria

- [ ] Macros edit no longer imports the raw picker library
- [ ] Three wheels + banner labels stay understandable
- [ ] Save writes macros/calories; Cancel restores the opening values
- [ ] Repo-wide search shows the picker library imported only from ClockPicker
- [ ] Food, steps, rest, exercise, weight, and calories still behave as in earlier phases
