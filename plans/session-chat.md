# Plan: Session chat

> Source PRD: `plans/prd-session-chat.md`

## Flow

For the developer. Read this section. Everything below is for the agent.

A workout gets one shared chat room for every week and every session. You can write before the first workout, from the plan or during the session, and the workout badge counts that room together with the exercises.

1. The session thread opens from the routine, the editor, and the live session, and send, edit, delete, and live updates work like an exercise.
2. Unread on that room adds to the exercise counts, and older records with no message list still count as zero.
3. Self-self rooms show one fixed Planned label and one fixed Session label, including on exercise threads.

- One room per workout. A later week is the same thread. A duplicated workout starts empty.
- The workout badge is exercise unreads plus the session unread. Three 1s on exercises and 1 on the session show as 4.

---

## Architectural decisions

- **Routes**: no new app routes. The session thread is the existing chat sheet on the routine, the workout editor, and the live session.
- **Room**: one session thread per `workoutId`, across every week and every time that week. Exercise threads stay `workoutId` + `exerciseId`. Socket room `workout:{workoutId}:session`. Conversation id `session:{workoutId}`. Exercise conversation ids stay `{workoutId}:{exerciseId}`. A value that starts with `session:` is never an exercise id.
- **Key models**:
  - **Message**: same document as exercise chat. Session messages omit `exerciseId`. Exercise messages still require it. Soft delete. `type` stays `text`.
  - **MessageRead**: `userId`, `workoutId`, `lastReadAt`, and no `exerciseId` for the session room. Exercise reads stay keyed by exercise.
  - A missing `messages` field on any previously saved object is `[]` before a count, filter, or reduce. Do not rewrite old documents to add the field.
- **Roles**: same screen rule as exercise chat. The editor sends as `trainer`. Your own live session sends as `trainee`. Watching another trainee, or the trainer dashboard, stays `trainer`. Bubble side is screen role against message role, not `senderId`. Edit and delete only on the sent side.
- **Self-self**: the workout owner has no `trainersIds`. That person gets the notes icon and the side labels. An owner with a trainer gets the chat icon and no labels. Labels are one per side, fixed to the top of the thread, and follow the bubbles.
- **Access**: same as exercise chat. The trainee is `workout.forUserId`. A trainer must be on that user’s `trainersIds`.
- **HTTP**: the message service gains a session list, create, and mark-read that send `workoutId` and `role` only. Update and delete stay by message id and role. Unread summary keeps trainee, workout, and exercise totals. It adds a session count per workout. `workouts[workoutId]` and the trainee total already include that session count. The session icon reads the session count alone. The client does not add it a second time.
- **Services / store**: extend the existing message service, chat adapter, and unread summary. No new Redux module.
- **Libraries**: existing `@mui/x-chat` sheet, `ChatUnreadBadge`, `ChatBubbleOutlineIcon`, `SlideDialog`. No second chat kit.
- **Copy**: English and Hebrew live with the chat. Session empty copy is about the workout. Label copy is `Planned` / `Session` and `מתוכנן` / `אימון`.

---

## Phase 1: Session thread

**User stories**: 1, 2, 3, 4, 5, 6, 7, 13, 14

### What to build

A session room is the current chat sheet with no exercise. List, send, and mark-read take `workoutId` and the screen role. The server stores the message without `exerciseId` and must not return those messages from an exercise room. A list for a workout that has never had session messages returns an empty list. If a payload’s `messages` field is missing, the client uses `[]` and still renders the thread.

The conversation id is `session:{workoutId}`. Join and leave use `workout:{workoutId}:session`. Created, updated, and removed events for that room update the open sheet. Edit and delete stay available only on bubbles whose role matches the screen. HTTP success is still the source of truth if the socket drops.

The sheet title is the workout name. When the screen role is trainer and the trainee is someone else, the trainee’s name is included. There is no exercise name. Empty copy explains that this thread is about the workout.

The control is hidden until `workout._id` exists. It uses the same icon rule as exercise chat: notes when the workout owner has no trainer, chat bubble when they do. The unread badge can show 0 in this phase.

Three placements, all opening this room:

- Routine week body: the session row is always rendered once the week’s instructions exist, including `0` done. The control is the first item in that row. The “sessions” heading, divider, and date buttons render only when that week has finished sessions. Changing the week does not change the room.
- Workout editor: the control sits on the times-per-week row, on the screen that actually edits the workout. Sending from here uses the trainer role. Changing the week does not change the room.
- Live session header: the control sits in the actions, between the more-options button and expand. The role is the normal live-session role.

A duplicated workout has a new id, so it starts with an empty room. Messages are not copied.

### Acceptance criteria

- [ ] Routine, editor, and live session open one thread for that workout
- [ ] A week with no finished sessions still shows the control, and a later week shows the same messages
- [ ] A note can be sent before the first session, and it is still there after reload
- [ ] A planning send is on the sent side in the editor and on the received side in your own live session
- [ ] A live-session send does the opposite
- [ ] A trainer viewing a trainee sends as the trainer from both places
- [ ] Edit, delete, and a second open sheet stay in sync, and only the sent side can edit or delete
- [ ] The title is the workout name, plus the trainee’s name when viewing someone else
- [ ] The control is absent until the workout has an id
- [ ] An exercise room does not show session messages
- [ ] A missing `messages` field does not break opening the thread

---

## Phase 2: Unread sum

**User stories**: 11, 12

### What to build

The unread summary gains a session count per workout, and a matching “has messages” flag for the dot on a read thread. The number already stored on the workout and on the trainee includes that session count. Example: three exercises with 1 unread and a session with 1 unread make `workouts[workoutId]` equal 4. The session icon shows 1. Each exercise icon still shows 1.

The calculation that produces those totals reads session messages as `messages ?? []`. A missing field adds 0. It does not throw, and it does not clear exercise counts. Old summaries that have no session map are normalized to an empty map before any lookup.

Opening the session room marks that room read and subtracts only its count from the workout and trainee totals. Exercise counts stay. While the room is open, a new message from the other role is marked read instead of badging. A session socket payload has `workoutId` and `senderRole` and no `exerciseId`. The client must accept that payload. An exercise payload still requires `exerciseId`. A session event increments the session count and the workout and trainee totals, and does not increment an exercise.

The same `+9` cap applies. The icon shows the seen dot when the session count is 0 and the room has messages.

### Acceptance criteria

- [ ] 1 unread on three exercises and 1 on the session shows 4 on the workout and on the trainee total
- [ ] The session icon shows only the session count
- [ ] Opening the session room clears only that count
- [ ] A workout saved before this field exists, with no `messages`, still shows its exercise total
- [ ] A session message while the room is closed bumps the session icon, the workout, and the trainee, and no exercise icon
- [ ] A session message while that room is open does not leave a badge

---

## Phase 3: Self-self labels

**User stories**: 8, 9, 10

### What to build

On the shared thread, when the workout owner has no trainer, pin two labels to the top of the message list: `Planned` on the trainer side and `Session` on the trainee side. They stay visible while the messages scroll. They are not repeated on bubbles. They use the same edges as the bubbles, so when the screen role changes, the labels swap sides with them. Hebrew uses `מתוכנן` and `אימון`. Light and dark use the existing tokens.

When the workout owner has a trainer, render no labels. Exercise rooms and the session room share this behavior.

### Acceptance criteria

- [ ] A self-self exercise room and session room show one Planned label and one Session label
- [ ] The labels stay at the top while the thread scrolls and do not appear on each bubble
- [ ] Planning puts Planned on your side; the live session puts Session on your side
- [ ] A workout owner who has a trainer sees no labels
- [ ] English and Hebrew both show the labels
