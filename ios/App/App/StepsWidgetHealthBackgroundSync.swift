import Foundation
import HealthKit

/// Keeps the steps widget fresh while the app is backgrounded by listening for
/// HealthKit updates and writing today's activity into the App Group store.
final class StepsWidgetHealthBackgroundSync {
    static let shared = StepsWidgetHealthBackgroundSync()

    private let healthStore = HKHealthStore()
    private var observerQueries: [HKObserverQuery] = []
    private var isStarted = false
    private var syncInProgress = false

    private let observedTypes: [(HKQuantityType, HKUnit)] = [
        (HKQuantityType(.stepCount), .count()),
        (HKQuantityType(.activeEnergyBurned), .kilocalorie()),
        (HKQuantityType(.distanceWalkingRunning), .meter()),
        (HKQuantityType(.flightsClimbed), .count()),
    ]

    func start() {
        guard HKHealthStore.isHealthDataAvailable(), !isStarted else { return }
        isStarted = true

        for (sampleType, _) in observedTypes {
            let query = HKObserverQuery(sampleType: sampleType, predicate: nil) { [weak self] _, completionHandler, error in
                defer { completionHandler() }

                guard error == nil else { return }
                self?.syncTodayActivityToWidget()
            }

            healthStore.execute(query)
            observerQueries.append(query)

            healthStore.enableBackgroundDelivery(for: sampleType, frequency: .immediate) { _, error in
                if let error {
                    NSLog("[StepsWidgetHealthBackgroundSync] background delivery failed: \(error.localizedDescription)")
                }
            }
        }

        syncTodayActivityToWidget()
    }

    func syncTodayActivityToWidget() {
        guard HKHealthStore.isHealthDataAvailable(), !syncInProgress else { return }
        syncInProgress = true

        let group = DispatchGroup()
        var steps = 0
        var burnedCalories = 0
        var distanceMeters = 0.0
        var flightsClimbed = 0

        for (sampleType, unit) in observedTypes {
            group.enter()
            queryTodaySum(for: sampleType, unit: unit) { value in
                switch sampleType.identifier {
                case HKQuantityTypeIdentifier.stepCount.rawValue:
                    steps = Int(value.rounded())
                case HKQuantityTypeIdentifier.activeEnergyBurned.rawValue:
                    burnedCalories = Int(value.rounded())
                case HKQuantityTypeIdentifier.distanceWalkingRunning.rawValue:
                    distanceMeters = value
                case HKQuantityTypeIdentifier.flightsClimbed.rawValue:
                    flightsClimbed = Int(value.rounded())
                default:
                    break
                }
                group.leave()
            }
        }

        group.notify(queue: .main) { [weak self] in
            let distanceKm = (distanceMeters / 1000 * 100).rounded() / 100
            _ = StepsWidgetStore.updateHealthMetrics(
                steps: steps,
                burnedCalories: burnedCalories,
                distance: distanceKm,
                flightsClimbed: flightsClimbed
            )
            self?.syncInProgress = false
        }
    }

    private func queryTodaySum(
        for sampleType: HKQuantityType,
        unit: HKUnit,
        completion: @escaping (Double) -> Void
    ) {
        let calendar = Calendar.current
        let start = calendar.startOfDay(for: Date())
        let predicate = HKQuery.predicateForSamples(
            withStart: start,
            end: Date(),
            options: .strictStartDate
        )

        let query = HKStatisticsQuery(
            quantityType: sampleType,
            quantitySamplePredicate: predicate,
            options: .cumulativeSum
        ) { _, result, _ in
            let value = result?.sumQuantity()?.doubleValue(for: unit) ?? 0
            completion(value)
        }

        healthStore.execute(query)
    }
}
