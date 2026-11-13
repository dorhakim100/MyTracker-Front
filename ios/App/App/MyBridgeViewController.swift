import Capacitor
import UIKit

/// Registers app-local Capacitor plugins. `cap sync` only scans npm packages,
/// so local plugins must be registered here (or in packageClassList).
class MyBridgeViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        super.capacitorDidLoad()
        bridge?.registerPluginInstance(StepsWidgetPlugin())
        bridge?.registerPluginInstance(PhoneHealthSettingsPlugin())
    }
}

@objc(PhoneHealthSettingsPlugin)
public class PhoneHealthSettingsPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "PhoneHealthSettingsPlugin"
    public let jsName = "PhoneHealthSettings"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "open", returnType: CAPPluginReturnPromise),
    ]

    private let urls = [
        "settings-navigation://com.apple.Settings.Apps/com.apple.Health/SOURCES_ITEM",
        "App-prefs:com.apple.Health",
    ]

    @objc func open(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            self.openFirst(index: 0, call: call)
        }
    }

    private func openFirst(index: Int, call: CAPPluginCall) {
        guard index < urls.count, let url = URL(string: urls[index]) else {
            call.resolve(["opened": false])
            return
        }

        UIApplication.shared.open(url, options: [:]) { opened in
            if opened {
                call.resolve(["opened": true])
                return
            }
            self.openFirst(index: index + 1, call: call)
        }
    }
}
