# Plan: Routine Details

> Source PRD: [prd-routine-details.md](./prd-routine-details.md)

## Flow

For the developer. Read this section. Everything below is for the agent.

Tapping a workout card opens a view-only routine page. A week toggle starts on the latest week, each exercise shows expected versus actual, finished sessions reopen their statistics, and an edit icon opens the current editor on top.

1. **Routine Details week view** — the card and a new menu item open the page, with the week toggle, week status, and the set tables.
2. **Exercise details from the card** — tapping a display card opens the full exercise page.
3. **Week session statistics** — the open week lists its finished sessions, and each one opens the existing statistics modal.
4. **Edit from Routine Details** — the edit icon opens the current editor and returns here on close or save.

- The week toggle only includes weeks that already exist, including a week at 0/x.
- The editor is not changed, so it still opens on its own latest week.

---

## Architectural decisions

- **Routes**: no new route. Routine Details is a full slide on the workout card, same as today’s details and edit sheets. Past inactive routines keep opening Workout Details.
- **Key models**: no schema changes. Weeks come from the existing week-status list (`weekNumber`, `isDone`). The open week is the existing instructions document (`doneTimes`, `timesPerWeek`, `exercises`, sets with expected and actual). A finished session is an existing session for that user, workout, and week that has `statsId` or finished instructions.
- **Services / store**: no new Redux module. Load weeks and the selected week through the existing instructions service, using the same user the editor uses (the trainee when a trainer is viewing, otherwise the logged-in user). Session list uses the existing session query with that user, the workout, and the week number, and treats one session as a one-item list. Recap uses the existing stats read by session id. Do not walk calendar days and do not add a stats write.
- **Libraries**: the existing week toggle, MUI Table, the existing exercise details sheet, the existing large statistics dialog, and the existing editor. No new package.
- **Editor boundary**: do not modify the editor. The edit icon stacks it in a second sheet. The menu item Edit Routine stays a direct open that closes back to the list.
- **Dark mode / i18n**: new UI follows `html.dark-mode` and existing color tokens. Success uses the existing green plus a check. Page copy is colocated in English and Hebrew. The new menu label sits with the workout card’s existing menu strings, in both languages. Exercise cards keep View Details. The workout menu uses the existing Workout Details string.

---

## Phase 1: Routine Details week view

**User stories**: 1, 2, 3, 4, 5, 6, 7, 12, 13, 14

### What to build

The workout card tap and a new first menu item, Routine Details, open a view-only sheet titled with the routine name. The old details item stays second, still opens today’s exercise list, and its label becomes Workout Details. Edit Routine and the rest of the menu stay. The dashboard card uses the same tap. Its Edit Routine button, and start, duplicate, deactivate, and delete, stay as they are. The more menu still does not also trigger the card tap.

The page loads the week-status list for this workout. The toggle has one option per existing week, ordered by week number, using the same toggle the editor uses (week label, number as the icon). No week that is absent from that list is rendered, and none of the rendered weeks are disabled. The selected week is the greatest week number, even when its count is 0/x. Changing the toggle loads that week’s instructions.

The open week shows `doneTimes / timesPerWeek`. Missing `doneTimes` is 0. Missing `timesPerWeek` is 1.

- 0/x: planned and not done. No failure mark.
- Greater than 0 and below x: in progress. The fraction only.
- x/x, or above: finished. A check and the existing green.

A week in the toggle shows that same success mark when its status `isDone` is true. The selected week also shows it when the loaded count is finished, even if `isDone` is still false. Unfinished weeks have no cross icon.

Under the status, each exercise on that week’s instructions is a new display-only card. Do not change the live session card or the editor card. The header shows the exercise image, name, and muscles. There is no menu, chat, reorder, delete, or effort toggle. Sets are a read-only MUI table: Set, Weight, Reps, and one effort column. The effort header is RPE when the first set has RPE, otherwise RIR, matching the editor. Each value cell shows expected and actual. Weight uses the existing kg label. A missing value is a dash. At 0/x the actuals still show, even when they equal the plan.

A failed week or instructions load uses the existing error toast. No weeks shows a short empty line and no toggle. No exercises shows the week status and no cards.

### Acceptance criteria

- [ ] Card tap and the Routine Details menu item open the same view-only sheet, on the list and the dashboard
- [ ] The sheet title is the routine name
- [ ] Workout Details still opens today’s exercise list, and exercise cards still say View Details
- [ ] The toggle lists only existing weeks, starts on the latest, and includes a week at 0/x
- [ ] 0/x reads as planned and not done, a partial count reads as in progress, and x/x reads as finished with a check and green
- [ ] Finished weeks in the toggle show that success mark, and unfinished weeks have no cross
- [ ] Each exercise is a display-only card whose table shows expected and actual for weight, reps, and RPE or RIR
- [ ] New copy exists in English and Hebrew
- [ ] Edit Routine, start, duplicate, deactivate, delete, and past inactive rows behave as they do today

---

## Phase 2: Exercise details from the card

**User stories**: 8

### What to build

Tapping the display card, including its table, opens the existing full exercise details sheet for that exercise. Pass the workout id, workout name, and the same chat role Workout Details uses. Closing it returns to Routine Details on the same week. The card does not become editable.

### Acceptance criteria

- [ ] Tapping a display card opens the existing exercise details page for that exercise
- [ ] Closing it returns to the same week of Routine Details
- [ ] The live session card and the editor card do not gain this display table

---

## Phase 3: Week session statistics

**User stories**: 9, 10

### What to build

When the open week’s `doneTimes` is 0, render no session list and do not request sessions. When it is above 0, load sessions for this user, workout, and week through the existing session query. Keep sessions that have `statsId` or finished instructions. Sort by date, newest first. Show each date in the user’s language. Tapping one loads the existing recap by session id and opens it in the existing large statistics dialog, with the routine name and exercises. Closing it returns to the same week. A failed recap or session load uses the existing error toast. An empty result renders no list. Do not create or finish statistics from this page.

### Acceptance criteria

- [ ] A week at 0/x shows no session list
- [ ] A week with finished sessions lists them by date, newest first
- [ ] Tapping a session opens the existing statistics modal for that session
- [ ] Closing the modal returns to the same week
- [ ] This page does not create statistics

---

## Phase 4: Edit from Routine Details

**User stories**: 11

### What to build

An edit icon on Routine Details opens the existing editor in a sheet on top of this page. Do not modify the editor. It still chooses its own latest week. The editor’s close and its save-and-close only dismiss that sheet. Then reload the week list and the week the user was viewing. If that week no longer exists, select the latest remaining week. The outer close still leaves Routine Details. The card’s Edit Routine menu item still opens the editor directly and still returns to the list.

### Acceptance criteria

- [ ] The edit icon opens the existing editor on top of Routine Details
- [ ] The editor code is unchanged and still starts on its own latest week
- [ ] Closing or saving the editor returns to Routine Details and refreshes the week that was open
- [ ] The Edit Routine menu item still opens the editor directly and returns to the list
