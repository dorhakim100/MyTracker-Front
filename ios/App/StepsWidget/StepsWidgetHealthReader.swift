import Foundation
import HealthKit

enum StepsWidgetHealthReader {
    private static let healthStore = HKHealthStore()

    private static let observedTypes: [(HKQuantityType, HKUnit)] = [
        (HKQuantityType(.stepCount), .count()),
        (HKQuantityType(.activeEnergyBurned), .kilocalorie()),
        (HKQuantityType(.distanceWalkingRunning), .meter()),
        (HKQuantityType(.flightsClimbed), .count()),
    ]

    static func fetchTodayActivity(completion: @escaping (StepsWidgetHealthMetrics?) -> Void) {
        guard HKHealthStore.isHealthDataAvailable() else {
            completion(nil)
            return
        }

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

        group.notify(queue: .global(qos: .userInitiated)) {
            let distanceKm = (distanceMeters / 1000 * 100).rounded() / 100
            completion(
                StepsWidgetHealthMetrics(
                    steps: steps,
                    burnedCalories: burnedCalories,
                    distance: distanceKm,
                    flightsClimbed: flightsClimbed
                )
            )
        }
    }

    private static func queryTodaySum(
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
