import SwiftUI
import WidgetKit

struct StepsCaloriesWidget: Widget {
    let kind: String = StepsWidgetConstants.stepsCaloriesWidgetKind

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: StepsTimelineProvider()) { entry in
            StepsCaloriesWidgetEntryView(entry: entry)
                .widgetURL(URL(string: StepsWidgetConstants.deepLink)!)
        }
        .configurationDisplayName("Steps + Calories")
        .description("Today's steps and calorie progress")
        .supportedFamilies([.systemMedium])
    }
}
