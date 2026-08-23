---
name: start
description: >-
  Kick off hackathon planning by running grill-me, then write-a-prd, then
  prd-to-plan in order. Use when the user says start, kickoff, kick off,
  begin planning, or wants the full planning pipeline.
disable-model-invocation: true
---

# Start — Planning Pipeline

Run the three planning skills **in order**. Do not skip ahead. Do not merge steps into one response dump.

## Pipeline

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
- During planning, also follow `reuse-libraries` (MUI first, small libs OK, no alternate UI kit)
- During this pipeline, also respect `conventions`, `senior-ux`, `animation-guidance`, and `testing` when they become relevant later — not during planning beyond library choices
