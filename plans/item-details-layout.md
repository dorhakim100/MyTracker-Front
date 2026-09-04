# Plan: Item details layout

> Source PRD: [prd-item-details-layout.md](./prd-item-details-layout.md)

## Architectural decisions

- **Routes**: no new URL. Item details stays the existing full-screen slide sheet (search, barcode, logged list, edit meal, favorites, progress).
- **Key models**: catalog items already have `categories: string[]`. Custom logs persist `image` (already on log) plus `categories`. Creator check uses `createdBy` on the log (already written on save; add to the log type if missing). No `popularity` / `searchTerms` / `isCurated` on the sheet.
- **Macros views**: two versions — **per 100g** (item baseline) vs **day progress** (existing preview + donut). Primary is always the donut; small is always the banners of the other view. Serving size / servings / meal keep today’s defaults and only change the log payload and day-progress side.
- **View preference**: IndexedDB via the existing IndexedDB service (device-only, same idea as recent searches). Nutrition-category browse and existing “default to item macros” entry points open on per 100g. Changing the select always writes IndexedDB. Stop using prefs `showDayProgress` on this screen; do not remove the prefs field.
- **Services / store**: no new Redux module. Reuse log save, day save, image fetch-on-error, Cloudinary upload, favorite handling, and the day-progress preview helper.
- **Libraries**: MUI Fab wrapped as a new CustomFloatingButton with CustomButton’s props and existing accent mixins (every favorite color + `html.dark-mode`). Category badges follow muscle-group badge language and the existing item-category color map. No new package, no second UI kit.
- **Floating action**: primitive does not own position. The sheet pins it bottom-end and adds scroll padding. Hidden when read-only. Add vs check for create vs update.
- **i18n / theme**: colocated eng/heb on the components that own new copy. Colors from tokens / CSS vars only.

---

## Phase 1: New sheet chrome

**User stories**: 1–9, 5, 20–23, 30, 31 (partial)

### What to build

The details sheet becomes a scrolling food page in the exercise-details family: large square photo, favorite overlay with a contrast scrim, category badges, name, kcal per 100g (or per serving for meals). Item cards get the same favorite-on-photo scrim. A themed floating button replaces the footer add/update so logging stays one tap while scrolling. Serving controls and today’s macros/add handlers stay as they are so the sheet is still demoable end-to-end.

### Acceptance criteria

- [ ] Opening an item shows a large square photo, badges (if any), name, and baseline kcal
- [ ] Tap photo still opens the existing lightbox
- [ ] Favorite sits on the photo and stays readable on light and busy images (details and item cards)
- [ ] Floating add/update is visible while scrolling; hidden when read-only
- [ ] Serving defaults and add/update still work as today
- [ ] Light/dark and favorite-color themes look intentional on the new chrome and the floating button

---

## Phase 2: Macros view-by

**User stories**: 10–19, 34

### What to build

The sheet shows two distinct macros versions at once. A CustomSelect chooses which is primary (donut) vs small (banners). Preference is stored in IndexedDB. Opening from a nutrition category (and existing edit-log / edit-meal default-to-item-macros) starts on per 100g; changing the select still saves the preference. The day-progress switch is gone. If day progress cannot render, the donut falls back to this log’s macros.

### Acceptance criteria

- [ ] Per 100g and day-progress are both visible and labeled; they are not two views of the same numbers
- [ ] Changing serving size updates day progress / the log, not the per-100g facts
- [ ] Select choice survives a reopen (IndexedDB)
- [ ] Category browse opens with per 100g as primary
- [ ] Edit-log / edit-meal still start on item macros
- [ ] The iOS day-progress switch is gone
- [ ] No-goal / read-only does not show a broken day-progress ring

---

## Phase 3: Meals and custom logs

**User stories**: 24–29

### What to build

Meals list nested foods (name + kcal) on the sheet. A custom log uses the same hero: the creator can upload a photo and toggle category badges; those save on the log with the rest of the custom entry. Anyone else sees image and categories read-only. Name and macros editing for custom logs stay as today. Nested items are display-only (no second details sheet).

### Acceptance criteria

- [ ] A meal shows its child items with name and kcal
- [ ] Creator can set/change custom-log photo via the existing Cloudinary upload
- [ ] Creator can toggle category badges; they persist on the log
- [ ] Non-creator cannot edit that image or those categories
- [ ] Custom-log name + macros + add/update still work without a photo
- [ ] Internal fields are not shown

---

## Optional if time

**User stories**: 32, 33

- Short enter motion on sheet content; skip or shorten when reduced-motion is set
