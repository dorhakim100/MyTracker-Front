import { useEffect, useState, type ReactNode } from 'react'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import {
  Bar,
  BarChart as RechartsBarChart,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'
import { useLineChartScrub } from '../../hooks/useLineChartScrub'
import type { ActivityFrame, GoalTarget } from '../../types/health/Activity'

export type ActivityChartBar = {
  label: string
  value: number
  goalHit: boolean
  active: boolean
  rangeLow?: number
  rangeHigh?: number
  target?: GoalTarget | null
}

interface ActivityBarChartProps {
  bars: ActivityChartBar[]
  goal: number
  axisHeight: number
  frame: ActivityFrame
  rtl?: boolean
  selectedIndex: number | null
  onSelect: (index: number) => void
  goalIcon?: ReactNode
  goalMedallion?: boolean
  goalLogo?: boolean
  yellowMedal?: boolean
}

const BAR_GAP: Record<ActivityFrame, string> = {
  week: '6%',
  month: '2%',
  quarter: '8%',
  year: '10%',
}
const Y_AXIS_WIDTH = 36

export function ActivityBarChart({
  bars,
  goal,
  axisHeight,
  frame,
  rtl = false,
  selectedIndex,
  onSelect,
  goalIcon,
  goalMedallion = true,
  goalLogo = true,
  yellowMedal = false,
}: ActivityBarChartProps) {
  const [width, setWidth] = useState(0)
  const reduceMotion = usePrefersReducedMotion()
  const icon = goalLogo
    ? goalIcon ?? <CheckRoundedIcon fontSize='small' />
    : null
  const top = Math.max(axisHeight, 1) * 1.15
  const hasRange = bars.some(
    (bar) => bar.rangeLow != null && bar.rangeHigh != null && bar.target
  )
  const orderedBars = rtl ? [...bars].reverse() : bars
  const bandSlots: { x: number; width: number }[] = []
  const labels = thinLabels(orderedBars, frame, width)
  const dataIndex = (index: number) =>
    rtl ? bars.length - 1 - index : index

  const { containerRef, isScrubbing, syncLastIndex, ...pointer } =
    useLineChartScrub({
      getIndexFromClientX: (clientX) =>
        indexFromClientX(clientX, containerRef.current, orderedBars.length, rtl),
      onSelect: (index) => onSelect(dataIndex(index)),
    })

  useEffect(() => {
    if (selectedIndex == null) {
      syncLastIndex(null)
      return
    }
    syncLastIndex(dataIndex(selectedIndex))
  }, [selectedIndex, syncLastIndex, rtl, bars.length])

  useEffect(() => {
    const element = containerRef.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width)
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [containerRef])

  return (
    <div
      ref={containerRef}
      className={`activity-bar-chart-container ${frame} ${
        isScrubbing ? 'is-scrubbing' : ''
      } ${yellowMedal ? 'medal-yellow' : ''}`}
      {...pointer}
    >
      <ResponsiveContainer width='100%' height={268}>
        <RechartsBarChart
          data={orderedBars.map((bar, index) => ({
            ...bar,
            label: labels[index],
          }))}
          barCategoryGap={BAR_GAP[frame]}
          margin={{ top: 14, right: 2, bottom: 0, left: 2 }}
        >
          <XAxis
            dataKey='label'
            axisLine={false}
            tickLine={false}
            interval={0}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            orientation={rtl ? 'right' : 'left'}
            domain={[0, top]}
            ticks={axisTicks(top, goal)}
            allowDataOverflow
            axisLine={false}
            tickLine={false}
            width={Y_AXIS_WIDTH}
            tickMargin={2}
            tick={(tickProps) => (
              <ActivityAxisTick
                {...tickProps}
                goal={goal}
                rtl={rtl}
              />
            )}
          />
          {!hasRange && goal > 0 && (
            <ReferenceLine
              y={goal}
              stroke='var(--activity-goal-line)'
              strokeWidth={2.5}
              strokeDasharray='6 5'
              zIndex={200}
            />
          )}
          <Bar
            dataKey='value'
            background={{ fill: 'transparent' }}
            zIndex={400}
            isAnimationActive={!reduceMotion}
            animationDuration={320}
            shape={(props) => (
              <ActivityBarShape
                {...props}
                top={top}
                bars={orderedBars}
                bandSlots={bandSlots}
                icon={icon}
                showMedallion={goalMedallion}
                selected={dataIndex(props.index) === selectedIndex}
              />
            )}
          >
            {orderedBars.map((bar, index) => (
              <Cell
                key={`${bar.label}-${index}`}
                fill={barFill(bar.active)}
              />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}

function ActivityMedal({
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

function sameBand(a?: ActivityChartBar, b?: ActivityChartBar) {
  if (!a?.target || !b?.target) return false
  return (
    a.target === b.target &&
    a.rangeLow === b.rangeLow &&
    a.rangeHigh === b.rangeHigh
  )
}

function bandBox(
  bar: ActivityChartBar | undefined,
  x: number,
  width: number,
  background: { y?: number | null; height?: number | null } | undefined,
  top: number
) {
  if (!bar?.target || bar.rangeLow == null || bar.rangeHigh == null) return null
  const plotY = background?.y
  const plotH = background?.height
  if (plotY == null || plotH == null || plotH <= 0 || top <= 0) return null
  const high = yFor(bar.rangeHigh, plotY, plotH, top)
  const low = yFor(bar.rangeLow, plotY, plotH, top)
  const y = Math.min(high, low)
  const height = Math.max(2, Math.abs(low - high))
  return { x, y, width, height, target: bar.target }
}

function yFor(value: number, plotY: number, plotH: number, top: number) {
  const ratio = Math.min(1, Math.max(0, value / top))
  return plotY + plotH * (1 - ratio)
}

function barFill(active: boolean) {
  if (active) return 'var(--activity-bar-active)'
  return 'var(--activity-bar)'
}

function ActivityBarShape(props: {
  x?: number
  y?: number
  width?: number
  height?: number
  fill?: string
  index?: number
  background?: { y?: number | null; height?: number | null }
  payload?: ActivityChartBar
  bars: ActivityChartBar[]
  bandSlots: { x: number; width: number }[]
  icon: ReactNode
  showMedallion: boolean
  selected: boolean
  top: number
}) {
  const {
    x = 0,
    y = 0,
    width = 0,
    height = 0,
    fill,
    index = 0,
    background,
    payload,
    bars,
    bandSlots,
    icon,
    showMedallion,
    selected,
    top,
  } = props
  if (width <= 0) return <g />
  const corner = width > 18 ? 8 : 3
  const center = x + width / 2
  const dotY = y - 12
  const baseline = (background?.y ?? y) + (background?.height ?? height)
  const seal = Math.min(32, width - 1)
  const medalRadius = seal / 2
  const iconSize = Math.round(medalRadius * 1.05)
  const showIcon =
    Boolean(payload?.goalHit) &&
    height >= medalRadius * 2.5 + 2 &&
    seal >= 18
  const medalY = y + 2 + medalRadius

  const prevSlot = bandSlots[index - 1]
  bandSlots[index] = { x, width }
  const band = bandBox(payload, x, width, background, top)
  if (band && prevSlot && sameBand(bars[index - 1], payload)) {
    const start = prevSlot.x + prevSlot.width
    band.x = start
    band.width = x + width - start
  }

  return (
    <g>
      {band && (
        <rect
          className={`activity-band activity-band-${band.target}`}
          x={band.x}
          y={band.y}
          width={band.width}
          height={band.height}
        />
      )}
      {height > 0 && (
        <rect
          className='activity-bar-value'
          x={x}
          y={y}
          width={width}
          height={height}
          rx={corner}
          fill={fill}
          stroke='none'
          style={{ outline: 'none' }}
        />
      )}
      {band && (
        <g
          className={`activity-band-edge activity-band-${band.target}`}
          pointerEvents='none'
        >
          <line
            x1={band.x}
            x2={band.x + band.width}
            y1={band.y}
            y2={band.y}
            strokeDasharray='6 5'
          />
          <line
            x1={band.x}
            x2={band.x + band.width}
            y1={band.y + band.height}
            y2={band.y + band.height}
            strokeDasharray='6 5'
          />
        </g>
      )}
      {selected && height > 0 && (
        <g
          className='activity-bar-marker'
          pointerEvents='none'
        >
          <line
            x1={center}
            x2={center}
            y1={dotY}
            y2={baseline}
            stroke='var(--activity-marker)'
            strokeWidth={2.5}
          />
          <circle
            cx={center}
            cy={dotY}
            r={4}
            fill='var(--activity-marker-fill)'
            stroke='var(--activity-marker)'
            strokeWidth={2}
          />
        </g>
      )}
      {showIcon && (showMedallion || icon) && (
        <g pointerEvents='none'>
          {showMedallion && (
            <ActivityMedal
              cx={center}
              cy={medalY}
              radius={medalRadius}
            />
          )}
          {icon && (
            <foreignObject
              x={center - iconSize / 2}
              y={medalY - iconSize / 2}
              width={iconSize}
              height={iconSize}
            >
              <div className='activity-bar-goal-icon'>{icon}</div>
            </foreignObject>
          )}
        </g>
      )}
    </g>
  )
}

function thinLabels(bars: ActivityChartBar[], frame: ActivityFrame, width: number) {
  if (frame !== 'month' || width <= 0) return bars.map((bar) => bar.label)
  const step = Math.max(1, Math.ceil(bars.length / Math.max(1, Math.floor(width / 36))))
  return bars.map((bar, index) => (index % step === 0 ? bar.label : ''))
}

function indexFromClientX(
  clientX: number,
  element: HTMLDivElement | null,
  count: number,
  rtl: boolean
) {
  if (!element || count <= 0) return null
  const fromBars = indexFromBars(element, clientX, count)
  if (fromBars != null) return fromBars

  const surface = element.querySelector('.recharts-surface')
  const box = (surface ?? element).getBoundingClientRect()
  const plotLeft = box.left + (rtl ? 2 : Y_AXIS_WIDTH)
  const plotWidth = box.width - Y_AXIS_WIDTH - 2
  if (plotWidth <= 0) return null
  const ratio = (clientX - plotLeft) / plotWidth
  if (ratio < 0 || ratio > 1) return null
  return Math.min(count - 1, Math.floor(ratio * count))
}

function indexFromBars(
  element: HTMLDivElement,
  clientX: number,
  count: number
) {
  const placed = [...element.querySelectorAll('.recharts-bar-rectangle')].flatMap(
    (group, index) => {
      const box = (
        group.querySelector('.activity-bar-value') ?? group.querySelector('rect')
      )?.getBoundingClientRect()
      if (!box || box.width <= 0) return []
      return [{ index, center: box.left + box.width / 2 }]
    }
  )
  if (placed.length < 2) return null

  const first = placed[0]
  const last = placed[placed.length - 1]
  if (last.index === first.index) return null
  const pitch = (last.center - first.center) / (last.index - first.index)
  if (pitch === 0) return null

  const origin = first.center - first.index * pitch - pitch / 2
  const start = Math.min(origin, origin + pitch * count)
  const end = Math.max(origin, origin + pitch * count)
  if (clientX < start || clientX > end) return null
  return Math.min(count - 1, Math.max(0, Math.floor((clientX - origin) / pitch)))
}

function axisTicks(top: number, goal: number) {
  const marks = [0]
  if (goal > 0 && goal < top) marks.push(goal)
  const mid = Math.round(top / 2)
  const crowded = marks.some((mark) => Math.abs(mark - mid) < top * 0.12)
  if (mid > 0 && !crowded) marks.push(mid)
  return [...new Set(marks)].sort((a, b) => a - b)
}

function ActivityAxisTick({
  x = 0,
  y = 0,
  payload,
  goal,
  rtl = false,
}: {
  x?: string | number
  y?: string | number
  payload?: { value?: number | string }
  goal: number
  rtl?: boolean
}) {
  const value = Number(payload?.value) || 0
  const isGoal = goal > 0 && value === goal
  return (
    <text
      className='recharts-cartesian-axis-tick-value'
      x={Number(x)}
      y={Number(y)}
      direction='ltr'
      textAnchor={rtl ? 'start' : 'end'}
      dominantBaseline='middle'
      fill={isGoal ? 'var(--accent)' : 'var(--ink-on-canvas)'}
      fontSize={11}
      fontWeight={isGoal ? 700 : 400}
    >
      {compactTick(value)}
    </text>
  )
}

function compactTick(value: number) {
  if (value >= 1000) {
    const compact = Math.round(value / 100) / 10
    return `${compact}k`
  }
  return String(Math.round(value))
}

function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false)
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduce(query.matches)
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])
  return reduce
}
