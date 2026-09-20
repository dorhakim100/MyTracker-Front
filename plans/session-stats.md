# Plan: Session statistics

> Source PRD: `plans/prd-session-stats.md`

## Architectural decisions

- **Routes**: no new app routes. Recap is a large `CustomAlertDialog` from the live session (finish + more-options).
- **HTTP (auth cookie, same as other APIs)**:
  - Open/close time frames on the session’s `stats` doc (from set-done and finish).
  - `GET` aggregated recap by session (or `statsId`).
  - Session payloads include `statsId`.
- **Key models**:
  - `stats`: `{ sessionId, userId, timeFrames: [{ from: ISO, to: ISO | null }] }`
  - Session: `statsId`
  - Recap (computed, not stored): duration, hardness (actual RPE), accuracy %, volume vs plan, sets done, vs last, per-exercise rows, `prs: { type: 'weight' | 'volume', ... }[]`
- **Time frames**: open on first `isDone` of any set while no open frame; close `to` on finish; finish-and-resume appends a new frame. Display `HH:mm`, store ISO.
- **Accuracy**: 40% RPE/RIR (midpoint conversion) / 40% weight jumps by planned-weight stage / 20% reps; 4 jumps empty a slice; missing expected rescales. Needle = actual RPE 5–10; bands Easy ≤7, Working ≤8.5, Hard ≤10. Center/% = accuracy, not RPE. Accuracy text is not arc-colored.
- **PRs**: computed on read. Weight = heaviest done set for that exercise; volume = highest `weight × reps` done set; include if that set’s session date is this session. Enum `PrType`: `weight` | `volume`.
- **Services / store**: frontend `session` + `stats` domain HTTP services and types. No Redux stats module; fetch recap on finish and reopen. Rest timer stays rest-only.
- **UI**: `CustomAlertDialog` `type: small | medium | large` (default small; recap = large). One Radial Elastic wrapper (`react-gauge-component`, `size` big|small), not CustomMui. Session header: more-options + expand-all icon only. Bottom Finish stays. Libraries: that gauge lib + existing CustomMui / MarqueeText. No second UI kit.
- **Bugs in later phase**: live Add set / Add exercise skip debounce; picker edits keep it. Exercise Details must fetch history even when `isNew`. Mid-session add still updates the next Edit routine.
- **Out of scope in every phase**: calories, e1RM, reps-only PR, PR snapshots, backfill of old sessions, tests unless asked.

---

## Phase 1: Large recap shell

**User stories**: 1–4, 10–14

### What to build

Give alerts a size prop (`small` default = today’s dialogs, `medium`, `large` ≈ full screen). Session header matches Exercise Card: more-options + expand/collapse all as the only extra icon. Finish lives on the bottom button and in the menu (no header Finish icon). Delete moves into the menu. Finish (button or menu) opens a **large** recap with placeholder copy so the path is clickable. Session statistics in the menu opens the same dialog when we later have `statsId` (hide the item until then, or no-op if missing).

### Acceptance criteria

- [ ] Existing delete/confirm alerts still look like today (`small`)
- [ ] Large recap almost fills the screen; both color modes
- [ ] Header has expand-all + more-options only
- [ ] Bottom Finish still finishes and opens the large recap
- [ ] More-options has Finish and Delete; Statistics hidden without stats
- [ ] Hebrew/English chrome for the new menu items and dialog title

---

## Phase 2: Time frames + duration

**User stories**: 5–9, 37–38 (duration)

### What to build

Add the `stats` collection and `session.statsId`. Completing any set while no frame is open creates/upserts stats and starts `{ from, to: null }`. Finish (including completing every set) sets `to` and opens the recap with **real duration** (sum of closed frames). Finish then lift again the same day appends another frame. Client does not invent duration from the rest timer.

### Acceptance criteria

- [ ] First done set on a session creates stats and `statsId`
- [ ] Finish closes the open frame; recap duration matches wall time of those frames
- [ ] Completing the last set also closes the frame and opens the recap
- [ ] Finish → more work → finish again: duration is the sum of both windows
- [ ] Statistics menu item appears once `statsId` exists and reopens the recap with the same duration
- [ ] Trainer viewing a trainee session uses the same GET

---

## Phase 3: Hardness + accuracy

**User stories**: 15–28, 45–46

### What to build

GET recap includes workout (and later per-exercise) actual RPE and accuracy %. Install `react-gauge-component`; one wrapper, `size` big|small, Radial Elastic, short elastic motion, token colors, three bands. Big gauge next to duration with % inside. Accuracy is expected vs actual (40/40/20, jump stages, 4-jump decay, RIR midpoints, rescale if a field is missing). Needle is hardness; % is not labeled as RPE-only.

### Acceptance criteria

- [ ] Big gauge needle sits in Easy/Working/Hard from actual RPE (RIR converted)
- [ ] Center % is 100% when weight, reps, and RPE/RIR all match expected
- [ ] Near-misses get partial credit via jumps (not 1 kg = 1%)
- [ ] Planned 8 kg vs 9 kg uses the 1–10 stage (1 kg jump); 200 vs 201 uses a heavy stage
- [ ] Accuracy label/text is not dyed by the hard/red arc
- [ ] Light and dark mode use theme tokens; no demo neon
- [ ] Missing expected RPE still scores from weight/reps (rescaled)

---

## Phase 4: Rest of the recap

**User stories**: 20, 30–36, 39

### What to build

Fill the recap: volume vs plan, sets done, vs last time this workout under the big gauge. Exercise list: image, marquee name, small gauge, accuracy beside the small gauge, absolute PR badges (`weight` / `volume`, both if two). Aggregation on GET: all-time heaviest / highest-volume done set for each session exercise; PR if that set’s date is this session; first-time exercise counts. Same recap for trainer view.

### Acceptance criteria

- [ ] Three numbers under the big gauge: volume vs plan, sets done, vs last (omit vs last if none)
- [ ] Each exercise row has image, marquee title, small same-component gauge, % beside it
- [ ] Weight and volume PRs use different badges; both show when both apply
- [ ] Heaviest done set in history on this session date → weight PR; same for set volume
- [ ] New exercise this session can PR
- [ ] Closing and reopening from more-options matches finish (computed on read)

---

## Phase 5: Live-session fixes

**User stories**: 40–44

### What to build

Add set and Add exercise on an active session save immediately (no debounce). Weight/reps/RPE/RIR picker edits stay debounced. Exercise Details loads graph and sets table even when the exercise was flagged `isNew` at search time. Adding mid-session still writes the workout so the next Edit routine includes the exercise.

### Acceptance criteria

- [ ] Add set persists without changing page
- [ ] Add exercise persists without changing page
- [ ] Spinning the weight picker still does not hit the API on every tick
- [ ] First-time exercise logged from a live session shows sets on Exercise Details graph and table
- [ ] That exercise still appears on the next Edit routine
- [ ] Recap still includes that exercise’s sets after finish
