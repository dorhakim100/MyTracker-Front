import { Line } from 'react-chartjs-2'
import { useMemo, useRef } from 'react'
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
import { getMonthNames } from '../../services/util.service'
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface LineChartProps {
  data: {
    labels: string[]
    datasets: {
      label: string
      data: (number | null)[]
      borderColor: string
      tension: number
    }[]
  }
  spanGaps?: boolean | number
  interpolateGaps?: boolean
  baseline?: number
  baselineColor?: string
  baselineLabel?: string
  onLineClick?: (index: number, estimatedValue: number) => void
}

const defaultData = {
  labels: getMonthNames(),
  datasets: [
    {
      label: 'Weight',
      data: [82, 81.5, 80.7, 80],
      borderColor: 'blue',
      tension: 0.3,
    },
  ],
}

export function LineChart({
  data = defaultData,
  spanGaps = false,
  interpolateGaps = false,
  baseline,
  baselineColor = 'rgba(0,0,0,0.35)',
  baselineLabel = 'Baseline',
  onLineClick,
}: LineChartProps) {
  const interpolateSeries = (series: (number | null)[]): (number | null)[] => {
    if (!interpolateGaps) return series
    const result = [...series]
    const definedIndices: number[] = []
    for (let i = 0; i < result.length; i++) {
      if (result[i] != null) definedIndices.push(i)
    }
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
  }
  const chartRef = useRef<ChartJS<'line'>>(null)

  // const [clickedIndex, setClickedIndex] = useState<number | null>(null)
  const processedData = useMemo<
    ChartData<'line', (number | null)[], string>
  >(() => {
    const baseDatasets: ChartDataset<'line', (number | null)[]>[] =
      data.datasets.map((ds) => ({
        label: ds.label,
        data: ds.data,
        borderColor: ds.borderColor,
        tension: ds.tension,
      }))

    if (typeof baseline === 'number' && data.labels?.length) {
      baseDatasets.push({
        label: baselineLabel,
        data: Array.from({ length: data.labels.length }, () => baseline),
        borderColor: baselineColor,
        tension: 0,
        borderDash: [6, 4],
        pointRadius: 0,
        hoverRadius: 0,
      })
    }

    const base: ChartData<'line', (number | null)[], string> = {
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
  }, [data, interpolateGaps, baseline, baselineColor, baselineLabel])

  const options: ChartOptions<'line'> = {
    responsive: true,
    spanGaps,
    plugins: {
      legend: { display: false },
      tooltip: {
        filter: (ctx: TooltipItem<'line'>) => ctx.raw != null,
      },
    },
    elements: {
      point: {
        radius: (ctx: ScriptableContext<'line'>) => (ctx.raw == null ? 0 : 0.3),
      },
    },
  }

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const chart = chartRef.current

    if (!chart) return
    const elements = chart.getElementsAtEventForMode(
      e.nativeEvent as unknown as Event,
      'nearest',
      { intersect: false },
      true
    )
    if (elements.length) {
      const { datasetIndex, index } = elements[0]
      const ds = chart.data.datasets[datasetIndex]
      const estimatedValue = (ds.data as (number | null)[])[index]
      onLineClick?.(
        index,
        typeof estimatedValue === 'number' ? estimatedValue : 0
      )
    }
  }

  return (
    <Line
      data={processedData}
      options={options}
      onClick={handleClick}
      ref={chartRef}
    />
  )
}
