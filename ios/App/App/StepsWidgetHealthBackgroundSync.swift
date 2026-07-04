import Foundation
import HealthKit
import UIKit

/// Nudges widget timelines to refresh when HealthKit reports new samples while
/// the app is backgrounded. The widget extension reads HealthKit directly.
final class StepsWidgetHealthBackgroundSync {
    static let shared = StepsWidgetHealthBackgroundSync()

    private let healthStore = HKHealthStore()
    private var observerQueries: [HKObserverQuery] = []
    private var isStarted = false

    private let observedTypes: [HKQuantityType] = [
        HKQuantityType(.stepCount),
        HKQuantityType(.activeEnergyBurned),
        HKQuantityType(.distanceWalkingRunning),
        HKQuantityType(.flightsClimbed),
    ]

    func start() {
        guard HKHealthStore.isHealthDataAvailable(), !isStarted else { return }
        isStarted = true

        for sampleType in observedTypes {
            let query = HKObserverQuery(sampleType: sampleType, predicate: nil) { _, completionHandler, error in
                defer { completionHandler() }

                guard error == nil else { return }
                guard UIApplication.shared.applicationState == .background else { return }
                StepsWidgetRefresh.reloadTimelinesIfAvailable()
            }

            healthStore.execute(query)
            observerQueries.append(query)

            healthStore.enableBackgroundDelivery(for: sampleType, frequency: .immediate) { _, error in
                if let error {
                    NSLog("[StepsWidgetHealthBackgroundSync] background delivery failed: \(error.localizedDescription)")
                }
            }
        }
    }
}
