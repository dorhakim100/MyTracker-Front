# Plan: Diary delete log reappears (frontend race)

## Problem

Deleting a log succeeds on the backend, but the log often reappears in the UI shortly after — especially when deleting quickly after navigating to Diary, and mainly when the backend is slow (dev with remote API).

## Hypotheses

1. **H-A (stale navigation fetch):** Navigating to Diary starts `dayService.query` in `Diary`’s `useEffect`. If the user deletes before that request returns, the late response still contains the deleted log and `setSelectedDiaryDay(diary)` restores it.

2. **H-B (user-change refetch):** Delete calls `optimisticUpdateUser`, which changes `user`. Diary’s effect depends on `[selectedDay, user]`, so it refetches. That refetch can complete against a server that still has the log (delete/`dayService.save` not finished), then overwrite Redux.

3. **H-C (LoggedList sync):** After optimistic delete, `LoggedList`’s sync `useEffect` re-reads `selectedDay` / `user.loggedToday` that was overwritten by a stale fetch (symptom of A/B, not root cause).

4. **H-D (pathname reset):** The pathname `useEffect` resets `selectedDay` from `user.loggedToday` and can restore a deleted log if `user` was not updated or was rolled back.

5. **H-E (unawaited day save):** `dayService.save` after delete is fire-and-forget; a concurrent query wins the race before persistence.

## Investigation

Instrument Diary fetch start/complete and delete flow with debug logs, reproduce by navigating to Diary and deleting quickly, then confirm which setter restores the log.

## Log verdict (pre-fix)

- **H-A CONFIRMED:** Stale navigation fetch `diary-fetch-1784893911740` returned 5 logs including deleted `6a6351c3` *after* optimistic delete had already removed it → `setSelectedDiaryDay` restored it (lines 141–143).
- **H-B CONFIRMED:** `optimisticUpdateUser` triggered a new Diary fetch via `[selectedDay, user]` (line 140 right after delete).
- **H-C:** Symptom only — LoggedList synced the restored Redux day.
- **H-D REJECTED** for the reappear path — pathname effect did not fire between delete and restore.
- **H-E:** Secondary — race is dominated by stale query overwrite, not the unawaited save itself.

## Minimal fix

In `Diary.tsx` `useEffect`:
1. Change deps from `[selectedDay, user]` → `[selectedDay, user?._id]` so optimistic user updates do not refetch.
2. Add an `ignore` cleanup flag so late `dayService.query` responses never call `setSelectedDiaryDay`.
