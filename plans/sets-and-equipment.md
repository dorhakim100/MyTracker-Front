# Plan: Sets and equipment

> Source PRD: `plans/prd-sets-and-equipment.md`

## Flow

A set can be marked, numbered, reordered, and given its own rest. Volume ignores warmups. Equipment tags and search use the same groups.

1. Set marks — the badge, the type sheet, and the plus are visible in the editor and in the sets table, and the type is saved.
2. Counting — the progress fill, the set total, volume, and records follow the type.
3. Reorder sets — the exercise menu opens a dialog where the sets can be dragged.
4. Rest and add set — each set has a rest, the timer uses it, and add set copies the last set as a normal set.
5. Slim instructions — new saves keep the exercise id, the sets, and the no-plan flag, and older weeks still show the exercise.
6. Equipment — tags show on the card, the details page, and routine details, search uses the same groups, and leverage and sled are stored as machine.

- An old set with no type still reads as normal. Every set saved from now on stores a type, and `normal` is one of those values.
- Only normal and failure sets take a number, fill the bar, and count in the set total.
- Volume and records include every type except warmup.
- The type sheet has no Remove. Each type has an info icon.
- Choosing Failure sets that set's RPE to 9.9 and its RIR to 0. The user can edit either value afterward.
- In a session, changing the type updates immediately, skips the picker debounce, and shows the same spinner as marking a set done.

---

## Architectural decisions

- **Set type**: `normal | warmUp | failure | drop | myoReps`. A set saved before this field exists has no type and reads as `normal`, so old documents keep working. Every save from now on writes the field, including `normal`. Do not omit it for a normal set. Stored on the set inside the instruction and on the logged set document. The logged-set schema must include it, and every path that rebuilds a set payload must copy it. A whitelist that copies only weight, reps, effort, and isDone will drop the type. When a rebuild copies an old set that has no type, write `normal`.
- **Failure effort**: when a set becomes `failure`, set its RPE to 9.9 and its RIR to 0. In planning, write both expected and actual, the same way the picker does. In a session, write actual. Keep both fields on the set. A later edit of either value is a normal edit, with no lock back to 9.9 or 0. Changing away from failure does not restore the previous effort.
- **Session type change**: same save path as marking a set done, not the debounced picker save. The sheet closes and the set updates in state immediately. Do not wait on the request before showing the new mark. While the save is in flight, that set's badge shows the same spinner used for the done checkbox, then the new mark when it settles.
- **Badge number**: derived, not stored. Walk the sets in order. Warmup, drop, and myo-reps do not increment. Normal increments and shows the number. Failure increments and shows F. `setNumber` stays the 1-based position in the list and is what order and history sort on.
- **What counts**:
  - Counting set: `normal` or `failure`.
  - Volume and records: every done set except `warmUp`. Planned volume uses the same exclusion. Drop and myo-reps are included.
  - Set total and progress fill: counting sets only. An exercise with none does not block the session.
  - A check on a warmup, drop, or myo-reps set is still saved.
- **Rest**: `restingTime` on each set, in milliseconds, same unit as today. The exercise-level value is a fallback for a set that has none, then the existing default (2.5 minutes). The header writes every set. The plan type sheet writes one set. The session timer reads the set just checked.
- **Add set**: copy the last set's reps, weight, effort, and rest. Force `normal`. Clear done. During a session, mark it added during the workout, as today.
- **Instructions write**: each exercise keeps `exerciseId`, `sets`, and `withoutExpected`. Do not write notes, name, image, muscles, equipment, or how-to text on a new save. Do not migrate or strip old documents.
- **Instructions read**: fill name, image, muscles, equipment, and how-to text from the exercise. If that load fails, use the copies still on the old document. Ignore notes. Prefer the exercise record when both exist, so a renamed equipment value shows.
- **Week copy**: spreading the set keeps type and per-set rest. Do not rebuild the set in a way that drops them. Warmup, drop, and myo-reps stay on the next week.
- **Equipment groups**: one list, used by tags, the filter, and exercise search.

  | Group | Matches |
  | --- | --- |
  | Barbell | barbell, ez barbell, olympic barbell, trap bar |
  | Dumbbell | dumbbell |
  | Machine | machine, leverage machine, sled machine, smith machine, and the other machine names already mapped |
  | Smith | smith machine |
  | Cable | cable |
  | Bodyweight | body weight, weighted, assisted |
  | Bands | band, resistance band |
  | Kettlebell | kettlebell |

  A smith exercise shows the Smith tag only. The Machine filter still returns it. The Smith filter returns only smith. Stored values for ez bar, Olympic bar, trap bar, and smith are not renamed.
- **Equipment rename**: on the exercise record, replace `leverage machine` and `sled machine` with `machine` in both equipment fields. Leave how-to text alone. Keep matching the old strings in the Machine group so a document that was not rewritten still filters.
- **Libraries**: the existing slide dialog, the existing clock picker, and the drag-and-drop list already in the app. Equipment tags follow the body-part badge and use existing theme tokens for a light and a dark color. The plus matches the chat unread mark in size. No new library.
- **Copy**: colocated English and Hebrew strings. No automated tests.

---

## Phase 1: Set marks

**User stories**: 1, 2, 3, 4, 5

### What to build

The set badge shows the derived mark in the editor and in the sets table. Tapping it opens a small slide dialog, in planning and during a session, with Warm up, Normal, Failure, Drop, and Myo-reps. Each row has the shared info button. Tapping it explains that type and does not select it. Choosing a row saves that type and leaves reps, weight, and the checked state as they are. Choosing Failure also sets that set's RPE to 9.9 and its RIR to 0. The user can change those afterward. Nothing forces them back.

In a session, choosing a type cancels any pending picker save and sends the update immediately, the same way marking a set done skips the debounce. The local set updates before the request returns, and the sheet closes. While that save is in flight, the badge shows the same spinner as the done checkbox. Planning still saves with the plan-mode update.

A set added during a session keeps the gray outline it has today and gets a plus in the user's color, the same size as the chat unread mark, drawn on that gray badge. The sets table shows the same type mark as the editor, not the raw set number. A set added during the workout is gray there too, with the same plus. Planned sets stay the normal badge, with no plus.

Persist the type on the instruction set and on the logged set. Session creation and later set saves must copy it. An old set with no type reads as normal. The first save of that set writes `normal`. A new set always stores a type, and a normal set stores `normal`. Reordering is not in this phase. The list order stays put.

### Acceptance criteria

- [ ] W, 1, F, D, M, 3 is what a warmup, normal, failure, drop, myo-reps, and normal set show, in the editor and in the sets table. The table does not keep showing only the stored set number.
- [ ] An old set with no type shows its number, and saving it writes `normal`.
- [ ] A new normal set is stored with type `normal`, not with the field left off.
- [ ] The sheet opens from the badge in planning and in a session, and it has no Remove.
- [ ] Each type has an info icon. Opening it explains the type and leaves the set unchanged.
- [ ] Changing type does not change reps, weight, or the check.
- [ ] Choosing Failure sets RPE to 9.9 and RIR to 0. Editing them afterward is kept.
- [ ] In a session, the new mark shows without waiting on the debounce used for weight and reps, and the badge shows the done-set spinner until the save settles.
- [ ] A set added during a session stays gray and shows the plus, in the editor and in the sets table. A planned set does not.
- [ ] Leaving the screen and coming back shows the same type.

---

## Phase 2: Counting

**User stories**: 7, 8, 9

### What to build

Use the counting rules from the architectural decisions everywhere a set is totaled.

On the session screen, the exercise fill and the session fill are done-counting-sets over counting-sets. The exercise is done when every counting set is checked. The session is done when every exercise is done by that rule. Warmup, drop, and myo-reps can be checked, and that check is saved, and it does not move the fill.

In stats, volume actual, volume planned, personal records, muscle distribution, and the volume charts skip warmup and include drop, myo-reps, and failure. The set total counts only normal and failure sets, done over planned. The recap's finished state uses the same exercise-done rule, so unchecked warmups do not keep the session unfinished.

### Acceptance criteria

- [ ] An exercise with two normal sets and a warmup reaches full when the two normal sets are checked, even if the warmup is not.
- [ ] A drop or myo-reps set that is checked does not move the fill and does not increase the set total.
- [ ] A checked failure set counts in the fill, the set total, volume, and records.
- [ ] A checked warmup adds nothing to volume or records.
- [ ] A checked drop adds its weight times reps to volume and can be a record.
- [ ] Planned volume leaves warmup out and includes drop and myo-reps.

---

## Phase 3: Reorder sets

**User stories**: 6

### What to build

Add Reorder sets to the exercise card menu in planning and during a session. It opens a slide dialog with the exercise image, the name, and one row per set. Each row shows the same badge, plus, reps, weight, and effort as the editor. The rows are for dragging, not for editing those values.

Dragging uses the list drag-and-drop already in the app. On drop, the set array is saved in the new order. Each set keeps its type, reps, weight, effort, rest, check, and session-added flag. `setNumber` becomes the new 1-based position. Badge numbers are derived again from that order.

### Acceptance criteria

- [ ] The menu opens the dialog in planning and during a session.
- [ ] The dialog shows the image, the name, and the same marks as the editor, including the plus.
- [ ] Dropping a set saves the new order, and the editor shows that order.
- [ ] A failure moved between two normal sets still shows F, and the normal numbers update.
- [ ] The set row in the editor gains no drag handle.

---

## Phase 4: Rest and add set

**User stories**: 10, 11, 12

### What to build

Store `restingTime` on each set. A set without one uses the exercise-level rest, then the default.

In planning, the header and its clock picker set every set to the chosen rest. The type sheet shows that set's rest under the type list. Choosing it opens the existing clock picker and writes only that set. During a session the type sheet is only the type list.

When a set is checked, the timer runs for that set's rest. That includes the set that finishes an exercise. Do not switch the duration to the next exercise's rest.

Add set copies the last set in the list, then forces the new set to normal, clears done, and appends it. During a session it is marked added during the workout. Copy reps, weight, effort, and rest so a warmup at 90 kg becomes a normal set at 90 kg.

Week copy and set rebuilds must keep per-set rest.

### Acceptance criteria

- [ ] Changing the header rest changes every set. Changing one set from the type sheet leaves the others.
- [ ] During a session the type sheet does not offer rest.
- [ ] Checking a set starts the timer for that set's rest, including the last set of the exercise.
- [ ] An old exercise with only one rest uses that time for every set until a set is changed.
- [ ] Add set after a warmup at 90 kg creates a normal set at 90 kg, with that warmup's reps, effort, and rest.
- [ ] The new set is not checked. During a session it shows the plus.

---

## Phase 5: Slim instructions

**User stories**: 13

### What to build

On save, each exercise on the instruction is the exercise id, the sets, and the no-plan flag. Sets still carry type, rest, reps, weight, effort, the check, and the session-added flag. Do not write notes or the copied catalog fields. Do not rewrite old documents in place.

On read, load the exercise and fill name, image, muscles, equipment, and how-to text. If the load fails, use the copies on the old document. If both exist, prefer the exercise record. Ignore notes. The card, the editor, the details page, routine details, and the session keep showing the exercise.

The backend accepts both shapes. A client that still sends the old copies must not crash the save. A client that receives a slim document must not crash the screen.

### Acceptance criteria

- [ ] A new save does not contain notes, name, image, muscles, equipment, or how-to text on the exercise entry.
- [ ] Opening that week still shows the name, image, and muscles.
- [ ] An old week that still has those copies, and notes, still opens.
- [ ] Type, per-set rest, and the no-plan flag survive the save.
- [ ] A failed exercise lookup falls back to the copies on the old document.

---

## Phase 6: Equipment

**User stories**: 14, 15, 16

### What to build

Show one tag per equipment group under the muscle line on the exercise card and on the exercise details page, and under the body-part badges on each exercise in routine details. Same tags in all three places. Use the body-part badge pattern: a light color and a dark color from existing theme tokens, a different pair per group. A smith exercise shows Smith, not Smith and Machine. Ez bar, Olympic bar, and trap bar show Barbell.

The filter and exercise search use the group table. Machine returns smith exercises. Smith returns only smith. Add Smith and Kettlebell to the filter. Reuse the closest existing artwork for those two.

Rename `leverage machine` and `sled machine` to `machine` on both equipment fields of the exercise record. Do not change how-to text. Do not rename smith or ez bar. The Machine group still matches the old strings.

Tags, the filter, and search must call the same group list. The frontend and the backend must not keep two copies that can drift.

### Acceptance criteria

- [ ] The card, the details page, and each exercise in routine details show the same tags, in light and dark mode.
- [ ] A smith exercise shows a Smith tag. Filtering Machine includes it. Filtering Smith does not include a plain machine.
- [ ] An ez-bar exercise shows Barbell and is returned by the Barbell filter.
- [ ] A leverage or sled exercise reads as machine and is returned by the Machine filter.
- [ ] How-to text that mentions a sled or a leverage machine is unchanged.
- [ ] Bodyweight matches body weight, weighted, and assisted. Bands matches band and resistance band.
