# Plan: Item unit flow

> Source PRD: [prd-item-unit-flow.md](./prd-item-unit-flow.md)

## Architectural decisions

- **Routes**: no new URL. Item details, barcode scanner, meal editor, and the standalone playground stay where they are. Nested meal preview is a half slide on top of details. Meal edit is a full slide with the existing meal editor.
- **Key models**: optional `unit: 'g' | 'ml'` on Item, copied onto MealItem and Log at add time. Missing unit displays as `g`. Meal documents do not store `unit`; the client derives it — `ml` only if every nested item is `ml`, otherwise `g`. Macros stay per 100 of that unit; no density conversion. `searchId` on custom items is a string.
- **Services / store**: no new Redux module. Reuse item save/create, get-by-searchId, log save, meal save, barcode scanner, existing playground admin list/save. Classifier is a small shared helper used by playground, one-shot write, and OFF/USDA ingest.
- **Back**: mongoose `unit` on Item and Log (optional enum). Temporary bulk-set-units admin endpoint for the catalog pass, then delete that endpoint. Do not use apply-catalog (it deletes foods).
- **Git split**: playground workstream (schema, classifier, playground UI, one-shot write) goes into the **staging area**. App flow (labels, scanner miss, custom editor, meal preview/edit, dock cleanup) stays **unstaged working changes**. Do not mix in one add.
- **Libraries**: MUI + existing CustomMui, SlideDialog half/full, BarcodeScanner, EditMeal. No new package, no second UI kit.
- **i18n / theme**: colocated eng/heb on the components that own new copy. Colors from tokens / CSS vars. Dark via `html.dark-mode`.
- **Dock**: serving / servings / meal / FAB stay visually where they are. Only the show/hide rules are cleaned up.

---

## Phase 1: Unit schema and playground review

**Git**: staged

**User stories**: 4, 9–12, 15 (schema part), 36 (partial)

### What to build

Item and log can persist `unit`. The standalone playground gains a unit control and All / g / ml / Unsure filters. Unsure is “no unit”. A curator can open live items, set g or ml, and save. The classifier exists here (drinks category + drink keywords → ml; unsure buckets omit unit; else g) so later phases reuse it. The app does not have to show ml labels yet.

### Acceptance criteria

- [ ] Saving an item with `unit` `'g'` or `'ml'` round-trips through Mongo
- [ ] Items without unit stay valid and still list
- [ ] Playground can filter All / g / ml / Unsure
- [ ] Setting unit in the playground editor and saving updates live
- [ ] Classifier returns ml / g / omit on a known drink, a solid, and an oil/sauce-style name

---

## Phase 2: One-shot classify, then remove bulk API

**Git**: staged

**User stories**: 8, 13, 14

### What to build

Run a one-shot admin write that sets confident units on the live catalog and leaves unsure items without unit. After the write succeeds, delete the bulk endpoint. Keep the Item and Log `unit` fields. Playground Unsure is the leftover queue.

### Acceptance criteria

- [ ] Confident drinks in the live DB have `unit: 'ml'`
- [ ] Confident solids have `unit: 'g'`
- [ ] Unsure foods have no unit and show in the playground Unsure filter
- [ ] The bulk-set admin endpoint is gone
- [ ] Later playground/item saves still persist `unit`

---

## Phase 3: Unit through logging and labels

**Git**: unstaged changes

**User stories**: 1–7, 35 (ingest)

### What to build

Logging and meal-building copy `unit` onto the meal line and the log. Missing unit displays as grams. A meal’s own label uses the derived rule (all nested ml → ml, else g). Item details serving extra and per-100 copy, and the meal editor amount line, switch g/ml. Serving preset numbers stay. New OFF/USDA saves run the classifier. Goal protein/carb/fat “grams” are unchanged.

### Acceptance criteria

- [ ] A drink shows ml on serving extra and per-100 copy
- [ ] A solid still shows g
- [ ] Adding to diary or a meal stores that item’s unit on the line/log
- [ ] A meal of only ml items labels as ml; one g (or missing) item makes the meal g
- [ ] Serving preset numbers are unchanged
- [ ] A newly ingested drink with a drink name/category gets ml when confident

---

## Phase 4: Scanner miss → custom with searchId

**Git**: unstaged changes

**User stories**: 16–18, 25

### What to build

A barcode scan that finds nothing invites adding a custom item. The sheet opens as custom with `searchId` set to the scanned string. Typed search empty state stays as it is. Try-again can remain secondary.

### Acceptance criteria

- [ ] Unknown barcode opens custom item details with that code as `searchId`
- [ ] Saving the custom item stores `searchId` as a string
- [ ] Scanning the same code later finds that custom item
- [ ] Typed search with no results is unchanged
- [ ] Hebrew and English invite copy live on the owning component

---

## Phase 5: Owner custom editor

**Git**: unstaged changes

**User stories**: 19–24, 26, 38

### What to build

The owner of a custom item can edit name, photo, categories, macros per 100, unit (default g), and searchId. Save item writes the catalog document and does not log. The floating button still adds or updates a log. SearchId can be typed or filled from a scan (code only, no product lookup). Duplicate searchId is rejected. Scanner-miss create uses this same editor with searchId prefilled. Non-owners cannot edit the food, only log amount and meal.

### Acceptance criteria

- [ ] Owner can change name/photo/categories/macros/unit and Save item without logging
- [ ] FAB still adds/updates a diary log
- [ ] Typing or scanning searchId saves it as a string
- [ ] A searchId that already belongs to another item is rejected
- [ ] Non-owner custom items stay read-only except serving/meal
- [ ] New custom items default to g

---

## Phase 6: Meal nested preview and Edit meal

**Git**: unstaged changes

**User stories**: 27–31

### What to build

Opening a meal still logs it from item details. The owner gets Edit, which opens the existing meal editor in a full slide and saves through the existing meal save path. Nested foods are tappable: a half slide shows item details with no controls, using that line’s meal values (amount, macros, unit), not the catalog 100g item. Clicking a line inside the meal editor (with controls) stays as today.

### Acceptance criteria

- [ ] Logging a meal from details still works
- [ ] Owner Edit opens the existing meal editor; save updates the meal
- [ ] Tapping a nested food opens a half sheet with no serving/meal/FAB
- [ ] Nested sheet numbers match the meal line, not the catalog baseline
- [ ] Non-owners do not get Edit
- [ ] Meal-editor item click still edits serving as today

---

## Phase 7: Item details dock cleanup

**Git**: unstaged changes

**User stories**: 32, 33

### What to build

Same dock placement. Replace the inline show/hide maze with named rules for meal, nested meal line, custom, fixed-menu, and read-only. Resolve leftover conflict markers while in this sheet. Compact serving / servings / meal / FAB still sit where they do now.

### Acceptance criteria

- [ ] Serving, servings, meal, and FAB are in the same place as today
- [ ] Meals still hide serving size; fixed-menu still hides the same controls as today
- [ ] Read-only details still have no dock
- [ ] No conflict markers in the details sheet
- [ ] Light/dark and Hebrew still look correct on the dock
