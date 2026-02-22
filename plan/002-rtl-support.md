# RTL Support Implementation Plan

## Implementation Status (Phase 1–3 Mostly Complete)

### Phase 1
- **DirectionThemeProvider** – Added in `main.tsx`; provides `direction: 'rtl'|'ltr'` to MUI theme based on `prefs.lang`
- **TrainerDashboard** – Theme uses `direction` from `prefs.lang`; `marginLeft`/`marginRight` replaced with `marginInlineStart`/`marginInlineEnd`
- **SlideAnimation** – Inverts `direction` when RTL so slide direction feels correct
- **Document** – `dir` and `lang` already set in `App.tsx` when language changes

### Phase 2 (CSS Audit – Partial)
- **Navigator** – Drawer `anchor={isRtl ? 'right' : 'left'}`; TrainerDashboard uses `flexDirection: row-reverse` when RTL
- **SlideDialog** – `marginLeft` → `marginInlineStart`; Typography `ml` → `marginInlineStart`
- **CustomList** – `right`, `padding-right` → `inset-inline-end`, `padding-inline-end`
- **AppHeader** – `left: 0; right: 0` → `inset-inline: 0`
- **FixedBottomNavigation** – Paper `left/right: 0` → `insetInline: 0`
- **ProfileCard** – `border-left` → `border-inline-start`
- **ExerciseCard** – `padding-left`, `border-left`, `right` → logical properties
- **EditIcon** – `right` → `inset-inline-end`
- **CustomAccordion** – `margin-right` → `margin-inline-end`
- **TraineeUserCard** – RTL flip for expand icon; hidden-state `translateX` reversed for RTL

### Phase 3 (Directional Logic)
- **SlideAnimation** – Already inverts direction for RTL ✓
- **Directional icons** – `scaleX(-1)` in RTL for DayController arrows, TraineeUserCard expand icon

---

## Current State Summary

### What Already Exists

- **Document direction** – `App.tsx` sets `document.documentElement.dir` and `lang` when `i18n.language` changes (Hebrew → `dir="rtl"`, `lang="he"`)
- **Hebrew text handling** – `ExerciseDetails` and `NotesDisplay` use `.hebrew-notes` / `.english-notes` with `direction: rtl` / `direction: ltr` for user-entered mixed content
- **i18n** – Full Hebrew translations wired via `react-i18next`; language switch in Prefs

### What's Missing for Full RTL

- **MUI theme direction** – Themes do not pass `direction: 'rtl'` to MUI
- **CssVarsProvider** – Main app uses `CssVarsProvider` without direction; MUI components won't mirror automatically
- **Logical vs physical CSS** – Many SCSS files use `left`, `right`, `margin-left`, `margin-right`, etc.
- **SlideAnimation** – Horizontal slide direction may need to flip for RTL
- **Bottom nav** – Icon order may need to reverse

* also regarding bottom navigation: the animation direction will need to be reversed as well

- **Icons** – Directional icons (chevrons, arrows) may need `transform: scaleX(-1)` in RTL

* slide animations across app should be revered at rtl

---

## Implementation Plan

### Phase 1: MUI Theme Direction

#### 1.1 Main App Theme

- **Location:** `main.tsx` uses `CssVarsProvider`; most of the app uses custom theme from `AppTheme` (inside `SignIn`) or inline components
- **Action:** Add a wrapper that injects `direction` into the theme based on `prefs.lang`:
  - When `lang === 'he'`: `createTheme({ direction: 'rtl' })` or equivalent for CssVarsProvider
  - When `lang === 'en'`: `direction: 'ltr'`
- **MUI RTL:** MUI v6+ supports `direction` in theme; components like Drawer, Tabs, List auto-mirror when theme has `direction: 'rtl'`
- **Optional:** For full RTL stylesheet flipping, add `@mui/material/styles/styledEngine` with `CacheProvider` and `createCache` from `@emotion/cache` using `stylis-plugin-rtl` – only if MUI's built-in RTL isn't sufficient

#### 1.2 TrainerDashboard Theme

- **Location:** `TrainerDashboard.tsx` – has its own `createTheme` and `ThemeProvider`
- **Action:** Make theme dynamic: read `prefs.lang` and pass `direction: prefs.lang === 'he' ? 'rtl' : 'ltr'` into `createTheme`
- **Note:** `marginLeft` in MuiTabs styleOverrides should switch to `marginInlineStart` or rely on MUI's RTL handling
- also, Navigator is attached to the left part of the dashboard, it needs to be aligned as well

#### 1.3 AppTheme (SignIn)

- **Location:** `CustomMui/shared-theme/AppTheme.tsx`
- **Action:** If used outside SignIn, ensure it receives `direction` from a parent that knows `lang`; otherwise keep as LTR if SignIn is always shown before main app (or add lang prop)

---

### Phase 2: CSS Audit – Physical to Logical Properties

#### 2.1 High-Impact Files (Explicit left/right)

| File                    | Notes                                     |
| ----------------------- | ----------------------------------------- |
| `FixedBottomNavigation` | Nav item order, icon alignment            |
| `SlideDialog`           | Slide-in direction, close button position |
| `ExerciseEditor`        | Set rows, weight/reps columns             |
| `ExerciseCard`          | Layout, expand icon                       |
| `ProfileCard`           | Avatar, content layout                    |
| `EditIcon`              | Icon position                             |
| `CustomToggle`          | Toggle track direction                    |
| `CustomList`            | Item layout                               |
| `Prefs`                 | Form layout                               |
| `GoalsCard`             | Card layout                               |
| `BarcodeScanner`        | Scanner overlay                           |
| `WeightChart`           | Chart padding, axis                       |
| `AppHeader`             | Back button, title alignment              |

#### 2.2 Replacement Strategy

- **Physical:** `margin-left`, `margin-right`, `padding-left`, `padding-right`, `left`, `right`, `text-align: left/right`
- **Logical:** `margin-inline-start`, `margin-inline-end`, `padding-inline-start`, `padding-inline-end`, `inset-inline-start/end`, `text-align: start/end`
- **Fallback:** If logical props aren't supported everywhere, use `[dir="rtl"]` / `[dir="ltr"]` overrides:

```scss
.element {
  margin-left: 1rem;
}
[dir='rtl'] .element {
  margin-left: 0;
  margin-right: 1rem;
}
```

---

### Phase 3: Components with Directional Logic

#### 3.1 SlideAnimation

- **Location:** `SlideAnimation.tsx` – uses `direction` (1/-1) for horizontal slide (left/right)
- **Action:** When `dir="rtl"`, invert the slide direction so "forward" still feels like moving right visually (which in RTL is the start side)

#### 3.2 SlideDialog

- **Location:** `SlideDialog.tsx` – slides `direction='up'` by default; check if any horizontal variant exists
- **Action:** If there's horizontal slide, ensure it flips for RTL

#### 3.3 Bottom Navigation

- **Location:** `FixedBottomNavigation.tsx`
- **Action:** In RTL, nav items are typically mirrored (first item on the right). MUI `BottomNavigation` may do this automatically with theme direction; verify and adjust order if needed

#### 3.4 Icons

- **Chevrons / Arrows:** Icons like `ChevronLeft`, `ChevronRight`, `ArrowBack` – in RTL, "back" is often to the right. Options:
  - Use `transform: scaleX(-1)` via `sx` when `dir="rtl"`
  - Or use MUI's `rtl`-aware icon variants if available

### 3.5 CustomList

- custom list uses both render right and slide logic that relies on direction instead of start or end, and it needs to be adressed

### 3.6 Slide logic

- across the app are several slide logic and renderRight action, that needs to be adressed as well, not only in CustomList

---

### Phase 4: Third-Party and Charts

#### 4.1 Chart.js (WeightChart, MacrosDonut, etc.)

- **Action:** Check if Chart.js supports RTL or mirroring; tooltips and axis labels may need manual alignment

#### 4.2 react-mobile-picker / Other Pickers

- **Action:** Verify MUI DatePicker/TimePicker RTL (already using `adapterLocale`); custom pickers may need explicit RTL handling

#### 4.3 Swiper / Carousels

- **Action:** Check `StatsCarousel` and similar; Swiper has `rtl` option

---

### Phase 5: Testing Checklist

- [ ] Switch language to Hebrew; confirm `dir="rtl"` on `<html>`
- [ ] MUI Drawer (if any) opens from correct side
- [ ] MUI Tabs, Lists, Dialogs mirror correctly
- [ ] Bottom nav order feels natural in RTL
- [ ] Slide transitions feel correct (forward/back)
- [ ] Forms (EditUser, EditGoal, EditMeal) layout correctly
- [ ] Charts and pickers display properly
- [ ] No horizontal scroll or overflow issues
- [ ] Mixed Hebrew/English text (e.g. notes) remains readable

---

## Suggested Implementation Order

1. **MUI theme direction** – Add `direction` to theme(s) based on `prefs.lang`; verify MUI components mirror
2. **TrainerDashboard theme** – Add dynamic direction
3. **CSS audit** – Replace high-impact physical properties with logical ones (or add `[dir="rtl"]` overrides)
4. **SlideAnimation** – Flip direction for RTL
5. **Bottom nav** – Verify and fix order/alignment
6. **Icons** – Add RTL flip for directional icons where needed
7. **Charts / third-party** – Address any RTL issues
8. **Full regression** – Test all main flows in Hebrew

---

## Effort Estimate

| Phase                              | Effort    |
| ---------------------------------- | --------- |
| MUI theme direction                | 0.5 day   |
| CSS logical properties / overrides | 1–2 days  |
| SlideAnimation, Nav, Icons         | 0.5 day   |
| Charts, pickers, third-party       | 0.5–1 day |
| Testing and fixes                  | 0.5–1 day |

**Total:** ~3–5 days

---

## References

- [MUI RTL guide](https://mui.com/material-ui/guides/right-to-left/)
- [MDN: Logical properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties)
- [HTML `dir` attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/dir)
