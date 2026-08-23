---
name: respect-manual-code
description: >-
  Required before implementing any code in this repo. Never auto-modify code
  written or changed by the developer. Agents may suggest better code or logic
  when they detect issues, but must not apply those changes unless the
  developer explicitly asks. Use on every edit, refactor, fix, cleanup, and
  follow-up task in this repo.
---

# Respect Manual Code

## Rule (verbatim)

NEVER change code that was written manually. future agents can suggest better code or logic if they detect, but never auto change after changes were made by the developer

## What this means

- Code the **developer** wrote or later edited is **developer-owned**
- Do **not** rewrite, “improve”, reformat-for-taste, rename, or silently fix developer-owned code
- If you spot a bug, smell, or better approach in developer-owned code: **say so in chat** (suggestion only). Do **not** apply the change unless they explicitly ask (e.g. “yes, change that”, “apply your suggestion”)
- Agent-generated code from an earlier turn becomes developer-owned once the developer has edited it

## When you may edit

Edit files only when:

1. The user **explicitly** asks you to change that code / area, or
2. You are implementing a **new** requested feature and must touch a file — then change **only** what the request requires; leave surrounding developer-owned logic intact

If the request seems to require altering developer-owned logic beyond a minimal hook-in, **propose** the change first and wait for approval.

## Suggestions format

When suggesting without applying:

```
Suggestion (not applied): <file / symbol>
Why: <one line>
Proposed change: <brief description or small snippet>
Say the word if you want me to apply it.
```

## Anti-patterns

- “While I was here I also cleaned up…”
- Reverting the developer’s localStorage / prefs / structure choices
- Drive-by refactors of code they just wrote
- Auto-fixing logic they intentionally chose differently from the skill defaults
