# Plan: Exercise chat

> Source PRD: `plans/prd-exercise-chat.md`

## Architectural decisions

- **Routes**: no new app routes. Chat is a slide dialog on existing workout / session / exercise-details screens.
- **Room**: one thread per `workoutId` + `exerciseId`. Socket room `workout:{workoutId}:exercise:{exerciseId}`. Conversation id in the chat adapter is that pair joined with `:`.
- **Key models**:
  - **Message**: `date`, `exerciseId`, `workoutId`, `senderId`, `role` (`trainer` | `trainee`), `type` (`text` now; later `image` / `video`), `content`, optional `media` (null now), `editedAt`, `deletedAt`. Soft delete. No `sessionId`.
  - **MessageRead**: `userId`, `workoutId`, `exerciseId`, `lastReadAt`.
- **Roles**: planning / `isExpected` sends and views as `trainer`. Live session sends and views as `trainee`. Bubble side = screen role vs message role, **not** `senderId === me`. Edit/delete only on sent (matching role).
- **Access**: trainee is `workout.forUserId`. Trainer if on that user’s `trainersIds`. Self-trainer is both. Guests cannot use sockets.
- **HTTP**: list room, create, edit, soft-delete, mark read, **unread summary** rolled up by trainee / workout / exercise. Persist then emit. Old instruction `notes` stay in Mongo unused; no migration.
- **Services / store**: domain message HTTP service + thin chat adapter over existing socket.io. No new Redux module.
- **Libraries**: `@mui/x-chat` (Conversation + list + composer + actions — not full ChatBox). Existing SlideDialog, Badge, CustomButton. Bump `@mui/material` to ^7.3 if the peer requires it. No chatscope / Stream / other UI kit.
- **Branches**: frontend `f/messages`, backend `f/messages`.

---

## Phase 1: Open a room and send

**User stories**: 1–5, 8–14, 32, 34, 35

### What to build

Chat icon in the ExerciseCard actions stack opens a slide dialog. Inside: `@mui/x-chat` thread for that workout + exercise. Sending trimmed text persists (GET/POST) with the **screen role**. Reopen (or switch planning vs session) and bubbles already match sent vs received — including self-trainer. Header shows exercise + workout name. Empty room has a short prompt. Light/dark via existing theme. Old notes UI can stay until phase 5.

### Acceptance criteria

- [ ] ExerciseCard chat icon sits with overflow / expand and does not crowd the title
- [ ] Sheet opens (not a centered modal) with exercise and workout name
- [ ] Empty room shows a write prompt; send is disabled while empty
- [ ] A sent message survives reload
- [ ] Planning send shows as sent on the plan and as received in a session for the same room (self-trainer)
- [ ] Session send shows as sent in session and as received on the plan
- [ ] Two different workouts with the same catalog exercise do not share a thread
- [ ] Chat surface follows MUI light/dark

---

## Phase 2: Live

**User stories**: 15

### What to build

After persist, emit created on the room socket. Open chat joins; close leaves. Adapter `subscribe` applies `message-added`. A second client with the same room open sees the new bubble without refresh. HTTP success remains source of truth if the socket drops.

### Acceptance criteria

- [ ] Two open sheets on the same room: send on one appears on the other without reload
- [ ] Closing the sheet stops receiving for that room
- [ ] Message is still stored if the socket fails after HTTP succeeds

---

## Phase 3: Edit & delete

**User stories**: 16–20 (34 if cheap)

### What to build

Own (sent) bubbles get edit and delete. Persist then emit updated / removed. Edited mark from x-chat. Deleted messages disappear for both. Received bubbles have no those actions. Optional confirm before delete.

### Acceptance criteria

- [ ] Sent message can be edited; both clients show the new text and an edited mark
- [ ] Sent message can be deleted; both clients lose the bubble
- [ ] Received messages have no edit/delete
- [ ] Self-trainer can only change messages that are sent **on this screen**

---

## Phase 4: Unread trail

**User stories**: 21–30

### What to build

Unread = other-role, not deleted, after this user’s `lastReadAt` for the room. One summary payload rolls counts up: exercise → workout → trainee → all trainees.

Same small absolute `ChatUnreadBadge` (`1`–`9`, then `+9`) on:

1. My Trainees accordion (trainer, non-dashboard workouts)
2. That trainee in the list, and dashboard trainee tabs
3. The workout card
4. The exercise chat icon — including while **editing the routine** (main trainer discovery)

Opening the room marks read and clears that trail. Own sends do not badge yourself. If the trainer is not in the room, their user socket still refreshes these badges.

### Acceptance criteria

- [ ] Trainee send while trainer is elsewhere: accordion → trainee → workout → exercise all show a count
- [ ] Editing that routine shows the badge on the exercise so the trainer can open the room
- [ ] Dashboard trainee tabs show the same trainee-level count
- [ ] Count never renders more than two characters (`+9` at 10+) at any level
- [ ] Opening the room clears the badge on that exercise and updates ancestors
- [ ] Own messages and deleted messages do not count

---

## Phase 5: All doors + notes gone

**User stories**: 6, 31, 33, 36, 37 + nice-to-haves 38–41

### What to build

Same dialog from SetsTable (existing note-icon slot; pass workout id) and from DetailsStage (replace notes textarea). Strip remaining notes UI and `onEditExerciseNotes` plumbing. Client stops calling instruction notes for this UX. Leave Mongo `notes` and the old notes API alone. Trainer header includes trainee name. Per-message text direction if x-chat does not; confirm-delete / Enter-to-send / scroll-to-date / reduced-motion if still missing.

### Acceptance criteria

- [ ] SetsTable icon opens the same room (optional: land near that day’s divider)
- [ ] DetailsStage has chat, not a notes field
- [ ] No expected/actual notes on the card, kebab modal, exercise details, or session notes modal
- [ ] Instruction `notes` in Mongo unchanged; nothing else breaks
- [ ] Trainer-on-trainee header shows trainee name
- [ ] Hebrew and mixed-direction messages stay readable
- [ ] Sheet motion still uses SlideDialog; no extra bubble animation system
