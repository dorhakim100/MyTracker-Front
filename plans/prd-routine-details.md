## Problem Statement

Tapping a workout card opens an exercise list, while the thing the user usually wants is the routine itself: which week they are in, what was planned, and what they actually did. The only place that shows weeks today is Edit Routine, and that page is for editing. Finished sessions already produce a statistics modal, but it is only reachable from the live session.

## Solution

Tapping a workout card opens Routine Details, a view-only sheet. A week toggle, the same kind of control Edit Routine uses, moves between weeks that already exist and always starts on the latest one. The open week shows whether it was only planned, is in progress, or is finished, then a read-only exercise card per exercise. Each card’s sets are a table of expected versus actual. Finished sessions for that week open the existing statistics modal. An edit icon opens the current editor on top and returns here when it closes.

## User Stories

**Must-have**

1. As a lifter, I want the workout card and a Routine Details menu item to open the same view-only page, so that the card shows my routine instead of an exercise list.
2. As a lifter, I want the old details action renamed to Workout Details, so that I can still open today’s exercise list when I mean that.
3. As a lifter, I want a week toggle like Edit Routine, limited to weeks that already exist, so that I can move through the routine without opening a week that was never created.
4. As a lifter, I want that toggle to open on the latest week, including one at 0/x, so that I land on the week I am actually in.
5. As a lifter, I want 0/x to read as planned and not done, a partial count to read as in progress, and x/x to read as finished with a success mark, so that I can tell those states apart.
6. As a lifter, I want finished weeks in the toggle to carry that success mark, so that I can see which weeks are done without opening each one.
7. As a lifter, I want each exercise as a display-only card whose sets are a table, so that weight, reps, and RPE or RIR show expected and actual instead of plain text.
8. As a lifter, I want tapping that card to open the full exercise details page, so that I can read the exercise without leaving the routine.
9. As a lifter, I want the open week to list its finished sessions by date, newest first, so that I can reopen each session’s existing statistics modal.
10. As a lifter, I want no session list at 0/x, so that a week that was never done does not offer statistics.
11. As a lifter, I want an edit icon on this page to open the current editor on top, so that I can change the routine and come back here on close or save.
12. As a trainer on the dashboard, I want the same card tap, so that reviewing a trainee’s routine matches the lifter’s page.
13. As a Hebrew or English user, I want the new copy in both languages, so that the page matches the app.

**Nice-to-have**

14. As a lifter, I want the sheet title to be the routine name, so that I know which routine I opened.

## Implementation Decisions

- New view-only Routine Details page. It does not edit sets, weeks, or times per week.
- Week navigation reuses the existing week toggle. Selectable weeks are the ones that already exist. The selected week opens on the latest. Finished weeks use a success treatment. This toggle does not follow the editor’s rule that a week unlocks only after the previous one is finished.
- New display-only exercise card, so the live session card and the editor stay unchanged. Sets use the existing table primitives. Columns are set, weight, reps, and RPE or RIR. Every value cell shows expected and actual.
- Tapping the display card opens the existing exercise details page.
- Finished sessions on the open week reuse the existing session statistics modal. No new statistics view.
- The edit icon stacks the existing editor in a sheet on top. The editor is not modified, so it still opens on its own latest week. Close and save return to Routine Details.
- The workout card is the only existing surface whose behavior changes: card tap and the new menu item open Routine Details. The current details item keeps its action and takes the Workout Details label. Exercise cards keep View Details. Edit Routine stays.
- No new library. English and Hebrew copy is colocated with the new page.

## Testing Decisions

No automated tests unless explicitly requested.

## Out of Scope

- Any change to the routine editor, including which week it opens on.
- Live session logging, finish flow, and how statistics are created.
- Chat on Routine Details.
- A new statistics layout.
- Changing what Workout Details shows, beyond the workout-card label.
- Start, duplicate, deactivate, and delete on the workout card.

## Further Notes

A week the user can open includes one whose count is still 0/x. Actual values on that week may still equal the plan because nothing was logged. The week status is what says it was not done. The table still shows both expected and actual.
