---
name: grill-me
description: >-
  Interview the user relentlessly about a plan or design until reaching shared
  understanding, resolving each branch of the decision tree. Use when user wants
  to stress-test a plan, get grilled on their design, or mentions "grill me".
disable-model-invocation: true
---

Interview me relentlessly about every aspect of this plan until we reach a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one-by-one. For each question, provide your recommended answer.

Ask the questions one at a time.

If a question can be answered by exploring the codebase, explore the codebase instead.

## Hackathon focus

Prioritize decisions that affect the demo:

- Who is the user and what is the one wow moment?
- What is in / out of scope for a 3-day build?
- What already exists (APIs, Figma, Jira tickets, PlainID patterns) we should reuse?
- What is the thinnest vertical slice that judges can click end-to-end?

When GitLab / Figma / Jira MCPs are available, pull context from them before asking questions those systems can answer.
