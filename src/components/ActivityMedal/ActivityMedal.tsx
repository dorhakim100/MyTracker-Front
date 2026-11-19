import type { ReactNode } from 'react'

const MARK_RADIUS = 50

interface ActivityMedalProps {
  cx?: number
  cy?: number
  radius?: number
  size?: number
  icon?: ReactNode
  yellow?: boolean
  className?: string
}

export function ActivityMedal({
  cx = 0,
  cy = 0,
  radius,
  size = 36,
  icon,
  yellow = false,
  className = '',
}: ActivityMedalProps) {
  if (radius != null) {
    return (
      <MedalMark
        cx={cx}
        cy={cy}
        radius={radius}
      />
    )
  }

  const bounds = medalBounds(MARK_RADIUS)
  const iconWidth = (MARK_RADIUS * 1.05) / bounds.width
  const iconLeft = -bounds.minX / bounds.width
  const iconTop = -bounds.minY / bounds.height

  return (
    <div
      className={`activity-medal-container ${
        yellow ? 'medal-yellow' : ''
      } ${className}`.trim()}
      style={{ width: size }}
      aria-hidden='true'
    >
      <svg
        viewBox={`${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}`}
      >
        <MedalMark
          cx={0}
          cy={0}
          radius={MARK_RADIUS}
        />
      </svg>
      {icon && (
        <div
          className='activity-medal-icon'
          style={{
            width: `${iconWidth * 100}%`,
            left: `${iconLeft * 100}%`,
            top: `${iconTop * 100}%`,
          }}
        >
          {icon}
        </div>
      )}
    </div>
  )
}

function MedalMark({
  cx,
  cy,
  radius,
}: {
  cx: number
  cy: number
  radius: number
}) {
  const stroke = Math.max(1, radius * 0.07)

  return (
    <g>
      <path
        d={medalRibbons(cx, cy, radius)}
        fill='var(--activity-medal-ribbon)'
        stroke='var(--activity-medal-edge)'
        strokeWidth={stroke}
        strokeLinejoin='round'
      />
      <path
        d={medalSeal(cx, cy, radius)}
        fill='var(--activity-medal-ribbon)'
        stroke='var(--activity-medal-edge)'
        strokeWidth={stroke}
        strokeLinejoin='round'
      />
      <circle
        cx={cx}
        cy={cy}
        r={radius * 0.68}
        fill='var(--activity-medal-face)'
        stroke='var(--activity-medal-edge)'
        strokeWidth={stroke}
      />
    </g>
  )
}

function medalBounds(radius: number) {
  const pad = Math.max(1, radius * 0.07) / 2
  const minX = -radius - pad
  const minY = -radius - pad
  const maxX = radius + pad
  const maxY = radius * 1.38 + pad

  return {
    minX,
    minY,
    width: maxX - minX,
    height: maxY - minY,
  }
}

function medalSeal(cx: number, cy: number, radius: number) {
  const lobes = 12
  const steps = lobes * 6
  let path = ''

  for (let step = 0; step <= steps; step++) {
    const turn = (step / steps) * Math.PI * 2 - Math.PI / 2
    const wave = (1 + Math.cos(turn * lobes)) / 2
    const r = radius * (0.86 + 0.14 * wave)
    const point = `${(cx + Math.cos(turn) * r).toFixed(1)} ${(cy + Math.sin(turn) * r).toFixed(1)}`
    path += step === 0 ? `M${point}` : `L${point}`
  }

  return `${path}Z`
}

function medalRibbons(cx: number, cy: number, radius: number) {
  const top = cy + radius * 0.4
  const tip = cy + radius * 1.38
  const notch = tip - radius * 0.3

  return `${ribbonSide(cx, top, tip, notch, radius, -1)}${ribbonSide(cx, top, tip, notch, radius, 1)}`
}

function ribbonSide(
  cx: number,
  top: number,
  tip: number,
  notch: number,
  radius: number,
  side: 1 | -1
) {
  const points = [
    [cx - side * radius * 0.02, top],
    [cx + side * radius * 0.76, top + radius * 0.1],
    [cx + side * radius * 0.56, tip],
    [cx + side * radius * 0.34, notch],
    [cx + side * radius * 0.04, tip - radius * 0.06],
  ]

  return (
    points
      .map(
        (point, index) =>
          `${index === 0 ? 'M' : 'L'}${point[0].toFixed(1)} ${point[1].toFixed(1)}`
      )
      .join('') + 'Z'
  )
}
