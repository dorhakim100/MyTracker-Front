# Plan: Beyond goal warning message (macros vs calories)

## Goal

Refine the ItemDetails beyond-goal warning so a dedicated helper returns the label to show, and the warning appears in both donut modes (composition and day progress).

## Current behavior

- Warning visibility is gated by `showDayProgress && dayProgressPreview?.isBeyondMacros`
- Label is always `t('macros.beyondMacros')` (“Beyond macros”)
- `isBeyond` in `day-progress-preview.service.ts` treats calories **or** any macro overshoot as one boolean

## Proposed change

1. **Split overshoot detection** in the preview service (or a sibling helper):
   - beyond macros = projected protein/carbs/fat > goal
   - beyond calories = projected calories > goal
2. **New function** that returns the string (or i18n key) to display:
   - past macros → existing “Beyond macros”
   - past calories → same phrasing with calories (“Beyond calories” / HE equivalent)
   - under both goals → empty / null (slot stays reserved when the controls row is shown)
3. **Show regardless of mode**: use the returned message whenever `canShowDayProgress` and the helper returns a value — not only when `prefs.showDayProgress` is on.
4. **i18n**: add `beyondCalories` (EN + HE).

## Decisions

1. If past **both** macros and calories → show **calories** label.
2. “Regardless of mode” = show when Day progress is off too, as long as projected day totals overshoot.

## Implementation

- Add `getBeyondGoalWarningKey(projected, goals)` → `'beyondCalories' | 'beyondMacros' | null` (calories first).
- Wire ItemDetails to use it without gating on `showDayProgress`.
- Add `beyondCalories` EN/HE strings.
