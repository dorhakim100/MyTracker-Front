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

    var favoriteColor: String {
        data.favoriteColor.isEmpty ? "primary" : data.favoriteColor
    }

    var accentHex: String {
        WidgetAppPalette.accentHex(favoriteColor: favoriteColor)
    }

    var accentColor: Color {
        Color(hex: accentHex)
    }

    var inkColor: Color {
        isDarkMode ? WidgetAppPalette.inkOnSurfaceDark : WidgetAppPalette.inkOnSurfaceLight
    }

    var titleColor: Color {
        inkColor.opacity(0.7)
    }

    var mutedTextColor: Color {
        inkColor.opacity(0.5)
    }

    var ringTextColor: Color {
        accentColor
    }

    var backgroundColor: Color {
        backgroundRGB.color
    }

    var trailColor: Color {
        WidgetRGB(hex: accentHex)
            .mixed(
                with: backgroundRGB,
                amount: WidgetAppPalette.chromeTint(isDarkMode: isDarkMode)
            )
            .color
    }

    var bannerFill: Color {
        isDarkMode
            ? Color.white.opacity(WidgetAppPalette.bannerOverlay(isDarkMode: true))
            : Color.black.opacity(WidgetAppPalette.bannerOverlay(isDarkMode: false))
    }

    private var backgroundRGB: WidgetRGB {
        if isDarkMode {
            return WidgetRGB(hex: WidgetAppPalette.cardHex(
                favoriteColor: favoriteColor,
                isDarkMode: true
            ))
        }
        return WidgetRGB(hex: accentHex).mixed(with: WidgetRGB(hex: "#ffffff"), amount: 0.07)
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
                iconColor: theme.accentColor,
                labelColor: theme.titleColor,
                fontSize: WidgetRingMetrics.titleFontSize
            )
            .padding(.bottom, WidgetRingMetrics.titleBottomSpacing)

            StepsRingView(
                progress: progress,
                accentColor: theme.accentColor,
                trailColor: theme.trailColor,
                stepsText: value,
                textColor: theme.ringTextColor,
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
                    .foregroundStyle(theme.inkColor)
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
                .foregroundStyle(theme.inkColor.opacity(0.88))
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 6)
        .background(
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .fill(theme.bannerFill)
        )
    }
}

private struct WidgetMacroGoalView: View {
    let theme: WidgetEntryTheme
    let macro: WidgetMacroType
    let current: Int
    let goal: Int

    private var style: WidgetMacroStyle {
        WidgetMacroColors.style(for: macro, isDarkMode: theme.isDarkMode)
    }

    private var progress: Double {
        guard goal > 0 else { return 0 }
        return min(Double(current) / Double(goal), 1)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 3) {
            HStack(spacing: 5) {
                Circle()
                    .fill(style.swatchColor)
                    .frame(width: 10, height: 10)

                Text(macro.label(lang: theme.data.lang))
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundStyle(style.labelColor)
                    .padding(.horizontal, 4)
                    .padding(.vertical, 2)
                    .background(
                        RoundedRectangle(cornerRadius: 6, style: .continuous)
                            .fill(style.labelFill)
                    )
                    .lineLimit(1)
            }

            WidgetGoalBannerView(
                theme: theme,
                current: StepsWidgetFormatting.formattedNumber(current),
                goal: StepsWidgetFormatting.formattedNumber(goal),
                suffix: StepsWidgetFormatting.gramSuffix(lang: theme.data.lang),
                accentColor: style.color,
                progress: progress
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
    var progress: Double = 1

    private let horizontalInset: CGFloat = 12
    private let barHeight: CGFloat = 3

    var body: some View {
        HStack(spacing: 6) {
            HStack(spacing: 2) {
                Text(current)
                    .font(.system(size: 13, weight: .bold))
                    .foregroundStyle(theme.inkColor)

                Text(suffix)
                    .font(.system(size: 11, weight: .medium))
                    .foregroundStyle(theme.mutedTextColor)

                Text("/")
                    .font(.system(size: 13, weight: .bold))
                    .foregroundStyle(theme.mutedTextColor)

                Text(goal)
                    .font(.system(size: 13, weight: .bold))
                    .foregroundStyle(theme.inkColor)

                Text(suffix)
                    .font(.system(size: 11, weight: .medium))
                    .foregroundStyle(theme.mutedTextColor)
            }
            .lineLimit(1)
            .minimumScaleFactor(0.65)
            .frame(maxWidth: .infinity, alignment: .leading)

            Image(systemName: "flag.fill")
                .font(.system(size: 11, weight: .semibold))
                .foregroundStyle(theme.inkColor.opacity(0.88))
        }
        .padding(.horizontal, horizontalInset)
        .padding(.vertical, 4)
        .background(
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .fill(theme.bannerFill)
        )
        .overlay(alignment: .bottom) {
            Rectangle()
                .fill(accentColor ?? theme.accentColor)
                .frame(height: barHeight)
                .scaleEffect(x: CGFloat(progress), y: 1, anchor: .leading)
                .animation(.easeInOut(duration: 0.35), value: progress)
        }
        .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
    }
}

private struct MetricTitleLabel: View {
    let icon: String
    let label: String
    let iconColor: Color
    let labelColor: Color
    var fontSize: CGFloat = 11

    var body: some View {
        HStack(spacing: 5) {
            Image(systemName: icon)
                .font(.system(size: fontSize, weight: .semibold))
                .foregroundStyle(iconColor)

            Text(label)
                .font(.system(size: fontSize, weight: .semibold))
                .foregroundStyle(labelColor)
                .lineLimit(1)
        }
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
