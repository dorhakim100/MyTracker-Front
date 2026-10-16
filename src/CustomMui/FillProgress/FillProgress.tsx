import { CSSProperties, ReactElement, useEffect, useState } from 'react'

const fillColors = {
  success: {
    light: 'var(--success-color)',
    dark: 'var(--success-color)',
    // dark: 'var(--success-color-dark-mode)',
  },
  danger: {
    light: 'var(--error-color)',
    dark: 'var(--error-color-dark-mode)',
  },
  white: { light: '#fff' },
  primary: { light: 'var(--primary-color)' },
  blue: { light: 'var(--picker-color-blue)' },
  yellow: { light: 'var(--picker-color-yellow)' },
  red: { light: 'var(--picker-color-red)' },
  orange: { light: 'var(--picker-color-orange)' },
  green: { light: 'var(--picker-color-green)' },
  deepPurple: { light: 'var(--picker-color-deep-purple)' },
  purple: { light: 'var(--picker-color-purple)' },
  pink: { light: 'var(--picker-color-pink)' },
} as const

type NamedFillColor = keyof typeof fillColors

export type FillProgressColor = NamedFillColor | (string & {})

interface FillProgressProps {
  children: ReactElement
  /** 0–100. The bar fills this much of the chosen edge. */
  value: number
  position?: 'inline-start' | 'inline-end' | 'top' | 'bottom'
  size?: 's' | 'm' | 'l'
  color?: FillProgressColor
  className?: string
  display?: boolean
  display100?: boolean
}

function toFillRatio(value: number) {
  if (!Number.isFinite(value) || value <= 0) return 0
  if (value >= 100) return 1
  return value / 100
}

function resolveFillColor(color: string) {
  if (color.startsWith('#')) return { light: color, dark: color }

  const named = (
    fillColors as Record<string, { light: string; dark?: string }>
  )[color]
  if (!named) {
    return {
      light: fillColors.success.light,
      dark: fillColors.success.dark,
    }
  }

  return { light: named.light, dark: named.dark ?? named.light }
}

/** Success and danger keep a gray track. Picker and other colors get a pale tint. */
function usesNeutralTrack(color: string) {
  if (color === 'success' || color === 'danger') return true
  if (color.startsWith('#')) return false
  return !(color in fillColors)
}

export function FillProgress({
  children,
  value,
  position = 'inline-start',
  size = 'm',
  color = 'success',
  className = '',
  display = true,
  display100 = display,
}: FillProgressProps) {
  const fillColor = resolveFillColor(color)
  const neutralTrack = usesNeutralTrack(color)

  const [afterMountValue, setAfterMountValue] = useState(display ? value : 0)

  useEffect(() => {
    if (display) {
      setAfterMountValue(value)
    } else {
      setAfterMountValue(0)
    }
  }, [value, display])

  return (
    <div
      className={`fill-progress-container ${position} size-${size}${
        neutralTrack ? ' neutral-track' : ''
      }${className ? ` ${className}` : ''}`}
      style={
        {
          '--fill-ratio': toFillRatio(afterMountValue),
          '--fill-color': fillColor.light,
          '--fill-color-dark': fillColor.dark,
        } as CSSProperties
      }
    >
      {children}
      <span
        className='fill-progress-clip'
        aria-hidden='true'
      >
        {display100 && <span className='fill-progress-track' />}
        <span className='fill-progress-bar' />
      </span>
    </div>
  )
}
