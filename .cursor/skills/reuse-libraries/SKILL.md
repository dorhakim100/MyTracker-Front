---
name: reuse-libraries
description: >-
  Required before implementing any code in this repo. When planning features or
  creating components, check for existing reliable open-source libraries first —
  prefer MUI (and CustomMui wrappers), allow small focused libs (e.g.
  react-toastify), and avoid installing alternate full UI kits for slight
  differences. Use when planning, scaffolding cmps, picking dependencies, or
  evaluating third-party packages.
---

# Reuse Existing Libraries

## Rule

When planning, always check for existing, good, reliable open libraries.

This also applies to component creation: always check if MUI already supports what is about to be planned, or whether a minimal library (e.g. react-toastify) fits. Do **not** plan and install a whole different UI library than MUI just for a slightly different component — small, focused libraries are fine.

## Decision order

1. **Already in the repo** — existing CustomMui, components, services, hooks
2. **MUI** (`@mui/material` / icons / X if already used) — compose or theme it
3. **Small focused library** — one job, mature, maintained (toasts, DnD, charts, etc.)
4. **Custom build** — only if 1–3 clearly don’t fit

Never introduce a second general-purpose UI kit (Chakra, Ant, shadcn-as-system, etc.) alongside MUI for a minor visual or interaction difference.

## If MUI supports it

- Prefer MUI primitives + SCSS / theme tokens
- If the pattern will repeat (shared props, prefs, dark mode, i18n, app logic): **suggest adding a new CustomMui wrapper** under `src/CustomMui/<Name>/`
- Don’t wrap one-off MUI usage “just in case”

## If a new small library is the right fit

In the plan or before install, briefly cover:

1. **Why** this lib (and why not MUI / in-repo)
2. **How it’s used** — typical import, setup, core API surface
3. **Where** it plugs in (which feature / layer)

If usage is **complex or repetitive** across parts of the app: **suggest a thin wrapper** (service, hook, or small component) so call sites stay simple. Keep the wrapper minimal — don’t build a second framework around the lib.

## Reliability bar

Prefer libraries that are:

- Actively maintained / widely used
- Compatible with React + this repo’s stack
- Small enough that the cost of adding them is obvious
- Documented enough to use without guessing

Skip abandoned, huge, or duplicate-purpose packages.

## Planning output (when relevant)

When `start` / PRD / plan touches UI or deps, include a short **Libraries** note:

- MUI / existing CustomMui: yes/no + which
- Candidate small lib (if any): name + why
- Wrapper / CustomMui suggestion (if repetition is likely)

## With other skills

- `conventions` — CustomMui and services patterns for wrappers
- `simple-readable` — smallest integration; no over-wrapping
- `respect-manual-code` — don’t rip out the developer’s chosen lib without asking
- `senior-ux` / `animation-guidance` — library choice still has to look and feel intentional
