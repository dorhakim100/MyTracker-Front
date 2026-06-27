//
//  StepsWidgetBundle.swift
//  StepsWidget
//
//  Created by Dor Hakim on 27/06/2026.
//

import WidgetKit
import SwiftUI

@main
struct StepsWidgetBundle: WidgetBundle {
    var body: some Widget {
        StepsWidget()
        StepsWidgetControl()
        StepsWidgetLiveActivity()
    }
}
