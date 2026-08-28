## Problem Statement

Exercise “notes” are a single expected/actual string buried in a kebab menu and a modal. The trainee often never sees them. The trainer’s plan note and the trainee’s session note cannot become a conversation, cannot update live, and do not work when the trainer is also the person lifting.

## Solution

Replace notes with a **per-exercise chat room** for that workout. Trainer and trainee (including self-trainer) send text in a slide dialog. Messages persist, appear live over sockets, can be edited or deleted by the sender on that screen, and show unread counts from the trainer’s My Trainees accordion down through trainee, workout, and exercise — so a trainer editing a routine can actually find the message. Old notes stay in the database unused; the new UI never reads or writes them.

## User Stories

**Must-have**

1. As a trainee, I want an obvious chat control on the exercise card, so that I know I can talk to my trainer about this exercise.
2. As a trainer planning a workout, I want the same chat control on the exercise, so that I can leave coaching notes without a separate notes field.
3. As a trainer or trainee, I want chat to open in a slide dialog (not a centered modal), so that it feels like the rest of the app’s sheets.
4. As a user, I want one room per workout + exercise, so that Push-day bench and Full-body bench do not mix.
5. As a user, I want the dialog header to show the exercise name and workout name, so that I know which room I am in.
6. As a trainer viewing a trainee, I want the header to include the trainee’s name, so that I do not mix clients.
7. As a user, I want messages grouped with date dividers (Today / Yesterday / date), so that older sessions are easy to scan.
8. As a user, I want newest messages at the bottom and the composer pinned there, so that sending feels like a normal chat.
9. As a trainer (or while planning), I want messages I send in that context to appear as sent, so that the plan side is “me”.
10. As a trainee (or while working out), I want session messages to appear as sent, so that the workout side is “me”.
11. As a self-trainer, I want notes I wrote while planning to show as received when I later train, so that the two roles stay visually distinct even though I am one person.
12. As a self-trainer, I want notes I wrote during a session to show as received when I go back to the plan, so that the converse is also true.
13. As a user, I want to send trimmed text, with send disabled while empty, so that I cannot post blank bubbles.
14. As a user, I want my send to save even if the socket drops, so that the message is not lost.
15. As a user with the chat open, I want the other person’s send, edit, and delete to appear without refreshing, so that the thread feels live.
16. As a user, I want to edit a message that shows as sent on this screen, so that I can fix a typo.
17. As a user, I want an “edited” mark on a changed message, so that the other person can tell it was updated.
18. As a user, I want to delete a message that shows as sent on this screen, so that I can take back a note.
19. As a user, I want a deleted message to disappear for both people, so that we share one thread.
20. As a user, I want received messages to have no edit/delete actions, so that I cannot change the other role’s words.
21. As a user, I want an unread count badge on the exercise chat icon, so that I notice new messages without opening the room.
22. As a user, I want that badge to show `1`–`9` then `+9`, so that it stays two characters and does not overflow the tight card chrome.
23. As a user, I want opening the room to clear unread for me, so that the badge goes away after I have seen the thread.
24. As a user, I want unread to count only the other role’s messages since I last opened this room, so that my own sends do not badge myself.
25. As a user, I want deleted messages ignored for unread, so that a taken-back note does not keep a badge.
26. As a trainer, I want a badge on the My Trainees accordion when any trainee has unread chat, so that I notice mail without opening the list.
27. As a trainer, I want a badge on the trainee in that list (and on dashboard trainee tabs), so that I know which person wrote.
28. As a trainer, I want a badge on that trainee’s workout card, so that I know which routine to open.
29. As a trainer editing a routine, I want a badge on the exercise, so that I land on the room that has the message — this is the main trainer discovery path.
30. As a trainer, I want those ancestor badges to use the same `+9` cap and to clear as I open the room, so that the trail stays consistent.
31. As a user opening SetsTable history, I want the same chat room from the existing note-icon slot, so that past sessions still have the conversation.
32. As a user, I want an empty room to show a short prompt, so that a trainee understands they can write.
33. As a Hebrew or mixed-language user, I want each bubble’s text direction to follow the message, so that Hebrew and English notes stay readable.
34. As a user, I want light and dark chat to use existing color tokens, so that the sheet matches the rest of LiftMate.
35. As a user, I want the chat icon to sit in the existing ExerciseCard actions stack, so that it aligns with overflow and expand and does not steal title space.
36. As a developer, I want all old notes UI removed (card lines, kebab modal, DetailsStage textarea, ExerciseDetails expected block, SetsTable notes modal), so that chat is the only path.
37. As a developer, I want existing `notes` fields on instructions left untouched in Mongo, so that we do not migrate unused data and nothing else breaks.

**Nice-to-have**

38. As a user, I want SetsTable to scroll the thread near that session’s date, so that history entry lands in context.
39. As a user, I want a confirm step before delete, so that a mis-tap does not remove a coaching note.
40. As a user, I want send-on-Enter (with a newline modifier if easy), so that desktop typing is fast.
41. As a user, I want reduced-motion to keep sheet open/close and new-bubble enter short, so that motion stays a cue not a show.

## Implementation Decisions

### Room and schema

- One room = `workoutId` + `exerciseId`. Socket room name: `workout:{workoutId}:exercise:{exerciseId}`.
- Workout already belongs to one trainee (`forUserId`). Same catalog exercise in two workouts = two rooms.
- **Message** document: `date`, `exerciseId`, `workoutId`, `senderId`, `role` (`trainer` | `trainee`), `type` (`text` now; reserved for later `image` / `video`), `content` (string; later caption), optional `media` (null now), `editedAt`, `deletedAt`.
- Soft delete. List endpoints omit `deletedAt` set. No `sessionId`.
- **MessageRead** document: `userId`, `workoutId`, `exerciseId`, `lastReadAt`.
- Populate sender name and image on read/emit via aggregation (same style as other backend aggregations). Also expose workout name and exercise name for the header when listing a room.

### Roles and alignment

- Planning / edit workout / `isExpected` → send and view as `trainer`.
- Live session → send and view as `trainee`.
- Bubble side: same role as this screen = sent; other role = received. Do **not** use `senderId === me` for side (self-trainer).
- Edit/delete allowed only when the message `role` matches the current screen role (sent bubbles). Trainer cannot moderate trainee messages.

### Access

- Trainee: `workout.forUserId` is the current user.
- Trainer: current user is on that trainee’s `trainersIds`.
- Self-trainer satisfies both. Guests cannot use sockets (existing socket auth).

### HTTP (backend)

- `GET` room messages by `workoutId` + `exerciseId` (populated, chronological, exclude deleted).
- `POST` create (`role` + `content`; server sets `senderId`, `date`, `type: text`).
- `PUT` edit content (only if caller’s allowed role matches message role; sets `editedAt`).
- `DELETE` soft-delete (same permission).
- `PUT` mark room read (`lastReadAt` now).
- `GET` unread summary for the current user: totals rolled up by **trainee**, **workout**, and **exercise** (other-role, after `lastReadAt`, not deleted). Client displays `+9` if a level’s count > 9.
- Trainer breadcrumb (must-have): My Trainees accordion → trainee row (and dashboard trainee tabs) → workout card → exercise chat icon while editing the routine. Same `ChatUnreadBadge` at every step. Opening the room marks read and clears that trail.
- Live: if the trainer is not in the room, still bump ancestor badges (emit to the trainer’s user socket, same pattern as health).

Persist **then** emit. HTTP success is source of truth.

### Sockets

- Extend existing authenticated Socket.IO. On chat open: join room; on close: leave.
- Events after persist: created / updated / deleted with the populated message (or id for delete) to the exercise room.
- Also notify the other party’s **user** room so ancestor unread badges update when they are not in the thread (same idea as health snapshots).
- Do not use the current `chat-send-msg` broadcast-only stub for this feature.

### Frontend modules

- Install **`@mui/x-chat`**. Bump `@mui/material` to **^7.3** if the peer requires it (current app is 7.0.1). Do not add chatscope, Stream, or another UI kit.
- **ExerciseChatAdapter** (thin): maps our API + existing socket.io onto `ChatAdapter`.
  - `conversationId` = `{workoutId}:{exerciseId}`.
  - `listMessages` → GET room, map to MUI `ChatMessage` (`parts: [{ type: 'text', text }]`, `createdAt` / `editedAt`, `author` from role).
  - `sendMessage` → POST (persist first), then return an empty/completed stream (no AI streaming).
  - `subscribe` → join socket room; push `message-added` / `message-updated` / `message-removed`. Cleanup leaves the room.
  - `markRead` → PUT lastReadAt. Call when the dialog opens.
- **ExerciseChatDialog** — existing SlideDialog; used from ExerciseCard, SetsTable, DetailsStage.
- **ExerciseChat** — `ChatProvider` + `ChatConversation` + `ChatConversationHeader` + `ChatMessageList` + `ChatComposer` inside the sheet. Do **not** use full `ChatBox` (no conversation sidebar, no AI regenerate).
- Use MUI’s date dividers, scroll-to-bottom, edited/deleted labels, and `ChatMessageActions` for edit/delete. Show actions only on **own** messages (`isOwnMessage` / current screen role).
- **`currentUser` follows screen role**, not `senderId`: planning → trainer participant; session → trainee participant. Two `ChatUser`s (`trainer` / `trainee`). That is how self-trainer sent/received stays correct.
- Shared **ChatUnreadBadge** — still ours: MUI Badge (`1`–`9` then `+9`) on exercise icon, workout card, trainee row/tab, and My Trainees accordion title (title is already a node; do not fork CustomAccordion unless a slot is required). In-thread unread marker is MUI’s.
- **message.service** — HTTP via existing http service. Types for our Message (including `type` for later media). Map to MUI messages only in the adapter.
- No new Redux module. Colocated eng/heb for header/empty/actions. withSuspense on exported feature cmps.
- Theme: Chat reads existing `ThemeProvider` (ThemeModeSync). Import `@mui/x-chat/themeAugmentation` in the theme file if needed. Prefer CSS vars / theme overrides over a parallel palette.
- Per-message LTR/RTL: if MUI does not follow the string, override `ChatMessageContent` only — do not restyle the whole kit.

### UI replacement

- ExerciseCard: chat icon in existing actions stack; drop inline notes and notes modal; kebab “Add notes” → Chat (same dialog).
- SetsTable: existing note icon opens ExerciseChatDialog (pass `workoutId` in; today the row only has sessionId + exerciseId).
- DetailsStage: remove notes textarea; same chat control.
- ExerciseDetails: remove expected-notes block.
- WorkoutSession / EditWorkout / NameExercises: remove `onEditExerciseNotes` plumbing.
- Client stops calling instructions notes GET/save for this UX. Leave backend notes route and instruction `notes` fields as-is.

### Libraries

- **`@mui/x-chat`** for the thread (list, bubbles, date dividers, composer, actions, live store). Why not custom: those surfaces already exist and theme with MUI. Why not chatscope/Stream: second UI kit / hosted backend.
- Existing SlideDialog, CustomButton, CustomOptionsMenu, MUI Badge for the card icon.
- Composer is MUI ChatComposer, not a second CustomInput chat form.
- No list virtualization work on our side (x-chat already virtualizes; our rooms stay small).
- Leave composer attachments / file parts unused until we add media; schema `type` still allows it later.

### Motion

- Sheet uses existing SlideDialog motion. Trust x-chat’s message enter / scroll-to-bottom. Respect `prefers-reduced-motion`. Do not add a second motion system on bubbles.

## Testing Decisions

No automated tests unless explicitly requested. Manual: trainee and trainer (and self-trainer) open the same room; send/edit/delete live; unread trail accordion → trainee → workout → exercise including `+9`; SetsTable opens the same thread; old notes UI gone; light/dark and Hebrew.

## Out of Scope

- Migrating existing expected/actual notes into messages
- Images, video, attachments, replies, typing indicators, read receipts beyond last-opened, push notifications
- ChatBox conversation sidebar, AI streaming, regenerate, tool calling
- chatscope, Stream, TalkJS, or any non-MUI chat kit
- Trainer deleting/editing the other role’s messages
- Changing Mongo `notes` on instructions or removing the old notes API
- A second slide-sheet implementation
- New Redux module
- Automated tests and Storybook

## Further Notes

Wow moment: trainee in a session taps chat, sees the plan note as a received message, replies, and the trainer (or the same person back on the plan) sees it live.

Branches: frontend `f/messages`, backend `f/messages`. Do not land this on `main` until the slice is ready.

**Libraries:** `@mui/x-chat` (Community, MIT) + existing SlideDialog / Badge / CustomButton. Thin **ExerciseChatAdapter** wrapper so ExerciseCard and SetsTable never talk to x-chat types. No second UI kit.
