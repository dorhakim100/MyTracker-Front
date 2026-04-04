# Debounce Exercise Set Editing

## Goal

Debounce the `updateExercise` callback (500ms, trailing edge) inside `ExerciseEditor`, so only the final picker value triggers the parent save. The picker UI stays instantly responsive via local `editSet` state. Flush the debounce on picker close and component unmount to guarantee no data loss.

## Problem

During a live workout session, every intermediate value from the `ClockPicker` (reps, weight, RPE/RIR) triggers `updateExercise` via a `useEffect([editSet])` in `ExerciseEditor.tsx` (lines 200-209). Each call to `WorkoutSession.updateExercise` fires **two HTTP calls**: `instructionsService.save` and `setService.saveSetBySessionIdAndExerciseId`. Rapid picker spinning creates a burst of unnecessary network requests.

## Implementation Decisions

- **New hook**: `useDebouncedCallback` in `src/hooks/useDebouncedCallback.ts` wrapping `lodash/debounce`
- **Debounce target**: Only the `useEffect([editSet])` path in `ExerciseEditor` (lines 200-209)
- **Not debounced**: `onAddSet`, `onDeleteSet`, `onMarkAsDone` (discrete user actions)
- **Scope**: Live workout session flow only (template editing already local-state-only)
- **Delay**: 500ms, trailing edge (lodash default)
- **Flush points**: picker close (`onClosePicker`) and component unmount (`useEffect` cleanup)
- **Dependency**: `lodash/debounce` (already in the project per plan 005)
- **No Redux changes** — the debounce wraps the prop callback, not store actions

## Out of Scope

- Debouncing the template/expected-values editing flow (no HTTP on that path)
- Splitting optimistic Redux updates from HTTP calls (keep simple for now)
- Debouncing `addSet`, `removeSet`, `markSetAsDone` operations

## Implementation Plan

### Phase 1: Create `useDebouncedCallback` hook

A reusable hook that accepts a callback and delay, returns a stable debounced version using `lodash/debounce`. The hook must:

- Keep the callback ref fresh (no stale closures) via `useRef`
- Return `flush()` and `cancel()` methods
- Auto-cancel on unmount via `useEffect` cleanup
- Hook API: `useDebouncedCallback(callback, delay, deps)` returns `{ debouncedFn, flush, cancel }`

**File**: `src/hooks/useDebouncedCallback.ts`

### Phase 2: Integrate debounce into ExerciseEditor

Replace the direct `updateExercise` call inside `useEffect([editSet])` (lines 200-209) with the debounced version. The `editSet` local state continues to update immediately (picker stays responsive). Only the parent `updateExercise` prop call is debounced.

Current code to change:

```typescript
// ExerciseEditor.tsx lines 200-209:
useEffect(() => {
  const newExercise = { ...exercise }
  if (!newExercise || !editSet) return
  newExercise.sets = newExercise.sets.map((set, index) => {
    if (editSet.index === index) return editSet
    if (editSet.index < index && isExpected) return editSet
    return set
  })
  updateExercise(newExercise, editSet.index)
}, [editSet])
```

The `updateExercise(newExercise, editSet.index)` call becomes `debouncedUpdateExercise(newExercise, editSet.index)`.

**File**: `src/components/ExerciseEditor/ExerciseEditor.tsx`

### Phase 3: Add flush on picker close

When the `SlideDialog` picker closes (`onClosePicker` and the dialog's `onClose`), call `flush()` on the debounced function so the last value is persisted immediately. Also ensure the `useEffect` cleanup in the hook flushes (not just cancels) on unmount to avoid data loss.

**File**: `src/components/ExerciseEditor/ExerciseEditor.tsx`

### Phase 4: Unit test the hook

A unit test for `useDebouncedCallback` verifying:

- Callback is debounced by the specified delay
- `flush()` fires the callback immediately
- Cleanup on unmount cancels pending calls (or flushes, per design)
- Callback ref stays fresh (latest closure is always called)

Uses fake timers for deterministic timing.

**File**: `src/hooks/__tests__/useDebouncedCallback.test.ts`

## Validation Checklist

1. Spinner reps/weight/RPE changes no longer fire immediate HTTP calls per tick.
2. After 500ms of inactivity the final value triggers a single `updateExercise`.
3. Closing the picker immediately persists the pending value.
4. Navigating away (unmount) persists the pending value.
5. `onAddSet`, `onDeleteSet`, `onMarkAsDone` remain instant (not debounced).
6. Picker UI stays instantly responsive during debounce.

## Risks

1. Stale closure in debounced callback could send outdated exercise state.
2. Unmount before flush could lose the last edit.
3. Rapid open/close of picker could skip flush if timing is edge-case.

## Mitigation

1. Use `useRef` to keep callback fresh — debounced wrapper stays stable, inner fn always current.
2. Hook cleanup calls `flush()` (not `cancel()`) to guarantee persistence on unmount.
3. Explicit `flush()` call on every picker close path.
