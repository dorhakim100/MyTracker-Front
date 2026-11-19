import Foundation
import SwiftUI
import WidgetKit

enum StepsWidgetConstants {
    static let appGroupId = "group.com.dorhakim.mytracker"
    static let storageFileName = "stepsWidgetData.json"
    static let credentialsFileName = "stepsWidgetCredentials.json"
    static let widgetKind = "StepsWidget"
    static let caloriesWidgetKind = "CaloriesWidget"
    static let stepsCaloriesWidgetKind = "StepsCaloriesWidget"
    static let deepLink = "mytracker://dashboard"
    // Must match BGTaskSchedulerPermittedIdentifiers in the App target's Info.plist.
    static let backgroundRefreshTaskId = "com.dorhakim.mytracker.widget-refresh"
    // WidgetKit throttles background refreshes to ~40-70/day and ignores sub-minute
    // intervals, so we request a realistic cadence for the passive case. Immediate
    // "on view" freshness comes from the host app calling reloadTimelines() when it
    // backgrounds (see AppDelegate), which re-runs getTimeline's HTTPS fetch.
    static let timelineRefreshSeconds = 15 * 60

    static let widgetKinds = [
        widgetKind,
        caloriesWidgetKind,
        stepsCaloriesWidgetKind,
    ]
}

struct StepsWidgetHealthMetrics {
    let steps: Int
    let burnedCalories: Int
    let distance: Double
    let flightsClimbed: Int
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
        return max(Double(value) / Double(goal) * 100.0, 0)
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

    func refreshedWithLiveHealth(_ metrics: StepsWidgetHealthMetrics) -> StepsWidgetData {
        let sameDay = Calendar.current.isDate(
            Date(timeIntervalSince1970: updatedAt / 1000),
            inSameDayAs: Date()
        )

        if !sameDay {
            return StepsWidgetData(
                steps: metrics.steps,
                goal: goal,
                calories: calories,
                caloriesGoal: caloriesGoal,
                distance: metrics.distance,
                burnedCalories: metrics.burnedCalories,
                flightsClimbed: metrics.flightsClimbed,
                proteinCurrent: proteinCurrent,
                proteinGoal: proteinGoal,
                carbsCurrent: carbsCurrent,
                carbsGoal: carbsGoal,
                fatsCurrent: fatsCurrent,
                fatsGoal: fatsGoal,
                favoriteColor: favoriteColor,
                accentHex: accentHex,
                isDarkMode: isDarkMode,
                lang: lang,
                updatedAt: Date().timeIntervalSince1970 * 1000
            )
        }

        return StepsWidgetData(
            steps: max(metrics.steps, steps),
            goal: goal,
            calories: calories,
            caloriesGoal: caloriesGoal,
            distance: max(metrics.distance, distance),
            burnedCalories: max(metrics.burnedCalories, burnedCalories),
            flightsClimbed: max(metrics.flightsClimbed, flightsClimbed),
            proteinCurrent: proteinCurrent,
            proteinGoal: proteinGoal,
            carbsCurrent: carbsCurrent,
            carbsGoal: carbsGoal,
            fatsCurrent: fatsCurrent,
            fatsGoal: fatsGoal,
            favoriteColor: favoriteColor,
            accentHex: accentHex,
            isDarkMode: isDarkMode,
            lang: lang,
            updatedAt: Date().timeIntervalSince1970 * 1000
        )
    }
}

struct StepsWidgetCredentials: Codable {
    let userId: String
    let authToken: String
    let apiBaseUrl: String

    var isValid: Bool {
        !userId.isEmpty && !authToken.isEmpty && !apiBaseUrl.isEmpty
    }
}

enum StepsWidgetCredentialsStore {
    private static var fileURL: URL? {
        FileManager.default.containerURL(
            forSecurityApplicationGroupIdentifier: StepsWidgetConstants.appGroupId
        )?.appendingPathComponent(StepsWidgetConstants.credentialsFileName)
    }

    @discardableResult
    static func save(_ credentials: StepsWidgetCredentials) -> Bool {
        guard credentials.isValid, let url = fileURL else {
            return false
        }

        do {
            let encoded = try JSONEncoder().encode(credentials)
            try encoded.write(to: url, options: [.atomic])
            return true
        } catch {
            return false
        }
    }

    static func load() -> StepsWidgetCredentials? {
        guard let url = fileURL,
              FileManager.default.fileExists(atPath: url.path),
              let encoded = try? Data(contentsOf: url),
              let credentials = try? JSONDecoder().decode(StepsWidgetCredentials.self, from: encoded) else {
            return nil
        }

        return credentials.isValid ? credentials : nil
    }

    static func clear() {
        guard let url = fileURL,
              FileManager.default.fileExists(atPath: url.path) else {
            return
        }

        try? FileManager.default.removeItem(at: url)
    }
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

    @discardableResult
    static func updateHealthMetrics(
        steps: Int,
        burnedCalories: Int,
        distance: Double,
        flightsClimbed: Int
    ) -> Bool {
        let existing = load()
        let sameDay = Calendar.current.isDate(
            Date(timeIntervalSince1970: existing.updatedAt / 1000),
            inSameDayAs: Date()
        )

        // Never regress today's totals; background HealthKit reads can lag behind
        // the full multi-source count that JS reads while the app is active.
        let resolvedSteps = sameDay ? max(steps, existing.steps) : steps
        let resolvedBurnedCalories = sameDay ? max(burnedCalories, existing.burnedCalories) : burnedCalories
        let resolvedDistance = sameDay ? max(distance, existing.distance) : distance
        let resolvedFlightsClimbed = sameDay ? max(flightsClimbed, existing.flightsClimbed) : flightsClimbed

        if sameDay,
           resolvedSteps == existing.steps,
           resolvedBurnedCalories == existing.burnedCalories,
           resolvedDistance == existing.distance,
           resolvedFlightsClimbed == existing.flightsClimbed {
            return true
        }

        let updated = StepsWidgetData(
            steps: resolvedSteps,
            goal: existing.goal,
            calories: existing.calories,
            caloriesGoal: existing.caloriesGoal,
            distance: resolvedDistance,
            burnedCalories: resolvedBurnedCalories,
            flightsClimbed: resolvedFlightsClimbed,
            proteinCurrent: existing.proteinCurrent,
            proteinGoal: existing.proteinGoal,
            carbsCurrent: existing.carbsCurrent,
            carbsGoal: existing.carbsGoal,
            fatsCurrent: existing.fatsCurrent,
            fatsGoal: existing.fatsGoal,
            favoriteColor: existing.favoriteColor,
            accentHex: existing.accentHex,
            isDarkMode: existing.isDarkMode,
            lang: existing.lang,
            updatedAt: Date().timeIntervalSince1970 * 1000
        )

        let saved = save(updated)
        if saved {
            StepsWidgetRefresh.reloadTimelinesIfAvailable()
        }
        return saved
    }
}

enum StepsWidgetRefresh {
    static func reloadTimelinesIfAvailable() {
        if #available(iOS 14.0, *) {
            for kind in StepsWidgetConstants.widgetKinds {
                WidgetCenter.shared.reloadTimelines(ofKind: kind)
            }
        }
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

enum WidgetAppPalette {
    static let inkOnSurfaceLight = Color(hex: "#1c292a")
    static let inkOnSurfaceDark = Color(hex: "#c8d2d2")

    static func accentHex(favoriteColor: String) -> String {
        switch favoriteColor {
        case "blue": return "#1976d2"
        case "yellow": return "#ffd166"
        case "red": return "#d32f2f"
        case "orange": return "#ed6c02"
        case "green": return "#06d6a0"
        case "deepPurple": return "#6366f1"
        case "purple": return "#9c27b0"
        case "pink": return "#ff69b4"
        default: return "#009688"
        }
    }

    static func cardHex(favoriteColor: String, isDarkMode: Bool) -> String {
        guard isDarkMode else { return "#ffffff" }
        switch favoriteColor {
        case "blue": return "#11161f"
        case "yellow": return "#18180f"
        case "red": return "#1a1011"
        case "orange": return "#19140f"
        case "green": return "#0f1815"
        case "deepPurple": return "#13101a"
        case "purple": return "#160f17"
        case "pink": return "#190f15"
        default: return "#112021"
        }
    }

    static func chromeTint(isDarkMode: Bool) -> Double {
        isDarkMode ? 0.22 : 0.14
    }

    static func bannerOverlay(isDarkMode: Bool) -> Double {
        isDarkMode ? 0.08 : 0.05
    }
}

struct WidgetMacroStyle {
    let color: Color
    let labelColor: Color
    let labelFill: Color
    let swatchColor: Color
}

enum WidgetMacroColors {
    static func style(for macro: WidgetMacroType, isDarkMode: Bool) -> WidgetMacroStyle {
        let tint = WidgetAppPalette.chromeTint(isDarkMode: isDarkMode)

        switch macro {
        case .protein:
            let color = Color(hex: isDarkMode ? "#e24b6e" : "#ef476f")
            if isDarkMode {
                return WidgetMacroStyle(
                    color: color,
                    labelColor: color,
                    labelFill: color.opacity(tint),
                    swatchColor: color
                )
            }
            return WidgetMacroStyle(
                color: color,
                labelColor: Color(hex: "#f4cbd5"),
                labelFill: Color(hex: "#ef476e").opacity(0.48),
                swatchColor: Color(hex: "#ef476e").opacity(0.58)
            )
        case .carbs:
            let color = Color(hex: isDarkMode ? "#21c993" : "#06d6a0")
            return WidgetMacroStyle(
                color: color,
                labelColor: color,
                labelFill: color.opacity(tint),
                swatchColor: color
            )
        case .fats:
            let color = Color(hex: isDarkMode ? "#ffcc66" : "#ffd166")
            return WidgetMacroStyle(
                color: color,
                labelColor: color,
                labelFill: color.opacity(tint),
                swatchColor: color
            )
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

struct WidgetRGB {
    let r: Double
    let g: Double
    let b: Double

    init(hex: String) {
        let sanitized = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var value: UInt64 = 0
        Scanner(string: sanitized).scanHexInt64(&value)
        r = Double((value >> 16) & 0xFF) / 255
        g = Double((value >> 8) & 0xFF) / 255
        b = Double(value & 0xFF) / 255
    }

    init(r: Double, g: Double, b: Double) {
        self.r = r
        self.g = g
        self.b = b
    }

    func mixed(with other: WidgetRGB, amount: Double) -> WidgetRGB {
        WidgetRGB(
            r: r * amount + other.r * (1 - amount),
            g: g * amount + other.g * (1 - amount),
            b: b * amount + other.b * (1 - amount)
        )
    }

    /// Brighter variation of this color, matching the web ring's oklch overflow.
    func brighterRing(isDarkMode: Bool) -> WidgetRGB {
        let source = oklch
        let lightness = isDarkMode
            ? min(0.98, source.l + 0.4)
            : min(0.94, source.l + 0.28)
        let chroma = source.c * (isDarkMode ? 1.28 : 1.12)
        return WidgetRGB(l: lightness, c: chroma, h: source.h)
    }

    /// Third lap: brighter than the second, shifted a little toward yellow-green.
    func lighterRing(isDarkMode: Bool) -> WidgetRGB {
        let source = oklch
        let lightness = isDarkMode
            ? min(0.995, source.l + 0.62)
            : min(0.97, source.l + 0.5)
        let chroma = source.c * (isDarkMode ? 1.85 : 1.55)
        let hue = source.h - 24 * Double.pi / 180
        return WidgetRGB(l: lightness, c: chroma, h: hue)
    }

    func mixedOKLCH(with other: WidgetRGB, amount: Double) -> WidgetRGB {
        let from = oklch
        let to = other.oklch
        return WidgetRGB(
            l: from.l * amount + to.l * (1 - amount),
            c: from.c * amount + to.c * (1 - amount),
            h: from.h
        )
    }

    var color: Color {
        Color(red: r, green: g, blue: b)
    }

    private struct OKLCH {
        let l: Double
        let c: Double
        let h: Double
    }

    private var oklch: OKLCH {
        let red = Self.linear(r)
        let green = Self.linear(g)
        let blue = Self.linear(b)
        let l = cbrt(0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue)
        let m = cbrt(0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue)
        let s = cbrt(0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue)
        let labL = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s
        let labA = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s
        let labB = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s
        return OKLCH(l: labL, c: hypot(labA, labB), h: atan2(labB, labA))
    }

    private init(l: Double, c: Double, h: Double) {
        let labA = c * cos(h)
        let labB = c * sin(h)
        let l_ = l + 0.3963377774 * labA + 0.2158037573 * labB
        let m_ = l - 0.1055613458 * labA - 0.0638541728 * labB
        let s_ = l - 0.0894841775 * labA - 1.2914855480 * labB
        let linearL = l_ * l_ * l_
        let linearM = m_ * m_ * m_
        let linearS = s_ * s_ * s_
        r = Self.clamp(
            Self.encode(4.0767416621 * linearL - 3.3077115913 * linearM + 0.2309699292 * linearS)
        )
        g = Self.clamp(
            Self.encode(-1.2684380046 * linearL + 2.6097574011 * linearM - 0.3413193965 * linearS)
        )
        b = Self.clamp(
            Self.encode(-0.0041960863 * linearL - 0.7034186147 * linearM + 1.7076147010 * linearS)
        )
    }

    private static func linear(_ channel: Double) -> Double {
        if channel <= 0.04045 { return channel / 12.92 }
        return pow((channel + 0.055) / 1.055, 2.4)
    }

    private static func encode(_ channel: Double) -> Double {
        if channel <= 0.0031308 { return 12.92 * channel }
        return 1.055 * pow(max(channel, 0), 1 / 2.4) - 0.055
    }

    private static func clamp(_ channel: Double) -> Double {
        min(max(channel, 0), 1)
    }
}

extension Color {
    init(hex: String) {
        let rgb = WidgetRGB(hex: hex)
        self.init(red: rgb.r, green: rgb.g, blue: rgb.b)
    }
}
