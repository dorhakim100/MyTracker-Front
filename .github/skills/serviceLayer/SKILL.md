Commented lines are for now to ignore

---

name: serviceLayer
description: Creating services, data persistence, https requests, indexDB, utility functions, and business logic in this React application.

---

# Service Layer Guidelines

When creating or modifying services in this application, follow these patterns:

## File Location

- Place services in `src/services/`
- Name files with `.service.ts` suffix (e.g., `chart.service.ts`)
<!-- - Create corresponding `.test.ts` file for tests -->

## Service Pattern

Services are pure functions, not classes. Export named functions:

````typescript
// item.service.ts


## Utility Functions
Place in `src/services/util.service.ts`:
- Keep utilities pure and stateless

## Testing Services
```typescript
// item.service.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { saveItem, loadItems } from './item.service'

describe('Item Service', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should save and load items', () => {
    const item = { id: '1', name: 'Test' }
    saveItem(item)
    expect(loadItems()).toContainEqual(item)
  })
})
````

## Type Safety

- Define types in `src/types/someItem/SomeItem.ts`
- Use strict typing for all function parameters and returns
- Avoid `any` type
