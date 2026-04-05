# Cancel Pending Debounce on Mark-as-Done

## Goal

Cancel the pending debounced `updateExercise` call when `onMarkAsDone` fires, preventing a stale debounced write from overwriting the `isDone` state on the server.

## Problem

During a live workout, when a user edits a set value (weight, reps, RPE/RIR) via the picker and then immediately taps "mark as done", two independent save flows race against each other:

1. The **debounced** `updateExercise` (pending from the picker edit, fires up to 1800ms later) — saves picker changes only, no `isDone`.
2. The **immediate** `markSetAsDone` — saves picker changes + `isDone: true`.

Because the debounced call fires AFTER `markSetAsDone` completes, it can **overwrite** the server state, reverting `isDone` back to `false`. This is a data-loss race condition.

## Solution

Cancel the pending debounced call at the start of `onMarkAsDone`. Since the `useEffect([editSet])` already updates Redux synchronously via `setSelectedSessionDay`, the `exercise` prop is up-to-date by the time the user taps done. The `markSetAsDone` call carries the complete data (picker changes + isDone toggle), so the cancelled debounce is redundant.

## Implementation Decisions

- **Strategy**: Cancel (not flush) the pending debounce — avoids unnecessary HTTP calls
- **Scope**: Only `onMarkAsDone` in `ExerciseEditor` — session flow only
- **No hook changes**: `cancel` is already exported from `useDebouncedCallback`
- **No tests**: The hook's cancel behavior is already tested; this is a 2-line wiring change

## Out of Scope

- Debouncing `markSetAsDone` itself (it's a discrete action)
- The `isExpected` (template editing) path — cancel fires unconditionally, so both paths are covered automatically
- Changes to `WorkoutSession` or the hook

## Implementation

### File: `src/components/ExerciseEditor/ExerciseEditor.tsx`

**Change 1** — Destructure `cancel` from `useDebouncedCallback`:

```typescript
const { debouncedFn: debouncedUpdateExercise, flush: flushUpdate, cancel: cancelUpdate } =
    useDebouncedCallback(stableUpdateExercise, 1800)
```

**Change 2** — Cancel pending debounce at top of `onMarkAsDone`:

```typescript
const onMarkAsDone = async (index: number) => {
    cancelUpdate()
    const newSets = [...exercise.sets]
    // ...
```

## Data Flow

```
User spins picker (weight=80)
  → editSet state updates
  → useEffect fires setSelectedSessionDay (Redux, immediate)
  → useEffect fires debouncedUpdateExercise (pending, 1800ms timer)

User taps "done"
  → cancelUpdate() kills the pending debounce
  → exercise prop already has weight=80 from Redux
  → markSetAsDone(weight=80, isDone=true) → single save with complete data
```

## Validation Checklist

1. Editing a set value and immediately marking done persists `isDone: true`.
2. No stale debounced write fires after `markSetAsDone`.
3. Normal debounced saves (without mark-done) still work as before.
4. Picker close flush behavior is unaffected.
