import Foundation

enum StepsWidgetConstants {
    static let appGroupId = "group.com.dorhakim.mytracker"
    static let storageFileName = "stepsWidgetData.json"
    static let widgetKind = "StepsWidget"
    static let deepLink = "mytracker://dashboard"
}

struct StepsWidgetData: Codable {
    let steps: Int
    let goal: Int
    let favoriteColor: String
    let accentHex: String
    let isDarkMode: Bool
    let lang: String
    let updatedAt: Double

    var progress: Double {
        guard goal > 0 else { return 0 }
        return min(max(Double(steps) / Double(goal) * 100.0, 0), 100)
    }

    static let placeholder = StepsWidgetData(
        steps: 0,
        goal: 10_000,
        favoriteColor: "primary",
        accentHex: "#009688",
        isDarkMode: false,
        lang: "en",
        updatedAt: 0
    )
}

enum StepsWidgetStore {
    private static var containerURL: URL? {
        FileManager.default.containerURL(
            forSecurityApplicationGroupIdentifier: StepsWidgetConstants.appGroupId
        )
    }

    private static var fileURL: URL? {
        containerURL?.appendingPathComponent(StepsWidgetConstants.storageFileName)
    }

    @discardableResult
    static func save(_ data: StepsWidgetData) -> Bool {
        guard let url = fileURL else {
            return false
        }

        do {
            let encoded = try JSONEncoder().encode(data)
            try encoded.write(to: url, options: [.atomic])
            return true
        } catch {
            return false
        }
    }

    static func load() -> StepsWidgetData {
        guard let url = fileURL,
              FileManager.default.fileExists(atPath: url.path) else {
            return migrateFromLegacyUserDefaults() ?? .placeholder
        }

        do {
            let encoded = try Data(contentsOf: url)
            return try JSONDecoder().decode(StepsWidgetData.self, from: encoded)
        } catch {
            return .placeholder
        }
    }

    /// UserDefaults App Group access is unreliable on some iOS builds (cfprefsd container null).
    private static func migrateFromLegacyUserDefaults() -> StepsWidgetData? {
        guard let defaults = UserDefaults(suiteName: StepsWidgetConstants.appGroupId),
              let encoded = defaults.data(forKey: "stepsWidgetData"),
              let decoded = try? JSONDecoder().decode(StepsWidgetData.self, from: encoded) else {
            return nil
        }

        _ = save(decoded)
        defaults.removeObject(forKey: "stepsWidgetData")
        return decoded
    }
}

enum StepsWidgetFormatting {
    static func formattedSteps(_ value: Int) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        formatter.groupingSeparator = ","
        return formatter.string(from: NSNumber(value: value)) ?? "\(value)"
    }

    static func outOfLabel(lang: String) -> String {
        lang == "he" ? "מתוך" : "Out of"
    }
}
