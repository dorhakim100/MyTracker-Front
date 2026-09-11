## Problem Statement

Every catalog item is treated as grams. Drinks still show serving size in g, per-100g copy, and “gr” on meal lines, so logging milk or juice feels wrong. Units are not on the item at all, so there is no way to review liquids vs solids in the playground.

Scanning a barcode that is not in the database or Open Food Facts is a dead end (error + try again). The custom-log path exists, but it does not keep the scanned code.

Item details controls which serving/meal fields appear are a tangle of inline conditions, even though the dock placement is fine. Nested foods inside a meal are a static list. Opening a meal cannot jump into the existing meal editor. After a custom item is saved, its owner cannot edit it or attach a barcode.

## Solution

Each item gets an optional `unit` of `g` or `ml`. Macros stay as stored (treat 100ml as 100g; no density conversion). The app copies `unit` onto meal items and logs when the user adds them. Missing unit displays as grams. A meal’s unit is not stored: the frontend derives it — `ml` only if every nested item is `ml`, otherwise `g` (a single grams item, or a missing unit, makes the meal grams).

Confident liquids are classified as `ml` (drinks category, or clear drink names in English and Hebrew). Oils, sauces, soups, yogurt, honey, and similar stay without a unit so they show up in a playground Unsure queue. A one-shot backend write fills confident units; that bulk API is removed afterward. Item and log schema fields stay.

Scanner miss opens the custom item sheet with `searchId` prefilled as the scanned string. Owned custom items become editable (name, photo, categories, macros per 100, unit, searchId via type or scan) with a Save item action separate from Add to meal. Meals keep the log sheet; the owner gets Edit into the existing meal editor; nested foods open a half-sheet read-only details with that item’s values inside the meal. Dock layout stays; only the show/hide logic is cleaned up.

## User Stories

**Must-have**

1. As a user logging a drink, I want serving size labeled in ml, so that the amount matches how I pour.
2. As a user viewing a drink, I want “per 100ml” (or the current serving in ml) instead of grams, so that the baseline facts match the unit.
3. As a user logging a solid food, I want grams to keep working exactly as today, so that existing muscle memory is unchanged.
4. As a user, I want missing unit to behave as grams, so that old items and logs do not break.
5. As a user adding a food to a meal or diary, I want that item’s unit stored on the meal line and the log, so that a later catalog change does not rewrite history.
6. As a user viewing a meal, I want its unit to be ml only when every nested item is ml, so that a mixed meal stays in grams.
7. As a user, I want serving-size presets to stay the same numbers, so that only the unit label changes.
8. As a user editing a meal, I want each line’s amount to show g or ml, so that mixed meals are readable.
9. As a curator, I want drinks and clearly named liquids auto-tagged `ml`, so that I do not hand-label the obvious set.
10. As a curator, I want oils, sauces, soup/stew, yogurt/cream, honey/syrup, dressing/mayo, and ice cream left without a unit, so that I can decide them myself.
11. As a curator, I want the standalone playground to filter All / g / ml / Unsure, so that I can work the leftover queue.
12. As a curator, I want to set g or ml on an item in the playground and save it to Mongo, so that Unsure items leave the queue.
13. As a curator, I want a one-shot classify-and-write of confident units against the live item database, so that the catalog is updated in bulk.
14. As a developer, I want that bulk-write API removed after the update, so that we do not keep a one-off admin surface.
15. As a developer, I want `unit` to remain on the item and log schemas, so that later saves do not strip the field.
16. As a user who scans a barcode with no match, I want to be invited to add a custom item, so that the scan is not a dead end.
17. As that user, I want the scanned code saved as `searchId` (string), so that the next scan of the same barcode finds my item.
18. As a user typing a search with no results, I want the empty state unchanged, so that non-barcode misses stay as they are.
19. As the owner of a custom item, I want to edit name, photo, categories, macros per 100, and unit, so that I can fix my food after creating it.
20. As the owner of a custom item, I want a Save item action, so that catalog changes do not require logging it again.
21. As the owner of a custom item, I want Add to meal / Update log to stay the floating button, so that saving the food and logging it stay two different actions.
22. As the owner of a custom item, I want to type a barcode/`searchId`, so that I can attach a code I already have.
23. As the owner of a custom item, I want to scan a barcode into `searchId`, so that I do not retype long codes.
24. As the owner of a custom item, I want a duplicate `searchId` rejected, so that I cannot overwrite someone else’s product.
25. As a user creating a custom item from a scanner miss, I want that same editor with `searchId` already filled, so that I only add name and macros.
26. As someone who did not create a custom item, I want it read-only except for logging amount and meal, so that I cannot edit another person’s food.
27. As a user opening a meal in item details, I want to still log that meal to the diary, so that the current add-meal flow stays.
28. As the owner of a meal, I want an Edit action on that sheet that opens the existing meal editor, so that I do not have to go back to Meals to change ingredients.
29. As a user looking at a meal, I want to tap a nested food and see its details, so that I can inspect what is inside the meal.
30. As that user, I want that nested sheet to be half-height and have no serving/meal controls, so that I am inspecting, not logging a second time.
31. As that user, I want the nested sheet to show the values as they exist inside the meal (amount and macros), so that I see what this meal actually contains, not the catalog 100g item.
32. As a user on item details, I want serving, servings, and meal to stay in the same dock, so that logging does not feel rearranged.
33. As a developer, I want those dock show/hide rules expressed as clear predicates, so that meal / custom / fixed-menu / noEdit cases are readable.
34. As a Hebrew-locale user, I want new copy (ml labels, add-custom invite, save item, edit meal, duplicate searchId) in each component’s eng/heb locals, so that strings are not dumped centrally.
35. As a user, I want new Open Food Facts / USDA items to get a unit when the classifier is confident, so that newly scanned drinks are ml without a playground pass.

**Nice-to-have**

36. As a curator, I want a count of unsure vs g vs ml in the playground toolbar, so that I can see how much review is left.
37. As a user with reduced motion, I want the half-sheet enter to stay in the existing short sheet motion, so that nested preview does not add a new animation language.
38. As a user, I want custom-item unit to default to g, so that creating a solid custom food needs no extra tap.

## Implementation Decisions

- Unit is optional `'g' | 'ml'` on Item, copied onto MealItem and Log at add/update time. Display helper: missing unit → `g`. Macros math stays `/ 100`. No density conversion.
- Meal unit is frontend-only. Do not persist `unit` on the Meal document. `getMealUnit(items)`: if every nested item’s unit (missing → `g`) is `ml`, the meal is `ml`; if any item is `g`, the meal is `g`. Use that for meal-level labels (not for nested lines, which keep their own unit).
- Two workstreams, kept apart in git: **playground** (classifier, standalone playground UI, one-shot Back write, Item/Log `unit` schema) goes into the **staging area**. **App flow** (ItemDetails, barcode miss, custom editor, EditMeal, labels) stays as **unstaged working changes**. Do not mix the two in one add.
- Classifier (shared by playground and ingest): `ml` if categories include `drinks` or the localized name matches drink keywords (water, juice, soda, milk, coffee, tea, beer, wine, smoothie, shake, beverage, and Hebrew equivalents). Return no unit for fatsOils, sauces, soup/stew, yogurt/cream, honey/syrup, dressing/mayo, ice cream. Everything else confident `g`.
- One-shot: Back admin bulk-set of confident units only. Then delete that endpoint. Keep mongoose `unit` on Item and Log (enum, optional). Meal nested items are Mixed objects and already persist extra fields; still type `unit` on MealItem. Do not use apply-catalog (it deletes foods).
- Playground: standalone app (not in-app ItemPlayground). Add unit control on the editor and filter All / g / ml / Unsure (`!unit`). Live save uses existing admin save. After bulk classify, leftover work is the Unsure filter.
- Labels: ItemDetails serving extra and per-100 copy switch on unit. EditMeal amount line uses the item’s unit. Same serving preset numbers. Protein/carb/fat “gram” on goal macros is unrelated and stays.
- Barcode miss: scanner only. On no product, open custom ItemDetails with `searchId` set to the scanned string. Keep try-again as a secondary path if useful; the primary invite is add custom. Typed ItemSearch empty state unchanged.
- Custom owner editor: if `type`/`source` is custom and `createdBy` is the current user, unlock name, photo, categories, macros-per-100, unit, searchId. Save item calls existing item save/create and does not log. FAB remains add/update log. SearchId input is a string; scan fills it without requiring a product lookup. Before save, `getBySearchId` — if another item already owns that id, reject. Scanner-miss create passes that searchId into create.
- Meal ItemDetails: keep log-this-meal. If the meal is the user’s, an Edit action opens existing EditMeal in a full SlideDialog; save uses the existing meal save path. Nested list items are tappable → half SlideDialog with ItemDetails `noEdit`, seeded with the nested MealItem (already scaled macros, servingSize, numberOfServings, unit). EditMeal’s own item click (with controls) stays as it is today.
- ItemDetails dock: do not move serving / servings / meal / FAB. Replace the inline null-return maze with named visible-option rules (hide serving on meals / mealId / fixed-menu as today). Resolve existing merge conflict in this file while touching it. Placement and compact dock stay.
- Ingest: when saving an OFF/USDA product, run the classifier and persist unit if confident.
- No new Redux module. No new UI kit. No new packages. Reuse SlideDialog half/full, CustomInput, CustomSelect, CustomButton, CustomFloatingButton, BarcodeScanner, EditMeal, item admin list/save.
- Old logs and meal lines without unit display as g. No backfill.

## Testing Decisions

No automated tests unless explicitly requested.

Manual check: drink vs solid labels on details and EditMeal; missing unit as g; playground Unsure queue and save; scanner miss → custom with searchId; duplicate searchId rejected; owner Save item vs FAB; nested meal half-sheet values; Edit meal from details; dock still in the same place for food / meal / custom / noEdit; Hebrew and both color modes.

## Out of Scope

- Density conversion or true volumetric macros
- Auto-ml for oils, sauces, honey, yogurt, or other unsure foods
- Typed barcode miss invite in ItemSearch
- Backfilling unit onto historical logs or meal lines
- In-app ItemPlayground (category-only admin page)
- Keeping the bulk-set-units admin endpoint after the catalog pass
- Changing serving-size preset numbers or dock visual placement
- Nested item editing from the half-sheet (editing stays in EditMeal)
- Alternate UI kits or new dependencies
- Automated tests / Storybook unless requested

## Further Notes

The wow moment is scanning an unknown bottle, saving it as a custom drink in ml with that barcode, then later tapping a meal ingredient and seeing its real amount in a half-sheet — units that match the food.

**Libraries:** MUI + existing CustomMui and SlideDialog. Existing BarcodeScanner and EditMeal. No new package.

**Sibling repo:** MyTracker-Back schema for Item and Log `unit`; temporary bulk-set endpoint removed after the write.

**Git split:** Playground + schema + classify = staged. App unit flow / ItemDetails / custom / meals = unstaged changes. Meal unit is derived on the client, never a stored field on Meal.

**Conflicts:** ItemDetails and item-categories currently have unresolved stash markers; resolve as part of touching those files, do not leave conflict markers.
