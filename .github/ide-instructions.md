# IDE Instructions

This is the source of truth for every coding agent (Cursor, Claude, Copilot, Codex, and others).

## Before implementing

**Do not write or edit application code until you have opened and followed every always-on skill below.** One-liners on this page are not a substitute for the `SKILL.md` files.

Live skills are in `.cursor/skills/`. Do **not** follow superseded `.github/skills/` names (`cmpStructure`, `styling`, `customCmps`, `serviceLayer`, `tdd`).

### Always-on — read on every implementation

1. `.cursor/skills/respect-manual-code/SKILL.md` — never auto-edit developer-written code; suggest only unless they explicitly ask to apply
2. `.cursor/skills/simple-readable/SKILL.md` — minimal, human-readable code; simple beats complex
3. `.cursor/skills/conventions/SKILL.md` — structure, i18n locals, withSuspense, dark mode, SCSS, CustomMui, Redux (replaces cmpStructure / styling / customCmps / serviceLayer)
4. `.cursor/skills/reuse-libraries/SKILL.md` — prefer MUI + small proven libs; CustomMui / thin wrappers when usage repeats
5. `.cursor/skills/senior-ux/SKILL.md` — senior UX/UI, anti-AI-slop, both color modes
6. `.cursor/skills/animation-guidance/SKILL.md` — subtle, visible motion
7. `.cursor/skills/testing/SKILL.md` — no tests unless explicitly requested

### When they apply

- User says **start** / kickoff / begin planning → `.cursor/skills/start/SKILL.md` (grill-me → write-a-prd → prd-to-plan). Do not implement until they ask.
- Grill / PRD / plan only → the matching skill under `.cursor/skills/`
- Optional older workflows (only if the user asks): `.github/skills/triage-issue`, `.github/skills/improve-codebase-architecture`

## Planning

New PRDs and plans go in `./plans/`. Numbered notes already in `plan/` are historical.

Ask questions in the plan and wait for answers before proceeding.

## Quick reminders (details in conventions)

- Prettier: `.prettierrc.json` (single quotes, no semis, jsxSingleQuote, singleAttributePerLine)
- User-facing copy: component `locals/eng.json` + `locals/heb.json` — never a central locales dump
- Feature cmps / pages: `export const Name = withSuspense(NameComponent)`
- Dark mode: only flip `prefs.isDarkMode`. `ThemeModeSync` sets `html.dark-mode` + MUI `setMode`. SCSS: `html.dark-mode &`
- Colors: edit only `src/theme/tokens.ts`

## Coding style

- No semicolons in TS unless necessary
- Single quotes in TS
- Event handlers named `onSomething`
- Class names kebab-case
- Root element uses a `container` class

## Speed

Demoable vertical slices > perfect architecture. Reuse existing modules first. No drive-by refactors.

## MCPs

Work PC has GitLab, Figma, and Jira. Prefer them for tickets, designs, and repo context before inventing.
