# Plan: Weight statistics

> Source PRD: `plans/prd-weight-statistics.md`

## Flow

For the developer. Read this section. Everything below is for the agent.

A person can open weight statistics, scroll their days, log measurements and a photo, estimate body fat, clear a field, and delete a day. A trainer can do the same for the trainee on screen.

1. Logged days open from the timeline icon, with the chart above the list.
2. A day opens, and its measurements can be saved or cleared.
3. A progress photo can be added, replaced, or removed.
4. Body fat can be estimated from that photo and applied to the day.
5. All days include empty ones, and the day can be deleted.

- The chart range does not filter the list.
- A day stays on the logged list until every field is cleared or the day is deleted.
- The profile weight changes only when today’s record changes. Health sync runs only for yourself, and only for today.

---

## Architectural decisions

- **Routes**: no new app routes and no new bottom-nav tab. Statistics and day details are full-screen slides. Details opens on top of statistics. Closing details returns to statistics.
- **Who**: the person on screen is `traineeUser` when one is selected, otherwise the signed-in user. Every read and write uses that id. Health sync runs only when that id is the signed-in user.
- **Day boundary**: the UTC day the diary already uses. Start is `YYYY-MM-DDT00:00:00.000Z`, end is `YYYY-MM-DDT23:59:59.999Z`. A new record’s `createdAt` is the start of that day. An edit does not change `createdAt`.
- **One record per day**: the latest record whose `createdAt` falls in that UTC day. A save updates it. A first save creates it. Older duplicates in the same day are left in place and are not shown.
- **Weight model**: `userId` and `createdAt` stay required. `kg` is no longer required. Optional fields, omitted when empty, never stored as null: `kg`, `waistCm`, `bodyFat`, `neckCm`, `chestCm`, `armsCm`, `hipsCm`, `thighCm`, `calfCm`, `imageUrl`. No note field.
- **Logged**: a record exists and at least one of those optional fields is set. Clearing the last one deletes the record.
- **lastWeight**: still derived on user read as the newest record by `createdAt`. The client updates the person on screen in memory when today’s record is saved or removed. Newest remaining record, or clear it when none remain. Do not write the trainer’s own `lastWeight` while a trainee is on screen. `optimisticUpdateUser` sets the signed-in user only; a trainee update goes through `setTraineeUser`.
- **Profile card**: shows kilograms when the selected day has `kg`, otherwise the existing empty label. The weight picker opens on the latest record that has `kg`, otherwise 60.
- **Health**: `healthService.saveWeight` only when viewing yourself, the day is today, and a kilogram value was just saved. Delete and clear do not call it.
- **List paging**: page size 30, newest first. Logged mode pages records. All-days mode pages calendar days from today back to the earliest record’s UTC date, and merges in the records for that window. No records at all means all-days shows only today.
- **Chart**: the existing weight chart and its range controls. They do not receive the list filter. A chart point does not open a day. The chart inside the statistics slide does not show another timeline icon.
- **Entry**: the timeline icon on the weight card opens statistics and no longer opens the picker. The update-weight button still opens the picker. The trainer view, which shows the chart and not the card, gets the same timeline icon on that chart.
- **Estimate**: existing `POST` body keeps `userId`, `imageUrl`, and `weightKg`. Optional `measurements` is added only when at least one circumference is set: `waist`, `neck`, `chest`, `arms`, `hips`, `thigh`, `calf`, numbers in centimeters, no nulls, no body fat, no photo URL. `weightKg` stays required on this call. The prompt string is unchanged when `measurements` is absent. When present, append one short line: `Measurements in cm, use them if present: ` plus the JSON object. Use the prompt the live estimate call already sends. Do not edit the unused older prompt copy.
- **Photos**: canonical URL is `imageUrl` on the weight. Reuse the existing body-fat upload compression. The file input accepts `image/*` and does not set `capture`, so the device can offer the camera or the library. Replace and clear call the existing Cloudinary destroy by delivery URL. A failed estimate does not destroy the image. The nightly body-fat purge skips any URL still stored on a weight.
- **Apply**: optional callback on the result screen. Midpoint is `Math.round(((min + max) / 2) * 10) / 10`, saved as `bodyFat`. The existing body-fat card does not pass the callback. The note is not stored.
- **Picker**: existing clock picker, unchanged. Steps of 0.1. Weight 30–150. Body fat 3–60, empty start 20. Circumferences: waist 40–160 start 80, neck 20–60 start 38, chest 60–160 start 100, arms 15–60 start 35, hips 60–160 start 95, thigh 30–100 start 55, calf 20–60 start 38. Empty start is the saved value when there is one.
- **Trash**: a small danger icon button (error color, same family as the existing delete button). A field trash shows only when that field has a value, clears immediately, and does not confirm. The header trash shows only when a record exists, uses the existing confirm dialog (cancel and a danger delete), and is only on the details slide.
- **Services / store**: extend the weight service and the body-fat estimate. No new Redux module. Slide state stays local. New copy lives in the feature’s colocated English and Hebrew locals. Reuse existing weight and body-fat strings when they already say the right thing. Dark mode through `html.dark-mode` and tokens. Exported feature components use `withSuspense`.
- **Libraries**: MUI and existing CustomMui. No new UI kit. No automated tests.
- **Out of scope in every phase**: a bottom-nav route, opening a day from the chart, restoring or redesigning the old body-fat card, deleting a health sample, deleting a day from the list or the card, any unit other than kilograms and centimeters, storing the estimate note.

---

## Phase 1: Logged day list

**User stories**: 1, 2, 3, 4 (logged only), 12

### What to build

The timeline icon on the weight card opens a full-screen statistics slide for the signed-in user. The same icon on the trainer chart opens it for the trainee. The slide shows the existing weight chart, full width, with its current controls, then a table of logged days.

The table is one row per UTC day, newest first, using the latest record in that day. Columns are the date (same Hebrew date format the weight card already uses), kilograms, and body fat. Body fat is a dash in this phase. A missing weight is a dash. Rows are not tappable and have no chevron yet. Infinite scroll loads 30 days at a time. The chart keeps loading its own range. There is no logged/all select yet.

The weight list call gains optional `skip` and `limit`. Callers that omit them, including the chart, still receive the full range they ask for.

Copy is in the slide’s English and Hebrew locals. Light and dark mode use the app tokens.

### Acceptance criteria

- [ ] The card’s timeline icon opens statistics. The update-weight button still opens the picker.
- [ ] The trainer chart has the same icon and opens the trainee’s days. The chart inside statistics has no second icon.
- [ ] Changing the chart range does not change the table.
- [ ] The table shows saved days only, newest first, date and weight, a dash when weight is missing, a dash for body fat.
- [ ] Scrolling loads the next page. The chart’s existing load still returns every point in its range.
- [ ] English, Hebrew, light mode, and dark mode match the rest of the app.

---

## Phase 2: Day measurements

**User stories**: 5, 6, 9 (field trash, not the photo and not the whole day), 10, 11

### What to build

A row is tappable, shows a chevron, and opens the details slide for that UTC day. The header is the translated date label on one side and the date value on the other. Under it, the measurement rows in this order: weight (kg), waist (cm), body fat (%), neck, chest, arms, hips, thigh, calf. No photo section yet. An empty value is a dash. There is no AI button yet.

Tapping a row opens the existing picker with the ranges in Architectural decisions. Confirm saves that field immediately onto the day’s record. The field trash appears only when the value is set, clears that field immediately, and leaves the other fields. If the clear removes the last stored field, the record is deleted and the details slide stays open as an empty day. The logged list drops that day.

`kg` is optional. A save finds the latest record in that UTC day and updates it, or creates one with `createdAt` at UTC midnight. The update sets or unsets only the field that changed. The quick picker still sends kilograms only and must not clear measurements.

Saving or clearing today’s record refreshes `lastWeight` for the person on screen: the saved record, or the newest remaining record, or nothing if none remain. An older day does not change `lastWeight`. The weight card’s date picker follows the same rule. Health sync runs only for yourself, only for today, and only when kilograms were saved.

The details slide can also be opened for today from the list once a record exists. Creating the first field from a logged row is enough for this phase. Empty days are phase 5.

### Acceptance criteria

- [ ] A row opens details and shows a chevron. Closing details returns to the list.
- [ ] Each measurement saves from the picker and shows the value with its unit. An empty field is a dash.
- [ ] The field trash clears only that field. Clearing the last field removes the day from the logged list and leaves details open and empty.
- [ ] A day with a waist and no weight stays on the logged list. The weight cell is a dash.
- [ ] Saving an older day does not change the profile weight. Saving today does. Deleting today’s last field falls back to the newest remaining record.
- [ ] Health sync runs only for your own weight, and only for today.
- [ ] The quick picker still updates kilograms and does not erase other fields.

---

## Phase 3: Progress photo

**User stories**: 7, 9 (photo trash)

### What to build

Details gains a progress-photo block under the date header and above the measurements. The empty state is an image input with an icon and a short caption. It accepts images only and offers the camera or the library.

Uploading saves `imageUrl` on that day’s record and creates the record if needed. A second upload destroys the previous Cloudinary file, then saves the new URL. The photo’s own danger trash destroys the Cloudinary file and clears `imageUrl` only. Body fat and the other fields stay. If the photo was the last field, the record is deleted as in phase 2.

A failed body-fat estimate no longer destroys the uploaded image. The nightly purge skips URLs that a weight record still holds. Clearing or replacing the photo is what deletes the file.

### Acceptance criteria

- [ ] A day can be saved with only a photo. It stays on the logged list.
- [ ] A new photo replaces the old one, and the previous Cloudinary file is removed.
- [ ] The photo trash removes the file and the field. Body fat stays if it was set.
- [ ] A failed estimate does not delete a photo that is still on the day.
- [ ] The nightly purge does not delete a photo that is still on a weight.

---

## Phase 4: Body-fat estimate

**User stories**: 8

### What to build

The body-fat row shows a small AI icon button when `imageUrl` is set. Pressing it with no `kg` shows the existing invalid-weight error and does not call the API. Pressing it with a photo and a weight calls the existing estimate with `weightKg` and, when any are set, `measurements` for waist, neck, chest, arms, hips, thigh, and calf. Omit empty measurements entirely.

The result screen accepts an optional apply callback. Apply saves the midpoint to one decimal as `bodyFat`, closes the result, and leaves the note unsaved. The existing body-fat card is unchanged and does not pass the callback. An unusable photo or an error writes nothing.

The prompt gains the one trailing line only when measurements are sent.

### Acceptance criteria

- [ ] The AI button is visible only after a photo is saved.
- [ ] Without a weight, the button does not call the API and shows the existing error.
- [ ] A call with no circumferences sends the same prompt as today, plus `weightKg`.
- [ ] A call with a waist and a neck sends only those two measurements, in centimeters, and the prompt mentions them in one short trailing line.
- [ ] Apply stores the midpoint to one decimal. Failure stores nothing. The old estimate card still only displays the result.

---

## Phase 5: Empty days and delete

**User stories**: 4 (all days), 9 (header trash), 10

### What to build

Above the table, the existing select offers logged days and all days. Default is logged. Switching reloads the table from the first page.

All days lists every UTC day from today back to the earliest record, newest first, 30 days at a time. Days with no record show dashes and are tappable. Opening one shows empty details. The first save creates the record. When the user has no records, all days shows only today.

The details header shows a danger trash only when a record exists. It opens the existing confirm dialog. Confirm destroys the Cloudinary photo if there is one, deletes the record, closes details, and refreshes the list. If that day was today, `lastWeight` becomes the newest remaining record, or is cleared when none remain. Cancel leaves the day as it was.

There is still no delete on the list or on the weight card.

### Acceptance criteria

- [ ] The select defaults to logged. All days shows empty days back to the first saved day, and only today when nothing is saved.
- [ ] An empty day opens details. Saving one field adds it to the logged list.
- [ ] The header trash is absent on an empty day. Confirm deletes the record and its photo and returns to the list.
- [ ] Cancel does not change the day.
- [ ] Deleting today updates the profile weight to the newest remaining day, or shows no weight when none remain.
