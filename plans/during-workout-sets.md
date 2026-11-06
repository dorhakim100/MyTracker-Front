# Plan: During-workout sets

> Source PRD: [prd-during-workout-sets.md](./prd-during-workout-sets.md)

## Flow

A set added during a live session is marked extra. It shows an outline number in the editor and faded rows on the routine. It can be swiped away during the workout, or removed with the existing button while planning. Saving the next week makes a kept extra set part of the plan. The week it was added in still shows it as extra.

1. Mark extra sets in the session — adding a set during a workout stores the mark, shows it in the editor and on the routine, and lets that set be swiped away.
2. Keep or drop them next week — a copied extra set still looks unplanned, the existing remove button deletes it, and saving that later week clears the mark on sets that stay.

- The mark is cleared only when saving a week that has not been performed yet. Saving a week that already has completed sessions leaves the mark.

---

## Architectural decisions

- **Routes**: none. Live session, routine details, and the existing workout editor stay as they are.
- **Key model**: optional `isDuringWorkout?: boolean` on the existing set. Missing or false means planned. True means added during a live session.
- **Persistence**: the field rides on the set inside the instructions document and on the set payload those saves already send. No new endpoint, service, or store. The server already copies a week forward and must keep this field on the set.
- **Who sets it**: only Add set during a live session (`isExpected` is false). Add set while planning must not keep the flag, including when the new set is copied from an extra set.
- **Who clears it**: the planner save that already copies actual values into expected. Clear the field when that week's `doneTimes` is 0. Leave it when `doneTimes` is greater than 0. The session save path never clears it.
- **Removal**: live session uses the existing delete swipe, and only for a set with the flag. Planning keeps the existing remove button for every set. Do not add a control, and do not change how a planned set is removed.
- **Look**: one class, `during-workout`, on the editor set-number badge and on the extra set's expected and actual rows. Planned sets keep the favorite-color badge and full-strength rows. No new color token and no new copy. Dark mode stays on existing ink tokens; add `html.dark-mode` only if a token is not enough.
- **Libraries**: MUI Badge and Table already in these screens. No new package.
- **Tests**: none.

---

## Phase 1: Mark extra sets in the session

**User stories**: 1, 2, 3, 4

### What to build

Add `isDuringWorkout` to the set type. When a set is added during a live session, set the flag to true on that new set before the existing instructions save and set save run. The cleaner that drops the unused RPE or RIR field must leave this flag in place. Adding a set while planning writes the flag off, so spreading the previous set cannot mark a planned set as extra.

In the exercise editor, both set-number badges (the live row and the previous-week rail) get the class `during-workout` when the flag is set. Style that class so the badge is an outline: no favorite-color fill, number in the normal ink color at about half opacity. The favorite-color fill rule on `.MuiBadge-badge` has to lose to this class. Planned badges stay as they are.

On the routine exercise card, put `during-workout` on the expected row and the actual row when the flag is set. Those rows render at about half opacity. Planned rows stay at full strength. The done marker can stay.

During a live session, swipe-to-delete is the existing delete action. It is currently attached only while planning, and the list disables swipe while planning. Attach that same delete action for a set whose flag is set, even though this is a live session. Leave the mark-done swipe in place, including on an extra set. Do not attach delete for a planned set. Do not change the list-level swipe block (planning, dashboard, and an in-flight update still block the whole list). The existing "cannot delete the only remaining set" guard stays.

### Acceptance criteria

- [ ] Add set during a live session saves `isDuringWorkout: true` on that set in the instructions
- [ ] Add set while planning does not save the flag, even if the previous set has it
- [ ] The extra set's number badge is an outline in the live editor, and a planned set's badge is unchanged
- [ ] Routine details shows that extra set's expected and actual rows faded, and planned rows unchanged
- [ ] Swiping the extra set during the session deletes it; swiping a planned set still marks it done
- [ ] The last remaining set still cannot be deleted
- [ ] Light and dark mode both keep the planned badge on the favorite color and the extra badge as an outline

---

## Phase 2: Keep or drop them next week

**User stories**: 5, 6, 7, 8

### What to build

The next week already opens as a copy, so a kept extra set still has the flag. Phase 1's class then shows the outline badge in the planner and the faded rows if that week is opened on the routine. No second visual treatment.

The planner remove button already deletes whichever set it sits on. Do not hide it, restyle it, or add a guard for this flag. Deleting an extra set there removes it from the week being edited, same as today.

On the existing planner save, after the actual values are copied into expected, drop `isDuringWorkout` from every set when this week's `doneTimes` is 0. Omit the field rather than storing false. When `doneTimes` is greater than 0, leave the field as it was. That is what keeps the original week marked after a later save, and what turns a kept extra set into a planned set when the unstarted next week is saved.

Do not clear the flag on any session save.

### Acceptance criteria

- [ ] Opening the next week still shows a copied extra set with the outline badge
- [ ] The existing remove button deletes that extra set from the next week
- [ ] Saving the next week (`doneTimes` 0) stores the kept sets without `isDuringWorkout`, and they render as planned
- [ ] Saving the original week after it has completed sessions (`doneTimes` > 0) still has the flag, and routine details still fades those rows
- [ ] Planned sets remove the same way they do today
