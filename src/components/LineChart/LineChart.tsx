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
      data: number[]
      borderColor: string
      tension: number
    }[]
  }
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

export function LineChart({ data = defaultData }: LineChartProps) {
  const options = { responsive: true, plugins: { legend: { display: false } } }

  return <Line data={data} options={options} />
}
