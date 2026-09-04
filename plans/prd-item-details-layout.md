## Problem Statement

Item details is a compact sheet: a 60px thumbnail, name, one kcal line, and two views of the **same** macros (donut + banners) side by side. The add action is a full-width button at the bottom. That layout does not scale once the sheet has to show a real food photo, category, per-100g facts, and how this log hits today’s macros. Adding food then feels cramped, the two macros views are not distinct, food categories have no badge language (exercises already do for muscle groups), and a scrolling sheet would bury the add action. Custom logs also cannot carry a photo or categories, so they never look like real foods in browse.

## Solution

Item details becomes a scrolling food sheet in the same visual family as exercise details: a large square photo, favorite on the image (always readable), category badges, name and calories, then two **different** macros views — **per 100g** vs the existing **day-progress** donut — one primary, one small, swapped with a CustomSelect. The preferred primary is stored in IndexedDB; opening from a nutrition category always starts on per 100g. Serving / servings / meal stay as they are and still only drive the log and day-progress side. A new themed floating button stays on screen to add or update the log. Meals list nested items. The creator of a custom log can set its image and categories. Item cards get the same favorite-on-photo contrast treatment.

## User Stories

**Must-have**

1. As a user, I want a large square food photo at the top of item details, so that the sheet feels like a real food page, not a cramped row.
2. As a user, I want tapping the photo to open the existing image lightbox, so that I can inspect it without a new viewer.
3. As a user, I want the favorite heart on the photo, so that favoriting stays one tap and does not compete with the title.
4. As a user, I want that heart readable on light, dark, or busy photos, so that I never lose the control.
5. As a user, I want the same readable favorite overlay on item cards in category browse, so that search cards and details feel like one product.
6. As a user, I want food category badges under the photo (same language as muscle-group badges), so that I can see what kind of food this is at a glance.
7. As a user, I want no badge row when the item has no categories, so that empty chrome does not show.
8. As a user, I want the localized name under the badges, so that long names still marquee like today.
9. As a user, I want calories per 100g (or per serving for meals) as the subtitle, so that the identity block is the food’s baseline, not the scaled log.
10. As a user, I want two macros versions — per 100g vs how this log lands on today’s distribution — so that I can judge both the food and the day.
11. As a user, I want one version primary (the existing macros donut) and the other small (the macros banners), so that they are visually distinct.
12. As a user, I want a CustomSelect to choose which version is primary, so that I can switch view without a hidden toggle.
13. As a user, I want that choice remembered on this device (IndexedDB), so that the next open matches how I like to look at food.
14. As a user, I want opening an item from a nutrition category to show per 100g as primary even if I usually prefer day progress, so that browse is about the food.
15. As a user, I want changing the select after a category open to still save my preference, so that the next non-category open uses it.
16. As a user, I want edit-log and edit-meal entry to keep starting on item macros (today’s `shouldDefaultItemMacros`), so that those flows do not suddenly show day progress.
17. As a user, I want serving size, number of servings, and meal to keep today’s defaults (100g, 1 serving, current meal) and today’s controls, so that logging muscle memory is unchanged.
18. As a user, I want changing serving or servings to update the day-progress view and the log that will be saved, not the per-100g facts, so that the two versions stay honest.
19. As a user, I want the day-progress switch removed, so that both versions are always on screen and the select is the only view control.
20. As a user, I want a floating add button that stays visible while I scroll, so that I can log without hunting for a footer.
21. As a user, I want that button to add a new log or confirm an existing log edit (add vs check), so that create and update stay obvious.
22. As a user, I want no floating button on read-only details, so that Progress and `noEdit` do not offer a fake action.
23. As a user, I want enough space at the bottom of the sheet that serving controls are not trapped under the floating button, so that I can still change amount.
24. As a user, I want a meal to list its nested foods (name + kcal), so that I know what I am logging.
25. As a user creating a custom log, I want to set a photo (placeholder until I upload), so that my custom food looks like other items.
26. As a user who created a custom log, I want to change its photo later, so that I can fix a missing or wrong image.
27. As a user who created a custom log, I want to toggle category badges, so that it can show up in browse the same way catalog food does.
28. As someone who did not create that custom log, I want image and categories read-only, so that I cannot overwrite someone else’s food.
29. As a user, I want custom-log name and macros editing to keep working as today, so that a quick custom entry is still possible without a photo.
30. As a developer, I want a shared floating button primitive with the same props as the existing custom button, so that FABs stay on-theme for every favorite color and light/dark.
31. As a Hebrew-locale user, I want new chrome (view-by labels, badge names, add tooltip, custom-log upload) in the feature’s own eng/heb locals, so that copy is not dumped into a central file.

**Nice-to-have**

32. As a user, I want a short enter animation on the sheet content, so that the new layout feels alive without delaying the add tap.
33. As a user with reduced motion, I want that motion shortened or skipped, so that the sheet stays calm.
34. As a user without a daily goal, I want the primary donut to fall back to this log’s macros and the select to hide or disable day progress, so that the sheet does not show a broken preview.
35. As a user, I want tapping a nested meal item to stay display-only in this slice, so that we do not nest another details sheet yet.

## Implementation Decisions

- Rewrite the item-details sheet in place. Same consumers (search, barcode, logged list, edit meal, favorites, progress). Same add/update handlers and default edit values. Do not fork a second details component.
- Hero follows exercise details: full-width square cover photo, 8px radius, tap opens the existing image dialog. Favorite overlays the photo (top-end). A small circular scrim behind the heart keeps contrast in both color modes; item cards reuse that overlay, not the whole details layout.
- New category badges mirror muscle-group badges: tinted pill, light/dark token pair, sizes s/m/l, wrap row. Colors come from the existing item-category color map. Labels from existing category i18n keys. Unknown category ids are skipped.
- Macros pair: primary is always the existing macros donut; small is always the macros banners of the other view. Header row holds a CustomSelect (per 100g vs day progress), same idea as exercise “view by”.
- Per 100g reads the item’s baseline macros. Day progress keeps the existing preview helper and donut props (including beyond-macros warning). Serving size / servings / meal only change `editItem.totalMacros` and therefore the day-progress / save payload.
- View preference: new IndexedDB record via the existing IndexedDB service (device-only, same pattern as recent searches). Do not use the prefs `showDayProgress` switch on this screen; leave that prefs field in place but stop reading/writing it from item details. Category browse passes the existing “default to item macros” flag. Edit-log / edit-meal keep passing it. Changing the select always writes IndexedDB.
- Remove the iOS day-progress switch. Both macros versions stay visible; the select only swaps which is primary.
- New CustomMui floating button: wrap MUI Fab, accept the same props as CustomButton (text, icon, onClick, size, variant, tooltip, disabled, className, vibrate, etc.). Text → extended Fab; otherwise circular. Accent via favorite-color class and existing solid-accent / chrome mixins so every picker color and `html.dark-mode` work. Click animation + light vibrate like CustomButton. The primitive does not own page position; item details pins it bottom-end in the sheet and adds scroll padding. Hidden when `noEdit`. Add icon for new log; check icon for update.
- Meal nested items: simple list (name + kcal) under the macros block. Not a second details navigation in this slice.
- Custom log (new or `source` custom): keep name input. If the current user is the creator (new log counts as theirs; existing uses `createdBy` already written on save), show photo placeholder + edit control and tappable category badges. Upload through the existing Cloudinary upload service (same as profile). Persist `image` (already on log) and `categories` on the log. Non-creators see read-only badges and photo. Do not show popularity, searchTerms, or isCurated.
- Types: add `categories` (and `createdBy` if missing) on the log shape so custom-log extras round-trip on save. Item `categories` already exist for catalog food. No new Redux module.
- Libraries: MUI Fab + existing CustomMui, MacrosDonut, Macros, CustomSelect, FavoriteButton, SlideDialog, upload service, IndexedDB service, item-category config, BodyPartBadge as visual reference. No second UI kit, no new packages.
- Styling: component SCSS, CSS variables / tokens, dark overrides with `html.dark-mode`. New user-facing strings colocated on the components that own them.
- Motion: short, CSS-only; respect reduced motion. Favorite overlay is contrast, not decoration.

## Testing Decisions

No automated tests unless explicitly requested.

Manual check: search / barcode / category browse / edit log / custom log / meal / `noEdit`; per-100g vs day-progress select and IDB remember; category browse fallback; favorite contrast on details and cards in light and dark; FAB add/update and hidden when read-only; custom-log image + categories for creator only; nested meal items; Hebrew + both color modes.

## Out of Scope

- Redesigning serving-size / servings / meal controls or changing default values
- Nested navigation into a meal’s child items
- Showing internal fields (popularity, searchTerms, isCurated)
- Inferring categories for Open Food Facts / USDA products
- Removing `showDayProgress` from global prefs or the prefs screen
- Replacing ItemCard with the full details layout (favorite scrim only)
- New UI kits, new upload providers, or backend browse-API work beyond persisting log image/categories/`createdBy`
- Automated tests / Storybook unless requested

## Further Notes

The wow moment is opening a food from browse and seeing a large photo, category badges, honest per-100g facts, and today’s macros impact at the same time — then logging with one floating tap.

**Libraries:** MUI Fab via a new CustomFloatingButton (CustomButton’s props + existing accent mixins). Existing MacrosDonut, Macros, CustomSelect, FavoriteButton, IndexedDB service, Cloudinary upload service. No new package.

**Entry overrides for primary macros:** IndexedDB preference, except nutrition-category browse and existing `shouldDefaultItemMacros` callers, which open on per 100g / item macros.
