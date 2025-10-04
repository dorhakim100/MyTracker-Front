// LineChart.tsx
import { Line } from 'react-chartjs-2'
import { useMemo, useRef, useState, useCallback, useEffect } from 'react'
import type {
  ChartData,
  ChartDataset,
  ChartOptions,
  ScriptableContext,
  TooltipItem,
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

type SeriesValue = number | null

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
}

const DARK_MODE_WHITE = '#fff'
const LIGHT_MODE_GRAY = 'rgba(0,0,0,0.35)'

export default function LineChart({
  data,
  spanGaps = false,
  interpolateGaps = false,
  baseline,
  baselineLabel = 'Baseline',
  isDarkMode = false,
  onLineClick,
}: LineChartProps) {
  const chartRef = useRef<ChartJS<'line'>>(null)
  const [clickedIndex, setClickedIndex] = useState<number | null>(null)

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

  const processedData = useMemo<
    ChartData<'line', SeriesValue[], string>
  >(() => {
    const baseDatasets: ChartDataset<'line', SeriesValue[]>[] =
      data.datasets.map((ds) => ({
        label: ds.label,
        data: ds.data,
        borderColor: isDarkMode
          ? lightenColor(ds.borderColor, 0.25)
          : ds.borderColor,
        tension: ds.tension,
        borderWidth: isDarkMode ? 2 : undefined,
        pointRadius: 0.3,
      }))

    if (typeof baseline === 'number' && data.labels?.length) {
      baseDatasets.push({
        label: baselineLabel,
        data: Array.from({ length: data.labels.length }, () => baseline),
        borderColor: isDarkMode ? DARK_MODE_WHITE : LIGHT_MODE_GRAY,
        tension: 0,
        borderDash: [6, 4],
        pointRadius: 0,
      })
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
  ])

  const options: ChartOptions<'line'> = {
    responsive: true,
    spanGaps,
    interaction: { mode: 'index', intersect: false, axis: 'x' },
    plugins: {
      legend: { display: false },
      tooltip: {
        filter: (ctx: TooltipItem<'line'>) => ctx.raw != null,
        titleColor: isDarkMode ? DARK_MODE_WHITE : undefined,
        bodyColor: isDarkMode ? DARK_MODE_WHITE : undefined,
        backgroundColor: isDarkMode ? 'rgba(0,0,0,0.8)' : undefined,
      },
    },
    elements: {
      point: {
        radius: (ctx: ScriptableContext<'line'>) => (ctx.raw == null ? 0 : 0.3),
        hitRadius: 12,
        hoverRadius: 4,
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
      },
    },
  }

  // Click handler (mouse)
  const handleClick: React.MouseEventHandler<HTMLCanvasElement> = (e) => {
    const chart = chartRef.current
    if (!chart) return

    // Try hit-test first
    const elements = chart.getElementsAtEventForMode(
      e.nativeEvent as unknown as Event,
      'nearest',
      { intersect: false },
      true
    )
    if (elements.length) {
      const { datasetIndex, index } = elements[0]
      const ds = chart.data.datasets[datasetIndex]
      const estimatedValue = (ds.data as SeriesValue[])[index]
      const isBaselineHit = ds.label === baselineLabel
      setClickedIndex(index)
      onLineClick?.(
        index,
        typeof estimatedValue === 'number' ? estimatedValue : 0,
        isBaselineHit
      )
      return
    }

    // Fallback: map pixel → x-value → index
    const native = e.nativeEvent as MouseEvent
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect()
    const px = native.clientX - rect.left
    const xScale: any = (chart as any).scales?.x
    if (!xScale) return

    const v = xScale.getValueForPixel(px)
    let idx =
      typeof v === 'number' ? Math.round(v) : data.labels.indexOf(v as string)
    if (idx < 0) return
    if (idx >= data.labels.length) idx = data.labels.length - 1
    setClickedIndex(idx)

    const firstDs = chart.data.datasets[0]
    const val = (firstDs?.data as SeriesValue[] | undefined)?.[idx]
    onLineClick?.(idx, typeof val === 'number' ? val : 0, false)
  }

  // Touch-drag support
  const handleTouchMove: React.TouchEventHandler<HTMLCanvasElement> = (evt) => {
    const chart = chartRef.current
    if (!chart) return
    const touch = evt.touches[0]
    if (!touch) return

    const rect = (evt.target as HTMLCanvasElement).getBoundingClientRect()
    const px = touch.clientX - rect.left

    const xScale: any = (chart as any).scales?.x
    if (!xScale) return

    const v = xScale.getValueForPixel(px)
    let idx =
      typeof v === 'number' ? Math.round(v) : data.labels.indexOf(v as string)
    if (idx < 0 || idx >= data.labels.length) return

    setClickedIndex(idx)

    const firstDs = chart.data.datasets[0]
    const val = (firstDs?.data as SeriesValue[] | undefined)?.[idx]
    onLineClick?.(idx, typeof val === 'number' ? val : 0, false)
  }

  // Guideline plugin (vertical line)
  const guidelinePlugin = useMemo(
    () => ({
      id: 'vertical-guideline',
      afterDatasetsDraw: (chart: ChartJS<'line'>) => {
        if (clickedIndex == null) return
        const { ctx, chartArea } = chart
        const xScale: any = (chart as any).scales?.x
        if (!xScale) return

        const labelOrIndex =
          Array.isArray(chart.data.labels) &&
          chart.data.labels[clickedIndex] != null
            ? chart.data.labels[clickedIndex]
            : clickedIndex

        const x = xScale.getPixelForValue(labelOrIndex)
        if (x == null) return

        ctx.save()
        ctx.beginPath()
        ctx.setLineDash([6, 4])
        ctx.lineWidth = 2
        ctx.strokeStyle = isDarkMode
          ? 'rgba(255,255,255,0.85)'
          : 'rgba(0,0,0,0.75)'
        ctx.moveTo(x, chartArea.top)
        ctx.lineTo(x, chartArea.bottom)
        ctx.stroke()
        ctx.restore()
      },
    }),
    [clickedIndex, isDarkMode]
  )

  // Redraw after index/color change so the line appears immediately
  useEffect(() => {
    const chart = chartRef.current
    if (!chart) return
    chart.update('none')
  }, [clickedIndex, isDarkMode])

  return (
    <Line
      data={processedData}
      options={options}
      onClick={handleClick}
      onTouchMove={handleTouchMove}
      ref={chartRef}
      plugins={[guidelinePlugin]}
    />
  )
}
