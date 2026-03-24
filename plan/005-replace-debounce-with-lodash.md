# Replace Self-Coded Debounced Fetch With Lodash Debounce

## Goal

Replace all custom/project-level debounced fetch patterns with `lodash`'s built-in `debounce` for more robust and consistent behavior.

## Debounce Usage Inventory (All Found Places)

1. `src/services/util.service.ts`
   - Current: custom exported `debounce()` wrapper around the `debounce` npm package (`import debounceLib from 'debounce'`)
   - Plan: remove this wrapper and use `lodash/debounce` directly in consumers

2. `src/pages/LiftMate/EditWorkout/EditWorkout.tsx`
   - Current: imports `debounce` from `services/util.service`
   - Usage: debounced exercise search fetch
   - Plan: switch to `lodash/debounce`

3. `src/pages/LiftMate/Progress/Progress.tsx`
   - Current: imports `debounce` from `services/util.service`
   - Usage: debounced exercise search fetch
   - Plan: switch to `lodash/debounce`

4. `src/components/ItemSearch/ItemSearch.tsx`
   - Current: imports `debounce` from `services/util.service`
   - Usage: debounced item search fetch
   - Plan: switch to `lodash/debounce`

5. `src/pages/MyTracker/Progress/Progress.tsx`
   - Current: imports `debounce` from `services/util.service`
   - Usage: debounced `handleLoadItems` fetch pipeline
   - Plan: switch to `lodash/debounce` and cleanup with `cancel()`

6. `src/pages/TrainerDashboard/pages/Exercises/TrainerExercises.tsx`
   - Current: imports `debounce` from `@mui/material`
   - Usage: debounced exercise search fetch
   - Plan: standardize to `lodash/debounce` (single debounce source across app)

7. `src/components/WorkoutSession/WorkoutSession.tsx`
   - Current: imports `debounce` from `@mui/material`
   - Usage: debounced exercise search fetch
   - Plan: standardize to `lodash/debounce`

8. `package.json` / `package-lock.json`
   - Current: `debounce` dependency present
   - Plan: add `lodash` (or `lodash.debounce`) and remove `debounce` after migration is complete

## Migration Plan

1. Add lodash debounce dependency:
   - Preferred import style: `import debounce from 'lodash/debounce'`

2. Replace imports in all usage files:
   - Remove `services/util.service` debounce imports
   - Remove `@mui/material` debounce imports where used for fetch debounce
   - Import from `lodash/debounce` directly

3. Normalize debounce lifecycle handling:
   - Keep stable debounced function instances (`useMemo`/`useRef`)
   - Add cleanup with `debouncedFn.cancel()` in `useEffect` cleanup/unmount

4. Remove obsolete abstraction:
   - Delete `debounce` export from `services/util.service.ts`
   - Ensure no remaining references

5. Remove old dependency:
   - Remove `debounce` package if no usages remain

6. Verification:
   - Run lint
   - Smoke test all search screens:
     - LiftMate Progress
     - EditWorkout exercises search
     - Trainer Exercises
     - WorkoutSession add-exercise flow
     - MyTracker ItemSearch and Progress

## Risk Notes

- Debounced function identity and stale closures can cause missed updates if not memoized/cleaned correctly.
- Any current behavior relying on previous debounce API (`clear`) must be updated to lodash API (`cancel`, optional `flush`).
- Using one shared debounce implementation reduces subtle behavior differences from mixed sources.

## Questions Before Implementation

1. Do you want `lodash` (`lodash/debounce`) or `lodash.debounce` (single-purpose package)?
what's the defferences?
2. Should I fully remove the `debounce` package and the `util.service.ts` debounce helper in this migration?
yes you can remmove them
3. Do you want trailing-only behavior (lodash default) everywhere, or custom options in specific screens (e.g. `leading: true`)?
lodash - default