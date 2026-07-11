import UIKit
import Capacitor
import BackgroundTasks

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        registerBackgroundRefreshTask()
        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Home button / app switch — reload widget so it HTTPS-fetches before suspend.
        StepsWidgetRefresh.reloadTimelinesIfAvailable()
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        StepsWidgetRefresh.reloadTimelinesIfAvailable()
        scheduleBackgroundRefresh()
    }

    func applicationProtectedDataDidBecomeAvailable(_ application: UIApplication) {
        // Lock → unlock to home screen while app stays in memory.
        StepsWidgetRefresh.reloadTimelinesIfAvailable()
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
    }

    func applicationWillTerminate(_ application: UIApplication) {
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

}

// MARK: - Background widget refresh
//
// BGAppRefreshTask lets iOS wake the app periodically (opportunistically, tuned to
// the user's habits — realistically a handful of times per day) even when it isn't
// open. On each wake we ask WidgetKit to rebuild its timeline, which re-runs the
// widget's HTTPS fetch, and we schedule the next refresh so the chain continues.
extension AppDelegate {
    func registerBackgroundRefreshTask() {
        if #available(iOS 13.0, *) {
            BGTaskScheduler.shared.register(
                forTaskWithIdentifier: StepsWidgetConstants.backgroundRefreshTaskId,
                using: nil
            ) { [weak self] task in
                guard let refreshTask = task as? BGAppRefreshTask else {
                    task.setTaskCompleted(success: false)
                    return
                }
                self?.handleBackgroundRefresh(task: refreshTask)
            }
        }
    }

    @available(iOS 13.0, *)
    private func handleBackgroundRefresh(task: BGAppRefreshTask) {
        // Keep the chain alive: the OS only ever runs one scheduled task at a time.
        scheduleBackgroundRefresh()

        // Guard against setTaskCompleted being called twice (fetch callback + expiry).
        var didComplete = false
        let complete: (Bool) -> Void = { success in
            DispatchQueue.main.async {
                guard !didComplete else { return }
                didComplete = true
                task.setTaskCompleted(success: success)
            }
        }

        task.expirationHandler = {
            complete(false)
        }

        // Fetch in the app (which has a real background execution + network budget),
        // persist to the shared App Group store, then reload the widget so it renders
        // the fresh cached data instantly instead of racing its own network fetch.
        let stored = StepsWidgetStore.load()
        StepsWidgetBackendClient.fetchTodayHealth { metrics in
            if let metrics {
                let refreshed = stored.refreshedWithLiveHealth(metrics)
                _ = StepsWidgetStore.save(refreshed)
            }
            StepsWidgetRefresh.reloadTimelinesIfAvailable()
            complete(metrics != nil)
        }
    }

    func scheduleBackgroundRefresh() {
        if #available(iOS 13.0, *) {
            let request = BGAppRefreshTaskRequest(
                identifier: StepsWidgetConstants.backgroundRefreshTaskId
            )
            // Earliest the OS may run it; actual timing is decided by iOS.
            request.earliestBeginDate = Date(timeIntervalSinceNow: 15 * 60)
            try? BGTaskScheduler.shared.submit(request)
        }
    }
}
