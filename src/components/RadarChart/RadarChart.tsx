import { useMemo, type MouseEvent } from 'react'
import { useSelector } from 'react-redux'
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart as RechartsRadar,
  ResponsiveContainer,
} from 'recharts'
import { muscleColor } from '../../services/util.service'
import { RootState } from '../../store/store'

export interface RadarPoint {
  id: string
  label: string
  value: number
  previous?: number
}

interface RadarChartProps {
  points: RadarPoint[]
  selectedId: string | null
  onSelect: (id: string) => void
  reduceMotion?: boolean
}

const START_ANGLE = 90
const END_ANGLE = -270

function angleDiff(a: number, b: number) {
  const diff = Math.abs(a - b) % 360
  return diff > 180 ? 360 - diff : diff
}

function groupIndexAt(
  clientX: number,
  clientY: number,
  svg: SVGSVGElement,
  count: number,
) {
  const rect = svg.getBoundingClientRect()
  const dx = clientX - (rect.left + rect.width / 2)
  const dy = clientY - (rect.top + rect.height / 2)
  const distance = Math.hypot(dx, dy)
  const outer = (Math.min(rect.width, rect.height) / 2) * 0.68
  if (distance > outer) return -1

  const chartDeg = (-Math.atan2(dy, dx) * 180) / Math.PI
  const step = (END_ANGLE - START_ANGLE) / count
  let best = 0
  let bestDiff = Infinity
  for (let index = 0; index < count; index += 1) {
    const diff = angleDiff(chartDeg, START_ANGLE + index * step)
    if (diff < bestDiff) {
      bestDiff = diff
      best = index
    }
  }
  return best
}

export function RadarChart({
  points,
  selectedId,
  onSelect,
  reduceMotion = false,
}: RadarChartProps) {
  const isDarkMode = useSelector(
    (state: RootState) => state.systemModule.prefs.isDarkMode,
  )
  const max = useMemo(() => {
    const values = points.flatMap((point) => [point.value, point.previous ?? 0])
    return Math.max(1, ...values)
  }, [points])

  const showPrevious = points.some((point) => point.previous != null)

  function onAreaClick(event: MouseEvent<HTMLDivElement>) {
    if (!points.length) return
    const svg = event.currentTarget.querySelector('svg')
    if (!(svg instanceof SVGSVGElement)) return
    const index = groupIndexAt(event.clientX, event.clientY, svg, points.length)
    if (index < 0) return
    onSelect(points[index].id)
  }

  return (
    <div
      className='radar-chart-container'
      onClick={onAreaClick}
    >
      <ResponsiveContainer
        width='100%'
        height={340}
      >
        <RechartsRadar
          data={points}
          cx='50%'
          cy='50%'
          outerRadius='68%'
          startAngle={START_ANGLE}
          endAngle={END_ANGLE}
        >
          <PolarGrid stroke='color-mix(in srgb, var(--ink-on-canvas) 18%, transparent)' />
          <PolarAngleAxis
            dataKey='label'
            tick={(tickProps) => (
              <SpokeLabel
                tickProps={tickProps}
                points={points}
                selectedId={selectedId}
                isDarkMode={isDarkMode}
                onSelect={onSelect}
              />
            )}
          />
          <PolarRadiusAxis
            domain={[0, max]}
            tick={false}
            axisLine={false}
          />
          {showPrevious && (
            <Radar
              dataKey='previous'
              stroke='color-mix(in srgb, var(--ink-on-canvas) 45%, transparent)'
              fill='color-mix(in srgb, var(--ink-on-canvas) 12%, transparent)'
              fillOpacity={1}
              isAnimationActive={!reduceMotion}
              animationDuration={280}
            />
          )}
          <Radar
            dataKey='value'
            stroke='var(--accent)'
            fill='var(--accent)'
            fillOpacity={0.28}
            activeDot={false}
            dot={(dotProps) => (
              <SelectionDot
                cx={dotProps.cx}
                cy={dotProps.cy}
                payload={dotProps.payload}
                selectedId={selectedId}
              />
            )}
            isAnimationActive={!reduceMotion}
            animationDuration={280}
          />
        </RechartsRadar>
      </ResponsiveContainer>
    </div>
  )
}

function SelectionDot({
  cx,
  cy,
  payload,
  selectedId,
}: {
  cx?: number
  cy?: number
  payload?: RadarPoint
  selectedId: string | null
}) {
  if (cx == null || cy == null || payload?.id !== selectedId) return null

  return (
    <circle
      cx={cx}
      cy={cy}
      r={5}
      fill='var(--accent)'
      stroke='var(--canvas-color)'
      strokeWidth={2}
    />
  )
}

function SpokeLabel({
  tickProps,
  points,
  selectedId,
  isDarkMode,
  onSelect,
}: {
  tickProps: {
    x?: number | string
    y?: number | string
    index?: number
  }
  points: RadarPoint[]
  selectedId: string | null
  isDarkMode: boolean
  onSelect: (id: string) => void
}) {
  const point = points[tickProps.index ?? -1]
  if (!point) return null

  const x = Number(tickProps.x)
  const y = Number(tickProps.y)
  const selected = point.id === selectedId

  return (
    <g
      className={`radar-spoke ${selected ? 'selected' : ''}`}
      onClick={(event) => {
        event.stopPropagation()
        onSelect(point.id)
      }}
    >
      <rect
        x={x - 36}
        y={y - 16}
        width={72}
        height={32}
        fill='transparent'
      />
      <text
        x={x}
        y={y}
        textAnchor='middle'
        dominantBaseline='middle'
        fill={muscleColor(point.id, isDarkMode)}
        opacity={selectedId && !selected ? 0.45 : 1}
        fontWeight={selected ? 700 : 500}
        fontSize={13}
      >
        {point.label}
      </text>
    </g>
  )
}
