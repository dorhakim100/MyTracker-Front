import { useMemo } from 'react'
import GaugeComponent from 'react-gauge-component'

interface SessionHardnessGaugeProps {
  size: 'big' | 'small'
  actualRpe: number | null
  accuracy: number | null
}

function cssVar(name: string, fallback: string) {
  if (typeof window === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim()
  return value || fallback
}

export function SessionHardnessGauge({
  size,
  actualRpe,
  accuracy,
}: SessionHardnessGaugeProps) {
  const colors = useMemo(
    () => ({
      green: cssVar('--picker-color-green', '#06d6a0'),
      yellow: cssVar('--picker-color-yellow', '#ffd166'),
      red: cssVar('--picker-color-red', '#d32f2f'),
      ink: cssVar('--ink-on-canvas', '#05090a'),
    }),
    []
  )

  const value = actualRpe == null ? 5 : Math.min(10, Math.max(5, actualRpe))
  const accuracyLabel = accuracy == null ? '—' : `${Math.round(accuracy)}%`
  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return (
    <div className={`session-hardness-gauge-container size-${size}`}>
      <GaugeComponent
        type='radial'
        minValue={5}
        maxValue={10}
        value={value}
        arc={{
          width: size === 'big' ? 0.22 : 0.3,
          padding: 0.015,
          subArcs: [
            { limit: 7, color: colors.green },
            { limit: 8.5, color: colors.yellow },
            { color: colors.red },
          ],
        }}
        pointer={{
          elastic: !reduceMotion,
          animationDelay: 0,
          animationDuration: reduceMotion ? 0 : 400,
          color: colors.ink,
          baseColor: colors.ink,
        }}
        labels={{
          valueLabel: {
            hide: size === 'small',
            formatTextValue: () => accuracyLabel,
            style: {
              fill: colors.ink,
              textShadow: 'none',
              fontSize: size === 'big' ? '28px' : '14px',
              fontWeight: 700,
            },
          },
          tickLabels: {
            type: 'inner',
            hideMinMax: size === 'small',
            ticks:
              size === 'big'
                ? [{ value: 5 }, { value: 7 }, { value: 8.5 }, { value: 10 }]
                : [],
            defaultTickValueConfig: {
              style: {
                fill: colors.ink,
                textShadow: 'none',
                fontSize: 10,
              },
            },
          },
        }}
      />
    </div>
  )
}
