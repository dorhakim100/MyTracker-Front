---
name: conventions
description: >-
  Required before implementing any code in this repo. Enforce this repo's
  React/TypeScript frontend conventions: folder structure, nested single-consumer
  components and custom hooks, colocated i18n locals (eng/heb), withSuspense
  exports, dark mode (html.dark-mode + MUI ThemeModeSync), SCSS, CustomMui,
  services, Redux, coding style, and reuse-existing-first. Use when creating or
  editing components, pages, services, store modules, styles, types,
  translations, theming, or scaffolding features.
---

# Frontend Conventions

Follow the structure and patterns described below. Speed matters — reuse first, but do not over-abstract.

## Stack

- React + TypeScript + Vite
- SCSS (component styles + `src/assets/styles/main.scss`)
- MUI as primary UI library
- Redux (legacy `createStore` + combineReducers) for app state
- `http.service` + domain services for HTTP
- CustomMui wrappers for repeated MUI + app logic
- i18next — colocated `locals/eng.json` + `locals/heb.json` per component
- Prettier (see `.prettierrc`) — match repo formatting, do not invent style

## Coding style

- No semicolons in TS unless necessary
- Single quotes in TS/JS; single quotes in JSX/TSX attributes (Prettier)
- Event handlers named `onSomething`
- Class names kebab-case
- Root element of a component uses a `container` class (e.g. `app-header-container`)

## Folder structure

```
src/
  components/<Name>/          # shared / multi-consumer feature components
    <Name>.tsx
    styles/<Name>.scss
    locals/
      eng.json                # English copy for this cmp only
      heb.json                # Hebrew copy for this cmp only
      index.ts                # registerLocals(ns, { eng, heb })
    <Child>/                  # ONLY if Child has exactly one consumer: this parent
  CustomMui/<Name>/           # MUI wrappers with shared app logic
    <Name>.tsx
    styles/<Name>.scss
  pages/<Name>/               # route-level pages (same cmp folder pattern)
    <Name>.tsx
    styles/<Name>.scss
    locals/eng.json + heb.json + index.ts
    <Child>/                  # page-only children live under the page
  services/<domain>/          # *.service.ts
  services/http.service.ts
  services/i18n/register-locals.ts
  i18n.ts                     # i18next init (eng / heb)
  theme/tokens.ts             # SINGLE SOURCE OF TRUTH for colors
  theme/appTheme.ts           # MUI theme — imports from tokens.ts
  assets/styles/setup/variables.scss  # imports generated CSS vars from tokens
  assets/styles/setup/_tokens.generated.scss  # AUTO — npm run theme:vars
  components/ThemeModeSync/   # syncs prefs → html.dark-mode + MUI setMode
  store/actions/              # *.actions.ts
  store/reducers/             # *.reducer.ts
  store/store.ts
  types/<domain>/<Type>.ts
  hooks/
  lib/withSuspense.tsx        # Suspense export HOC
  assets/styles/main.scss     # imports all SCSS
  assets/routes/
```

## Components

- Every component gets its own folder
- Every component folder has `styles/` with a SCSS file — even if empty for now
- Import that SCSS from `src/assets/styles/main.scss`
- Prefer existing components / CustomMui before creating new ones

### Suspense export (required for feature cmps + pages)

Every exported feature component / page is wrapped with `withSuspense` from `src/lib/withSuspense.tsx`.

```tsx
function HomeComponent(props: HomeProps) {
  // ...
}

export const Home = withSuspense(HomeComponent)
```

Parent (consumer) may pass suspense controls **alongside** the component's real props:

| Prop | Type | Default | Meaning |
|------|------|---------|---------|
| `isSuspense` | `boolean` | `true` | Wrap in `<Suspense>`; `false` renders the cmp directly |
| `fallback` | `ComponentType<{ size?: FallbackSize }>` | `Spinner` (MUI) | Fallback component while suspended |
| `fallbackSize` | `'s' \| 'm' \| 'l' \| 'xl'` | `'m'` | Passed to the fallback as `size` |

```tsx
<Home />
<Home fallbackSize='l' />
<Home isSuspense={false} />
<Home fallback={MyLoader} fallbackSize='xl' someData={data} />
```

Rules:

- Implement the UI as an inner function (`NameComponent`); export `const Name = withSuspense(NameComponent)`
- `withSuspense` strips `isSuspense` / `fallback` / `fallbackSize` / `isLoading` before forwarding props to the inner cmp
- `withSuspense` always renders a stable `.with-suspense-container` shell (loading fallback and content swap inside it) so theme transitions stay aligned
- When a parent owns chrome (border/background), keep that chrome **outside** the suspense-wrapped child so loading does not unmount the transitioning surface
- Default fallback is `src/CustomMui/Spinner/Spinner.tsx`
- Do **not** wrap low-level CustomMui primitives (`CustomButton`, `Spinner`, etc.) — only feature `components/` and `pages/` (and nested feature children that are exported)
- Optional: pair with `React.lazy` for code-splitting; `withSuspense` accepts lazy components

### Locals (i18n) — colocated

User-facing strings live **next to the component**, not in a central locales dump.

```
<Name>/
  locals/
    eng.json
    heb.json
    index.ts
```

Rules:

- Language codes / filenames: `eng` and `heb` only
- Namespace = component name (e.g. `AppHeader`, `Home`)
- `locals/index.ts` calls `registerLocals(ns, { eng, heb })` from `services/i18n/register-locals`
- Component imports `./locals` (side-effect + ns export) and uses `useTranslation(ns)`
- Nested single-consumer children get their **own** `locals/` under their folder
- Do not put feature copy in a global JSON file; keep strings with the UI that owns them
- Shared chrome strings may live on the owning shell component (e.g. `AppHeader`)

### Single-consumer nesting (required)

When creating a new component and you are **absolutely sure** it has only one consumer:

- Place it **under the parent folder**, not in top-level `src/components/`
- Keep the same folder shape: `<Child>/<Child>.tsx` + `styles/<Child>.scss`
- Import the child SCSS from `main.scss` as usual

Example:

```
src/pages/Home/
  Home.tsx
  styles/Home.scss
  locals/
    eng.json
    heb.json
    index.ts
  HeroBanner/
    HeroBanner.tsx
    styles/HeroBanner.scss
    locals/
      eng.json
      heb.json
      index.ts
```

When a nested component or a custom hook gains a second consumer, **promote** it to `src/components/` / `src/hooks` (or `CustomMui/` if it is a reusable MUI wrapper). Do not nest under a parent if reuse is likely.

## Styling

- MUI is the main UI library
- Do not style MUI primarily via inline `sx` / HTML style props for shared look — use SCSS (and CustomMui) unless a one-off exception is clearly better
- Prefer CSS/SCSS for both regular elements and MUI overrides
- Define shared tokens in `assets/styles/setup/` (generated) — see color SSOT below

### Colors — single source of truth

**Edit colors only in `src/theme/tokens.ts`.**

| Consumer | How it gets colors |
|----------|--------------------|
| MUI | `appTheme.ts` imports `colorTokens` |
| SCSS / CSS vars | `_tokens.generated.scss` via `npm run theme:vars` (also on `dev` / `build` / Vite plugin) |
| Runtime dark mode | `ThemeModeSync` toggles `html.dark-mode` which remaps the same CSS vars |

Do **not** hardcode hex colors in `appTheme.ts`, `variables.scss`, or component SCSS. Use CSS vars (`var(--primary-color)`) or Sass aliases (`$primary-color`). After changing `tokens.ts`, regenerate (`theme:vars`) if Vite is not already running.

### Dark mode (required)

Single source of truth for mode: `prefs.isDarkMode` in Redux (`systemModule`).
Single source of truth for color values: `src/theme/tokens.ts`.

`ThemeModeSync` (`src/components/ThemeModeSync/ThemeModeSync.tsx`) keeps mode aligned:

1. Toggles **`html.dark-mode`** — CSS variables + SCSS (including MUI portals: Dialog, Menu, Select)
2. Calls MUI **`setMode('dark' | 'light')`** — ThemeProvider color schemes in `src/theme/appTheme.ts`

Rules:

- Toggle dark mode only via `setPrefs({ ...prefs, isDarkMode })` — persists to localStorage via `systemService`; never set `html` class or MUI mode by hand in feature code
- Theme transitions: prefer View Transitions API (fast). Fallback interpolates CSS vars on `html` only via `@property` — never `transition` on `*` / every node (that lags)
- SCSS dark overrides use **`html.dark-mode &`** (or nested under `html.dark-mode`), **not** per-component `className="dark-mode"`
- Do **not** sprinkle `prefs.isDarkMode ? 'dark-mode' : ''` on CustomMui roots — portals already inherit from `html`
- Colors/surfaces go through CSS vars (`--surface-color`, `--text-color`, `--border-color`, …) so light/dark swap automatically
- MUI palette in `appTheme` must stay derived from `tokens.ts` — never diverge
- Optional override props like `CustomSkeleton`'s `isDarkMode` are fine for edge cases; default to prefs / theme

## CustomMui

- Repeated MUI usage + app logic → wrap in `src/CustomMui/<Name>/`
- See `src/CustomMui/CustomButton/CustomButton.tsx` as the pattern
- Feature-specific UI stays in `src/components/` or under its single parent; only promote to CustomMui when reuse is real
- Available primitives: `CustomButton`, `Spinner`, `CustomOptionsMenu`, `CustomAccordion`, `CustomAlertDialog`, `CustomInput`, `CustomLinearProgress`, `CustomSelect`, `CustomSkeleton`, `CustomStepper`, `CustomToggle`
- Do **not** wrap CustomMui primitives with `withSuspense`
- Before new UI: follow `reuse-libraries` — check MUI first; suggest CustomMui when the pattern will repeat

## Services

- Place in `src/services/` (domain subfolders OK)
- Name `*.service.ts`
- Export an object of functions (not classes), e.g. `export const itemService = { query, getById, ... }`
- All HTTP goes through `http.service` (`get` / `post` / `put` / `delete`)
- Types live in `src/types/<domain>/`
- Avoid `any`; keep utilities pure in `util.service.ts` when shared

## Redux

- Module shape: `somethingModule` on root state
- Actions in `store/actions/*.actions.ts` call services then `store.dispatch`
- Reducers export action type constants + reducer function
- Register new reducers in `store/store.ts` via `combineReducers`

## Reuse-first (hackathon speed)

1. Search existing components, CustomMui, services, hooks, types
2. Check MUI / small proven libs per `reuse-libraries` before greenfield UI or deps
3. Extend what exists if it fits in < ~15 min of adaptation
4. Only create new modules when nothing close exists
5. Do not build abstractions "for later" — vertical slice for the demo first
6. Skip over-engineering: no alternate full UI libraries, no drive-by refactors

## MCPs

When GitLab / Figma / Jira are connected: pull ticket scope, designs, and existing API/contracts before inventing structure.
