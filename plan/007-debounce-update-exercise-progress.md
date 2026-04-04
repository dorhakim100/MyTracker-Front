# 007 – Debounce Exercise Set Editing – Progress

> Plan: [007-debounce-update-exercise.md](./007-debounce-update-exercise.md)

## Status: Not Started

---

## Phase 1: Create `useDebouncedCallback` hook

- [ ] Create `src/hooks/useDebouncedCallback.ts`
- [ ] Implement hook using `lodash/debounce` with `useRef` for fresh callback
- [ ] Return `{ debouncedFn, flush, cancel }`
- [ ] Auto-cancel (or flush) on unmount via `useEffect` cleanup

## Phase 2: Integrate debounce into ExerciseEditor

- [ ] Import `useDebouncedCallback` in `ExerciseEditor.tsx`
- [ ] Replace direct `updateExercise` call in `useEffect([editSet])` with debounced version
- [ ] Verify picker UI stays instantly responsive via local `editSet` state

## Phase 3: Add flush on picker close

- [ ] Call `flush()` in `onClosePicker`
- [ ] Call `flush()` in `SlideDialog` `onClose` handler
- [ ] Ensure hook cleanup calls `flush()` on unmount (not just `cancel()`)

## Phase 4: Unit test the hook

- [ ] Create test file `src/hooks/__tests__/useDebouncedCallback.test.ts`
- [ ] Test: callback is debounced by specified delay
- [ ] Test: `flush()` fires callback immediately
- [ ] Test: unmount cancels/flushes pending calls
- [ ] Test: callback ref stays fresh (latest closure called)

---

## Notes

_(Add implementation notes, blockers, or decisions here as work progresses.)_
