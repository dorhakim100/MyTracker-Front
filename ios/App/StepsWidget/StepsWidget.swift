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

    // Snapshots must render instantly (widget gallery, first placement), so we
    // read the last cached value here instead of blocking on the network.
    func getSnapshot(in context: Context, completion: @escaping (StepsWidgetEntry) -> Void) {
        completion(StepsWidgetEntry(date: Date(), data: StepsWidgetStore.load()))
    }

    // This is the widget's "useEffect": every time the system (or the host app
    // via WidgetCenter.reloadTimelines) rebuilds the timeline, we fire a fresh
    // HTTPS request, then ask the system to refresh again after a short interval.
    // iOS throttles that interval heavily, so the primary "on visible" trigger is
    // the app reloading timelines as it moves to the background (see AppDelegate).
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
