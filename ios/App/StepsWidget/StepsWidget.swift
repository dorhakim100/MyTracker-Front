import SwiftUI
import WidgetKit

enum StepsWidgetDataLoader {
    static func loadFresh(completion: @escaping (StepsWidgetData) -> Void) {
        let stored = StepsWidgetStore.load()

        StepsWidgetBackendClient.fetchTodayHealth { metrics in
            guard let metrics else {
                completion(stored)
                return
            }

            let data = stored.refreshedWithLiveHealth(metrics)
            _ = StepsWidgetStore.save(data)
            completion(data)
        }
    }

    static func nextTimelineDate(from date: Date = Date()) -> Date {
        Calendar.current.date(
            byAdding: .second,
            value: StepsWidgetConstants.timelineRefreshSeconds,
            to: date
        ) ?? date.addingTimeInterval(TimeInterval(StepsWidgetConstants.timelineRefreshSeconds))
    }
}

struct StepsWidgetEntry: TimelineEntry {
    let date: Date
    let data: StepsWidgetData
}

struct StepsTimelineProvider: TimelineProvider {
    func placeholder(in context: Context) -> StepsWidgetEntry {
        StepsWidgetEntry(date: Date(), data: .placeholder)
    }

    func getSnapshot(in context: Context, completion: @escaping (StepsWidgetEntry) -> Void) {
        if context.isPreview {
            completion(StepsWidgetEntry(date: Date(), data: StepsWidgetStore.load()))
            return
        }

        StepsWidgetDataLoader.loadFresh { data in
            completion(StepsWidgetEntry(date: Date(), data: data))
        }
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<StepsWidgetEntry>) -> Void) {
        StepsWidgetDataLoader.loadFresh { data in
            let entry = StepsWidgetEntry(date: Date(), data: data)
            let nextUpdate = StepsWidgetDataLoader.nextTimelineDate()
            completion(Timeline(entries: [entry], policy: .after(nextUpdate)))
        }
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
