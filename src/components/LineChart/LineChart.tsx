import { Line } from 'react-chartjs-2'
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
}: LineChartProps) {
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
        radius: (ctx: any) => (ctx.raw == null ? 0 : 3),
      },
    },
  }

  return <Line data={data as any} options={options as any} />
}
