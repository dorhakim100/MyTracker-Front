# Hebrew Support Implementation Plan

## Current State Summary

### What Already Exists

- **`prefs.isEnglish`** in Redux/system store – defaults to `false` (Hebrew-first), but the language switch UI is commented out

* change the key to lang, and values will be en/he for now.

- **Hebrew weekdays** – `translateDayToHebrew()` in `util.service.ts` used for date display
- **RTL text detection** – `translateService.isLtrString()` and `hebrew-notes` / `english-notes` CSS classes for user-entered notes in ExerciseDetails and NotesDisplay
- **Hebrew locale in some places** – ` TimesContainer` uses `'he'` for time, `EditGoal` uses `'he'` for dates
- **`messages` config** – Centralized success/error strings in `assets/config/messages.ts` (English only)
- **Routes** – `title` field on each route (e.g. "Dashboard", "Food", "Workouts")

### Tech Stack

- React 19, Vite 6, Redux, MUI
- `date-fns`, `@mui/x-date-pickers` (with `AdapterDateFns`) – both support locale
- No i18n library currently installed

### Gaps

- No i18n library; strings hardcoded across 80+ components
- `index.html` has static `lang="en"`
- `LocalizationProvider` in CustomDatePicker uses no locale (date-fns defaults to English)
- `TimesContainer` uses invalid locale `'eng'` (should be `'en'`)
- Language toggle exists in prefs but is disabled; no runtime language switching

---

## Implementation Plan

### Phase 1: Foundation

#### 1.1 Choose i18n Approach

- use A

**Option A: react-i18next (Recommended)**

- Widely used, good DX, supports namespaces, lazy loading
- Integrates well with React and existing patterns
- Add `i18next`, `react-i18next`, `i18next-browser-languagedetector`

**Option B: Minimal / No Library**

- Use `prefs.isEnglish` + a simple `t(key)` wrapper over JSON translation objects
- Pros: No extra deps, full control
- Cons: No pluralization, interpolation, or future locale expansion without refactor

**Question:** Do you want full i18n infrastructure (easier to add more languages later) or a lightweight Hebrew-only solution?

- i want a full i18n support

#### 1.2 Translation File Structure

```
src/
  assets/
    locales/
      en.json      # English strings
      he.json      # Hebrew strings
```

Structure mirrors app structure or usage:

```json
// en.json
{
  "nav": { "dashboard": "Dashboard", "food": "Food", "workouts": "Workouts", "user": "User" },
  "messages": {
    "success": { "updateCalories": "Calories updated successfully", ... },
    "error": { "search": "Failed to search", ... }
  },
  "common": { "save": "Save", "cancel": "Cancel", "delete": "Delete", ... },
  "prefs": { "lightMode": "Light mode", "darkMode": "Dark mode", "hebrew": "Hebrew", "english": "English" }
}
```

#### 1.3 Re-enable Language Toggle

- Uncomment `LanguageSwitch` and `onSetPrefs('lang')` in `Prefs.tsx`
- Connect `prefs.isEnglish` to i18n `changeLanguage()` so changing prefs updates the active locale
- Persist choice via existing `systemService.setPrefs()` (already stores `isEnglish`)

---

### Phase 2: RTL Layout

#### 2.1 Document Direction

- Set `document.documentElement.dir` and `document.documentElement.lang` when language changes (Hebrew → `dir="rtl"`, `lang="he"`; English → `dir="ltr"`, `lang="en"`)
- Apply this in App root or a small `LocaleProvider` that listens to `prefs.isEnglish` / i18n language

#### 2.2 Layout and Styling

- MUI supports RTL via `createTheme` with `direction: 'rtl'` (and optionally `@mui/material/styles/styledEngine` with `CacheProvider` for RTL)
- Chakra UI also supports RTL
- Audit flexbox layouts – many use `flex-direction: row/column`; verify they look correct in RTL
- Fix invalid usage: `TimesContainer` uses `'eng'` – should use `'en'` or `'he'` based on prefs

#### 2.3 Components with Explicit Direction

- `NotesDisplay` and `ExerciseDetails` already use `hebrew-notes` / `english-notes` for user content – keep as-is; these handle mixed content per field
- `SlideAnimation`, `SlideDialog` – check if slide direction should flip in RTL
- Swipe gestures – ensure swipe left/right semantics feel correct in RTL

---

### Phase 3: Centralized Strings

#### 3.1 Migrate `messages` Config

- Replace direct `messages.success.xyz` usage with `t('messages.success.xyz')`
- Add Hebrew translations in `he.json` for all keys in `messages.ts`
- Optionally keep `messages.ts` as fallback or remove after migration

#### 3.2 Migrate Route Titles

- In `routes.ts`, replace hardcoded `title` with translation keys or `t('nav.dashboard')` etc.
- Bottom nav and any place that renders route titles will use those keys

#### 3.3 Migrate Component Strings (Incremental)

**Priority order:**

1. **High visibility**: Nav, Prefs, SignIn, main page headers
2. **User-facing actions**: Buttons (Save, Cancel, Delete), labels, placeholders
3. **Forms**: EditUser, EditGoal, EditMeal, ItemSearch, etc.
4. **Workout flow**: WorkoutSession, ExerciseEditor, SetsTable, ExerciseCard
5. **Diary/Food**: Diary, MealsCard, ItemDetails
6. **Charts/Stats**: WeightChart, Progress, MacrosProgress
7. **Less frequent**: Dialogs, tooltips, empty states

**Pattern:** Replace `"Some text"` with `t('module.key')` and add keys to both `en.json` and `he.json`.

---

### Phase 4: Dates and Numbers

#### 4.1 Date Pickers

- Wrap app (or relevant subtree) in `LocalizationProvider` with `AdapterDateFns` and `dateAdapterLocale`: `prefs.isEnglish ? enUS : he` (from `date-fns/locale`)
- Ensure `CustomDatePicker` and any other date pickers use this provider

#### 4.2 Date Formatting

- Audit all `toLocaleDateString` / `toLocaleString` / `format()` usage:
  - `TimesContainer`: fix `'eng'` → use locale from prefs
  - `EditGoal`: already uses `'he'` – make dynamic based on prefs
  - `Progress` (hebrewDate): ensure consistency with chosen locale
- Use `date-fns` `format()` with locale when available

#### 4.3 Numbers

- Hebrew locale typically uses same numerals; if you need Hebrew numerals, plan a small utility
- Chart.js and other chart libs – check if they respect locale for tooltips/labels

---

### Phase 5: Search and External Data

#### 5.1 Search

- `search-service.ts` uses `isEnglishWord()` for logic – keep for detection
- UI strings in `ItemSearch`, `ExercisesSearch` (e.g. "No results found") – migrate to `t()`

#### 5.2 Food / Exercise Data

- Backend data (product names, exercise names) may be in English or Hebrew – no change needed if displayed as-is
- If you translate food/exercise names in the future, that would be a separate project (API or client-side glossary)

---

## Questions Before Implementation

1. **i18n library**: Use `react-i18next` (full i18n) or a minimal custom `t()` + JSON approach?
2. **Default language**: Keep default as Hebrew (`isEnglish: false`) or make it English and let users opt into Hebrew?
3. **Scope**: Should we start with a few high-priority screens (e.g. nav, prefs, diary, workouts) and expand incrementally, or aim for full coverage in one pass?

- after installing the i18n library, i want you to modify hard coded html parts to support the newly added approach, even if we only have english for now. don't move to hebrew implementation until i aprove.

4. **RTL layout**: Do you want full RTL layout mirroring (menus, nav order, etc.) or mainly RTL for Hebrew text blocks (e.g. notes) as you have today?

- when we will start implementing hebrew, yes, full hebrew support to all cmps. data base data won't have translation for now.

---

## Suggested Implementation Order

1. Install i18n (if using react-i18next) and set up `en` / `he` with a minimal set of keys
2. Create a `LocaleProvider` that: sets `dir`/`lang`, syncs with `prefs.isEnglish`, provides `t()`
3. Re-enable language toggle in Prefs and wire it to i18n + prefs
4. Configure `LocalizationProvider` and date-fns locale for date pickers
5. Migrate `messages` and route titles
6. Migrate high-priority components (nav, prefs, main screens)
7. Add RTL theme/layout support and test
8. Incrementally migrate remaining components

---

## Estimated Effort

| Phase               | Effort (rough) |
| ------------------- | -------------- |
| Foundation          | 0.5–1 day      |
| RTL layout          | 0.5–1 day      |
| Centralized strings | 1–2 days       |
| Component migration | 2–4 days       |
| Dates/numbers       | 0.5 day        |
| Search/data         | 0.5 day        |

**Total:** ~5–9 days depending on scope and whether you use a library or custom solution.
