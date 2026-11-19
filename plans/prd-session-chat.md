## Problem Statement

Exercise chat is a room for one exercise. There is nowhere to talk about the workout as a whole: how the week should feel, what to watch, or a note written before the first session. The first and second time in a week, and later weeks of the same workout, are the same plan, but they have no shared thread. When one person is both planner and lifter, the two sides of a room are hard to tell apart once the messages leave the screen they were written on.

## Solution

Each workout gets one session chat room. Every week and every session of that workout share it. Planning sends as the trainer, a live session sends as the trainee, and a trainer viewing someone else stays the trainer. The same sheet, send, edit, delete, and live updates as exercise chat. Self-self rooms (no trainer) show one fixed **Planned** label and one fixed **Session** label, including on exercise rooms. The workout unread badge is the sum of exercise unreads plus this room.

## User Stories

**Must-have**

1. As a lifter or trainer, I want one session thread per workout, so that both sessions in a week and every later week stay in the same room.
2. As a lifter, I want to write in that thread before the first session, so that a plan note exists when I start.
3. As a lifter, I want the thread on the routine’s session row even when that week has no sessions yet, so that an empty week still opens the room.
4. As a lifter, I want the same thread on the edit screen’s times-per-week row, so that I can write while editing the plan.
5. As a lifter, I want the same thread in the live session header, between more options and expand, so that I can write during the workout.
6. As a trainer planning or viewing a trainee, I want my sends to be the trainer side, so that the plan and the session stay distinct.
7. As the person doing my own workout, I want my sends to be the trainee side, so that the session is “me”.
8. As a self-trainer, I want a fixed Planned label on the planning side and a Session label on the workout side, so that I can tell my two roles apart without a tag on every bubble.
9. As a self-trainer, I want those labels to follow the bubbles and swap when I switch between planning and the workout, so that the side I am on is always “me”.
10. As a user with a trainer, I want the chat icon and no side labels, so that the two people stay the distinction.
11. As a user, I want the session icon’s unread count to add to the exercise counts, so that 1 on three exercises plus 1 on the session shows as 4 on the workout.
12. As a user, I want opening the session room to clear only that room, so that exercise badges stay until I open them.
13. As a Hebrew or English user, I want the new copy in both languages, so that the thread matches the app.

**Nice-to-have**

14. As a user, I want the sheet title to be the workout name, and the trainee’s name when I am viewing someone else, so that I know which room I opened.

## Implementation Decisions

- Widen the existing exercise chat into one room module. A session room is keyed by the workout. An exercise room stays keyed by the workout and the exercise. Same sheet, roles, edit, delete, live updates, and read behavior. No second chat stack.
- Self-self is a user with no trainer: the notes icon. A user with a trainer keeps the chat icon. Side labels render only in self-self, one fixed label per side, on both session and exercise rooms.
- Unread keeps a session count separate from each exercise count. The icon shows the session count. Workout and trainee badges show the sum, including the session count. Records saved before the session room have no `messages` field. Every count treats a missing `messages` value as `[]`, so existing workouts still add up and nothing throws.
- Entry points are the routine session row (always present; session dates still appear only after a finished session), the edit times-per-week row, and the live session header between more options and expand. The control is hidden until the workout has been saved.
- Switching weeks does not change the room. A duplicated workout is a new empty room.
- No new library. Reuse the existing MUI chat sheet, unread badge, and chat icon. New copy is colocated with the chat.

## Testing Decisions

No automated tests unless explicitly requested. Manual: plan a note before the first session, open the same thread from the routine, the editor, and the live session, and from a later week. Self-self labels swap with the screen and do not show for a real trainer–trainee pair. Three exercise unreads plus one session unread show as 4, and opening the session clears only the session count. A workout saved before this field exists, with no `messages`, still shows its exercise unread total and does not break the badge.

## Out of Scope

- A session button on the workout-details preview or the day picker
- Copying messages when a workout is duplicated
- Images, video, replies, typing indicators, or push notifications
- A second chat UI kit or a parallel chat implementation
- Migrating old instruction notes into messages
- Changing exercise chat behavior beyond the self-self side labels and the unread sum

## Further Notes

The useful moment is a note written on the plan, seen on the other side during the workout, and answered there, with the workout badge showing the session message together with any exercise messages.
