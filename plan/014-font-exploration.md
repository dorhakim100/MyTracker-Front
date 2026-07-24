# Font Exploration Plan

## Product context

MyTracker is a Hebrew-first nutrition + workouts tracker: dense numeric UI (calories, macros, rings, timers), teal utilitarian dashboard, MUI + SCSS, RTL via `DirectionThemeProvider`.

## Constraint

Fonts must support **Hebrew + Latin** well. Pure Latin UI fonts (Inter, Geist, Satoshi, DM Sans, Plus Jakarta) are out.

## Chosen fonts (user-selectable)

| Body class | Font | Feel |
|------------|------|------|
| `font-rubik` (default) | **Rubik** | Softly rounded geometric. Warmer fitness/wellness personality. |
| `font-heebo` | **Heebo** | Clean Roboto-family Hebrew extension. Precise, dashboard-native. |
| `font-assistant` | **Assistant** | Contemporary Hebrew UI. More refined editorial polish. |

## Implementation

1. Bundle all three variable TTFs under `public/fonts/`
2. `@font-face` + body-class CSS variables in `typography.scss`
3. `prefs.font` in IndexedDB / Redux (`system.service.ts`), default `font-rubik`
4. Preferences select in `PreferencesCard`; `App.tsx` applies the body class
5. Calorie rings keep the original SF Pro / system stack on `CircularProgress`
