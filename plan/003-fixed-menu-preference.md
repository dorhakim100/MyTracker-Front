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
  menuLogs: Log[]  // uses existing Log type
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

#### 3.2 Menu Service

**New file:** `src/services/menu/menu.service.ts`

**Backend routes** (Menu router – same pattern as User):

| Method | Route        | Handler        | Description              |
| ------ | ------------ | -------------- | ------------------------ |
| GET    | `/`          | getMenus       | Query menus (filter)     |
| GET    | `/:id`       | getMenu        | Get menu by id           |
| POST   | `/`          | addMenu        | Create menu              |
| PUT    | `/:id`       | updateMenu     | Update menu              |
| DELETE | `/:id`       | deleteMenu     | Delete menu              |

**Note:** The routes you shared appear to be User routes. Confirm the Menu base path (e.g. `menu` → `/api/menu`) and that the above structure matches your backend.

**Service API:**

```ts
// src/services/menu/menu.service.ts
import { httpService } from '../http.service'
import { Menu } from '../../types/menu/Menu'

const KEY = 'menu'

export const menuService = {
  query,
  getById,
  save,
  remove,
  getEmptyMenu,
  getDefaultFilter,
}

async function query(filter: MenuFilter) {
  try {
    const menus = await httpService.get(KEY, filter)
    return menus
  } catch (err) {
    throw err
  }
}

async function getById(menuId: string) {
  try {
    const menu = await httpService.get(`${KEY}/${menuId}`, null)
    return menu
  } catch (err) {
    throw err
  }
}

async function save(menu: Menu) {
  try {
    if (menu._id) {
      return await httpService.put(`${KEY}/${menu._id}`, menu)
    }
    return await httpService.post(KEY, menu)
  } catch (err) {
    throw err
  }
}

async function remove(menuId: string) {
  try {
    return await httpService.delete(`${KEY}/${menuId}`, null)
  } catch (err) {
    throw err
  }
}

function getEmptyMenu(userId: string): Menu {
  return {
    _id: '',
    userId,
    menuLogs: [],
  }
}

function getDefaultFilter(): MenuFilter {
  return { userId: '' }
}
```

**MenuFilter type** (in `src/types/menu/Menu.ts` or alongside):

```ts
export interface MenuFilter {
  userId: string
}
```

---

### Phase 4: Types & i18n

#### 4.1 Menu Types

**New file:** `src/types/menu/Menu.ts`

```ts
import { Log } from '../log/Log'

export interface Menu {
  _id: string
  userId: string
  menuLogs: Log[]
}

export interface MenuFilter {
  userId: string
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
| Add Menu type + MenuFilter                                  | Pending |
| Add i18n keys                                               | Pending |
| Backend: support `isFixedMenu` on user                      | Pending |
| Menu service implementation                                 | Pending |
| Menu service + FixedMenu data integration                   | Future  |

---

## Open Questions

1. **Backend Menu routes:** The routes you shared appear to be User routes. Please confirm the actual Menu API base path and structure (e.g. `menu` vs `user/:id/menu`).
2. **Menu CRUD:** Will menus be created/edited in the FixedMenu view, or is there a separate flow?
