## Problem Statement

A set added during a live workout looks the same as a set that was planned. On the exercise editor and on routine details there is no way to see which sets were extra. When the next week is planned, those extras need to either be dropped or become part of the plan.

## Solution

A set added during a live session is marked `isDuringWorkout`. In the exercise editor its set-number badge is an outline with a quieter number. Planned badges stay the user's favorite color. On routine details, planned rows stay at full strength and an extra set's expected and actual rows are faded. Both treatments use a CSS class so the look can be changed by hand.

During the workout, that extra set can be swiped away with the delete swipe that already exists. While planning, it is removed with the remove button that already exists. The next week already opens with those sets still marked. Leaving one in and saving that week clears the mark, so it is planned from then on. The week where it was added keeps the mark.

## User Stories

**Must-have**

1. As a lifter in a session, I want a set I add during the workout to be marked as extra, so that it is distinct from the plan.
2. As a lifter, I want that set's number badge to use a quieter outline style, so that I can see it while logging.
3. As a lifter, I want to swipe that extra set away, so that I can remove a set I did not mean to add.
4. As a trainer opening the routine, I want planned rows at full strength and extra rows faded, so that the plan reads more strongly than sets added in the session.
5. As a trainer planning the next week, I want copied extra sets to still look unplanned, so that I can decide whether they belong.
6. As a trainer, I want the existing remove button to delete an extra set while planning, so that I can drop it before it joins the plan.
7. As a trainer, I want a kept extra set to become a normal planned set when I save the next week, so that later weeks treat it as part of the plan.
8. As a trainer looking back at the week it was added, I want the mark to remain, so that saving that week does not rewrite history.

## Implementation Decisions

- One optional field on the existing set, `isDuringWorkout`. It is saved with the instructions and set payloads that already exist. No new service, store, or screen.
- The field is set only when a set is added during a live session. Adding a set while planning does not set it.
- The unplanned look is a CSS class on the editor set-number badge and on the extra set's rows in routine details. Planned sets keep their current color and weight.
- Workout removal uses the existing swipe-to-delete, allowed when the field is set. Planning removal uses the existing remove button. No new control.
- The next week already arrives as a copy that still has the field. Save on that later week clears it for sets that were kept. Save on the week where the set was added does not.

## Testing Decisions

No automated tests. Check by hand: add a set during a session, swipe it away, leave another and confirm the badge and the faded routine rows, then save the next week and confirm the kept set looks planned while the original week still shows it as extra.

## Out of Scope

- A separate keep action.
- A new way to copy a week forward.
- Marking sets that were added from the planner.
- Changing how planned sets are removed.
- The same treatment on session stats, the sets table, or charts.
- Changing volume, PRs, or whether an extra set counts as work done.

## Further Notes

The server already copies a week forward and must store this field on the set. If it drops unknown set fields, that persistence has to be added there. No new library.
