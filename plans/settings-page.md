# Plan: Settings page

> Source PRD: [prd-settings-page.md](./prd-settings-page.md)

## Flow

For the developer. Read this section. Everything below is for the agent.

The profile gear opens a settings slide page for that person. Language, font, color, mode, fixed menu, and health live there. The steps goal stays in its accordion.

1. The gear opens the page, with language, font, and fixed menu working, including the fixed-menu explanation.
2. Mode is Light, Dark, or System, on the new segment control.
3. Favorite color is a select with a swatch and a name, and the preferences accordion is gone.
4. Health opens a methods page where the person can connect or disconnect. The health accordion keeps only the steps goal.

- Device settings stay on this device. Fixed menu updates the person the page was opened for. Google health still belongs to the signed-in user.
- System follows the phone. Light and Dark stay fixed. An existing dark-mode choice stays Dark.

---

## Architectural decisions

- **Routes**: no new route. Settings and health methods are full slide dialogs, including a second dialog stacked on the first. The gear is on every profile card: own profile, the selected trainee, and each trainee in the trainer list. The pencil still opens edit.
- **Who the page is for**: the page receives the person on that card. Fixed menu reads and writes that person’s `isFixedMenu`. Mode, language, font, favorite color, the active health method, and the in-app phone-health flag stay on this device. Google connect and disconnect use the signed-in user’s id, even when the page was opened for a trainee.
- **Key models**: device prefs gain `colorMode`: `light` | `dark` | `system`. `isDarkMode` stays the resolved boolean the rest of the app already reads. Missing `colorMode` migrates from the saved boolean: true → `dark`, false → `light`. New defaults stay dark. Device prefs also gain `usePhoneHealth`, defaulting to true when missing, so today’s startup permission request keeps working until the person disconnects.
- **Favorite color**: stored keys stay `primary`, `blue`, `yellow`, `red`, `orange`, `green`, `deepPurple`, `purple`, `pink`. Titles shown to the user: Teal, Azure, Gold, Crimson, Tangerine, Mint, Indigo, Violet, Hot pink. No hex in the label.
- **Services / store**: no new Redux module. Prefs still persist through the existing system prefs service. Fixed menu still saves through the existing user update. Google connect stays on the existing auth flow. Google disconnect is `POST health/google/disconnect` with `{ userId }` for the signed-in user. It removes the health link only. It does not sign the user out and does not call Google sign-out.
- **Health connected, per method**: Google uses `googleHealthConnected`. Phone health uses the health plugin’s authorization check and `usePhoneHealth`. Do not treat the shared `permited` flag as “phone health is connected”: connecting Google currently writes that same flag. The settings row shows Connected only when the active method (`healthProvider`, `native` or `google`) is actually connected.
- **Libraries**: MUI and the existing toggle, select, button, alert dialog, and slide dialog. No new package and no second UI kit. Android opens Health Connect settings through the health plugin already in the app. iPhone opens the system Settings page for the app through the Capacitor app plugin already in the app. Do not use private preference URLs. The plugin cannot revoke HealthKit.
- **Copy**: new sentences live in the settings feature’s own English and Hebrew locals, the same way other features do. Reuse existing prefs and health strings when the wording is already right.
- **Appearance**: new styles follow `html.dark-mode`. Do not add a `dark-mode` class by hand on the new controls. The app keeps applying the resolved light or dark the way it does today.
- **Leave in the repo**: the old preferences card, color picker, dark-mode switch, language switch, health provider card, and health connect block. User Details stops rendering the pieces that have moved. Do not delete those files.

---

## Phase 1: Open settings

**User stories**: 1, 2, 3, 6, 11 (info icon)

### What to build

The settings icon on a profile card opens a full slide dialog titled Settings, for the person that card shows. The edit icon still opens edit.

The page is a vertical list of rows, so a later phase can insert one. This phase has three working rows, in this order: Language, Font, Fixed menu.

Language is the existing select. Values stay `en` and `he`. Labels are English and עברית. Changing it updates device prefs and the current language, the same way the old switch did.

Font is the existing font select. Values and labels stay Rubik, Heebo, and Assistant. It still writes device prefs.

Fixed menu is the existing switch. It reads and writes `isFixedMenu` on the person the page was opened for, through the existing user update. A failed save shows the existing update-user error. If that person has no id, the switch does nothing.

Beside the Fixed menu title is a reusable info control: a small “i” icon. The caller passes a header and a description. The click opens the existing alert dialog, which already stacks above a slide dialog. Header: “Fixed menu”. Description: “When this is on, food follows a set menu instead of the daily diary.” Hebrew carries the same meaning. The control is a shared component, not a one-off inside settings.

Remove language, font, and fixed menu from the preferences accordion so they are not in two places. Leave dark mode and favorite color in that accordion. Leave the health accordion as it is.

Device rows always write this device’s prefs, including when the card is a trainee.

### Acceptance criteria

- [ ] The gear on your profile, on the selected trainee, and on a trainee in the list opens settings for that person
- [ ] The pencil still opens edit
- [ ] Language and font change this device and survive a reload
- [ ] Fixed menu changes the person the page was opened for, and a failed save shows the existing error
- [ ] The info icon opens the alert dialog with the fixed-menu header and description, in both languages
- [ ] Dark mode and favorite color are still in the preferences accordion
- [ ] The health accordion is unchanged
- [ ] Old preference components are still in the repo

---

## Phase 2: Mode

**User stories**: 4, 11 (segment)

### What to build

Add a Mode row as the first settings row. It uses a new `segment` variant of the existing toggle. Options are Light, Dark, and System. Choosing one saves `colorMode` on device prefs.

Light sets the resolved dark flag off. Dark sets it on. System matches the phone’s `prefers-color-scheme` and updates when the phone changes, while `colorMode` stays `system`. The rest of the app keeps reading the resolved flag, including the status bar on the phone.

A saved prefs record with no `colorMode` becomes Dark if the old flag was on, and Light if it was off. Someone who already chose dark mode stays on Dark. The default for a new install stays dark.

The segment variant has two tones:

- Color, used by Mode. The track is a pale tint of the current favorite color, using the existing picker wash. The selected segment is a raised neutral pill. Labels stay readable in light and dark. The pill does not turn the favorite color into a solid fill.
- Natural. Gray track, white selected pill, no favorite-color class. Dark mode is the dark version: a dark gray track and a light selected pill. Expose this as a prop on the same variant so a later screen can use it. Mode does not use it.

The existing toggle behavior stays: one selected value, disabled options still work, the old default look is unchanged when the variant is not segment.

Remove the dark-mode switch from the preferences accordion. Favorite color stays there until the next phase.

### Acceptance criteria

- [ ] Mode is the first row and offers Light, Dark, and System
- [ ] Light and Dark stay fixed until the person changes them
- [ ] System follows the phone and updates when the phone’s appearance changes
- [ ] An existing dark-mode user lands on Dark; an existing light-mode user lands on Light
- [ ] The Mode track is a pale tint of the current favorite color in both color modes
- [ ] The natural segment tone is gray with a white pill, and dark mode is the dark version of that control, with no favorite color
- [ ] The old toggle look is unchanged where the segment variant is not used
- [ ] The dark-mode switch is no longer in the preferences accordion

---

## Phase 3: Favorite color

**User stories**: 5

### What to build

Add a Favorite color row after Font. It is the existing select. The saved value stays the current color key.

The select can render a row the caller supplies, for both the closed value and each option. This row is a swatch plus the title. No hex is shown. Titles:

- `primary` — Teal
- `blue` — Azure
- `yellow` — Gold
- `red` — Crimson
- `orange` — Tangerine
- `green` — Mint
- `deepPurple` — Indigo
- `purple` — Violet
- `pink` — Hot pink

Hebrew uses natural names for the same colors. The swatch uses the existing color treatment for that key. Choosing a color still writes `favoriteColor` on device prefs and the app still applies it the way it does today.

Remove favorite color from the preferences accordion. That accordion is now empty, so remove it from User Details. Do not delete the old card or the color picker.

The settings order is now Mode, Language, Font, Favorite color, Fixed menu.

### Acceptance criteria

- [ ] Favorite color sits after Font
- [ ] Each option shows a swatch and the title above, with no hex
- [ ] The saved value is still the existing color key, and the app’s accent still follows it
- [ ] The select’s existing callers still show their current labels
- [ ] The preferences accordion is gone from User Details
- [ ] The old color picker and preferences card are still in the repo

---

## Phase 4: Health

**User stories**: 7, 8, 9, 10

### What to build

Add a Health row at the bottom of settings. The title sits with the status. The button opens a second full slide dialog, the methods page.

When the active method is connected, a Connected tag sits beside the Health title and the button says Change. Otherwise the button says Connect. Both open the same page.

The methods page lists the ways available on this device. On the web, that is Google only. On the phone, that is phone health, then Google. Each row has an icon, a title, a short description, and one button.

A method that is not connected shows Connect. A method that is connected shows a Connected tag beside its title, and the button says Disconnect.

Connecting a method makes it the active source and runs the existing connect flow for the signed-in user:

- Google uses the existing Google health connect. Then the active source is `google`, and the connected flag refreshes from the server.
- Phone health sets `usePhoneHealth` on and the active source to `native`, then runs the existing read-authorization request.

Disconnect asks first, in the existing alert dialog, with the existing danger confirm. Cancel does nothing.

- Google disconnect calls `POST health/google/disconnect` with the signed-in user’s id. On success the Google health flag is cleared. The login and the Google account stay. On failure the existing error message shows and the method stays connected.
- Phone disconnect sets `usePhoneHealth` off, treats phone health as disconnected in the app, and opens the system permission screen. Android opens Health Connect settings. iPhone opens the system Settings page for the app. Startup must not ask for phone-health permission again, or read phone health, until the person taps Connect.

Disconnecting one method leaves the other as it was. If the method that was in use is now disconnected, the settings row returns to Connect. The active source value can stay on that method.

On User Details, the health accordion shows only the steps goal. Remove the provider switch and the connect block from what that accordion renders. Do not change the steps goal. Do not delete the old health components.

Short copy, in both languages:

- Phone health: steps and activity from this phone.
- Google: steps and activity from Google. Disconnect stops health and keeps the Google login.
- Confirm disconnect: a header and one line that this method will stop supplying health data.

### Acceptance criteria

- [ ] Health is the last settings row
- [ ] Connect, and Change when already connected, open the same methods page
- [ ] Web lists Google only. A phone lists phone health and Google
- [ ] A connected method shows the tag by its title and a Disconnect button
- [ ] Connecting a method makes it the active source through the existing connect flow
- [ ] Google disconnect removes the health link for the signed-in user and does not sign them out
- [ ] A failed Google disconnect shows an error and stays connected
- [ ] Phone disconnect stops in-app reading, does not prompt again on startup, and opens the system permission screen
- [ ] Disconnecting one method leaves the other unchanged
- [ ] Opening settings for a trainee still changes the signed-in user’s Google health, and still changes this phone’s native health
- [ ] The health accordion shows only the steps goal
- [ ] The old health components are still in the repo
