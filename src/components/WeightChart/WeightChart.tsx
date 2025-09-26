import { useEffect, useMemo, useState } from 'react'
import { LineChart } from '../LineChart/LineChart'
import {
  LineChartControls,
  LineChartRangeKey,
} from '../LineChart/LineChartControls'

import { colors } from '../../assets/config/colors'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { weightService } from '../../services/weight/weight.service'
import { Weight } from '../../types/weight/Weight'

interface WeightChartProps {
  className?: string
}

const now = new Date()

export function WeightChart({ className = '' }: WeightChartProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const user = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.user
  )

  const [range, setRange] = useState<LineChartRangeKey>('3M')

  const [weights, setWeights] = useState<Weight[]>([])

  const data = useMemo(() => {
    const series = prepareSeries(range, weights)
    const labelsToShow = series?.labels
    const kgs = series?.data ?? []

    return {
      labels: labelsToShow,
      datasets: [
        {
          label: 'Weight',
          data: kgs,
          borderColor:
            colors[prefs.favoriteColor as keyof typeof colors] ||
            colors.primary,
          tension: 0.3,
        },
      ],
    }
  }, [range, weights])

  useEffect(() => {
    const fetchWeights = async () => {
      const weights = await weightService.query({
        userId: user?._id,
      })
      setWeights(weights)
    }
    fetchWeights()
  }, [user?._id])

  function prepareSeries(range: LineChartRangeKey, weights: Weight[]) {
    const sorted = [...weights].sort((a, b) => a.createdAt - b.createdAt)

    const startOfDay = (d: Date) =>
      new Date(d.getFullYear(), d.getMonth(), d.getDate())
    const today = startOfDay(new Date())

    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`)
    const dayKey = (d: Date) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

    const dayToLabel = (d: Date) => `${d.getDate()}/${d.getMonth() + 1}`

    const lastOfDayMap = new Map<string, number>()
    for (const w of sorted) {
      const d = startOfDay(new Date(w.createdAt))
      lastOfDayMap.set(dayKey(d), w.kg)
    }

    let start: Date
    if (range === 'ALL') {
      if (sorted.length === 0) return { labels: [], data: [] }
      start = startOfDay(new Date(sorted[0].createdAt))
    } else {
      const daysMap: Record<'1M' | '3M' | '6M' | '1Y', number> = {
        '1M': 30,
        '3M': 90,
        '6M': 180,
        '1Y': 365,
      }
      const count = daysMap[range as '1M' | '3M' | '6M' | '1Y']
      start = new Date(today)
      start.setDate(start.getDate() - (count - 1))
    }

    const labels: string[] = []
    const data: (number | null)[] = []
    const cursor = new Date(start)
    while (cursor <= today) {
      const key = dayKey(cursor)
      labels.push(dayToLabel(cursor))
      data.push(lastOfDayMap.get(key) ?? null)
      cursor.setDate(cursor.getDate() + 1)
    }

    return { labels, data }
  }

  return (
    <div className={`weight-chart ${className}`.trim()}>
      <div className='header'>
        <h3 className='title'>Weight</h3>
      </div>
      <div className='chart-wrapper'>
        <LineChart data={data} interpolateGaps={true} spanGaps={true} />
      </div>
      <LineChartControls value={range} onChange={setRange} />
    </div>
  )
}
