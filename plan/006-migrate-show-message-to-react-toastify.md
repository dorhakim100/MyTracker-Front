# Migrate Existing Show Message Logic To React-Toastify

## Goal

Replace the current `UserMsg` UI implementation with `react-toastify` for better UX and visual quality, while keeping message trigger logic and content behavior the same.

## Non-Negotiable Behavior Parity

1. Keep all existing message APIs unchanged:
   - `showUserMsg(msg)`
   - `showSuccessMsg(txt)`
   - `showErrorMsg(txt)`
2. Keep message content exactly the same:
   - same text payload (`txt`)
   - same semantic type (`success` / `error`)
3. Keep toast lifecycle behavior:
   - appears at top
   - auto-dismiss after 3000ms
   - new message replaces/overrides current visible toast
4. Keep dismiss by swipe/drag up behavior.

## New UX Requirements

1. Use `react-toastify` built-in animation/transition (no custom framer-motion entrance animation).
2. Show progress bar (visible countdown indicator) in each toast.
3. Background and visual style should follow user preferences:
   - light/dark mode
   - favorite color (`primary`, `blue`, `red`, `yellow`, `green`, `orange`, `deepPurple`, `purple`, `pink`)

## Scope

### In Scope

- `src/components/UserMsg/UserMsg.tsx` (render layer migration)
- `src/components/UserMsg/styles/UserMsg.scss` (toast theming)
- `src/services/event-bus.service.ts` (API compatibility retained, internals may route to toast)
- `src/App.tsx` (keep or adjust mounting location only if needed)
- `package.json` (add `react-toastify`)

### Out Of Scope

- Changing existing call sites across feature components
- Changing text/i18n keys
- Adding new toast types beyond `success` and `error`

## Implementation Plan

1. Add dependency:
   - Install `react-toastify`.

2. Mount one global toast container in `UserMsg`:
   - Keep `<UserMsg />` mounted from `App` as today.
   - Use one container instance app-wide.

3. Configure toast behavior to match existing logic:
   - `position`: top-centered equivalent
   - `autoClose`: `3000`
   - `draggable`: enabled
   - `draggableDirection`: vertical (`y`) to preserve swipe-up close flow
   - `hideProgressBar`: `false` (progress bar visible by requirement)
   - `closeOnClick`: `false`
   - `pauseOnHover`: `false`
   - `pauseOnFocusLoss`: `false`
   - `newestOnTop`: `true`
   - Use a stable toast id so only one user message is visible at a time.

4. Keep event-bus contract unchanged:
   - Continue listening to `show-msg` events (or route through same exported helpers).
   - No call-site migration needed.

5. Apply theme-aware styling:
   - Add class composition based on prefs:
     - mode class: `dark-mode` or light
     - color class: `favoriteColor`
     - type class: `success` / `error`
   - Style toast background/text/icon/progress bar for each mode+color combination.
   - Reuse existing palette conventions already used in app styles and `colors` config.

6. Preserve close-by-swipe-up behavior:
   - Validate vertical drag dismissal in `react-toastify`.
   - If direction handling is not strict enough, add a minimal upward-threshold guard using toast callbacks while keeping built-in transition animation.

7. Remove obsolete internals from old `UserMsg` implementation:
   - Remove framer-motion-only message drag/opacity state from `UserMsg` once parity is verified.

## Validation Checklist

1. Trigger success/error from existing screens (no call-site edits) and verify:
   - exact text content
   - correct type styling
2. Verify top placement, 3000ms auto close, and visible progress bar.
3. Verify built-in react-toastify animation is active on show/hide.
4. Verify swipe/drag-up close still works on mobile and desktop touch/trackpad.
5. Verify theme combinations:
   - light + each favorite color
   - dark + each favorite color
6. Verify only one toast at a time (new one replaces old one).
7. Run lint and fix any newly introduced issues.

## Risks

1. Swipe direction behavior can differ slightly from custom framer-motion logic.
2. Theme contrast may be inconsistent for some color + dark-mode combinations.
3. Default toast stacking must be explicitly controlled to preserve single-message UX.

## Mitigation

1. Enforce a single stable toast id and update/replace rather than stacking.
2. Add explicit class-driven styling for contrast and readability.
3. Do a quick device smoke test (mobile + desktop) focused on drag dismiss and timing.

## Acceptance Criteria

1. Existing `showSuccessMsg/showErrorMsg` callers work unchanged.
2. Content and timing behavior remain the same as current implementation.
3. Toast uses react-toastify built-in animation.
4. Progress bar is visible.
5. Toast styling respects dark/light mode and favorite color preferences.
6. Swipe-up dismiss remains supported.
