import Foundation
import Capacitor
import WidgetKit

@objc(StepsWidgetPlugin)
public class StepsWidgetPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "StepsWidgetPlugin"
    public let jsName = "StepsWidget"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "update", returnType: CAPPluginReturnPromise)
    ]

    @objc func update(_ call: CAPPluginCall) {
        // Capacitor passes JS numbers as NSNumber; getInt/getDouble often fail on them.
        let steps = call.jsInt("steps")
        let goal = call.jsInt("goal", default: 10_000)
        let favoriteColor = call.getString("favoriteColor") ?? "primary"
        let accentHex = call.getString("accentHex") ?? "#009688"
        let isDarkMode = call.jsBool("isDarkMode")
        let lang = call.getString("lang") ?? "en"
        let updatedAt = call.jsDouble("updatedAt", default: Date().timeIntervalSince1970 * 1000)

        let data = StepsWidgetData(
            steps: steps,
            goal: goal,
            favoriteColor: favoriteColor,
            accentHex: accentHex,
            isDarkMode: isDarkMode,
            lang: lang,
            updatedAt: updatedAt
        )

        guard StepsWidgetStore.save(data) else {
            let hasContainer = FileManager.default.containerURL(
                forSecurityApplicationGroupIdentifier: StepsWidgetConstants.appGroupId
            ) != nil

            if hasContainer {
                call.reject("Unable to write widget data file in App Group container.")
            } else {
                call.reject("App Group container unavailable. Re-register group.com.dorhakim.mytracker in Apple Developer and reinstall the app.")
            }
            return
        }

        if #available(iOS 14.0, *) {
            WidgetCenter.shared.reloadTimelines(ofKind: StepsWidgetConstants.widgetKind)
            WidgetCenter.shared.reloadAllTimelines()
        }

        call.resolve([
            "steps": steps,
            "goal": goal,
            "updatedAt": updatedAt,
        ])
    }
}

private extension CAPPluginCall {
    func jsNumber(_ key: String) -> NSNumber? {
        guard let value = getValue(key) else { return nil }

        if let number = value as? NSNumber {
            return number
        }
        if let intValue = value as? Int {
            return NSNumber(value: intValue)
        }
        if let doubleValue = value as? Double {
            return NSNumber(value: doubleValue)
        }
        if let string = value as? String, let doubleValue = Double(string) {
            return NSNumber(value: doubleValue)
        }

        return nil
    }

    func jsInt(_ key: String, default defaultValue: Int = 0) -> Int {
        jsNumber(key)?.intValue ?? defaultValue
    }

    func jsDouble(_ key: String, default defaultValue: Double = 0) -> Double {
        jsNumber(key)?.doubleValue ?? defaultValue
    }

    func jsBool(_ key: String, default defaultValue: Bool = false) -> Bool {
        guard let value = getValue(key) else { return defaultValue }

        if let boolValue = value as? Bool {
            return boolValue
        }
        if let number = value as? NSNumber {
            return number.boolValue
        }

        return defaultValue
    }
}
