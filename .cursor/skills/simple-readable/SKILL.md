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
