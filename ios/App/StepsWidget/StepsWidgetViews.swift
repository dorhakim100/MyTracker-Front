import SwiftUI
import WidgetKit

struct StepsWidgetEntryView: View {
    @Environment(\.widgetFamily) private var family
    @Environment(\.colorScheme) private var colorScheme
    let entry: StepsWidgetEntry

    private var data: StepsWidgetData {
        entry.data
    }

    private var hasSyncedData: Bool {
        data.updatedAt > 0
    }

    private var isDarkMode: Bool {
        hasSyncedData ? data.isDarkMode : (colorScheme == .dark)
    }

    private var accentColor: Color {
        Color(hex: data.accentHex)
    }

    private var textColor: Color {
        isDarkMode ? accentColor : Color(red: 0.1, green: 0.1, blue: 0.1)
    }

    private var trailColor: Color {
        isDarkMode ? Color(red: 0.22, green: 0.24, blue: 0.27) : Color(red: 0.9, green: 0.9, blue: 0.9)
    }

    private var backgroundColor: Color {
        isDarkMode ? Color(red: 0.08, green: 0.09, blue: 0.11) : Color.white
    }

    var body: some View {
        Group {
            switch family {
            case .systemMedium:
                mediumLayout
            default:
                smallLayout
            }
        }
        .stepsWidgetFullColorContent()
        .modifier(StepsWidgetBackgroundModifier(color: backgroundColor))
    }

    private var smallLayout: some View {
        StepsRingView(
            progress: data.progress,
            accentColor: accentColor,
            trailColor: trailColor,
            stepsText: StepsWidgetFormatting.formattedSteps(data.steps),
            textColor: textColor,
            subtitle: nil,
            ringSize: 92,
            lineWidth: 8,
            textSize: 22
        )
        .padding(12)
    }

    private var mediumLayout: some View {
        HStack(spacing: 16) {
            StepsRingView(
                progress: data.progress,
                accentColor: accentColor,
                trailColor: trailColor,
                stepsText: StepsWidgetFormatting.formattedSteps(data.steps),
                textColor: textColor,
                subtitle: nil,
                ringSize: 110,
                lineWidth: 9,
                textSize: 24
            )

            VStack(alignment: .leading, spacing: 6) {
                Text("Steps")
                    .font(.headline)
                    .foregroundStyle(textColor)

                Text("\(StepsWidgetFormatting.outOfLabel(lang: data.lang)) \(StepsWidgetFormatting.formattedSteps(data.goal))")
                    .font(.subheadline)
                    .foregroundStyle(textColor.opacity(0.65))

                Text("\(Int(data.progress.rounded()))%")
                    .font(.caption)
                    .foregroundStyle(accentColor)
            }

            Spacer(minLength: 0)
        }
        .padding(16)
    }
}

struct StepsRingView: View {
    let progress: Double
    let accentColor: Color
    let trailColor: Color
    let stepsText: String
    let textColor: Color
    let subtitle: String?
    let ringSize: CGFloat
    let lineWidth: CGFloat
    let textSize: CGFloat

    var body: some View {
        ZStack {
            Circle()
                .stroke(trailColor, lineWidth: lineWidth)

            Circle()
                .trim(from: 0, to: progress / 100)
                .stroke(
                    accentColor,
                    style: StrokeStyle(lineWidth: lineWidth, lineCap: .round)
                )
                .rotationEffect(.degrees(-90))

            VStack(spacing: 4) {
                Text(stepsText)
                    .font(.system(size: textSize, weight: .bold))
                    .foregroundStyle(textColor)
                    .minimumScaleFactor(0.6)
                    .lineLimit(1)

                if let subtitle {
                    Text(subtitle)
                        .font(.caption)
                        .foregroundStyle(textColor.opacity(0.65))
                        .lineLimit(1)
                }
            }
            .padding(.horizontal, 8)
        }
        .frame(width: ringSize, height: ringSize)
        .stepsWidgetFullColorContent()
    }
}

private extension View {
    @ViewBuilder
    func stepsWidgetFullColorContent() -> some View {
        if #available(iOS 16.0, *) {
            widgetAccentable(false)
        } else {
            self
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

private struct StepsWidgetBackgroundModifier: ViewModifier {
    let color: Color

    func body(content: Content) -> some View {
        if #available(iOS 17.0, *) {
            content.containerBackground(for: .widget) {
                color
            }
        } else {
            content.background(color)
        }
    }
}
