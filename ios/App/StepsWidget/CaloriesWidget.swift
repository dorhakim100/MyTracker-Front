import SwiftUI
import WidgetKit

struct CaloriesWidget: Widget {
    let kind: String = StepsWidgetConstants.caloriesWidgetKind

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: StepsTimelineProvider()) { entry in
            CaloriesWidgetEntryView(entry: entry)
                .widgetURL(URL(string: StepsWidgetConstants.deepLink)!)
        }
        .configurationDisplayName("Calories")
        .description("Today's calorie progress and macros")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
