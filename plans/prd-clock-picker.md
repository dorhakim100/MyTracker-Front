## Problem Statement

Number wheels in the app do not feel like one product. Most screens use ClockPicker, but weight, calories, and macros still talk to `react-mobile-picker` themselves. A fast swipe only moves as far as the finger traveled, so users cannot flick to a much larger value the way they do on an iOS clock. Haptics also fire from finger travel, so the device still ticks at the first or last value even when the number did not change.

## Solution

ClockPicker becomes the only number-wheel wrapper. Weight, calories, and macros render it and keep only their domain save logic. A fast flick on release jumps many items and the existing snap animates there. Haptics tick only when the selected value actually changes. ClockPicker owns wheels, optional header and column-label slots, absolute and increment buttons, and Save/Cancel. Spinning is a local draft; Save commits; Cancel discards. Food, steps, rest, and exercise keep today’s convenience props.

## User Stories

**Must-have**

1. As a user, I want every number wheel to look and move the same way, so that weight, calories, macros, servings, steps, rest, and exercise feel like one control.
2. As a user, I want a fast vertical flick to land far up or down the list, so that I can jump across a long range the way an iOS clock does.
3. As a user, I want a slow drag to stay near where I released, so that fine adjustments still feel precise.
4. As a user, I want the wheel to refuse to leave the first or last value, so that I cannot scroll past the allowed range.
5. As a user, I want a haptic tick only when the selected number changes, so that rubber-banding at the ends does not buzz for no reason.
6. As a user, I want no extra tick on finger-down or finger-up unless the number changed, so that grab and release do not feel noisy.
7. As a user, I want Save to write the draft (weight, calories, macros, servings, etc.), so that spinning never silently changes my stored goal or log.
8. As a user, I want Cancel to restore what I had when I opened the picker, so that an accidental spin is reversible.
9. As a user, I want optional quick-set buttons that jump to a value (50, 100, step presets), so that common targets stay one tap.
10. As a user, I want optional increment buttons (±400 kcal) that add or subtract and clamp to min/max, so that calorie jumps stay in range.
11. As a user, I want a large live kcal readout above the calorie wheels, so that I can see the draft while I spin.
12. As a user, I want carb / protein / fat labels beside or under those three wheels, so that I know which column is which.
13. As a user, I want one-column, two-column (whole + decimal), and three-column wheels from the same control, so that each screen only passes its columns and chrome.
14. As a user, I want existing food-serving, steps, rest-timer, and exercise pickers to keep working with the same save/cancel and presets, so that this work does not regress those flows.
15. As a developer, I want no screen except ClockPicker to import `react-mobile-picker`, so that scroll feel and haptics stay in one place.

**Nice-to-have**

16. As a user, I want drag-to-reorder lists to keep today’s distance-based haptics, so that list reordering does not change with this picker work.
17. As a user, I want reduced-motion to keep the flick usable but not theatrical, so that the snap stays short.
18. As a Hebrew-locale user, I want Save/Cancel and picker chrome to keep using existing common strings, so that we do not add a new copy dump.
19. As a user, I want light and dark wheels to stay readable, so that selected vs unselected numbers still contrast in both modes.

## Implementation Decisions

- Deepen ClockPicker as the only wrapper around the existing mobile picker library. Do not add another UI kit or replace the library.
- Keep the current convenience API (single numeric `value`, optional decimal column, min/max or explicit values, absolute `buttonsValues`, optional Save/Cancel). Existing food, steps, rest, and exercise call sites stay on that path.
- Add a generalized N-column path: column name + values + optional label slot, optional header slot, optional increment buttons. Internally the convenience path maps onto the same columns renderer.
- ClockPicker owns wheels, header/label slots, absolute and increment buttons, and Save/Cancel. Feature screens become thin: they pass columns/slots/buttons and run domain writes only in their Save handler.
- Calories and macros switch to save-on-confirm. They no longer write goal/user while the wheel is spinning. Cancel discards the draft.
- Increment buttons apply a delta to the target column (calories: the only column) and clamp to that column’s min/max. Absolute buttons keep today’s “set to this value” behavior.
- On pointer-up, measure flick speed, convert it to extra items, add that to the nearest snap index, clamp, and set the value so the library’s existing ~300ms snap coasts to a farther number. Slow release = nearby item.
- `useDragHaptics` gains an optional `value`. When it is passed, vibrate only if it changed; no down/up ticks. When it is omitted, keep distance-based ticks for list reorder.
- Weight, calories, and macros stop importing the picker library and stop attaching their own haptic handlers. They render ClockPicker.
- `onChange` for the convenience path stays compatible with today’s callers (save commits one number). Multi-column save passes all column values to the parent Save handler.
- No schema or backend contract changes. No new Redux module.
- No automated tests unless explicitly requested.

## Testing Decisions

No automated tests unless explicitly requested. Manual check: flick far vs slow drag, haptic silence at ends, Save/Cancel on weight/calories/macros, and no regressions on food servings, steps, rest, and exercise.

## Out of Scope

- Replacing or patching the picker library
- Native CSS scroll-snap rewrite
- Redesigning CustomList haptics
- Changing MUI date pickers or the color picker
- Automated tests, Storybook, or extra i18n dumps
- Live-writing goal/user while spinning on calories/macros

## Further Notes

Every number wheel should feel like iOS — a fast flick travels far, and the phone only ticks when the number actually changes.

**Libraries:** MUI + existing CustomButton for chrome. `react-mobile-picker` stays (already in repo). ClockPicker is the wrapper. No new package.
