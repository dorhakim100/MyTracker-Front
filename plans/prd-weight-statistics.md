## Problem Statement

Logging weight is a single number on the profile card. Empty days are hard to fill in, and there is no place for a progress photo or the other body measurements. Body-fat estimation already exists, but it is a one-off photo and a range. It does not land on the day, and it cannot use measurements the user already knows.

## Solution

A timeline icon opens a full-screen statistics slide. The existing weight chart and its range controls stay on top, full width. Under them, a select defaults to logged days, with all days as the other choice, and an infinite-scroll table lists one row per calendar day. A row shows the date, weight, and body fat, a dash when a value is missing, and a chevron.

Tapping a row opens a details slide for that day. The user can save a photo and any of the measurements. A photo can be sent for a body-fat estimate, and applying the result stores one percent on that day. Each filled field can be cleared. The whole day can be deleted from details after a confirm. A day stays logged while any field remains.

The same slides open for a trainee when a trainer is viewing them.

## User Stories

**Must-have**

1. As a user, I want the timeline icon on my weight card to open statistics, so that the chart and the day list have room. The update-weight button on the card stays the quick picker.
2. As a trainer, I want the same icon on the trainee’s chart, so that I see and edit that person’s days. The person on screen is the trainee when one is selected, otherwise me.
3. As a user, I want the chart and its range controls unchanged above the list, so that the range does not filter the table.
4. As a user, I want logged days by default, and all days as the other choice, so that I can reach an empty day and log it. The list is newest first, from today back to the earliest saved day, or only today when nothing is saved. A missing weight or body fat is a dash.
5. As a user, I want a day page with the date, a progress photo, and the measurements, so that I can log more than weight. The fields are weight (kg), waist (cm), body fat (%), neck, chest, arms, hips, thigh, and calf. Empty fields are left off the record until I set them.
6. As a user, I want each field to open the existing number picker and save when I confirm, so that logging feels like updating weight. Weight is 30–150 kg and opens on the latest known weight, or 60. Body fat is 3–60% and opens at 20. Circumferences are centimeters in steps of 0.1 and open at waist 80, neck 38, chest 100, arms 35, hips 95, thigh 55, and calf 38, each on a wide range around that start.
7. As a user, I want to take or choose one photo for the day, so that I can keep a progress picture. A new photo replaces the old one. The photo accepts images only.
8. As a user, I want an estimate button once a photo is saved, so that I can fill body fat. It runs only when that day has a weight. The estimate still receives weight, plus any circumferences that are set, in centimeters. Applying stores the midpoint, to one decimal. A failure writes nothing.
9. As a user, I want a danger trash on each filled field, so that I can clear that field immediately. Clearing the photo removes the stored image and does not clear body fat. A separate danger trash on the details page deletes the whole day after the existing confirm dialog, and only when a record exists.
10. As a user, I want the day to stay on the logged list while any field is set, so that a photo or a measurement with no weight still counts. It leaves the list only when every field is gone.
11. As a user, I want my profile weight to change only when I save or remove today’s record, so that editing an older day does not replace it. Removing today falls back to the newest remaining day, or shows nothing when none remain. Health sync runs only when I am viewing myself and the day is today.
12. As a Hebrew or English user, in light or dark mode, I want both slides to follow the app’s language, tokens, and picker color.

**Nice-to-have**

None for this version.

## Implementation Decisions

### Libraries

- Already in the app: the weight chart, the select, the slide dialog, the number picker, the confirm dialog, the button, the sets-table infinite scroll, the body-fat estimate, and the existing image upload used for that estimate.
- A small image field for this page, images only, camera or library. No new UI kit.

### Modules

- The weight record gains optional measurements and a photo. Kilograms are no longer required. One record per person per calendar day. Saving a field updates that record. Clearing a field removes only that field. Deleting the day removes the record and its stored photo. The quick picker still writes kilograms only.
- A paged day list. Logged days are records. All days fill the calendar from today back to the earliest record. The table infinite-scrolls that list.
- A statistics slide: the existing chart, the logged/all select, and the day table. State stays on the slide.
- A details slide: date header, photo, measurement rows, per-field trash, and the header trash with the existing confirm.
- The body-fat estimate accepts the set circumferences only when present. The prompt is unchanged unless they are present, in which case one short line at the end tells the model to use them. The result screen takes an optional apply action, so the current estimate card still works. A failed estimate, and the nightly image purge, leave a photo that is still saved on a day.

### Direction

- The timeline icon on the weight card opens statistics. On the trainer view, the same icon sits on the chart.
- There is one record per calendar day. A later save updates it.
- `lastWeight` updates only for the person on screen, and only when the saved or deleted day is today. The health app is not cleared on delete.
- Body fat sent to the estimate is the weight in kilograms, never a previous percent, and never the photo URL inside the measurements.

## Testing Decisions

No automated tests.

## Out of Scope

- Storing the estimate note on the day.
- A new bottom-navigation tab.
- Opening a day by tapping a point on the chart.
- Putting the old body-fat card back on the profile, or redesigning it.
- Removing a sample from the health app.
- Deleting a day from the list or from the weight card.
- A unit other than kilograms and centimeters.

## Further Notes

The current estimate card keeps working because apply is optional. Progress photos must survive a failed estimate and the nightly purge until the user clears the photo or deletes the day.
