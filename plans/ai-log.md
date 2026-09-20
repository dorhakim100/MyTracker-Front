# Plan: AI log

> Source PRD: `plans/prd-ai-log.md`

## Architectural decisions

- **Routes**: no new app routes. Compose and review are slide dialogs from the add FAB (same place barcode scan lives today).
- **HTTP**: `POST /api/ai-log/estimate` (auth cookie, same as other APIs). Body `{ imageUrl?: string, text?: string }` — at least one required. Gemini key stays on the server.
- **Model**: same `GEMINI_API_KEY` / `GEMINI_MODEL` as body fat (Flash-Lite). Structured JSON. No OpenAI for this flow.
- **Response modes**: `meal` | `custom` | `cant_figure`. No midpoint field; grams logged = average of min/max. Calories derived from P/C/F.
- **Decision tree**:
  - No image or unusable image + usable text → `custom`
  - Unusable image + useless text → `cant_figure`
  - Usable image + detectable foods → `meal`
  - Usable image but cannot split, or opaque dish (burrito / sandwich / “with chicken” and no visible parts) → `custom`
- **Oil (prompt, not always)**: add an oil line **only** when (1) that food is typically cooked in oil **and** (2) the photo looks oily **or** the user text implies oil/fried/sautéed. Otherwise omit oil. Never add oil to every meal, never bake an oil buffer into every item’s macros. When added: grams min 10 / max 20 (average 15); catalog oil if `search-name` hits, else custom oil line.
- **Line shape**: per-100g P/C/F (catalog or cooked/ready custom) + `gramsMin` / `gramsMax`. Displayed totals = per100g × grams. Meal min/max = sum of lines.
- **Review**: existing item details (custom log or meal). Meal editor for line edits. Do not auto-save to the meal library. Diary save is existing log/day APIs (meal → one log per line).
- **Images**: AI plate uploads use a distinct Cloudinary prefix/tag. Custom AI logs store the plate on `log.image`. Catalog meal lines keep item images. After 2 calendar days from the log day, destroy that plate URL and set `image` to null. Body-fat purge job unchanged.
- **Services / store**: frontend domain `aiLog` HTTP service + types. No new Redux module; reuse item/user/day actions already used by item details. Backend estimate module copies the body-fat Gemini pattern (prompt, schema, image fetch, structured JSON) then `search-name` per detected food.
- **Compose text**: multiline **textarea** (not a single-line field). Several visible rows, line breaks, `dir="auto"` for mixed RTL/LTR. Extend the existing MUI input wrapper with multiline if that is the smaller change.
- **Description language**: **any language** is valid (Hebrew, English, mixed, other). No client validation on script/locale. Prompt must interpret whatever the user typed; never `cant_figure` or error because it is not English. Chrome copy (placeholders, buttons) still follows app eng/heb locals. Catalog `search-name` may miss non-English names → custom line, not a hard fail.
- **Libraries**: MUI + existing CustomMui and slide dialog. Existing client image compression for uploads. No new UI kit, no range-slider library.
- **UI conventions**: colocated eng/heb locals, `withSuspense` on the compose feature cmp, colors via tokens / `html.dark-mode`, smallest hook into item details for range caption + grams band.
- **Auth**: same as add FAB today (signed-in). Guests get the existing register prompt.
- **Out of scope in every phase**: barcode elsewhere, AI history, streaming, tests, paid models, changing body fat.

---

## Phase 1: Compose → custom log (mock)

**User stories**: 1–7, 20–21, 27, 35–36, 40–41

### What to build

Replace add-FAB Speed Dial Scan with an AI compose sheet (photo picker + **textarea** description). The textarea is multiline with `dir="auto"` so Hebrew, English, mixed, or other scripts type naturally — **do not** limit language. Send is enabled only if photo or text is filled. A mock estimate always returns a custom log. Open existing item details; user can edit name/macros/grams/meal and log to the diary. Do not save a reusable meal. Barcode stays on search filter, meal editor, and item barcode field.

### Acceptance criteria

- [ ] FAB Scan opens the AI sheet, not the barcode camera
- [ ] Description is a textarea (multiple rows, line breaks), not a single-line input
- [ ] Hebrew, English, mixed, or other text is accepted with no language gate
- [ ] Send disabled when both photo and text are empty; enabled when either is set
- [ ] Loading shows on the sheet, then item details opens as a custom log
- [ ] User can edit and save to the selected diary day with derived calories
- [ ] Suggestion is not added to My Meals
- [ ] Filter / meal-editor / item barcode scan still open barcode
- [ ] Signed-out add still shows the register prompt
- [ ] Sheet follows existing light/dark tokens

---

## Phase 2: Live custom estimate

**User stories**: 4, 15–16, 24, 41–42

### What to build

Wire compose to `POST /api/ai-log/estimate`. Backend calls Gemini (same Flash-Lite env as body fat). For this phase the API may always return `custom` (or `cant_figure` later). Prompt: cooked/ready, macros per 100g, grams min/max, no oil buffer in macros; **interpret user text in any language** (Hebrew included) — never fail because the description is not English. Opaque dishes still return a custom log, not an error. Client uses average grams and existing custom-log details. Plate photo uploads with the AI prefix/tag. Gemini key not in the frontend.

### Acceptance criteria

- [ ] Text-only request returns a named custom log with per-100g macros and grams min/max
- [ ] Photo + optional text works the same when the model cannot or should not split items
- [ ] Logged grams are the average of the range; calories match P/C/F helpers
- [ ] “Burrito with chicken”, Hebrew (e.g. בוריטו עם עוף), or mixed language does not 500 / empty — it is a custom log
- [ ] Non-English text is never rejected as `cant_figure` solely for language
- [ ] Outage: form keeps photo/text; user can retry
- [ ] Same Gemini env as body fat; no OpenAI call

---

## Phase 3: Meal + catalog + oil

**User stories**: 8–14, 22

### What to build

Usable plate photo: Gemini returns distinct foods with gram ranges. Server `search-name` each line — catalog hit uses DB identity and per-100g; miss is a custom line. Open item details as a meal; user edits via the existing meal editor (add/remove/swap/amounts).

Oil is **conditional in the prompt**, not a default line: only if that food is typically cooked in oil **and** the plate looks oily or the user mentioned oil/fried/sautéed **in whatever language they used**. Then one oil line at 10–20g (average 15), catalog oil if found else custom. Never append oil to grilled/dry/steamed meals or when the user said no oil. If the model cannot split a good photo, fall back to custom (phase 2).

### Acceptance criteria

- [ ] Clear plate photo opens a meal with multiple lines and detected grams
- [ ] Known foods show catalog name/image/macros; unknown foods are custom lines
- [ ] Mixed catalog + custom meal can be edited and logged as one diary row per line
- [ ] Oily / “fried” input can include a 10–20g oil line
- [ ] Dry / steamed / “no oil” / foods not usually cooked in oil do **not** get an oil line
- [ ] Unsplittable or opaque dish with a photo still becomes a custom log
- [ ] Meal is not auto-saved to the meal library

---

## Phase 4: Range, grams, AI caption

**User stories**: 23, 25–26, 28–30

### What to build

On the suggestion (meal and custom): show min–max **totals** from per-100g × grams min/max. Meal header band is the live sum of current lines. Changing grams rescales totals without forcing a macros re-edit; custom per-100g stays editable. A read-only “AI calculated” caption keeps the original grams range (and original per-100g) after the user edits.

### Acceptance criteria

- [ ] Each line shows a macros band that matches current grams × per-100g
- [ ] Meal header band updates when a line’s grams or macros change
- [ ] Initial grams are the average of min/max (no extra midpoint from the API)
- [ ] Fixing grams with “right” macros does not require re-entering P/C/F
- [ ] AI caption still shows the original estimate after edits
- [ ] Calories stay derived

---

## Phase 5: Recovery + plate photos

**User stories**: 17–19, 31–34, 37–39, 43–44  
**Nice-to-have if cheap**: 45–48

### What to build

`cant_figure` (unreadable photo **and** useless text): message on the compose sheet + button that closes AI and opens normal food search. Keep compose state on Gemini/network failure with retry.

Custom AI logs keep the plate photo on `log.image`. Meal catalog lines keep item images. Daily cleanup: AI-prefixed plate URLs on logs older than 2 calendar days from the log day → Cloudinary destroy + `image` null (default placeholder). Body-fat cleanup unchanged. Compose copy in colocated eng/heb; dark mode and short sheet motion as elsewhere.

Optional: AI-looking Speed Dial icon, native camera capture, localized dish name, reduced-motion.

### Acceptance criteria

- [ ] Garbage photo + empty/nonsense text shows couldn’t-figure + Item Search, not a dead toast
- [ ] Search CTA lands on existing food search
- [ ] Failed estimate does not wipe the form
- [ ] Custom AI diary row shows the plate for two days, then the default image
- [ ] Catalog meal rows never use the plate as the thumb
- [ ] Manual custom-log photos and body-fat images are not deleted by this job
- [ ] eng/heb strings live with the compose (and any new details copy), not a global dump
