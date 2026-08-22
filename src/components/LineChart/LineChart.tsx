import { Line } from 'react-chartjs-2'
import { useMemo, useRef, useState, useCallback, useEffect } from 'react'
import type {
  ChartData,
  ChartDataset,
  ChartOptions,
  ScriptableContext,
} from 'chart.js'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { getColor } from '../../services/util.service'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import {
  lastRealIndex,
  nearestRealIndex,
  POINT_ACTIVE_BORDER,
  POINT_ACTIVE_RADIUS,
  POINT_RADIUS,
  shouldShowPointDots,
  useLineChartScrub,
  indexFromScaleValue,
  type LineChartScrubMeta,
  type SeriesValue,
} from '../../hooks/useLineChartScrub'
import {
  LineChartReadout,
  type LineChartReadoutContent,
} from './LineChartReadout'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export interface LineChartProps {
  data: {
    labels: string[]
    datasets: {
      label: string
      data: SeriesValue[]
      borderColor: string
      tension: number
    }[]
  }
  spanGaps?: boolean | number
  interpolateGaps?: boolean
  baseline?: number
  baselineColor?: string // kept for compatibility (not needed if using darkMode colors)
  baselineLabel?: string
  isDarkMode?: boolean
  onLineClick?: (
    index: number,
    estimatedValue: number,
    isBaseline?: boolean
  ) => void
  secondData?: (number | null)[]
  secondDataLabel?: string
  isDisplaySecondLine?: boolean
  isDisplayPoints?: boolean
  selectedIndex?: number | null
  showReadout?: boolean
  formatReadout?: (
    index: number,
    value: number | null
  ) => LineChartReadoutContent
  onDismissSelection?: () => void
  readoutAfterLabel?: string
}

const DARK_MODE_WHITE = '#fff'
const LIGHT_MODE_GRAY = 'rgba(0,0,0,0.35)'
const MAIN_DATASET_INDEX = 0

function defaultReadout(
  index: number,
  value: number | null,
  labels: string[]
): LineChartReadoutContent {
  const title =
    value == null
      ? '—'
      : Number.isInteger(value)
      ? String(value)
      : value.toFixed(1)
  return {
    title,
    subtitle: labels[index] ?? '',
  }
}

export default function LineChart({
  data,
  spanGaps = false,
  interpolateGaps = false,
  baseline,
  baselineLabel = 'Baseline',
  isDarkMode = false,
  onLineClick,
  secondData,
  secondDataLabel = 'Weekly Average',
  isDisplayPoints = false,
  selectedIndex: selectedIndexProp,
  showReadout = false,
  formatReadout,
  onDismissSelection,
  readoutAfterLabel,
}: LineChartProps) {
  void isDisplayPoints

  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const min = useMemo(() => {
    if (data.datasets[0].data.length === 0) return 0
    return (
      Math.floor(
        Math.min(
          ...data.datasets[0].data.filter(
            (data): data is number => data !== null
          )
        ) -
          Math.max(
            ...data.datasets[0].data.filter(
              (data): data is number => data !== null
            )
          ) /
            25
      ) || 0
    )
  }, [data])
  const max = useMemo(() => {
    if (data.datasets[0].data.length === 0) return 100
    return Math.ceil(
      Math.max(
        ...data.datasets[0].data.filter((data): data is number => data !== null)
      ) +
        Math.max(
          ...data.datasets[0].data.filter(
            (data): data is number => data !== null
          )
        ) /
          25
    )
  }, [data])

  const chartSettings = useMemo(() => prefs.weightChartSettings, [prefs])

  const chartRef = useRef<ChartJS<'line'>>(null)
  const isControlled = selectedIndexProp !== undefined
  const [internalIndex, setInternalIndex] = useState<number | null>(null)
  const selectedIndex = isControlled ? selectedIndexProp ?? null : internalIndex

  const onLineClickRef = useRef(onLineClick)
  onLineClickRef.current = onLineClick

  const originalNullIndices = useMemo(() => {
    if (!interpolateGaps || !data.datasets[0]) return new Set<number>()
    const set = new Set<number>()
    data.datasets.forEach((ds) => {
      ds.data.forEach((v, i) => {
        if (v == null) set.add(i)
      })
    })

    return set
  }, [data.datasets, interpolateGaps])

  const interpolateSeries = useCallback(
    (series: SeriesValue[]): SeriesValue[] => {
      if (!interpolateGaps) return series
      const result = [...series]
      const definedIndices: number[] = []
      for (let i = 0; i < result.length; i++)
        if (result[i] != null) definedIndices.push(i)
      if (definedIndices.length < 2) return result

      for (let k = 0; k < definedIndices.length - 1; k++) {
        const startIdx = definedIndices[k]
        const endIdx = definedIndices[k + 1]
        const startVal = result[startIdx] as number
        const endVal = result[endIdx] as number
        const gap = endIdx - startIdx
        if (gap <= 1) continue
        const step = (endVal - startVal) / gap
        for (let i = startIdx + 1; i < endIdx; i++) {
          result[i] = startVal + step * (i - startIdx)
        }
      }
      return result
    },
    [interpolateGaps]
  )

  const lightenColor = (hex: string, amount: number) => {
    if (!hex || !hex.startsWith('#')) return hex
    const num = parseInt(hex.slice(1), 16)
    let r = (num >> 16) & 0xff
    let g = (num >> 8) & 0xff
    let b = num & 0xff
    r = Math.min(255, Math.round(r + (255 - r) * amount))
    g = Math.min(255, Math.round(g + (255 - g) * amount))
    b = Math.min(255, Math.round(b + (255 - b) * amount))
    const toHex = (v: number) => v.toString(16).padStart(2, '0')
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
  }

  const toRgba = (hex: string, alpha: number) => {
    if (!hex || !hex.startsWith('#')) return hex
    const num = parseInt(hex.slice(1), 16)
    const r = (num >> 16) & 0xff
    const g = (num >> 8) & 0xff
    const b = num & 0xff
    return `rgba(${r},${g},${b},${alpha})`
  }

  const processedData = useMemo<
    ChartData<'line', SeriesValue[], string>
  >(() => {
    const baseDatasets: ChartDataset<'line', SeriesValue[]>[] =
      data.datasets.map((ds) => ({
        label: ds.label,
        data: ds.data,
        borderColor: isDarkMode
          ? lightenColor(ds.borderColor as string, 0.25)
          : ds.borderColor,
        tension: ds.tension,
        borderWidth: isDarkMode ? 2 : undefined,
      }))

    if (typeof baseline === 'number' && data.labels?.length) {
      baseDatasets.push({
        label: baselineLabel,
        data: Array.from({ length: data.labels.length }, () => baseline),
        borderColor: isDarkMode ? DARK_MODE_WHITE : LIGHT_MODE_GRAY,
        tension: 0,
        borderDash: [6, 4],
        pointRadius: 0,
        pointHoverRadius: 0,
        pointHitRadius: 0,
      })
    }

    if (secondData && secondData.length && chartSettings.isMovingAverage) {
      const movingAverageColor = getColor(chartSettings.movingAverageColor)
      const baseLineColor =
        movingAverageColor ||
        (data.datasets?.[0]?.borderColor as string | undefined) ||
        (isDarkMode ? DARK_MODE_WHITE : LIGHT_MODE_GRAY)

      let maColor: string
      if (baseLineColor.startsWith('#')) {
        const lightened = lightenColor(baseLineColor, 0.35)
        maColor = toRgba(lightened, isDarkMode ? 0.7 : 0.9)
      } else {
        maColor = isDarkMode ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.25)'
      }

      baseDatasets.push({
        label: secondDataLabel,
        data: secondData,
        borderColor: maColor,
        borderWidth: 2,
        tension: 0.2,
        pointRadius: 0,
        pointHoverRadius: 0,
        pointHitRadius: 0,
        borderJoinStyle: 'round',
        borderCapStyle: 'round',
        order: -1,
      } as ChartDataset<'line', SeriesValue[]>)
    }

    const base: ChartData<'line', SeriesValue[], string> = {
      labels: data.labels,
      datasets: baseDatasets,
    }

    if (!interpolateGaps) return base
    return {
      ...base,
      datasets: base.datasets.map((ds) => ({
        ...ds,
        data: interpolateSeries(ds.data),
      })),
    }
  }, [
    data,
    interpolateGaps,
    baseline,
    baselineLabel,
    isDarkMode,
    interpolateSeries,
    secondData,
    chartSettings,
    secondDataLabel,
  ])

  const labelCount = data.labels?.length ?? 0
  const showDots = shouldShowPointDots(labelCount)
  const safeIndex =
    selectedIndex != null && selectedIndex >= 0 && selectedIndex < labelCount
      ? selectedIndex
      : null
  const safeIndexRef = useRef(safeIndex)
  safeIndexRef.current = safeIndex

  const seriesKey = useMemo(() => {
    const labels = data.labels ?? []
    const series = data.datasets[0]?.data ?? []
    let lastVal = ''
    let count = 0
    for (let i = 0; i < series.length; i++) {
      if (series[i] != null) {
        count++
        lastVal = String(series[i])
      }
    }
    return `${labels[0] ?? ''}:${labels[labels.length - 1] ?? ''}:${
      labels.length
    }:${count}:${lastVal}`
  }, [data.labels, data.datasets])

  const mainPointRadius = useCallback(
    (ctx: ScriptableContext<'line'>) => {
      if (ctx.datasetIndex !== MAIN_DATASET_INDEX) return 0
      if (ctx.raw == null) return 0
      if (originalNullIndices.has(ctx.dataIndex)) return 0
      if (ctx.dataIndex === safeIndexRef.current) return POINT_ACTIVE_RADIUS
      return showDots ? POINT_RADIUS : 0
    },
    [originalNullIndices, showDots]
  )

  const options: ChartOptions<'line'> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: true,
      spanGaps,
      events: [],
      interaction: { mode: 'index', intersect: false, axis: 'x' },
      layout: {
        autoPadding: false,
        padding: { top: 10, right: 10, left: 4 },
      },
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
      },
      elements: {
        point: {
          radius: mainPointRadius,
          hoverRadius: mainPointRadius,
          hitRadius: 12,
          borderWidth: (ctx: ScriptableContext<'line'>) =>
            ctx.datasetIndex === MAIN_DATASET_INDEX &&
            ctx.dataIndex === safeIndexRef.current
              ? POINT_ACTIVE_BORDER
              : 0,
          backgroundColor: (ctx: ScriptableContext<'line'>) => {
            if (
              ctx.datasetIndex === MAIN_DATASET_INDEX &&
              ctx.dataIndex === safeIndexRef.current
            ) {
              return isDarkMode ? '#111' : '#fff'
            }
            return ctx.dataset.borderColor as string
          },
          borderColor: (ctx: ScriptableContext<'line'>) => {
            if (
              ctx.datasetIndex === MAIN_DATASET_INDEX &&
              ctx.dataIndex === safeIndexRef.current
            ) {
              return isDarkMode ? DARK_MODE_WHITE : '#111'
            }
            return ctx.dataset.borderColor as string
          },
        },
      },
      scales: {
        x: {
          ticks: { color: isDarkMode ? DARK_MODE_WHITE : undefined },
          grid: { color: isDarkMode ? 'rgba(255,255,255,0.08)' : undefined },
        },
        y: {
          ticks: { color: isDarkMode ? DARK_MODE_WHITE : undefined },
          grid: { color: isDarkMode ? 'rgba(255,255,255,0.08)' : undefined },
          min: min,
          max: max,
        },
      },
    }),
    [spanGaps, mainPointRadius, isDarkMode, min, max]
  )

  const emitSelection = useCallback(
    (index: number, isBaseline: boolean) => {
      safeIndexRef.current = index
      chartRef.current?.update('none')
      if (!isControlled) setInternalIndex(index)
      const chart = chartRef.current
      const firstDs = chart?.data.datasets[MAIN_DATASET_INDEX]
      const val = (firstDs?.data as SeriesValue[] | undefined)?.[index]
      onLineClickRef.current?.(
        index,
        typeof val === 'number' ? val : 0,
        isBaseline
      )
    },
    [isControlled]
  )

  const onScrubSelect = useCallback(
    (index: number, meta: LineChartScrubMeta) => {
      if (meta.kind === 'scrub') {
        emitSelection(index, false)
        return
      }

      const chart = chartRef.current
      if (!chart) {
        emitSelection(index, false)
        return
      }

      const elements = chart.getElementsAtEventForMode(
        meta.nativeEvent,
        'nearest',
        { intersect: false },
        true
      )
      if (elements.length) {
        const { datasetIndex } = elements[0]
        const ds = chart.data.datasets[datasetIndex]
        if (ds?.label === baselineLabel) {
          emitSelection(index, true)
          return
        }
      }

      emitSelection(index, false)
    },
    [baselineLabel, emitSelection]
  )

  const getIndexFromClientX = useCallback(
    (clientX: number) => {
      const chart = chartRef.current
      if (!chart) return null
      const xScale = chart.scales?.x
      if (!xScale) return null
      const rect = chart.canvas.getBoundingClientRect()
      const px = clientX - rect.left
      const clampedPx = Math.min(Math.max(px, xScale.left), xScale.right)
      const rawIndex = indexFromScaleValue(
        xScale.getValueForPixel(clampedPx),
        data.labels
      )
      if (rawIndex == null) return null
      return nearestRealIndex(
        data.datasets[0]?.data,
        rawIndex,
        selectedIndex
      )
    },
    [data.labels, data.datasets, selectedIndex]
  )

  const {
    containerRef,
    isScrubbing,
    syncLastIndex,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    onLostPointerCapture,
  } = useLineChartScrub({
    getIndexFromClientX,
    onSelect: onScrubSelect,
  })

  useEffect(() => {
    syncLastIndex(safeIndex)
  }, [safeIndex, syncLastIndex])

  useEffect(() => {
    const last = lastRealIndex(data.datasets[0]?.data)
    if (last == null) {
      if (!isControlled) setInternalIndex(null)
      return
    }
    if (!isControlled) setInternalIndex(last)
    const val = data.datasets[0]?.data[last]
    onLineClickRef.current?.(last, typeof val === 'number' ? val : 0, false)
    // Reset only when the series identity changes, not when the user scrubs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seriesKey, isControlled])

  const guidelinePlugin = useMemo(
    () => ({
      id: 'vertical-guideline',
      afterDatasetsDraw: (chart: ChartJS<'line'>) => {
        const index = safeIndexRef.current
        if (index == null) return
        const { ctx, chartArea } = chart
        if (!chartArea) return

        const meta = chart.getDatasetMeta(MAIN_DATASET_INDEX)
        const pt = meta?.data?.[index]
        const xScale = chart.scales?.x
        const xFromScale = xScale
          ? xScale.getPixelForTick(index)
          : undefined
        const x = Number.isFinite(pt?.x)
          ? pt.x
          : Number.isFinite(xFromScale)
            ? xFromScale
            : null
        if (x == null) return

        const glowColor = isDarkMode
          ? 'rgba(255,255,255,0.14)'
          : 'rgba(0,0,0,0.08)'
        const lineColor = isDarkMode
          ? 'rgba(255,255,255,0.5)'
          : 'rgba(0,0,0,0.35)'

        ctx.save()
        ctx.beginPath()
        ctx.rect(
          chartArea.left,
          chartArea.top,
          chartArea.right - chartArea.left,
          chartArea.bottom - chartArea.top
        )
        ctx.clip()

        ctx.fillStyle = glowColor
        ctx.fillRect(x - 1.5, chartArea.top, 3, chartArea.bottom - chartArea.top)

        ctx.beginPath()
        ctx.lineWidth = 2
        ctx.strokeStyle = lineColor
        ctx.moveTo(x, chartArea.top)
        ctx.lineTo(x, chartArea.bottom)
        ctx.stroke()
        ctx.restore()
      },
    }),
    [isDarkMode]
  )

  const onDismiss = useCallback(() => {
    safeIndexRef.current = null
    chartRef.current?.update('none')
    if (!isControlled) setInternalIndex(null)
    syncLastIndex(null)
    onDismissSelection?.()
  }, [isControlled, onDismissSelection, syncLastIndex])

  const processedValue =
    safeIndex == null
      ? null
      : (processedData.datasets[MAIN_DATASET_INDEX]?.data as SeriesValue[])?.[
          safeIndex
        ] ?? null

  const readoutContent =
    showReadout && safeIndex != null
      ? formatReadout
        ? formatReadout(safeIndex, processedValue)
        : defaultReadout(safeIndex, processedValue, data.labels)
      : null

  return (
    <div className={`line-chart container ${isDarkMode ? 'dark-mode' : ''}`}>
      {showReadout && (
        <div className='readout-slot'>
          {readoutContent && (
            <LineChartReadout
              title={
                readoutAfterLabel
                  ? `${readoutContent.title} ${readoutAfterLabel}`
                  : readoutContent.title
              }
              subtitle={readoutContent.subtitle}
              onDismiss={onDismiss}
              isDarkMode={isDarkMode}
            />
          )}
        </div>
      )}
      <div
        ref={containerRef}
        className={`chart-canvas-container ${
          isScrubbing ? 'is-scrubbing' : ''
        }`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onLostPointerCapture={onLostPointerCapture}
      >
        <Line
          data={processedData}
          options={options}
          ref={chartRef}
          plugins={[guidelinePlugin]}
        />
      </div>
    </div>
  )
}
