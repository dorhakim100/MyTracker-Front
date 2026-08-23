---
name: testing
description: >-
  Required before implementing any code in this repo. Default to skipping tests
  during hackathon development. When the user explicitly asks for tests, use
  Vitest and Storybook focused on user behavior flows — not unit tests of
  internals. Use when user mentions test, vitest, storybook, coverage, or asks
  to verify a flow.
---

# Testing (Hackathon Default)

## Default rule

**Do not write tests** unless the user explicitly asks.

Do not:

- Add `__tests__` / `*.test.ts(x)` / `*.spec.ts(x)` proactively
- Suggest TDD or coverage goals unprompted
- Block a feature on missing tests
- Add testing dependencies beyond what the repo already has unless asked

When implementing features, ignore Testing Decisions in PRDs that say "none" / default skip.

## When the user asks for tests

Stack:

- **Vitest** + Testing Library (jsdom) for behavior flows
- **Storybook** for UI states (default / loading / empty / error / dark) when UI-heavy

### What to test

Focus on **user-visible behavior**:

- Happy path of a critical flow (e.g. submit form → see result)
- Important error / empty states the demo might hit
- Accessibility of primary controls when relevant (role/name)

### What not to test

- Implementation details (internal state, private helpers, Redux action type strings)
- Snapshot spam
- One assertion per tiny pure util unless it is demo-critical
- Full coverage of every branch

### Patterns

```ts
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('Feature flow', () => {
  it('lets the user complete the primary action', async () => {
    const user = userEvent.setup()
    render(/* providers + component */)
    await user.click(screen.getByRole('button', { name: /save/i }))
    expect(screen.getByText(/saved/i)).toBeInTheDocument()
  })
})
```

Storybook: one story per meaningful state, not per prop permutation.

## Placement

- Colocate `*.test.tsx` near the flow under test, or under `src/**/__tests__/`
- Stories next to the component: `ComponentName.stories.tsx`

## Reminder

If unclear whether the user wants tests: **ask once**, default no.
