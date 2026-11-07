# Plan: MyTracker public site

> Source PRD: plans/prd-mytracker-site.md

## Flow

For the developer. Read this section. Everything below is for the agent.

A visitor can open the public site, read a short marketing page in their language, swipe real screenshots of the app, switch light and dark from the header, and read the privacy policy.

1. App shell — both pages open, language and theme work, and a phone uses the hamburger.
2. Home — the marketing page, the screenshots, and the short motion.
3. Privacy — the policy in both languages, with the update date and the mail link.

- The policy names only the data the app collects today. A feature that needs new data updates this page in the same release, and the date changes with it.

---

## Architectural decisions

- **Repo**: sibling of the tracker, directory name `MyTracker-Site`, at `/Users/dorhakim/Desktop/Projects/MyTracker/MyTracker-Site`. Vite + React + TypeScript. No backend, no auth, no tests.
- **Routes**: `/` is Home. `/privacy` is Privacy. Add a later page as another route. Unknown paths redirect to `/`.
- **Layout**: one shell wraps every route. The header is always visible. Page content sits under it.
- **i18n**: i18next + react-i18next + browser language detector. Supported languages `en` and `he`. Fallback `en`. Detection order `localStorage`, then `navigator`. Storage key `my-tracker-lang`. Strings live in each component's `locals/eng.json` and `locals/heb.json` and are registered on import. Hebrew sets `document.documentElement.lang` to `he` and `dir` to `rtl`. English sets `lang` to `en` and `dir` to `ltr`.
- **Theme**: one SCSS file owns the colors. Components use those variables only. Light is the default until a saved choice or `prefers-color-scheme: dark` says otherwise. The choice is stored under `my-tracker-theme` as `light` or `dark`. Dark mode is the class `dark-mode` on `html`, and that class remaps the same variables. Do not copy the tracker's favorite-color palette. Seed only the brand set: primary `#009688`, primary-dark `#00695c`, primary-darker `#004d40`, primary-light `#4db6ac`, canvas as a 7% mix of primary on white, ink `#05090a`, surface ink `#1c292a`. Dark canvas `#0b1415`, dark ink a light gray, surface ink `#c8d2d2`.
- **UI library**: MUI for the icon buttons in the header (menu, language, theme). No second UI kit. The screenshot row is CSS scroll-snap, not a carousel package.
- **Motion**: 200–300ms, ease-out, opacity plus a few pixels of translate. `prefers-reduced-motion: reduce` disables it.
- **Assets**: copy the square logo from the tracker (`public/logo-square.png`, or the copy under the Android web assets if the public file is missing). Download these README screenshots into the site and use the local files, not hotlinked GitHub URLs:
  - Dashboard: `https://github.com/user-attachments/assets/dada68b1-f8d6-44a3-b38a-fe84c8385bba`
  - Diary: `https://github.com/user-attachments/assets/d04e6305-d066-4e23-987c-aa44fa80b3d6`
  - Workouts: `https://github.com/user-attachments/assets/d6102a9b-cc69-43f3-be76-a2adaa60fec9`
  - Food search: `https://github.com/user-attachments/assets/b716ed6b-4a6c-48d1-9e8c-78afe6258592`
- **Contact**: `my.tracker.support@gmail.com` as `mailto:` on Home and at the end of Privacy.
- **Conventions**: match the tracker. Component folder, `styles/` SCSS, colocated locals, root element class ends in `-container`. Prettier as the tracker: single quotes, no semicolons, JSX single quotes. No tests.

---

## Phase 1: App shell

**User stories**: 1, 3, 4

### What to build

Create the sibling Vite app and a shell a visitor can click through in both languages and both themes.

- Scaffold React + TypeScript + Vite. Add React Router, i18next, the browser language detector, Sass, and MUI plus its required emotion packages.
- Global styles: the color variables file, Rubik from the tracker's font file (copy the variable font), page background `canvas`, text `ink`. Import component SCSS from one main stylesheet.
- Shell with a header and an outlet.
- Header, wide screen (from about 720px): square logo linking to `/`, text tabs for Home (`/`) and Privacy (`/privacy`), then a language control and a theme control. The active tab is visually distinct using the primary color. Tabs are links, not buttons.
- Header, narrow screen: logo, language, theme, and a menu button. The menu button opens and closes a panel that contains only Home and Privacy. The panel closes on navigation, Escape, and a click outside. `aria-expanded` on the button. The panel animates open and closed.
- Language control toggles `en` and `he` and persists. Theme control toggles light and dark and persists. Both work before any other content exists.
- `/` and `/privacy` each render a translated title so the routes are visibly different. `/privacy` is reachable from the header in both layouts.
- Redirect any other path to `/`.

### Acceptance criteria

- [ ] The app runs from the sibling repo and `/` and `/privacy` both render.
- [ ] Wide layout shows Home and Privacy as tabs. Narrow layout hides those tabs and opens them from the menu button.
- [ ] Switching language updates the visible strings and flips direction for Hebrew.
- [ ] Switching theme remaps the page colors, and both choices survive a reload.
- [ ] Colors used by the shell come from the variables file.

---

## Phase 2: Home

**User stories**: 1, 2, 6

### What to build

Replace the Home placeholder with the marketing page. Privacy stays the placeholder from phase 1.

- Hero: translated headline, one sentence (food diary and workouts), and the dashboard screenshot. On a narrow screen the screenshot sits under the text. On a wide screen it sits beside the text. The hero fades and rises a few pixels on enter.
- Screenshot row: diary, workouts, food search, in that order. Horizontal scroll-snap. Each shot has a short translated caption. The visitor can swipe on a phone and scroll sideways with a trackpad. The row does not autoplay. On a wide screen the shots sit in one row if they fit, and still scroll if they do not.
- Three lines under the row: log food, train, see progress. One sentence each. They fade in. No icon grid and no extra cards.
- Footer line: the support address as a mail link.
- `prefers-reduced-motion: reduce` shows the same content with no entrance animation.
- Screenshots are the local copies. Alt text is translated.

### Acceptance criteria

- [ ] Home shows the hero, three screenshots with captions, three lines, and the mail link, in both languages.
- [ ] The hero stacks on a phone and sits side by side on a wide screen.
- [ ] The screenshot row can be swiped, and it does not move on its own.
- [ ] Reduced motion leaves the content in place without the entrance animation.
- [ ] The header from phase 1 still works on this page.

---

## Phase 3: Privacy

**User stories**: 5

### What to build

Replace the Privacy placeholder with the policy. Home does not change.

- A reading column, comfortable line length, same canvas and type as Home. No screenshot row and no marketing hero.
- Visible updated date: 7 November 2026.
- Sections, in this order, in both languages:
  1. Who we are. MyTracker, contact `my.tracker.support@gmail.com`.
  2. What we collect today. Account details (name, email, password stored by the server). Camera, used to scan product barcodes. Photos the user chooses for body-fat records. Health reads: steps, active calories, distance, flights climbed. Health write: body weight, only when the user logs a weight. Messages, including text and media, between a trainer and a trainee.
  3. Why. To run the diary, workouts, and progress features the user asked for.
  4. What we do not do. We do not sell this data and we do not use it for advertising.
  5. Deletion. The user can delete their account inside the app, from their profile. That deletion removes the account and the data attached to it.
  6. Changes. If a new feature needs data that is not listed here, this page is updated first and the date above changes. The page does not say we may collect anything we want.
  7. Contact. The same email as a mail link.
- Plain sentences. No "we may collect information" catch-all.
- The header marks Privacy as the active tab, including when it was opened from the phone menu.

### Acceptance criteria

- [ ] `/privacy` shows every section above in English and in Hebrew, including the date and the mail link.
- [ ] The text does not grant permission to collect data beyond the list.
- [ ] Hebrew layout is right to left and the column stays readable on a phone.
- [ ] Home is unchanged.
