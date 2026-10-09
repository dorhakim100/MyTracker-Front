---
name: write-a-prd
description: >-
  Create a PRD through user interview, codebase exploration, and module design,
  then save it under ./plans/. Use when user wants to write a PRD, create a
  product requirements document, or plan a new feature.
disable-model-invocation: true
---

This skill will be invoked when the user wants to create a PRD. You may skip steps if you don't consider them necessary.

The PRD is how the developer checks that the work is heading the right way. Write it so they can read it in one pass and agree or correct it. Interview deeply; keep the file short. Implementation detail belongs in the plan, not here.

1. Ask the user for a long, detailed description of the problem they want to solve and any potential ideas for solutions.

2. Explore the repo to verify their assertions and understand the current state of the codebase. If Jira / Figma / GitLab MCPs are connected, pull relevant tickets, designs, and repo context.

3. Interview the user relentlessly about every aspect of this plan until you reach a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one-by-one. (If `grill-me` already ran in this conversation, reuse those answers — do not re-ask settled questions.)

4. Sketch out the major modules you will need to build or modify to complete the implementation. Prefer reusing existing services, CustomMui wrappers, store modules, and hooks before inventing new layers.

A deep module (as opposed to a shallow module) is one which encapsulates a lot of functionality in a simple, testable interface which rarely changes.

Check with the user that these modules match their expectations.

5. Once you have a complete understanding of the problem and solution, use the template below to write the PRD. Save it as `./plans/prd-<feature-slug>.md`. If the user asks to also open a Jira / GitLab issue, do that via MCP after the file is written. Ask the developer to read the file and confirm the direction.

Default testing stance: **no tests unless the user explicitly asks**. Reflect that under Testing Decisions.

<prd-template>

## Problem Statement

A few sentences. The problem from the user's perspective.

## Solution

A few sentences. What we will build, from the user's perspective, including the main flow.

## User Stories

A short numbered list of the flows that define the feature. Not an exhaustive catalog.

1. As an <actor>, I want a <feature>, so that <benefit>

<user-story-example>
1. As a mobile bank customer, I want to see balance on my accounts, so that I can make better informed decisions about my spending
</user-story-example>

Cover the main paths and the important exceptions. Mark must-have vs nice-to-have. Skip a story that only restates something already said above.

## Implementation Decisions

The choices the developer needs to agree with before planning. A short list:

- Modules to build or change
- Product and architecture choices that set direction

Leave schema, API contracts, interfaces, and interaction-by-interaction behavior for the plan. No file paths or code.

## Testing Decisions

Default: no automated tests unless the user explicitly requests them.

If tests are requested, list:

- A description of what makes a good test (only test external user behavior, not implementation details)
- Which user flows will be covered (Vitest + Testing Library; Storybook for UI states)
- Prior art for the tests (i.e. similar types of tests in the codebase)

## Out of Scope

A description of the things that are out of scope for this PRD.

## Further Notes

Any further notes about the feature.

</prd-template>
