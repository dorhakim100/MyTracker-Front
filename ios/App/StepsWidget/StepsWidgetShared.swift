import Foundation
import SwiftUI

enum StepsWidgetConstants {
    static let appGroupId = "group.com.dorhakim.mytracker"
    static let storageFileName = "stepsWidgetData.json"
    static let widgetKind = "StepsWidget"
    static let caloriesWidgetKind = "CaloriesWidget"
    static let stepsCaloriesWidgetKind = "StepsCaloriesWidget"
    static let deepLink = "mytracker://dashboard"

    static let widgetKinds = [
        widgetKind,
        caloriesWidgetKind,
        stepsCaloriesWidgetKind,
    ]
}

struct StepsWidgetData: Codable {
    let steps: Int
    let goal: Int
    let calories: Int
    let caloriesGoal: Int
    let distance: Double
    let burnedCalories: Int
    let flightsClimbed: Int
    let proteinCurrent: Int
    let proteinGoal: Int
    let carbsCurrent: Int
    let carbsGoal: Int
    let fatsCurrent: Int
    let fatsGoal: Int
    let favoriteColor: String
    let accentHex: String
    let isDarkMode: Bool
    let lang: String
    let updatedAt: Double

    var stepsProgress: Double {
        Self.progress(value: steps, goal: goal)
    }

    var caloriesProgress: Double {
        Self.progress(value: calories, goal: caloriesGoal)
    }

    private static func progress(value: Int, goal: Int) -> Double {
        guard goal > 0 else { return 0 }
        return min(max(Double(value) / Double(goal) * 100.0, 0), 100)
    }

    init(
        steps: Int,
        goal: Int,
        calories: Int,
        caloriesGoal: Int,
        distance: Double,
        burnedCalories: Int,
        flightsClimbed: Int,
        proteinCurrent: Int,
        proteinGoal: Int,
        carbsCurrent: Int,
        carbsGoal: Int,
        fatsCurrent: Int,
        fatsGoal: Int,
        favoriteColor: String,
        accentHex: String,
        isDarkMode: Bool,
        lang: String,
        updatedAt: Double
    ) {
        self.steps = steps
        self.goal = goal
        self.calories = calories
        self.caloriesGoal = caloriesGoal
        self.distance = distance
        self.burnedCalories = burnedCalories
        self.flightsClimbed = flightsClimbed
        self.proteinCurrent = proteinCurrent
        self.proteinGoal = proteinGoal
        self.carbsCurrent = carbsCurrent
        self.carbsGoal = carbsGoal
        self.fatsCurrent = fatsCurrent
        self.fatsGoal = fatsGoal
        self.favoriteColor = favoriteColor
        self.accentHex = accentHex
        self.isDarkMode = isDarkMode
        self.lang = lang
        self.updatedAt = updatedAt
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        steps = try container.decode(Int.self, forKey: .steps)
        goal = try container.decode(Int.self, forKey: .goal)
        calories = try container.decodeIfPresent(Int.self, forKey: .calories) ?? 0
        caloriesGoal = try container.decodeIfPresent(Int.self, forKey: .caloriesGoal) ?? 2_000
        distance = try container.decodeIfPresent(Double.self, forKey: .distance) ?? 0
        burnedCalories = try container.decodeIfPresent(Int.self, forKey: .burnedCalories) ?? 0
        flightsClimbed = try container.decodeIfPresent(Int.self, forKey: .flightsClimbed) ?? 0
        proteinCurrent = try container.decodeIfPresent(Int.self, forKey: .proteinCurrent) ?? 0
        proteinGoal = try container.decodeIfPresent(Int.self, forKey: .proteinGoal) ?? 0
        carbsCurrent = try container.decodeIfPresent(Int.self, forKey: .carbsCurrent) ?? 0
        carbsGoal = try container.decodeIfPresent(Int.self, forKey: .carbsGoal) ?? 0
        fatsCurrent = try container.decodeIfPresent(Int.self, forKey: .fatsCurrent) ?? 0
        fatsGoal = try container.decodeIfPresent(Int.self, forKey: .fatsGoal) ?? 0
        favoriteColor = try container.decode(String.self, forKey: .favoriteColor)
        accentHex = try container.decode(String.self, forKey: .accentHex)
        isDarkMode = try container.decode(Bool.self, forKey: .isDarkMode)
        lang = try container.decode(String.self, forKey: .lang)
        updatedAt = try container.decode(Double.self, forKey: .updatedAt)
    }

    static let placeholder = StepsWidgetData(
        steps: 0,
        goal: 10_000,
        calories: 0,
        caloriesGoal: 2_000,
        distance: 0,
        burnedCalories: 0,
        flightsClimbed: 0,
        proteinCurrent: 0,
        proteinGoal: 0,
        carbsCurrent: 0,
        carbsGoal: 0,
        fatsCurrent: 0,
        fatsGoal: 0,
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
    static func formattedNumber(_ value: Int) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        formatter.groupingSeparator = ","
        return formatter.string(from: NSNumber(value: value)) ?? "\(value)"
    }

    static func formattedDistance(_ value: Double) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        formatter.minimumFractionDigits = 0
        formatter.maximumFractionDigits = 2
        formatter.groupingSeparator = ","
        return formatter.string(from: NSNumber(value: value)) ?? String(format: "%.2f", value)
    }

    static func formattedSteps(_ value: Int) -> String {
        formattedNumber(value)
    }

    static func outOfLabel(lang: String) -> String {
        lang == "he" ? "מתוך" : "Out of"
    }

    static func stepsLabel(lang: String) -> String {
        lang == "he" ? "צעדים" : "Steps"
    }

    static func caloriesLabel(lang: String) -> String {
        lang == "he" ? "קלוריות" : "Calories"
    }

    static func proteinLabel(lang: String) -> String {
        lang == "he" ? "חלבון" : "Protein"
    }

    static func carbsLabel(lang: String) -> String {
        lang == "he" ? "פחמימות" : "Carbs"
    }

    static func fatsLabel(lang: String) -> String {
        lang == "he" ? "שומנים" : "Fats"
    }

    static func kcalSuffix(lang: String) -> String {
        lang == "he" ? "קל׳" : "kcal"
    }

    static func kmSuffix(lang: String) -> String {
        lang == "he" ? "ק״מ" : "km"
    }

    static func floorsSuffix(lang: String) -> String {
        lang == "he" ? "קומות" : "Floors"
    }

    static func gramSuffix(lang: String) -> String {
        lang == "he" ? "גרם" : "g"
    }

    static func outOfText(lang: String, value: Int) -> String {
        "\(outOfLabel(lang: lang)) \(formattedNumber(value))"
    }
}

enum WidgetMacroColors {
    static func color(for macro: WidgetMacroType, isDarkMode: Bool) -> Color {
        switch macro {
        case .protein:
            return Color(hex: isDarkMode ? "#e24b6e" : "#ef476f")
        case .carbs:
            return Color(hex: isDarkMode ? "#21c993" : "#06d6a0")
        case .fats:
            return Color(hex: isDarkMode ? "#ffcc66" : "#ffd166")
        }
    }
}

enum WidgetMacroType {
    case carbs
    case protein
    case fats

    func label(lang: String) -> String {
        switch self {
        case .carbs:
            return StepsWidgetFormatting.carbsLabel(lang: lang)
        case .protein:
            return StepsWidgetFormatting.proteinLabel(lang: lang)
        case .fats:
            return StepsWidgetFormatting.fatsLabel(lang: lang)
        }
    }
}

extension Color {
    init(hex: String) {
        let sanitized = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var value: UInt64 = 0
        Scanner(string: sanitized).scanHexInt64(&value)

        let red = Double((value >> 16) & 0xFF) / 255
        let green = Double((value >> 8) & 0xFF) / 255
        let blue = Double(value & 0xFF) / 255

        self.init(red: red, green: green, blue: blue)
    }
}
