# PRD: MyTracker public site

## Problem Statement

People who hear about MyTracker, and the stores that will review it, have nowhere public to read what the app is or how it handles their data. The tracker itself is the product. It should not also be the marketing page and the privacy policy.

## Solution

A small public site, MyTracker-Site, next to the tracker repo. A visitor lands on a short marketing page that looks like the app: teal, Rubik, the square logo, light and dark. They can switch language and theme from the header, swipe through real phone screenshots, and open a Privacy tab. The policy lists only what the app collects today and says a future feature that needs new data will update that page first.

## User Stories

1. As a visitor on my phone, I want a clear first screen and a way to open Privacy, so that I understand the app without hunting through the product.
2. As a visitor, I want to swipe real screenshots of the diary, workouts, and food search, so that I can see the app before I install it.
3. As a Hebrew or English reader, I want the page in my language, laid out in the right direction, so that I can read it comfortably.
4. As a visitor, I want to switch light and dark from the header, so that the page matches the app I already use.
5. As a person with a privacy question, I want the current data list, the date it was updated, and a mail link, so that I know what is collected and how to ask.
6. As someone who prefers less motion, I want the page to stay still, so that the animation does not get in the way.

All of the above are must-have.

## Implementation Decisions

- New Vite React app, TypeScript, in a sibling repo named MyTracker-Site. React Router has two routes, Home and Privacy, so a later page is another route.
- Same folder habits as the tracker: a page or component folder, its SCSS, and English and Hebrew strings next to it. i18next detects the browser language, falls back to English, and remembers the choice. Hebrew sets the page right to left.
- One SCSS variables file holds the colors, starting from the tracker's teal. Dark mode flips the same variables. Replacing the main color happens in that file.
- Header: on a wide screen, Home and Privacy are tabs, with language and dark mode beside them. On a phone, the logo, language, and dark mode stay visible, and a hamburger opens only Home and Privacy.
- Home is a marketing page: headline and one sentence with the dashboard screenshot, one swipeable row of diary, workouts, and food search, three short lines (log food, train, see progress), then the support email. The screenshot row is a scroll-snap row, not a carousel library. MUI is available for small controls such as the theme switch. No second UI kit.
- Motion is short and explains the entrance of the hero and the screenshot row. Reduced motion turns it off.
- Privacy is a reading page. It names today's data only: account details, barcode camera, body-fat photos, steps, active calories, distance, flights climbed, body weight saved when the user logs a weight, and trainer–trainee messages. It says the data is not sold or used for ads, how to delete an account inside the app, and that a new feature which needs new data updates this page first. The updated date is visible. Contact is my.tracker.support@gmail.com, also on Home.
- Screenshots and the square logo are copied from the tracker repo.

## Testing Decisions

No automated tests.

## Out of Scope

- Login, accounts, payments, and any backend.
- Store badges and install links.
- Pointing the tracker's Privacy and Support links at this site. That happens after the site has a public URL.
- A lawyer's review of the policy text.

## Further Notes

The policy is plain language in both languages, written to match the app as it works today. It is not a blank permission to collect more later. When a feature needs new data, the privacy page changes in the same release and the date changes with it.
