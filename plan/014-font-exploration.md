# Font Exploration Plan

## Product context

MyTracker is a Hebrew-first nutrition + workouts tracker: dense numeric UI (calories, macros, rings, timers), teal utilitarian dashboard, MUI + SCSS, RTL via `DirectionThemeProvider`.

Current type is fragmented: `system-ui` in `index.css`, MUI default Roboto fallbacks, unused Assistant `@font-face`, Inter named but unloaded on Sign-In, SF Pro override on CircularProgress.

## Constraint

Fonts must support **Hebrew + Latin** well. Pure Latin UI fonts (Inter, Geist, Satoshi, DM Sans, Plus Jakarta) are out.

## Chosen candidates (3 branches)

| Branch | Font | Feel |
|--------|------|------|
| `f/font-heebo` | **Heebo** | Clean Roboto-family Hebrew extension. Precise, dashboard-native, excellent for dense metrics. |
| `f/font-rubik` | **Rubik** | Softly rounded geometric. Warmer fitness/wellness personality without looking playful. |
| `f/font-assistant` | **Assistant** | Contemporary Hebrew UI (Ben Nathan / Source Sans Pro Latin spirit). More refined editorial polish. |

## Implementation (same wiring per branch)

1. Download variable (or weight range) TTFs into `public/fonts/<Name>/` + OFL license
2. Central `@font-face` + `--app-font-family` in `typography.scss`
3. Apply in `index.css` `:root`, `DirectionThemeProvider` MUI theme, `themePrimitives.ts`
4. Remove CircularProgress SF Pro override so rings inherit the app font

## Decision

User compares the three branches and picks one to keep.
