---
name: start
description: >-
  Kick off work when the user says start, kickoff, kick off, or begin
  planning. A small bug fix or small feature skips the PRD and plan and is
  implemented directly. Larger work runs grill-me, then write-a-prd, then
  prd-to-plan in order.
disable-model-invocation: true
---

# Start — Planning Pipeline

Decide the path **before** opening any planning skill. Do not start grill-me until the size check is done.

## Size check

**Small** when the task is a small bug fix or a small feature. All of these are true:

- One existing screen, component, or function
- The outcome is already clear
- It follows a pattern already in the code
- No new user flow, data model, or product decision

Examples: a wrong value, a broken condition, a label, a one-place tweak that reuses what is already there.

**Full pipeline** when any of these are true:

- New screen, flow, or domain concept
- A user-facing decision is still open
- The change spans multiple areas
- You are not sure it is small

The user can override. "This is small" uses the small path. "Plan this" uses the full pipeline.

## Small path

Skip the PRD and the plan.

- Do not read or run grill-me, write-a-prd, or prd-to-plan
- Do not write a PRD or a file in `./plans/`
- Say in one sentence why it is small and what will change
- Implement it. Read the always-on skills first
- Ask only when one missing fact would change the change

## Full pipeline

Run the three planning skills **in order**. Do not skip ahead. Do not merge steps into one response dump.

```
Task Progress:
- [ ] 1. grill-me
- [ ] 2. write-a-prd
- [ ] 3. prd-to-plan
```

### Step 1 — grill-me

Read and follow `.cursor/skills/grill-me/SKILL.md` fully.

Stay in grill-me until the user confirms shared understanding (or explicitly asks to move on). Then mark step 1 done.

### Step 2 — write-a-prd

Read and follow `.cursor/skills/write-a-prd/SKILL.md` fully.

Use grill-me outcomes as input. Produce the PRD file. Get user confirmation. Then mark step 2 done.

### Step 3 — prd-to-plan

Read and follow `.cursor/skills/prd-to-plan/SKILL.md` fully.

Use the PRD from step 2. Produce the phased plan in `./plans/`. Get user approval on phase breakdown before writing the final plan file.

## Rules

- One skill at a time — finish each before starting the next
- Announce transitions briefly: "Moving to write-a-prd" / "Moving to prd-to-plan"
- If the user already has a PRD or answers, adapt — still follow each skill's process, skip only redundant interview questions
- After the plan exists, stop. Do not start implementation unless the user asks
- The small path does not produce a plan. Implement it in the same turn
- During planning, also follow `reuse-libraries` (MUI first, small libs OK, no alternate UI kit)
- During this pipeline, also respect `conventions`, `senior-ux`, `animation-guidance`, and `testing` when they become relevant later — not during planning beyond library choices
