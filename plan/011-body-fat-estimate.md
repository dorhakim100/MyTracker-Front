# Plan: Body Fat Estimate from Photo

> Source PRD: approved in chat (grill-me + write-a-prd + prd-to-plan)

## Architectural decisions

- **Routes (frontend):** No new route; feature on `/user` via `BodyFatCard` in carousel.
- **Routes (backend):** `POST /api/body-fat/estimate`; later CRUD for history.
- **Schema (backend, Phase 3):** `BodyFatEstimate { userId, createdAt, weightKg, imageUrl, bodyFatMin, bodyFatMax, note }`.
- **Key models:** `BodyFatResult` discriminated union on frontend.
- **Auth:** Same session/cookie as `httpService`.
- **Third-party:** Frontend → Cloudinary; Frontend → Backend → Gemini.

---

## Phase 1: Frontend mock (tracer bullet) — IN PROGRESS

**User stories:** 1–11, 17–19

### What to build

End-to-end UI on User page: pick photo → compress upload to Cloudinary → editable pre-filled weight → submit → mocked `bodyFatService` → result/error + disclaimer.

### Acceptance criteria

- [x] `BodyFatCard` on User page carousel
- [x] Upload with compression transforms
- [x] Weight pre-fill from `user.lastWeight`
- [x] Mock service (success / unusable via `VITE_BODY_FAT_MOCK_SCENARIO`)
- [x] Loading and error states
- [x] Disclaimer footer
- [x] en/he i18n

---

## Phase 2: Backend + Gemini proxy

**User stories:** 17–18, 7–9

### Acceptance criteria

- [ ] `POST /body-fat/estimate` on MyTracker-Back
- [ ] Real Gemini structured JSON
- [ ] Frontend wired to real API
- [ ] No Gemini key in frontend

---

## Phase 3: Persistence + history

**User stories:** 12–13, 16

### Acceptance criteria

- [ ] Estimates persist per user
- [ ] History UI with thumbnails
- [ ] Trainee context if applicable

---

## Phase 4: Polish and hardening

**User stories:** 14–15, 10

### Acceptance criteria

- [ ] Retake after unusable photo
- [ ] Native camera on Capacitor
- [ ] Polished empty/error copy
