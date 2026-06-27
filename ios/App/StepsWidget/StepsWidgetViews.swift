import SwiftUI
import WidgetKit

struct WidgetEntryTheme {
    let data: StepsWidgetData
    let colorScheme: ColorScheme

    var hasSyncedData: Bool {
        data.updatedAt > 0
    }

    var isDarkMode: Bool {
        hasSyncedData ? data.isDarkMode : (colorScheme == .dark)
    }

    var accentColor: Color {
        Color(hex: data.accentHex)
    }

    var textColor: Color {
        isDarkMode ? accentColor : Color(red: 0.1, green: 0.1, blue: 0.1)
    }

    var mutedTextColor: Color {
        isDarkMode ? textColor.opacity(0.55) : Color(red: 0.45, green: 0.45, blue: 0.45)
    }

    var trailColor: Color {
        isDarkMode ? Color(red: 0.22, green: 0.24, blue: 0.27) : Color(red: 0.9, green: 0.9, blue: 0.9)
    }

    var backgroundColor: Color {
        isDarkMode ? Color(red: 0.08, green: 0.09, blue: 0.11) : Color.white
    }
}

private enum WidgetRingMetrics {
    static let ringSize: CGFloat = 92
    static let textSize: CGFloat = 18
    static let titleFontSize: CGFloat = 14
    static let titleBottomSpacing: CGFloat = 6
    static let subtitleSize: CGFloat = 10
    static let lineWidth: CGFloat = 7
}

struct StepsWidgetEntryView: View {
    @Environment(\.widgetFamily) private var family
    @Environment(\.colorScheme) private var colorScheme
    let entry: StepsWidgetEntry

    private var theme: WidgetEntryTheme {
        WidgetEntryTheme(data: entry.data, colorScheme: colorScheme)
    }

    var body: some View {
        Group {
            switch family {
            case .systemMedium:
                stepsMediumLayout
            default:
                stepsSmallLayout
            }
        }
        .stepsWidgetFullColorContent()
        .modifier(StepsWidgetBackgroundModifier(color: theme.backgroundColor))
    }

    private var stepsSmallLayout: some View {
        MetricSmallColumnView(
            theme: theme,
            icon: "figure.walk",
            label: StepsWidgetFormatting.stepsLabel(lang: entry.data.lang),
            value: StepsWidgetFormatting.formattedSteps(entry.data.steps),
            outOfValue: entry.data.goal,
            progress: entry.data.stepsProgress
        )
        .padding(.horizontal, 10)
        .padding(.bottom, 10)
        .padding(.top, 8)
    }

    private var stepsMediumLayout: some View {
        HStack(alignment: .top, spacing: 8) {
            MetricSmallColumnView(
                theme: theme,
                icon: "figure.walk",
                label: StepsWidgetFormatting.stepsLabel(lang: entry.data.lang),
                value: StepsWidgetFormatting.formattedSteps(entry.data.steps),
                outOfValue: entry.data.goal,
                progress: entry.data.stepsProgress
            )
            .frame(maxWidth: .infinity)

            VStack(spacing: 6) {
                WidgetStatBannerView(
                    theme: theme,
                    icon: "speedometer",
                    value: StepsWidgetFormatting.formattedDistance(entry.data.distance),
                    suffix: StepsWidgetFormatting.kmSuffix(lang: entry.data.lang)
                )
                WidgetStatBannerView(
                    theme: theme,
                    icon: "flame.fill",
                    value: StepsWidgetFormatting.formattedNumber(entry.data.burnedCalories),
                    suffix: StepsWidgetFormatting.kcalSuffix(lang: entry.data.lang)
                )
                WidgetStatBannerView(
                    theme: theme,
                    icon: "arrow.up.right",
                    value: StepsWidgetFormatting.formattedNumber(entry.data.flightsClimbed),
                    suffix: StepsWidgetFormatting.floorsSuffix(lang: entry.data.lang)
                )
            }
            .frame(maxWidth: .infinity)
        }
        .padding(.horizontal, 12)
        .padding(.bottom, 10)
        .padding(.top, 8)
    }
}

struct CaloriesWidgetEntryView: View {
    @Environment(\.widgetFamily) private var family
    @Environment(\.colorScheme) private var colorScheme
    let entry: StepsWidgetEntry

    private var theme: WidgetEntryTheme {
        WidgetEntryTheme(data: entry.data, colorScheme: colorScheme)
    }

    var body: some View {
        Group {
            switch family {
            case .systemMedium:
                caloriesMediumLayout
            default:
                caloriesSmallLayout
            }
        }
        .stepsWidgetFullColorContent()
        .modifier(StepsWidgetBackgroundModifier(color: theme.backgroundColor))
    }

    private var caloriesSmallLayout: some View {
        MetricSmallColumnView(
            theme: theme,
            icon: "flame.fill",
            label: StepsWidgetFormatting.caloriesLabel(lang: entry.data.lang),
            value: StepsWidgetFormatting.formattedNumber(entry.data.calories),
            outOfValue: entry.data.caloriesGoal,
            progress: entry.data.caloriesProgress
        )
        .padding(.horizontal, 10)
        .padding(.bottom, 10)
        .padding(.top, 8)
    }

    private var caloriesMediumLayout: some View {
        HStack(alignment: .top, spacing: 8) {
            MetricSmallColumnView(
                theme: theme,
                icon: "flame.fill",
                label: StepsWidgetFormatting.caloriesLabel(lang: entry.data.lang),
                value: StepsWidgetFormatting.formattedNumber(entry.data.calories),
                outOfValue: entry.data.caloriesGoal,
                progress: entry.data.caloriesProgress
            )
            .frame(maxWidth: .infinity)

            VStack(spacing: 8) {
                WidgetMacroGoalView(
                    theme: theme,
                    macro: .carbs,
                    current: entry.data.carbsCurrent,
                    goal: entry.data.carbsGoal
                )
                WidgetMacroGoalView(
                    theme: theme,
                    macro: .protein,
                    current: entry.data.proteinCurrent,
                    goal: entry.data.proteinGoal
                )
                WidgetMacroGoalView(
                    theme: theme,
                    macro: .fats,
                    current: entry.data.fatsCurrent,
                    goal: entry.data.fatsGoal
                )
            }
            .frame(maxWidth: .infinity)
        }
        .padding(.horizontal, 12)
        .padding(.bottom, 10)
        .padding(.top, 8)
    }
}

struct StepsCaloriesWidgetEntryView: View {
    @Environment(\.colorScheme) private var colorScheme
    let entry: StepsWidgetEntry

    private var theme: WidgetEntryTheme {
        WidgetEntryTheme(data: entry.data, colorScheme: colorScheme)
    }

    var body: some View {
        HStack(spacing: 10) {
            MetricSmallColumnView(
                theme: theme,
                icon: "figure.walk",
                label: StepsWidgetFormatting.stepsLabel(lang: entry.data.lang),
                value: StepsWidgetFormatting.formattedSteps(entry.data.steps),
                outOfValue: entry.data.goal,
                progress: entry.data.stepsProgress
            )

            MetricSmallColumnView(
                theme: theme,
                icon: "flame.fill",
                label: StepsWidgetFormatting.caloriesLabel(lang: entry.data.lang),
                value: StepsWidgetFormatting.formattedNumber(entry.data.calories),
                outOfValue: entry.data.caloriesGoal,
                progress: entry.data.caloriesProgress
            )
        }
        .padding(.horizontal, 12)
        .padding(.bottom, 10)
        .padding(.top, 8)
        .stepsWidgetFullColorContent()
        .modifier(StepsWidgetBackgroundModifier(color: theme.backgroundColor))
    }
}

struct MetricSmallColumnView: View {
    let theme: WidgetEntryTheme
    let icon: String
    let label: String
    let value: String
    let outOfValue: Int
    let progress: Double

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            MetricTitleLabel(
                icon: icon,
                label: label,
                color: theme.textColor,
                fontSize: WidgetRingMetrics.titleFontSize
            )
            .padding(.bottom, WidgetRingMetrics.titleBottomSpacing)

            StepsRingView(
                progress: progress,
                accentColor: theme.accentColor,
                trailColor: theme.trailColor,
                stepsText: value,
                textColor: theme.textColor,
                subtitle: StepsWidgetFormatting.outOfText(lang: theme.data.lang, value: outOfValue),
                subtitleColor: theme.mutedTextColor,
                ringSize: WidgetRingMetrics.ringSize,
                lineWidth: WidgetRingMetrics.lineWidth,
                textSize: WidgetRingMetrics.textSize,
                subtitleSize: WidgetRingMetrics.subtitleSize
            )
            .frame(maxWidth: .infinity)

            Spacer(minLength: 0)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    }
}

private struct WidgetStatBannerView: View {
    let theme: WidgetEntryTheme
    let icon: String
    let value: String
    let suffix: String

    var body: some View {
        HStack(spacing: 6) {
            HStack(spacing: 2) {
                Text(value)
                    .font(.system(size: 13, weight: .bold))
                    .foregroundStyle(theme.textColor)
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)

                Text(suffix)
                    .font(.system(size: 11, weight: .medium))
                    .foregroundStyle(theme.mutedTextColor)
                    .lineLimit(1)
            }
            .frame(maxWidth: .infinity, alignment: .leading)

            Image(systemName: icon)
                .font(.system(size: 12, weight: .semibold))
                .foregroundStyle(theme.textColor.opacity(0.85))
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 5)
        .background(
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .fill(theme.isDarkMode ? Color.white.opacity(0.04) : Color.black.opacity(0.04))
        )
    }
}

private struct WidgetMacroGoalView: View {
    let theme: WidgetEntryTheme
    let macro: WidgetMacroType
    let current: Int
    let goal: Int

    private var macroColor: Color {
        WidgetMacroColors.color(for: macro, isDarkMode: theme.isDarkMode)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 3) {
            HStack(spacing: 5) {
                Circle()
                    .fill(macroColor)
                    .frame(width: 10, height: 10)

                Text(macro.label(lang: theme.data.lang))
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundStyle(macroColor)
                    .lineLimit(1)
            }

            WidgetGoalBannerView(
                theme: theme,
                current: StepsWidgetFormatting.formattedNumber(current),
                goal: StepsWidgetFormatting.formattedNumber(goal),
                suffix: StepsWidgetFormatting.gramSuffix(lang: theme.data.lang),
                accentColor: macroColor
            )
        }
    }
}

private struct WidgetGoalBannerView: View {
    let theme: WidgetEntryTheme
    let current: String
    let goal: String
    let suffix: String
    var accentColor: Color?

    var body: some View {
        HStack(spacing: 6) {
            HStack(spacing: 2) {
                Text(current)
                    .font(.system(size: 13, weight: .bold))
                    .foregroundStyle(theme.textColor)

                Text(suffix)
                    .font(.system(size: 11, weight: .medium))
                    .foregroundStyle(theme.mutedTextColor)

                Text("/")
                    .font(.system(size: 13, weight: .bold))
                    .foregroundStyle(theme.mutedTextColor)

                Text(goal)
                    .font(.system(size: 13, weight: .bold))
                    .foregroundStyle(theme.textColor)

                Text(suffix)
                    .font(.system(size: 11, weight: .medium))
                    .foregroundStyle(theme.mutedTextColor)
            }
            .lineLimit(1)
            .minimumScaleFactor(0.65)
            .frame(maxWidth: .infinity, alignment: .leading)

            Image(systemName: "flag.fill")
                .font(.system(size: 11, weight: .semibold))
                .foregroundStyle(theme.textColor.opacity(0.85))
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background(
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .fill(theme.isDarkMode ? Color.white.opacity(0.04) : Color.black.opacity(0.04))
        )
        .overlay(alignment: .bottom) {
            Rectangle()
                .fill(accentColor ?? theme.accentColor)
                .frame(height: 2)
                .padding(.horizontal, 8)
        }
    }
}

private struct MetricTitleLabel: View {
    let icon: String
    let label: String
    let color: Color
    var fontSize: CGFloat = 11

    var body: some View {
        HStack(spacing: 5) {
            Image(systemName: icon)
                .font(.system(size: fontSize, weight: .semibold))

            Text(label)
                .font(.system(size: fontSize, weight: .semibold))
                .lineLimit(1)
        }
        .foregroundStyle(color.opacity(0.9))
    }
}

struct StepsRingView: View {
    let progress: Double
    let accentColor: Color
    let trailColor: Color
    let stepsText: String
    let textColor: Color
    let subtitle: String?
    var subtitleColor: Color?
    let ringSize: CGFloat
    let lineWidth: CGFloat
    let textSize: CGFloat
    var subtitleSize: CGFloat = 11

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

            VStack(spacing: 2) {
                Text(stepsText)
                    .font(.system(size: textSize, weight: .bold))
                    .foregroundStyle(textColor)
                    .minimumScaleFactor(0.55)
                    .lineLimit(1)

                if let subtitle {
                    Text(subtitle)
                        .font(.system(size: subtitleSize, weight: .medium))
                        .foregroundStyle(subtitleColor ?? textColor.opacity(0.55))
                        .minimumScaleFactor(0.6)
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
