## Problem Statement

The steps and calories banners show today only. There is no way to see earlier days, a streak, or whether the goal was hit across a week, a month, or a year. The app reads those numbers live from Google Health or from the phone, and it does not keep a daily history. Past days are available from those sources, but nothing asks for them.

## Solution

Tapping the steps banner or the calories banner opens one full slide. A time-frame filter and paging move through week, month, 3 months, and year. The ring shows the average for the page, or the selected bar’s per-day value. A bar chart, a streak card, and a list of the same values sit underneath.

The backend stores one day per vendor and returns the finished page. The slide renders that page. Google and phone health each save their history in the background and keep today and yesterday fresh. The selected vendor wins when it has a value above zero. Another vendor fills a zero or a gap.

## User Stories

**Must-have**

1. As a user, I want the steps banner and the calories banner to open the same full slide, so that I can review that metric. The caller passes the metric and the goal icon. Footprints for steps, fire for calories. A check is used when no icon is passed.
2. As a user, I want week, month, 3 months, and year, so that I can change the window. Week is the 7 days ending on the page. Month is 30 days. Three months is 13 weeks. Year is the calendar year, and months that have not started are left out. Paging moves by that same window and stops at today. Previous, next, and back-to-today are disabled when there is nowhere to go.
3. As a user, I want the ring to show the page average, the days that hit the goal, and the total, so that the page reads like the reference. Selecting a bar shows that bar’s per-day value and its label. An X clears the selection. A day bar shows the day. A week bar shows that week’s daily average. A month bar shows that month’s daily average.
4. As a user, I want day bars to show the goal icon when the goal was hit, so that a hit is visible on the chart and on a day card. Week and month bars do not get an icon. A goal line sits at the daily goal. The chart leaves 15% of headroom above the taller of the goal and the tallest bar.
5. As a user, I want the list under the streak to match the page, so that I can read the same numbers. Week is 7 day cards. Month groups forward by 7 from the first day, so a page has four week cards and one 2-day card. Three months is 13 week cards. Year is one card per month that has started. Each grouped card is the daily average of its own days.
6. As a user, I want the streak card to follow the page, so that a past page shows the run as it stood at the end of that page. The run can be longer than the bars. Today does not break a run that is already going. A missed day before that does. Zero still shows the card. Steps and calories have separate streaks. The live streak is returned and not shown.
7. As a user, I want every elapsed day to count, so that an empty day is a zero in the average, the total, and the streak. A zero is used only when every vendor has nothing for that date. The selected vendor wins when it is above zero. Another vendor’s number is used when the selected one is zero or missing.
8. As a user, I want Google and phone health saved when I turn a source on, so that a Fitbit history in Google replaces the phone for those days, and turning Google back on later fetches the full history again. The pull runs in the background and does not block the slide. Today and yesterday keep updating from the active source.
9. As a user, I want skeletons and a spinner while a page is loading, so that a slow request looks like Statistics. The ring, the summary, the streak, and the cards use skeletons. The chart area uses the centered spinner. When the page arrives, the bars animate up. A later background save does not put a visible page back into skeletons. Changing the time frame or the page does.
10. As a Hebrew or English user, in light or dark mode, I want the slide to follow the app’s language, tokens, and picker color.

**Nice-to-have**

11. As a user, I want the live streak shown somewhere later, so that the field returned now has a place to go. This version does not show it.

## Implementation Decisions

### Libraries

- Already in the app: the full slide dialog, the app’s circular progress for the value ring, skeletons, MUI’s circular progress for the chart spinner only, the footprints and fire glyphs, the line-chart clear control and haptics, and Recharts.
- The bar chart is a thin wrapper over the Recharts bar chart already in the app. MUI has no bar chart. No second chart library and no second UI kit.

### Modules

- Activity days. One stored day per person, date, and vendor, for steps and calories. Reading a range returns the merged value.
- An activity page from the backend. A metric, a time frame, and a page come back ready to render: bars, cards, average, goal count, total, both streaks, the goal, the axis height, and which paging controls are enabled.
- A health vendor with two jobs: save all available days, and refresh today and yesterday. Google and phone health are the two implementations. Phone history is read on the device and then saved. Another source later is another implementation of those two jobs.
- A bar chart. It receives the ready bars, the goal, the axis height, and an optional icon. It owns focus, the clear control, haptics, the goal line, and the 15% headroom.
- An activity dialog. It opens from the two banners and renders one page: filter, paging, ring, summary, streak, list, and the statistics loading states.

### Direction

- The steps goal is the user’s steps goal, or the existing default when none is set. The calories goal is the number the health banner already treats as 100%: the calorie goal, plus 500 when the aim is to lose, minus 500 when the aim is to gain, and unchanged when the aim is to maintain.
- A day the vendor successfully reports as zero is stored as zero. It still loses to another vendor’s number above zero at read time.
- Distance and floors stay on the dashboard. They are not stored for this page and do not open it.
- The dashboard banners keep reading today as they do now. This work adds the open action and the history behind the slide.
- Android needs the history permission so a full phone history can be read. Without it, the phone can only see about 30 days before the first grant.
- The slide is for the person whose health is connected on this device. It does not open another person’s history.

## Testing Decisions

No automated tests.

## Out of Scope

- A day view, and any time frame besides week, month, 3 months, and year.
- Showing the live streak.
- Distance, floors, or any metric besides steps and calories.
- A Garmin or other new vendor. The vendor jobs are shaped so one can be added later.
- Replacing the dashboard’s live today value with the stored day.
- Storing raw health samples.
- Viewing a trainee’s activity.

## Further Notes

The reference is the attached steps screen: filter, paging, a large average, a goal line, day marks, a streak card, and a list. The ring replaces the plain number. The sentence under the ring is the goal count and the total, or the selected bar’s label.
