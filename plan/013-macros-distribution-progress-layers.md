# Plan: MacrosDistribution dual-layer progress donut

## Goal

Improve `MacrosDistribution` so the donut shows **goal distribution** (pale colors) plus **current progress** (solid fill) per macro — without breaking goal editing / meal editing flows, and without changing other `MacrosDonut` call sites.

## Decisions

1. **Fill geometry:** Solid fill grows clockwise from the start of each pale segment.
2. **Data:** Explicit current macros (+ calories) from Dashboard.
3. **Over 100%:** Cap at full segment (fill the pale completely).
4. **Pale colors:** Same hex with reduced opacity on the pale layer.
5. **Center label:** `current` + “Out of {goal}” styled like `CaloriesProgress` / `CircularProgress`.

## Implementation

1. **`MacrosDonut`** (opt-in, default unchanged):
   - Optional `showProgress`, `currentProtein/Carbs/Fats`, `currentCalories`, `goalCalories`.
   - Progress mode: pale layer (goal conic + opacity) + fill layer (per-segment progress, transparent remainder).
   - Center: formatted current + `macros.outOf` goal.
2. **`MacrosDistribution`**:
   - `isGoal?: boolean` — when `true`, solid donut (EditMeal / composition).
   - When `!isGoal`, pass progress props through to `MacrosDonut`.
3. **Dashboard:** Pass current grams + calories/goal calories; `isGoal={false}` (or omit).
4. **EditMeal:** `isGoal={true}`.
5. **Styles:** Layered `.donut-pale` / `.donut-fill` under existing `.donut-inner`.

## Out of scope

- Other `MacrosDonut` call sites.
- Overflow UX beyond 100%.
