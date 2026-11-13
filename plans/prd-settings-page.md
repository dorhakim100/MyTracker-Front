## Problem Statement

Settings live in an accordion on the profile, which was enough for one or two controls and is now too much. Health connection sits in a second accordion beside the steps goal, with a switch that does not explain the two ways to connect. Appearance is only light or dark. Favorite color is a row of unnamed swatches.

## Solution

The profile gear opens a full settings slide page for that person. The page is a list of rows, so a new setting can be added later. Mode is Light, Dark, or System. Language, font, and favorite color are selects. Fixed menu is a switch with a short explanation. Health opens a second slide page that lists the ways to connect, with a clear connect and disconnect. The steps goal stays in its accordion.

## User Stories

**Must-have**

1. As a signed-in user, I want settings from my profile gear, so that appearance, language, font, color, fixed menu, and health are one page.
2. As a trainer, I want that same gear on a trainee, so that I can change that trainee’s fixed menu.
3. As a user, I want device settings to keep changing this device, so that opening a trainee’s page does not retint my phone’s language, mode, font, or color.
4. As a user, I want Light, Dark, and System, so that the app can follow my phone or stay fixed.
5. As a user, I want each favorite color to show a swatch and a real name, so that I know what I am picking.
6. As a user, I want a short explanation of fixed menu, so that I know food will follow a set menu instead of the daily diary.
7. As a user, I want to see whether health is connected and open the list of methods, so that I can connect or switch without hunting through an accordion.
8. As a user, I want to disconnect Google health without signing out of Google, so that I can stop health and keep my login.
9. As a phone user, I want disconnect to open the system permission screen, so that I can turn off health access where the phone allows it.
10. As a user, I want the steps goal to stay where it is, so that this work does not move that control.

**Nice-to-have**

11. As a developer, I want a natural gray segment and a reusable info icon, so that later screens can use them without a favorite-color tint or a one-off dialog.

## Implementation Decisions

- Settings is a slide page of rows, opened for one person: you, the selected trainee, or a trainee on the trainer list. The pencil still edits that person.
- Rows, top to bottom: Mode, Language, Font, Favorite color, Fixed menu, Health. A new setting is another row.
- Device settings stay on this device: mode, language, font, favorite color, and which health method is active. Fixed menu is saved on the person the page was opened for. Google health connect and disconnect still belong to the signed-in user. A later version can point device settings at the trainee without a new page.
- Mode is a new segment variant of the existing toggle. The track is a pale tint of the current favorite color. The same variant has a natural gray track, a white selected pill, and no favorite color. Dark mode is the dark version of that gray control. System follows the phone and updates when the phone changes. Light and Dark stay fixed. Someone who already saved dark mode stays on Dark. The rest of the app keeps using the resolved light or dark.
- Language stays English and Hebrew. Font stays the current choices. Favorite color keeps today’s stored names. The select shows a swatch and a title: Teal, Azure, Gold, Crimson, Tangerine, Mint, Indigo, Violet, Hot pink. The existing select grows enough for the caller to render that row.
- Fixed menu is a switch. A reusable info icon opens the existing alert dialog. The caller supplies the header and the description. This one is titled “Fixed menu” and says that food follows a set menu instead of the daily diary.
- Health on the settings page shows Connect, or a Connected tag and Change when the active method is connected. Both open a second slide page. On the web the list is Google. On the phone it is phone health and Google. Each row has an icon, a title, a short description, and Connect. When that method is connected, a Connected tag sits by the title and the button reads Disconnect. Confirm uses the existing alert dialog and the current danger confirm.
- Connecting a method makes it the active source, using today’s connect flows. Disconnecting one method leaves the other as it was. Google health disconnect is a server call for the signed-in user and does not sign them out. Phone health clears the in-app permission and opens the system permission screen.
- The preferences accordion leaves the profile. The health accordion keeps only the steps goal. Existing preference and health components stay in the repo.
- No new UI kit. No new package. Segment, select content, the info icon, and both slide pages are extensions of controls already in the app.

## Testing Decisions

No automated tests unless explicitly requested. Manual check: own profile and a trainee, Light / Dark / System, color names, fixed-menu info, health connect and disconnect on web and phone, and the steps goal still in its accordion.

## Out of Scope

- Moving or redesigning the steps goal
- Deleting the old preference and health components
- New health vendors
- Saving mode, language, font, color, or the active health method per trainee
- Signing the user out of Google
- Turning off iPhone health permission from inside the app beyond opening the system screen
- Other stored preferences that are not on this page today

## Further Notes

The page should feel like a place that can grow. Each setting is one row. Health methods are a second page, not more rows on the first.

**Libraries:** MUI and the existing toggle, select, button, alert dialog, and slide page. The health plugin and the app shell already in the project cover the system permission screen. No new package.
