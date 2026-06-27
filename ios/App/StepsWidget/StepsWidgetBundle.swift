import SwiftUI
import WidgetKit

@main
struct StepsWidgetBundle: WidgetBundle {
    var body: some Widget {
        StepsWidget()
        CaloriesWidget()
        StepsCaloriesWidget()
    }
}
