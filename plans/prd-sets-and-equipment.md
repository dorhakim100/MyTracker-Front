## Problem Statement

Every set looks the same, so a warmup, a failed set, a drop, and a myo-reps set are counted and numbered like working sets. Rest is one number for the whole exercise, so a heavier set cannot have a longer rest, and the timer cannot follow the set that was just done. Saved instructions copy the whole exercise into every week, and equipment on the card and in search does not use the same groups. Smith is missing as its own filter, and leverage and sled machines are stored under names the Machine filter does not match.

## Solution

Each set has a type, shown on its badge in the editor and in the sets table. Tapping the badge opens a small sheet to change the type, in planning and during a session. A set added during a session stays gray and gains a small plus in the user's color, in the editor and in the sets table. Reordering sets is a menu action that opens a slide dialog.

Only normal and failure sets take a number, fill the progress bar, and count toward the set total. Volume and records include every type except warmup. Warmup, drop, and myo-reps stay on the plan, copy to next week, and can still be checked.

Each set stores its own rest. In planning, the header sets every set, and the type sheet changes one set through the existing clock picker. The session timer uses the rest of the set just checked. Add set copies the last set and makes the new one normal.

New instructions save the exercise id, the sets, and the flag for an exercise added with no plan. Name, image, muscles, equipment, and how-to text come from the exercise. Older instructions still open.

Equipment shows as colored tags, like body-part badges, on the exercise card, on the exercise details page, and on each exercise in routine details. Search, the filter, and the tags share one group list. Smith is its own tag and also appears under Machine. Leverage and sled machines are stored as machine.

## User Stories

**Must-have**

1. As a user planning or training, I want each set's badge to show its number or W, F, D, or M in the editor and in the sets table, so that I can see the kind of set without reading a label.
2. As a user, I want a warmup, a normal set, a failure, a drop, a myo-reps set, and another normal set to read W, 1, F, D, M, 3, so that only working sets are numbered and a failure still takes a number.
3. As a user, I want to tap the badge and pick Warm up, Normal, Failure, Drop, or Myo-reps, so that I can change the set without leaving the list. Each type has an info icon that explains it without selecting it. In a session that change shows immediately, with the same spinner as marking a set done, and it does not wait on the picker debounce.
4. As a user, I want a type change to keep the reps, weight, and checked state, so that marking a set does not make me enter it again. Choosing Failure sets RPE to 9.9 and RIR to 0, and I can edit those afterward.
5. As a user in a session, I want a set I added during the session to stay gray and show a small plus in my color, the same size as the chat unread mark, in the editor and in the sets table, so that I can tell it from the planned sets.
6. As a user, I want Reorder sets in the exercise menu to open a slide dialog with the image, the name, and the sets as they look in the editor, so that I can drag them without a new control on the crowded row.
7. As a user, I want the progress fill to finish when every normal and failure set is checked, so that warmup, drop, and myo-reps do not block the end of the exercise.
8. As a user, I want volume and records to include drop, myo-reps, and failure, and to leave out warmup, so that warmups do not inflate the work I actually did.
9. As a user, I want the set total to count only normal and failure sets, so that the total matches the sets that take a number.
10. As a user planning a workout, I want each set to have its own rest, the header to set them all, and the type sheet to change one, so that one heavier set can rest longer.
11. As a user in a session, I want the timer to run for the rest of the set I just checked, so that the planned rest for that set is the one I get.
12. As a user, I want Add set to copy the last set and make the new one normal, so that a warmup at 90 kg becomes the starting point for the next working set.
13. As a user opening an older week, I want the exercise name, image, and muscles to still appear, so that slimmer saved instructions do not blank the card.
14. As a user, I want equipment tags under the muscles on the exercise card, on the exercise details page, and under the body-part badges on each exercise in routine details, so that I can see how the exercise is done.
15. As a user filtering exercises, I want Machine to include smith exercises and Smith to show only smith, so that the filter matches the way I look for equipment.
16. As a user, I want a leverage or sled machine to show up as Machine, so that those exercises are not missing from the Machine filter.

## Implementation Decisions

### Libraries

- Existing slide dialog for the type sheet, the reorder dialog, and the rest picker. Existing clock picker for rest. No new dialog library.
- Reorder uses the drag-and-drop list already in the app. No second drag library.
- Equipment tags follow the body-part badge: one light color and one dark color per group, from existing theme tokens.
- The session plus matches the size of the chat unread mark. No new icon library.
- No second UI kit.

### Modules

- Set marks: editor badge, type sheet, sets table, and the session plus.
- Reorder sets: exercise-card menu and a slide dialog for one exercise.
- Counting: one rule for the set number, the progress fill, volume, records, and the set total, on the session screen and in stats.
- Rest and the timer: rest on each set, header sets all, type sheet changes one, add set copies the last set, timer reads the checked set.
- Slim instructions: new saves keep the exercise id, the sets, and the no-plan flag. Catalog fields are read from the exercise. Old documents that still carry a copied exercise, or notes, still open.
- Equipment: one group list for tags, filter, and search. Tags on the card, the details page, and each exercise in routine details. Stored leverage and sled names become machine. Smith stays stored as smith and matches both filters as agreed.

### Product choices

- An old set with no type still reads as a normal set. Every set saved from now on stores a type, and `normal` is a stored value.
- The type sheet has no Remove. Each type row uses the shared info button. Planned sets stay undeletable during a session. Session-added sets stay deletable the way they are today.
- Choosing Failure sets that set's RPE to 9.9 and its RIR to 0. Those values stay editable.
- In a session, a type change skips the picker debounce. The set updates immediately, and the badge shows the same spinner as marking a set done until the save settles.
- Drop and myo-reps are marks on one set. They are not extra rows of decreasing weight.
- Notes are not written on new saves. Nothing on screen reads them today.
- The exercise-level rest remains only so an older plan still has a time until a set has its own.
- How-to text is not rewritten when leverage and sled are renamed.
- Ez bar, Olympic bar, and trap bar stay stored as they are and display as Barbell.

## Testing Decisions

No automated tests. This was not requested.

## Out of Scope

- A drag handle on the set row.
- Remove inside the type sheet.
- Editing a single set's rest during a session.
- Drop-set or myo-reps sequences with several weights inside one set.
- A notes editor, or showing saved notes.
- Rewriting how-to sentences that mention a sled or a leverage machine.
- Renaming ez bar, Olympic bar, trap bar, or smith in the database.
- New equipment beyond Barbell, Dumbbell, Machine, Smith, Cable, Bodyweight, Bands, and Kettlebell.

## Further Notes

Warmup, drop, and myo-reps still show in the plan and are copied into the next week. Checking them is saved. That check does not move the progress fill.

The sets table shows the same type badge as the editor. A set added during the workout stays gray there and carries the plus.

Both stored equipment fields on the exercise are renamed for leverage and sled. Search, the filter, and the tags use the same groups, so a label and a stored name cannot drift apart again.
