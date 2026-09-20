## Problem Statement

Logging a meal from a plate or a vague description is slow. Search and barcode only help when the user already knows the exact foods and can find them. The add FAB’s Scan action opens a barcode camera, which does nothing for a homemade plate, a restaurant dish, or “burrito with chicken.” Users either skip logging or spend minutes building a custom log / meal by hand. Cloudinary space is limited, so plate photos cannot live forever.

## Solution

Replace the add FAB Speed Dial **Scan** with an **AI log** sheet: optional plate photo and/or a **multiline description in any language**. One backend call (Gemini Flash-Lite, same free setup as body fat) returns either a **meal of line items** (catalog matches + custom lines + oil when it belongs) or a **single custom log**. The user reviews and edits in existing item details (grams, macros, min–max, meal editor), then logs like today. The description is never restricted to English or Hebrew; chrome copy still follows the app language.

Usable photo → aim for a meal; if the model cannot split the plate, custom log. No usable photo → always custom log when the text is enough. Unreadable photo and useless text → “we couldn’t figure this out” and a button into normal food search. Never a dead-end error when a prompt can still guess the dish.

Macros are per 100g cooked/ready. Range is grams min/max; the initial amount is the average. Displayed totals = per 100g × grams. Calories are derived. Oil is its own ~10–20g line when the food is usually cooked in oil and the photo/text says so — not a fudge inside every macro. AI plate photos on custom AI logs are deleted after two days and the image is set to null (default placeholder). Catalog images and manual custom-log photos are untouched.

## User Stories

**Must-have**

1. As a user, I want the add FAB Scan action to open AI log instead of barcode, so that I can log a plate without hunting barcodes.
2. As a user, I want barcode scan to remain in search filter, meal editor, and item barcode field, so that product lookup still works.
3. As a user, I want a slide sheet with a plate photo picker and a **textarea** description (not a single-line field), so that I can write a real plate note with line breaks.
4. As a user, I want to describe the food in **any language** (Hebrew, English, mixed, or other), so that the app never blocks or ignores me for the language I type.
5. As a user, I want Send enabled when at least one of photo or text is filled, so that I am not blocked by an empty form.
6. As a user, I want Send disabled when both are empty, so that I do not hit the API with nothing.
7. As a user, I want a clear loading state while the estimate runs, so that I know the app is working.
8. As a user with a **usable plate photo**, I want a meal with detected foods and amounts, so that I can log the plate as real items.
9. As a user whose photo can be split, I want catalog hits filled from the database (name, image, per-100g macros) with AI grams, so that known foods stay accurate.
10. As a user whose photo has foods not in the database, I want those lines as custom items, so that the meal is still complete.
11. As a user, I want a mix of catalog and custom lines in one meal, so that a partial catalog match is still useful.
12. As a user, I want oil as its own 10–20g line when that food is usually cooked in oil and the plate looks oily or I mentioned oil, so that fat is visible and editable instead of hidden in every range.
13. As a user, I want oil matched in the catalog when possible, otherwise a custom oil line, so that I can still edit grams.
14. As a user with a usable photo that **cannot** be split into items, I want a single custom log, so that I still get something to edit.
15. As a user with **no photo or an unusable photo** and a good or vague description, I want a custom log for the whole dish, so that “burrito with chicken” is not an error.
16. As a user, I want opaque combo foods to always be a custom log, so that the model does not invent a fake ingredient list.
17. As a user with an unreadable photo **and** a useless description, I want a message that we could not figure it out, so that I am not stuck on a spinner or a generic error.
18. As that user, I want a button into normal Item Search, so that I can log the usual way.
19. As a user, I want network/Gemini outages to keep my photo and text on the compose sheet with retry, so that I do not lose the request.
20. As a user, I want the suggestion to open existing item details (meal or custom log), so that I edit with controls I already know.
21. As a user, I want to change grams, macros, name, meal slot, and line items before logging, so that a bad guess is fixable.
22. As a user on a meal suggestion, I want the existing meal editor (add, remove, swap, change amounts), so that I can fix the AI list.
23. As a user, I want every line to have grams min and grams max from the model, with the logged grams as the average, so that the API does not send a separate midpoint.
24. As a user, I want per-100g macros to be a single cooked/ready estimate (catalog or custom), so that oil is not double-counted inside the food.
25. As a user, I want min–max **totals** on each item as per-100g × grams min/max, so that I see the band in logging units.
26. As a user on a meal, I want min–max on the **whole meal** as the live sum of lines, so that editing one item updates the plate band.
27. As a user, I want calories derived from P/C/F, so that calories cannot drift from macros.
28. As a user, I want changing grams to rescale the displayed totals without forcing me to re-edit per-100g, so that “macros right, grams wrong” is one field.
29. As a user, I want per-100g still editable on custom lines, so that I can fix the food itself.
30. As a user, I want a visible “AI calculated” caption (original grams range and original per-100g) that does not change when I edit, so that I can compare my log to the guess.
31. As a user logging a custom AI dish, I want the plate photo as the hero and as `log.image`, so that the diary row shows what I ate.
32. As a user logging a meal, I want each diary row to keep the **item** image, so that chicken does not become a plate thumbnail.
33. As a user, I want AI plate photos on custom AI logs removed after two days from the log day (`image` null, default placeholder), so that Cloudinary stays within limits.
34. As a user, I want catalog images and manual custom-log photos to stay, so that cleanup does not wipe the rest of the diary.
35. As a user, I want logging to use the existing diary save path (meal → one log per line), so that progress and history stay consistent.
36. As a user, I do not want the suggestion auto-saved to my meal library, so that a one-off plate does not clutter My Meals.
37. As a Hebrew or English user, I want compose **chrome** (errors, couldn’t-figure CTA) in the app language (colocated locals), so that the sheet matches the rest of the app — this does not restrict the description language.
38. As a user, I want light and dark mode to use existing color tokens and `html.dark-mode` SCSS, so that the sheet is not a different product.
39. As a user, I want sheet open/close and loading feedback to be short and noticeable (existing slide dialog motion), so that the flow feels like other sheets.
40. As a signed-out user, I want the existing register prompt when opening add, so that AI log is not a guest back door.
41. As a developer, I want the Gemini key only on the backend, so that the client cannot leak it.
42. As a developer, I want this feature to use the same Gemini model env as body fat (Flash-Lite), so that we do not pay for a second model.
43. As a developer, I want Cloudinary AI plate uploads tagged or prefixed, so that the 2-day job can find them without touching other images.
44. As a developer, I want body-fat nightly purge left unchanged, so that physique photos keep their own lifecycle.

**Nice-to-have**

45. As a user, I want the native camera as a first-class capture option, so that logging a plate is one tap on device.
46. As a user, I want the Speed Dial icon to read as AI rather than a QR code, so that Scan is not confused with barcode.
47. As a user, I want reduced-motion to shorten sheet and loading motion, so that it stays a cue, not a show.
48. As a user, I want a named dish from the model in my UI language when possible, so that the custom log title is readable without editing.

## Implementation Decisions

### Libraries

- MUI + existing CustomMui (button, input, spinner, slide dialog). No new UI kit.
- Image compression: existing client upload helper (same as body fat), not a new library.
- Gemini: existing `@google/generative-ai` on the backend; `GEMINI_API_KEY` + `GEMINI_MODEL` (default Flash-Lite preview). No OpenAI for this flow.
- No extra range-slider widget; min–max is copy + existing macros / serving-size controls.

### Frontend conventions (repo skills)

- New feature component: own folder, SCSS in `styles/`, import from main styles, colocated `locals/eng.json` + `heb.json` + `registerLocals`, export with `withSuspense`. Nested children only if they have a single consumer.
- Dark mode via prefs → ThemeModeSync → `html.dark-mode`; colors only from theme tokens / CSS vars. No ad-hoc dark classes.
- User-facing strings only in that component’s locals, not a global dump.
- Keep implementations small and readable; no extra adapter layers “for later.”
- Do not rewrite unrelated developer-owned logic in item details; hook in with the smallest new props/settings needed for AI payload, grams band, and AI caption.
- Motion: reuse slide dialog; 150–350ms; `prefers-reduced-motion` respected if we add any new transition.

### Entry and compose

- Speed Dial Scan on the add FAB opens a full (or existing search-sized) slide dialog with the new compose component. Modal type becomes AI, not barcode.
- Description is a **textarea** (multiline MUI field; extend the existing input wrapper with `multiline` if that is smaller than a one-off). Several visible rows, line breaks allowed, `dir="auto"` so Hebrew/LTR mix without a language picker. Not a single-line search box.
- User text is accepted in **any language**. No locale filter, no “English only” validation, no rejecting Hebrew/mixed/other scripts. App chrome (placeholders, buttons, errors) still uses colocated eng/heb from the UI language.
- Compose state: optional Cloudinary URL (tagged/prefixed plate upload) + text. Send if either is non-empty.
- Upload on pick (compressed), not as a second step after Send, so Send can POST `{ imageUrl?, text? }`.
- Loading stays on the compose sheet. Success closes compose and opens item details with the payload (meal or custom). `cant_figure` stays on compose with CTA that closes AI and opens existing food search.

### Decision tree (prompt + API)

- No image or image marked unusable → `mode: custom` if text is usable; `mode: cant_figure` only when text is also useless.
- Usable image → `mode: meal` when the model can list distinct foods with gram ranges; else `mode: custom`.
- Opaque dishes (burrito, sandwich, wrap, “with chicken” and no visible parts) → `mode: custom`, never invented ingredients.
- Oil: separate item, grams min 10 / max 20 (average 15), only if that food typically uses oil **and** the photo looks oily or the text implies oil. Do not inflate every item’s macros for oil.

### Estimate API

- `POST` authenticated estimate, body `{ imageUrl?: string, text?: string }`. At least one required.
- Gemini structured JSON. Prompt must treat user text as **language-agnostic**: understand Hebrew, English, mixed, or other; never refuse or `cant_figure` only because the text is not English. Server then `search-name` per detected food (catalog names may still be EN/HE-biased; a miss is a custom line, not an error). Hit → catalog identity + per-100g from DB + AI grams min/max. Miss → custom line with Gemini per-100g (cooked/ready) + grams min/max.
- Response (conceptual):
  - `cant_figure`
  - `custom`: name, per-100g P/C/F, gramsMin, gramsMax, optional plate `imageUrl`, plus copies of the original AI fields for the caption
  - `meal`: name, plate `imageUrl`, `items[]` each with source (catalog | custom | oil), identity fields, per-100g, gramsMin, gramsMax, original AI caption fields
- No midpoint field. Client (and log) uses average grams. Calories derived from P/C/F with existing macro helpers.
- Gemini failures that are not `cant_figure`: 5xx; client retry. Do not delete a plate upload on estimate failure until we know we will not retry (on give-up, destroy like body fat does on analyze failure).

### Item details / logging

- Meal payload → existing meal shape (`type` meal, `items` as meal items with `servingSize` = average grams, `numberOfServings` 1). Custom → existing custom-log settings plus serving size (catalog pattern: per 100g + grams).
- Show min–max totals from current grams band × per-100g; meal header sums current lines live.
- Persist AI original grams/range (and custom per-100g) as read-only caption data on the in-memory suggestion only; not required on the saved log schema beyond image/macros/grams already stored.
- Log with existing log save. Meal → one log per line. Do not `save` a meal document to the user’s meal list.
- Custom AI log `image` = plate URL. Catalog meal lines keep item images. Tag plate URLs so cleanup can see them.

### Images and cleanup

- Distinct Cloudinary prefix or tag for AI plates (not the generic body-fat/user upload mix if we can avoid it).
- Daily cron (same timezone slot style as existing crons): AI plate URLs on logs older than 2 calendar days from log day → destroy in Cloudinary, set `image` to null. Frontend already falls back to default/placeholder.
- Do not change the body-fat purge-all job.

### Schema

- Prefer no new log fields if a Cloudinary prefix/tag is enough to find AI plates. If not, a boolean or `source` detail such as `ai-plate` on the log is acceptable; diary display still uses existing custom/meal/usda/off sources for matching behavior.
- No new meal-library records.

## Testing Decisions

No automated tests for this hackathon unless explicitly requested. Do not add Vitest/Storybook as part of this work.

## Out of Scope

- Replacing barcode in Item Filter, Edit Meal, or item barcode field
- AI log history, suggestion streaming, or chat-style follow-up
- Auto-saving plates into My Meals
- Changing body-fat estimate, prompt, or nightly image purge
- Paying / swapping to a non-free model
- New range-slider or dual-thumb UI
- Density conversion, raw vs cooked except “always cooked/ready” in the custom prompt
- Guest AI (same add-FAB auth as today)
- Restricting description language (English-only, Hebrew-only, or a language picker)
- Tests, Storybook, coverage

## Further Notes

- Backend branch intent (`ai-scan`) currently has no food-estimate route; copy the body-fat Gemini module (prompt, schema, fetch image as base64, structured JSON) rather than inventing a second client.
- Existing `search-name` is Mongo text search — matches can be wrong; item details / meal editor is the correction UI.
- Demo wow: FAB Scan → photo of a plate (or a sentence) → editable meal or custom log → save to diary.
- Frontend branch name `f/ai-log` matches this PRD slug.
