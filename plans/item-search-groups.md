# Plan: Item search groups

> Source PRD: [prd-item-search-groups.md](./prd-item-search-groups.md)

## Architectural decisions

- **Routes**: no new URL. Search stays the existing full-screen picker (FAB, diary add, meal editor, menu editor).
- **Key models**: `Item.groups` is `string[]` of nutrition enums. Multi-membership allowed. Default `[]`. Favorites and user meals are **not** group enums; they remain `user.favoriteItems` and `user.meals`.
- **Browse enums**: finalized after a full Mongo scan, then shown as an editable list before backfill. Starting candidates: Proteins, Carbs, Vegetables, Fruits, Dairy, Nuts & seeds, Fats & oils, Prepared dishes, Snacks, Beverages, Condiments, Sweets. Yours tiles (Favorites, My Meals) are UI-only.
- **Backend**: MyTracker-Back item model + index on `groups`. Paginated query: group contains + optional txt + same sort keys as today’s search. New product creates persist `groups: []`. Playground/admin can edit `groups` for the tighten pass.
- **Services / store**: item HTTP service for group query; existing search-service for global text search; no new Redux module. Group browse uses React Query infinite query (same skip/limit idea as sets). Recent searches: IndexedDB only, records keyed by user id (~8 unique strings).
- **Libraries**: MUI + existing CustomMui, SlideDialog, CustomList, FavoriteButton, ItemDetails. `@tanstack/react-query` already in the app. Custom SVGs per nutrition group. No new UI kit or icon pack.
- **UI shell**: empty query + no group selected → grouping home (search bar, recent chips, Yours, Browse). Empty query + group selected → ItemCard grid. Non-empty query → today’s CustomList search. Clearing query restores the previous browse view. Group-label match merges that group’s items into global search.
- **i18n / theme**: feature locals (eng/heb); tile colors from tokens; `html.dark-mode` only. Motion: short press + existing slide dialog.

---

## Phase 1: Clickable browse

**User stories**: 1, 2, 5, 8, 9, 11, 12, 19, 20, 21, 23, 24

### What to build

Scan the item collection, propose the enum list for approval, then persist `groups` on existing documents (ambiguous products stay `[]`). New products save `[]`. Backend can return a page of items for one group. Empty search shows a Wolt-like home: top search bar, Browse tiles with SVGs/labels. Tap a nutrition group → ItemCard grid → tap card → existing ItemDetails slide-in → back to grouping home. Global name search still works from the top bar.

### Acceptance criteria

- [ ] Enum list was reviewed after the Mongo scan and then used for backfill
- [ ] Existing items have `groups` arrays; new products persist `[]`
- [ ] Opening a nutrition group shows cards from the group API (first page is enough)
- [ ] Card tap opens ItemDetails; back returns to grouping home
- [ ] ItemCard includes FavoriteButton and is a reusable component
- [ ] Tiles have custom SVGs, localized labels, and work in light and dark
- [ ] Top-bar text search still returns today’s list behavior

---

## Phase 2: Yours and search coexistence

**User stories**: 3, 4, 6, 7, 10

### What to build

Grouping home gains a Yours section: Favorites and My Meals tiles. Those drill-ins reuse today’s lists (favorites stay drag-reorderable). Typing still runs global search; clearing the query restores grouping home or the group that was open. Nutrition tiles with zero items are hidden; empty Yours tiles still show an empty state.

### Acceptance criteria

- [ ] Favorites and My Meals are the first tiles and open the existing list UIs
- [ ] Favorite reorder still works
- [ ] Clearing the search restores the previous browse view
- [ ] Empty nutrition groups are not shown
- [ ] Empty Favorites/Meals tiles still open with an empty state

---

## Phase 3: Group power

**User stories**: 13, 14

### What to build

Nutrition group browse uses React Query infinite pagination against the group API. Inside a group, a within-group text field and the same sort options as today’s search filter the query. The top bar remains global search (Phase 2 restore still applies).

### Acceptance criteria

- [ ] Scrolling a large group loads further pages without a full catalog download
- [ ] Within-group txt and sort change the fetched results
- [ ] Top-bar typing still leaves the group into global search; clear restores the group
- [ ] FavoriteButton on cards still works while paging

---

## Phase 4: Recent search chips

**User stories**: 16, 17, 18, 26

### What to build

Successful name searches are stored in IndexedDB keyed by the signed-in user id (~8 unique strings, case-insensitive dedupe, newest first). On grouping home, chips sit under the search bar. Tap reruns the query; dismiss one or clear all. No backend. Chips are not shown inside a group or during an active text search.

### Acceptance criteria

- [ ] Chips appear on grouping home for the current user only
- [ ] A second account on the same device does not see the first user’s chips
- [ ] Tap runs that search; removing a chip / clear-all updates storage
- [ ] Duplicate queries collapse to one chip (newest)

---

## Phase 5: Group-aware search and playground

**User stories**: 15, 22

### What to build

If the global query matches a group’s English or Hebrew label, that group’s items are merged into the search list (de-duped). The item playground/admin can edit `groups` so every document can be tightened after the first mapping pass.

### Acceptance criteria

- [ ] Searching a group label (e.g. vegetable / ירקות) includes that group’s items in the list
- [ ] Name hits and group hits do not show as duplicate rows
- [ ] Playground can view and change an item’s `groups`
- [ ] A playground save is visible in Browse after refresh

---

## Optional if time

**User stories**: 25, 27, 28, 29 (partial already in Phase 1)

- Tile count badges
- Extra reduced-motion polish beyond existing dialog motion
