import { Line } from 'react-chartjs-2'
import { useMemo } from 'react'
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

  const processedData = useMemo(() => {
    if (!interpolateGaps) return data
    return {
      ...data,
      datasets: data.datasets.map((ds) => ({
        ...ds,
        data: interpolateSeries(ds.data),
      })),
    }
  }, [data, interpolateGaps])
  const options = {
    responsive: true,
    spanGaps,
    plugins: {
      legend: { display: false },
      tooltip: {
        filter: (ctx: any) => ctx.raw != null,
      },
    },
    elements: {
      point: {
        radius: (ctx: any) => (ctx.raw == null ? 0 : 0.3),
      },
    },
  }

  return <Line data={(processedData ?? data) as any} options={options as any} />
}
