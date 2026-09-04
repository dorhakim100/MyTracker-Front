## Problem Statement

Finding food in search is still a text box plus favorites and sort. With an empty query the user only sees meals and favorite rows. There is no way to browse the catalog by food kind, even though the item collection is already large enough to browse. Items have no `groups` field, so the app cannot open “vegetables” or “proteins” as a set. Recent typed searches are forgotten. New Open Food Facts products can stay uncategorized; that gap is acceptable, but existing documents should be grouped.

## Solution

Search (the existing full-screen picker) becomes a Wolt-like browse home when the query is empty: a top search bar, recent-search chips, a **Yours** section (Favorites and My Meals tiles), then a **Browse** grid of nutrition-group tiles with custom SVGs. Tapping a nutrition group opens a paginated **ItemCard** grid (filter + sort, React Query). Tapping a card opens today’s ItemDetails slide-in. Back returns to the grouping home. Typing in the top bar still runs global search (same list as today); clearing the query restores the previous browse view. If the query matches a group’s English or Hebrew label, that group’s items are merged into the results. Each catalog item gets `groups: string[]` (multi-group allowed). Existing Mongo items are mapped; new products persist `[]`. After the first mapping pass, the playground is used to tighten every item.

## User Stories

**Must-have**

1. As a user, I want the empty-search screen to be a category grid instead of only favorites, so that I can browse food without knowing a name.
2. As a user, I want a search bar pinned at the top, so that I can type a name at any time.
3. As a user, I want typing a name to behave like today’s search (debounced results, sort, CustomList, favorites highlight), so that muscle memory is unchanged.
4. As a user, I want clearing the search to put me back where I was (grouping home or the group I had open), so that browse and search do not fight.
5. As a user, I want a Back control from a group to the grouping home, so that I can switch categories without closing search.
6. As a user, I want **Favorites** and **My Meals** as the first tiles (Yours), so that those collections stay one tap away.
7. As a user, I want Favorites to stay a reorderable list and Meals to stay today’s list, so that those flows do not regress.
8. As a user, I want nutrition groups as a second Browse section, so that catalog foods are grouped by kind, not by commerce categories.
9. As a user, I want each group tile to have a distinct SVG and readable label in English and Hebrew, so that the grid is scannable in both locales and both color modes.
10. As a user, I want empty nutrition groups hidden, so that I never tap a dead tile (empty Yours tiles still show with an empty state).
11. As a user, I want tapping a nutrition group to show item cards (image, name, macros teaser, FavoriteButton), so that browse feels different from text-search rows.
12. As a user, I want tapping a card to slide in ItemDetails, so that logging stays the same as today.
13. As a user, I want infinite pagination inside a group, so that large groups stay fast.
14. As a user, I want a within-group text field plus the same sort options as today, so that I can narrow a group without leaving it.
15. As a user, I want searching a group label (e.g. “vegetable” / “ירקות”) to include that group’s items in the global search list, so that group names work as search terms.
16. As a user, I want my last unique name searches as chips under the bar on the grouping home, so that I can rerun a query in one tap.
17. As a user, I want those recent searches stored on this device only, keyed by my user id, so that another account on the same phone does not see my history.
18. As a user, I want a chip to run that search, and a way to remove one chip or clear all, so that history stays useful.
19. As a user, I want an item to appear in more than one group when that is accurate (e.g. Greek yogurt in Dairy and Proteins), so that browse matches how I think about food.
20. As a developer, I want every existing item document to get a `groups` array from a careful collection scan, so that Browse is populated from real data.
21. As a developer, I want new `type: 'product'` items to save `groups: []`, so that Open Food Facts ingest does not invent categories.
22. As a developer, I want to tighten groups later in the item playground, so that the first mapping pass can be corrected item-by-item.
23. As a developer, I want a paginated backend query by `groups` plus txt and sort, so that the group grid is not a full-catalog download.
24. As a developer, I want ItemCard reusable outside this screen, so that other surfaces can show the same card later.

**Nice-to-have**

25. As a user, I want a count on group tiles, so that I can see how large a category is before opening it.
26. As a user, I want recent chips only on grouping home (not inside a group or during text search), so that the group grid stays clean.
27. As a user, I want reduced-motion to keep tile and dialog motion short, so that browse stays calm.
28. As a Hebrew-locale user, I want group labels, empty states, and chips from colocated or existing search locals, so that copy is not dumped into a central file beyond this feature’s locale files.
29. As a user, I want light and dark tiles to stay high-contrast, so that icons and labels remain readable.

## Implementation Decisions

- Visual reference is Wolt discover (top search, section headers, colored rounded tiles, 4-column grid). Taxonomy is nutrition groups, not Wolt commercial categories.
- **Yours** is not stored on `Item.groups`. Favorites still come from `user.favoriteItems`; meals from `user.meals`.
- Final Browse enum list is decided **after** scanning the Mongo item collection. Starting candidates (add/remove after scan): Proteins, Carbs, Vegetables, Fruits, Dairy, Nuts & seeds, Fats & oils, Prepared dishes, Snacks, Drinks, Sauces, Sweets. Present the list clearly for edit before backfill.
- `groups` is `string[]` of those enum values. Multi-membership is allowed. Browse a group = items whose array contains that enum.
- Schema: add `groups` on Item (frontend type, backend type, mongoose model) with default `[]`. Index `groups` for the paginated query.
- New products (Open Food Facts create path and backend `add`): persist `groups: []`. Do not infer groups at ingest.
- Backfill: map **all existing** collection documents. Ambiguous products get `[]` rather than a guess. Then playground pass to tighten every item.
- Group API: paginated list filtered by `groups` (contains), optional within-group `txt` (name/searchTerms), same sort keys as current search (relevance / macros high-low). Mirror playground list’s skip/limit shape; frontend uses React Query infinite query the same way sets are loaded (`useSets` pattern, skip as page param).
- Global search merge: if the trimmed query matches a group’s eng or heb label (case-insensitive, locale-aware enough for the labels we ship), fetch that group’s items and merge with today’s name search, de-duped by `searchId` / `_id`.
- ItemSearch shell: empty `txt` + no selected group → grouping home; empty `txt` + selected group → group cards; non-empty `txt` → today’s CustomList search. Selected group is client state inside the dialog.
- ItemCard: new component (image, localized name, macros teaser, FavoriteButton). Used for nutrition group results. Not used for text-search rows or Yours lists in this task.
- Recent searches: new IndexedDB store (or records) keyed by user id; keep ~8 unique strings, case-insensitive dedupe, newest first. No backend. Chips under the search bar on grouping home only.
- Icons: one custom SVG per nutrition group in frontend assets; Favorites/Meals can use existing MUI icons. Tile colors from theme tokens, not one-off hex in components. No new icon library or second UI kit.
- Libraries: MUI + existing CustomMui, SlideDialog, CustomList, FavoriteButton, ItemDetails, search-service, itemService, indexeddb.service, `@tanstack/react-query` (already in the app). No new packages unless a tiny SVG/inline helper is already in repo.
- i18n: group labels and new UI strings in the feature’s locals (eng/heb), not a central dump.
- Dark mode: `html.dark-mode` + tokens only; no hand-added dark-mode classes.
- Motion: short tile press and existing SlideDialog; no decorative grid choreography.
- No new Redux module unless existing item/user modules already need a small field; group browse lives in React Query.
- Playground/admin item editor should expose `groups` so the tighten pass is possible.
- No automated tests unless explicitly requested.

## Testing Decisions

No automated tests unless explicitly requested.

Manual check: grouping home in en/he and light/dark; Yours vs Browse; group cards paginate/filter/sort; details slide-in and back; global search unchanged; group-label merge; recent chips per user; new product has empty groups; empty Yours vs hidden empty nutrition tiles.

## Out of Scope

- Wolt commercial categories (beauty, electronics, etc.)
- Inferring groups for newly ingested products
- Replacing text-search CustomList with cards
- Changing Favorite/Meals data model or moving meals onto `Item.groups`
- Server-side recent-search history
- Count badges on tiles (nice-to-have)
- Macro-range filters beyond today’s sort
- New UI kits or icon packs
- Automated tests / Storybook unless requested

## Further Notes

The wow moment is opening Search and seeing a dense, tappable food-group grid, then a card list, then the same details sheet used to log food.

**Data caution:** mapping must be accurate. Scan the full collection, propose the enum list for approval, then backfill. Ambiguous items stay `[]`. The playground is the correction loop.

**Repos:** MyTracker-Front (UI, types, recent searches, ItemCard, React Query) and MyTracker-Back (schema, index, paginated group query, product default, catalog/playground `groups`).
