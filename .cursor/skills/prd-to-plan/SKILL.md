---
name: prd-to-plan
description: >-
  Turn a PRD into a multi-phase implementation plan using tracer-bullet vertical
  slices, saved as a local Markdown file in ./plans/. Use when user wants to
  break down a PRD, create an implementation plan, plan phases from a PRD, or
  mentions "tracer bullets".
disable-model-invocation: true
---

# PRD to Plan

Break a PRD into a phased implementation plan using vertical slices (tracer bullets). Output is a Markdown file in `./plans/`.

The plan has two audiences:

1. **Flow** — the section the developer reads in this file. The PRD already confirmed direction. Flow is the implementation walkthrough: short enough to skim, complete enough to see the whole flow and correct it.
2. **Everything after Flow** — for the agent. As detailed as implementation needs.

After the file is written, show the developer the Flow section only. Do not paste architectural decisions or phases into chat. Tell them the rest of the file is agent instructions.

## Process

### 1. Confirm the PRD is in context

The PRD should already be in the conversation or at `./plans/prd-*.md`. If it isn't, ask the user to paste it or point you to the file.

### 2. Explore the codebase

If you have not already explored the codebase, do so to understand the current architecture, existing patterns, and integration layers. Prefer extending existing modules over greenfield.

### 3. Identify durable architectural decisions

Before slicing, identify high-level decisions that are unlikely to change throughout implementation:

- Route structures / URL patterns
- Key data models
- Auth / authorization approach
- Service boundaries (http.service + domain services)
- Redux module boundaries
- Figma / design system constraints (if Figma MCP available)
- Libraries / CustomMui (follow `reuse-libraries`: MUI first, small libs OK, no alternate UI kit)

These go in **Architectural decisions**, below Flow, so every phase can reference them. Do not put them in Flow.

### 4. Draft vertical slices

Break the PRD into **tracer bullet** phases. Each phase is a thin vertical slice that cuts through ALL integration layers end-to-end, NOT a horizontal slice of one layer.

<vertical-slice-rules>
- Each slice delivers a narrow but COMPLETE path through every layer (types, service, store if needed, UI)
- A completed slice works or is verifiable on its own
- Prefer many thin slices over few thick ones
- Order slices so the first 1–2 phases produce a clickable end-to-end path
- Agent sections may include the behavior, edge cases, and contracts needed to implement the slice
- Prefer durable decisions (route paths, schema shapes, data model names) over file paths and function names that will drift
- Do NOT add test work unless the PRD / user explicitly requested tests
</vertical-slice-rules>

### 5. Quiz the user

Present the proposed breakdown as a numbered list. For each phase show:

- **Title**: short descriptive name
- **User stories covered**: which user stories from the PRD this addresses

Ask the user:

- Does the granularity feel right? (too coarse / too fine)
- Should any phases be merged or split further?

Iterate until the user approves the breakdown.

### 6. Write the plan file

Create `./plans/` if it doesn't exist. Write the plan as a Markdown file named after the feature (e.g. `./plans/user-onboarding.md`). Use the template below.

Write **Flow** from the approved phases so it matches the breakdown. Keep it to:

- One short paragraph: what the user can do when this is done
- A numbered list, one line per phase, in build order: what becomes possible after that phase
- A few bullets only for product decisions that change that flow

If Flow needs sub-bullets, acceptance criteria, schema, or file paths, it is too long — move that into the agent sections.

The sections after Flow may be as specific as the agent needs to implement without guessing (behavior, edge cases, contracts, acceptance). Prefer durable names over file paths that will drift.

<plan-template>
# Plan: <Feature Name>

> Source PRD: <brief identifier or link>

## Flow

For the developer. Read this section. Everything below is for the agent.

<one short paragraph: what ships>

1. <phase — what becomes possible>
2. <phase — what becomes possible>

- <decision that changes the flow, only if needed>

---

## Architectural decisions

Durable decisions that apply across all phases:

- **Routes**: ...
- **Key models**: ...
- **Services / store**: ...
- (add/remove sections as appropriate)

---

## Phase 1: <Title>

**User stories**: <list from PRD>

### What to build

End-to-end behavior for this slice, in enough detail for the agent to implement it. The developer does not read this.

### Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

---

## Phase 2: <Title>

**User stories**: <list from PRD>

### What to build

...

### Acceptance criteria

- [ ] ...

<!-- Repeat for each phase -->
</plan-template>
