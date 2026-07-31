# Plan: Native Calories widget macro border by progress %

## Goal

In the iOS **Calories** medium widget (`WidgetMacroGoalView` / `WidgetGoalBannerView`), make each macro’s bottom accent bar width = `current / goal` (capped at 100%). Grow from the left; animate when progress changes if the view updates in place.

## Approach

1. Compute `progress = min(current / goal, 1)` in `WidgetMacroGoalView` (0 when goal is 0).
2. Pass progress into `WidgetGoalBannerView`.
3. Replace the full-width bottom `Rectangle` overlay with a left-aligned bar whose width is `availableWidth * progress` (keep horizontal inset of 8).
4. Optional: `.animation(.easeInOut(duration: 0.4), value: progress)` — may not show across WidgetKit timeline reloads, but harmless.

## Out of scope

- Web `MacrosProgress` (reverted; wrong surface)
