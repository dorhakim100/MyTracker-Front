---
name: simple-readable
description: >-
  Required before implementing any code in this repo. Keep every implementation
  as minimal and human-readable as possible. Prefer simple logic over clever or
  complex solutions. Use when writing, editing, reviewing, or refactoring any
  code in this repo.
---

# Simple & Readable

## Rule

Every implementation should be as **minimal** as possible, and as **readable to the human developer** as possible. **Simple is better than complex logic.**

## Defaults

- Smallest change that satisfies the request — no speculative abstractions
- Clear names over short names; obvious control flow over clever tricks
- Prefer straightforward functions, early returns, and flat structure
- One concern per function/module when it stays easy to follow
- Copy existing repo patterns before inventing a new style

## Prefer

- A few clear lines over a “flexible” helper used once
- Explicit `if` / early `return` over nested ternaries and dense one-liners
- Plain data + functions over unnecessary classes, factories, or indirection
- Boring, standard library / already-in-repo approaches over new dependencies

## Never write a view as a branch table

Do not render a page, screen, or section by mapping an id and picking every field with a ternary. That is a component hiding inside the parent.

```tsx
{methods.map((method) => (
  <div key={method}>
    {method === 'google' ? <GoogleIcon /> : <PhoneIcon />}
    <span>{method === 'google' ? t('googleTitle') : t('phoneTitle')}</span>
    <p>{method === 'google' ? t('googleDescription') : t('phoneDescription')}</p>
  </div>
))}
```

Move that block into its own component. The row takes props (`icon`, `title`, `description`, handlers). The parent lists each row explicitly. An `id === '...'` check belongs in the handler that does the work, not on every line of the markup.

## Avoid unless explicitly requested

- Premature generalization (“for later”)
- Extra layers (wrappers, adapters, managers) that don’t pay rent today
- Clever FP/combinator pipelines that hide what happens
- Config objects / options bags for a single call site
- Drive-by refactors while implementing a feature

## Conflict resolution

1. Correctness
2. Readability for a human teammate under time pressure
3. Minimal surface area
4. Cleverness or future-proofing — last

If two approaches work, pick the one a tired developer can understand in under 30 seconds.

## With other skills

- Still follow `respect-manual-code` — don’t “simplify” developer-owned code unless asked
- Still follow `conventions` — simplicity within the repo’s structure, not inventing a parallel one
