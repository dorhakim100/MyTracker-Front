import { useMemo, useState } from 'react'
import { LineChart } from '../LineChart/LineChart'
import {
  LineChartControls,
  LineChartRangeKey,
} from '../LineChart/LineChartControls'
import { getMonthNames } from '../../services/util.service'

interface WeightChartProps {
  className?: string
}

export function WeightChart({ className = '' }: WeightChartProps) {
  const [range, setRange] = useState<LineChartRangeKey>('3M')

  const data = useMemo(() => {
    // Simple stub data, can be replaced with real weights from store/service
    const labels = getMonthNames()
    const sample = [
      82, 81.8, 81.4, 81, 80.6, 80.2, 79.9, 79.7, 79.5, 79.3, 79.2, 79.0,
    ]

    // Naive range filter just for skeleton; replace with real time-based slicing
    let sliceFrom = 0
    if (range === '3M') sliceFrom = 9
    if (range === '6M') sliceFrom = 6
    if (range === '1Y' || range === 'ALL') sliceFrom = 0
    if (range === '1M') sliceFrom = 11
    if (range === '7D') sliceFrom = 12 - 2 // not really days, placeholder

    const labelsSliced = labels.slice(sliceFrom)
    const dataSliced = sample.slice(sliceFrom)

    return {
      labels: labelsSliced,
      datasets: [
        {
          label: 'Weight',
          data: dataSliced,
          borderColor: 'rgb(99, 102, 241)',
          tension: 0.3,
        },
      ],
    }
  }, [range])

  return (
    <div className={`weight-chart ${className}`.trim()}>
      <div className='header'>
        <h3 className='title'>Weight</h3>
      </div>
      <div className='chart-wrapper'>
        <LineChart data={data} />
      </div>
      <LineChartControls value={range} onChange={setRange} />
    </div>
  )
}
