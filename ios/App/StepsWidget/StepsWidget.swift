import SwiftUI
import WidgetKit

struct StepsWidgetEntry: TimelineEntry {
    let date: Date
    let data: StepsWidgetData
}

struct StepsTimelineProvider: TimelineProvider {
    func placeholder(in context: Context) -> StepsWidgetEntry {
        StepsWidgetEntry(date: Date(), data: .placeholder)
    }

    func getSnapshot(in context: Context, completion: @escaping (StepsWidgetEntry) -> Void) {
        completion(StepsWidgetEntry(date: Date(), data: StepsWidgetStore.load()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<StepsWidgetEntry>) -> Void) {
        let entry = StepsWidgetEntry(date: Date(), data: StepsWidgetStore.load())
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: Date()) ?? Date().addingTimeInterval(900)
        completion(Timeline(entries: [entry], policy: .after(nextUpdate)))
    }
}

struct StepsWidget: Widget {
    let kind: String = StepsWidgetConstants.widgetKind

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: StepsTimelineProvider()) { entry in
            StepsWidgetEntryView(entry: entry)
                .widgetURL(URL(string: StepsWidgetConstants.deepLink)!)
        }
        .configurationDisplayName("Steps")
        .description("Today's step progress and activity stats")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
