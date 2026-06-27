import Capacitor

/// Registers app-local Capacitor plugins. `cap sync` only scans npm packages,
/// so local plugins must be registered here (or in packageClassList).
class MyBridgeViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        super.capacitorDidLoad()
        bridge?.registerPluginInstance(StepsWidgetPlugin())
    }
}
