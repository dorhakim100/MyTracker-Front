# Store release — what is left

The wiring (bundle id, Android project, privacy manifest, usage strings, legal-link hooks) is already in the repo. This file is the work that is still open: behavior changes, then account and console steps.

## Logic changes

### 1. Ask for Health and notifications when the user does the thing

`App.tsx` requests Health read and weight write, then notification permission, as soon as the native app starts (`handleHealthPermissions` / `handleLocalNotificationsPermissions`). Apple rejects a Health prompt that is not tied to an action the user just took. Play treats a Health Connect prompt the same way.

Change:

- Remove that launch effect.
- On native Health, ask only for the read types (steps, active calories, distance, flights) when the user turns the native provider on in `HealthProviderCard`. `reloadHealthForCurrentProvider` in `src/store/actions/health.actions.ts` already runs from that switch. It should request read access there, and it should not include the weight write.
- Ask for the weight write inside `healthService.saveWeight`, which `WeightCard` and `WeightDetails` already call when a weight is saved. If write access is missing, request it then, and skip the Health write if the user denies it. The weight still saves in MyTracker.
- Ask for notifications in `Timer.tsx` the first time a rest timer is started, before `LocalNotifications.schedule`. If the user denies it, the timer still runs on screen.

`requestReadAuthorization` in `src/services/health/health.service.ts` currently sends `WRITE_OPTIONS` (weight) together with the reads. Split that so the activity prompt and the weight prompt are two calls.

### 2. Sign in with Apple next to Google

`SignIn.tsx` offers email/password and Google. Guideline 4.8 expects Sign in with Apple beside a third-party login. Email and password does not cover it.

Change:

- Add Sign in with Apple on the native iOS sign-in screen, next to the Google button.
- Add the Sign in with Apple entitlement on the app target.
- Send the Apple identity token to a new backend exchange, the same way `startGoogleAuth` posts `auth/google/native-exchange`. The backend has to verify the token and create or load the user.
- Hide the Apple button on Android and web.

The Apple Developer capability is in the non-code section. The button does nothing until that capability and the backend exchange both exist.

### 3. Report and block on trainer–trainee chat

`ExerciseChatDialog` sends text, images, and video between a trainer and a trainee (`Message` in `src/types/message/Message.ts`). One account can put content in front of another account, and there is no report or block.

If that chat ships in the first store build, add:

- Report on a message, stored by the backend, with a way for you to review it.
- Block, so a user can stop seeing messages from the other person.
- A contact address in the app (the Support link covers this once `VITE_SUPPORT_URL` is set).

If the first release has no trainer accounts, this can wait.

### 4. Optional cut: ship before Google verifies the Health scope

`GOOGLE_SIGN_IN_SCOPES` in `src/services/auth/google-auth.service.ts` includes `https://www.googleapis.com/auth/googlehealth.activity_and_fitness.readonly`. That scope is restricted. Until Google verifies the consent screen, only test users can connect Google Health.

Native HealthKit and Health Connect do not need that scope. To ship the public app before verification, take the scope off the sign-in request and keep Google Health connect unavailable. Putting the scope back is the non-code verification flow below.

## Not code

Do these in order. Store binaries come after the privacy URL exists, because both listings and Health Connect ask for it.

### Privacy policy and support URL

1. Publish a privacy policy at a public `https` URL. It has to say:
   - Account data: name, email, password hash handled by the server.
   - Camera: used to scan product barcodes.
   - Photos: body-fat photos the user picks.
   - Health, read: steps, active calories, distance, flights climbed.
   - Health, write: body weight, only when the user logs a weight.
   - Health data is not used for advertising and is not sold.
   - How to delete an account (the in-app Delete Account button).
2. Publish a support page or a `mailto:` / `https` contact URL.
3. Put both URLs in `.env.local` as `VITE_PRIVACY_POLICY_URL` and `VITE_SUPPORT_URL` (see `.env.example`). The sign-in screen and the edit-profile screen show the links only after these are set. Rebuild after changing them.
4. Put the same privacy URL in `android/app/src/main/res/values/strings.xml` as `health_connect_privacy_policy_url`. It is currently `REPLACE_WITH_PRIVACY_POLICY_URL`. Health Connect opens that page from system settings.

### Confirm account deletion on the server

The app already calls delete from Edit Profile. Sign in, delete a test user, and confirm the backend removes the user and their logs, workouts, and photos. App Review tests this.

### Apple Developer (team `5PP67UW95F`)

Bundle id is `com.dorhakim.mytracker`. Widget id is `com.dorhakim.mytracker.StepsWidgetExtension`. App Group is `group.com.dorhakim.mytracker`.

1. [Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources) → Identifiers.
2. App ID `com.dorhakim.mytracker`. Enable:
   - HealthKit
   - HealthKit Background Delivery
   - App Groups → `group.com.dorhakim.mytracker`
   - Background Modes → Background fetch
   - Sign in with Apple (when that button is added)
3. App ID `com.dorhakim.mytracker.StepsWidgetExtension`. Enable the same App Group.
4. Create the App Group identifier if it is not there yet.
5. Xcode → Settings → Accounts. Sign in with an Apple ID that can create Distribution certificates for this team.
6. On a Mac, from the repo:

   ```bash
   npm run build
   npx cap sync ios
   cd ios/App && pod install && cd ../..
   ```

   Open `ios/App/App.xcworkspace`. Product → Archive. Distribute → App Store Connect.

   Confirm the archive is signed with Apple Distribution. The project uses Automatic signing. Version is `1.0` (`1`). Bump `CURRENT_PROJECT_VERSION` in the Xcode target for every upload after the first.

### Decide iPhone-only before screenshots

The Xcode target is iPhone and iPad (`TARGETED_DEVICE_FAMILY = 1,2`), and the iPhone allows landscape. That means App Store Connect requires iPad screenshots, and review will open the app on an iPad.

If the app is phone-only, say so and the setting can be switched to iPhone (`1`) before the listing is filled in. Leave it if iPad is a real target.

### App Store Connect

1. Create the app with bundle id `com.dorhakim.mytracker`.
2. Fill description, keywords, support URL, and the privacy policy URL.
3. Screenshots: 6.9-inch or 6.7-inch iPhone. Add iPad shots only if the target stays universal.
4. Age rating: health and fitness. Mention user-to-user messages if trainer chat ships.
5. App Privacy (nutrition labels): contact info, identifiers, health, photos, user content.
6. Export compliance: the app only uses HTTPS. `ITSAppUsesNonExemptEncryption` is already `false`, so the upload form should accept that.
7. Review notes: a demo email and password. Say that Health access is requested when activity tracking is turned on, the camera is for barcodes, and notifications are for the rest timer.

### Google Cloud

The iOS client id is already in `ios/App/App/Info.plist` (`GIDClientID` and the reversed URL scheme).

1. In [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials, open the iOS OAuth client and confirm its bundle id is `com.dorhakim.mytracker`. If it was created for `com.mytracker`, create a new iOS client and replace the id and URL scheme in `Info.plist`.
2. Copy the **web** client id into `VITE_GOOGLE_OAUTH_CLIENT_ID` before `npm run build`. Native Google Sign-In uses that id to get a server auth code.
3. Create an Android OAuth client after Play App Signing exists (next section). Package name `com.dorhakim.mytracker`. SHA-1 must be the Play app-signing certificate, not the debug keystore.
4. OAuth consent screen: if Google Health stays in the app, submit the restricted scope `googlehealth.activity_and_fitness.readonly` for verification. Add the test Google accounts under Test users until that is approved. Until then, anyone outside that list gets an unverified-app error on Google Health connect.

### Play Console

1. Create the app with package name `com.dorhakim.mytracker`.
2. Play App Signing: let Google hold the app-signing key. Create an upload key locally (`keytool`), do not commit the `.jks` (already gitignored).
3. Copy the app-signing SHA-1 into the Android OAuth client from the Google Cloud steps.
4. Build a release bundle:

   ```bash
   npm run build
   npx cap sync android
   cd android && ./gradlew bundleRelease
   ```

   `versionCode` is `1` and `versionName` is `1.0` in `android/app/build.gradle`. Raise `versionCode` on every later upload.
5. Health apps declaration. Declare only what the merged manifest keeps:
   - Read: steps, distance, active calories, floors climbed, weight
   - Write: weight
   The health plugin also declares heart rate, sleep, glucose, and similar types. Those are removed in `android/app/src/main/AndroidManifest.xml` with `tools:node="remove"`. The declaration must match that list, and the privacy policy must match it too.
6. Data safety form: health, email, photos, device identifiers. Camera is for barcodes. Notifications are local rest-timer alerts.
7. Store listing: description, screenshots, icon, feature graphic, support URL, privacy policy URL.
8. Internal testing track first. Install the Play-signed build and check Google sign-in, barcode scan, a rest-timer notification, and a weight save.

### Each store build

Vite bakes env vars at build time. A store build needs `VITE_API_URL` (or the native fallback `https://interested-selia-dorhakim-444c2d8e.koyeb.app/`), `VITE_GOOGLE_OAUTH_CLIENT_ID`, and the two legal URLs, then `npm run build` and `npx cap sync` for the platform you are uploading.

Android web assets and `capacitor-cordova-android-plugins` are gitignored. `npx cap sync android` recreates them. Do not commit a keystore or `android/local.properties`.
