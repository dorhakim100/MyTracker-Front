# Fixed Menu Preference Implementation Plan

## Overview

Allow users to choose between the standard diary view and a fixed menu view in the food tab. The preference is stored on the user object (`isFixedMenu`), and the food tab renders different content based on this setting.

---

## Data Structures

### Menu (Fixed Menu Entity)

```ts
interface Menu {
  _id: string
  userId: string
  menuLogs: MenuLog[]
}
```

### MenuLog (per-menu-log entry)

**Resolved:** No new type needed – `menuLogs` is an array of existing `Log` type.

---

## Implementation Plan

### Phase 1: User Model & Preference Switch

#### 1.1 Extend User Type

**File:** `src/types/user/User.ts`

Add optional field:

```ts
export interface User {
  // ... existing fields
  isFixedMenu?: boolean
}
```

#### 1.2 Add Switch in PreferencesCard

**File:** `src/components/PreferencesCard/PreferencesCard.tsx`

- Add a new switch row for "Fixed Menu" (similar to Dark Mode / Language)
- Use `user` from Redux (`userModule.user`) instead of `prefs`
- On toggle: call `updateUser({ ...user, isFixedMenu: !user?.isFixedMenu })`
- Requires `useDispatch` and `updateUser` from `user.actions`
- **Resolved:** The switch affects the **viewed user** – when viewing a trainee, it updates the trainee; when viewing self, it updates the logged-in user. Uses `displayUser = traineeUser || user` and `updateUser` (extended to update traineeUser + trainees in store when applicable).

#### 1.3 Update User Service

**File:** `src/services/user/user.service.ts`

- In `update()`: add `isFixedMenu` to `userToSend` so the backend persists it
- In `saveLoggedinUser()`: include `isFixedMenu` in the saved user object

**Backend:** Ensure the user API accepts and returns `isFixedMenu`. If the backend does not support it yet, add a migration/field on the user model.

---

### Phase 2: Food Tab Conditional Rendering

#### 2.1 Option A: Route Wrapper Component (Recommended)

Create a wrapper that picks the correct component based on `user.isFixedMenu`:

**New file:** `src/pages/MyTracker/FoodTab/FoodTab.tsx`

```tsx
// FoodTab.tsx – wrapper that conditionally renders Diary or FixedMenu
export function FoodTab() {
  const user = useSelector((state: RootState) => state.userModule.user)
  const traineeUser = useSelector(
    (state: RootState) => state.userModule.traineeUser
  )
  const displayUser = traineeUser || user

  if (displayUser?.isFixedMenu) {
    return <FixedMenu />
  }
  return <Diary />
}
```

**File:** `src/assets/routes/routes.ts`

- Change the food route `element` from `Diary` to `FoodTab`

#### 2.2 Option B: Conditional Inside Diary

Alternatively, keep the route pointing to `Diary` and have `Diary` conditionally render `<FixedMenu />` when `user.isFixedMenu` is true. Simpler but mixes two concerns in one component.

---

### Phase 3: Fixed Menu Page/Component

#### 3.1 Create FixedMenu Component

**New file:** `src/pages/MyTracker/FixedMenu/FixedMenu.tsx`

- Placeholder initially: show a simple "Fixed Menu" view
- Later: fetch and display `Menu` data for the user
- Data flow: `Menu` has `userId` and `menuLogs[]`; you’ll need a `menuService` to `query`/`getById` menus

#### 3.2 Menu Service (when ready)

**New file:** `src/services/menu/menu.service.ts`

- `query(filter: { userId: string })` – get menu(s) for user
- `getById(menuId: string)` – get single menu
- `update(menu: Menu)` – save menu
- Backend endpoints: `menu`, `menu/:id`, etc.

---

### Phase 4: Types & i18n

#### 4.1 Menu Types

**New file:** `src/types/menu/Menu.ts`

```ts
export interface Menu {
  _id: string
  userId: string
  menuLogs: MenuLog[]
}

export interface MenuLog {
  // Define based on your schema (see Phase 1 question)
  _id?: string
  // ... fields
}
```

#### 4.2 Translations

**Files:** `src/assets/locales/en.json`, `src/assets/locales/he.json`

Add keys, e.g.:

- `prefs.fixedMenu`

---

## Summary Checklist

| Step                                                        | Status  |
| ----------------------------------------------------------- | ------- |
| Add `isFixedMenu` to User type                              | Done    |
| Add switch in PreferencesCard                               | Done    |
| Wire switch to `updateUser`                                 | Done    |
| Add `isFixedMenu` to user.service update & saveLoggedinUser | Done    |
| Create FoodTab wrapper (or conditional in Diary)            | Pending |
| Create FixedMenu component (placeholder)                    | Pending |
| Update routes to use FoodTab                                | Pending |
| Add Menu & MenuLog types                                    | Pending |
| Add i18n keys                                               | Pending |
| Backend: support `isFixedMenu` on user                      | Pending |
| Menu service + FixedMenu data integration                   | Future  |

---

## Open Questions

1. **MenuLog structure:** What exact fields should `MenuLog` have? (e.g. day of week, meal period, items, macros, etc.)
2. **Trainee vs User:** When a trainer views a trainee’s profile, should the "Fixed Menu" switch update the trainee’s preference or the trainer’s?
3. **Backend:** Does the user API already support `isFixedMenu`, or does it need to be added?
4. **Menu CRUD:** Will menus be created/edited in the FixedMenu view, or is there a separate flow?
