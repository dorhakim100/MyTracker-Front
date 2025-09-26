import { useEffect, useMemo, useState } from 'react'
import { LineChart } from '../LineChart/LineChart'
import {
  LineChartControls,
  LineChartRangeKey,
} from '../LineChart/LineChartControls'
import { getDaysInMonth, getMonthNames } from '../../services/util.service'
import { colors } from '../../assets/config/colors'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { weightService } from '../../services/weight/weight.service'
import { Weight } from '../../types/weight/Weight'

interface WeightChartProps {
  className?: string
}

const now = new Date()

const periodMap = {
  '1M': new Date(now.setMonth(now.getMonth() - 1)).getTime(),
  '3M': new Date(now.setMonth(now.getMonth() - 3)).getTime(),
  '6M': new Date(now.setMonth(now.getMonth() - 6)).getTime(),
  '1Y': new Date(now.setFullYear(now.getFullYear() - 1)).getTime(),
  // ALL: 0,
}

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
    const period = periodMap[range as keyof typeof periodMap]

    const filteredWeights = weights.filter(
      (weight) => weight.createdAt >= period
    )

    const series = prepareSeries(range, filteredWeights)
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

    if (range === '1M') {
      const d = new Date()
      const days = getDaysInMonth(d) // [1..N]
      const map = new Map<number, number>() // day -> kg (last-of-day)
      for (const w of sorted) {
        const dt = new Date(w.createdAt)
        if (
          dt.getMonth() === d.getMonth() &&
          dt.getFullYear() === d.getFullYear()
        ) {
          map.set(dt.getDate(), w.kg)
        }
      }
      return {
        labels: days.map(String),
        data: days.map((day) => map.get(day) ?? null),
      }
    }

    const monthMap = new Map<string, number>()
    for (const w of sorted) {
      const d = new Date(w.createdAt)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      monthMap.set(key, w.kg)
    }

    const monthNames = getMonthNames()
    const buildMonthBuckets = (start: Date, count: number) => {
      const labels: string[] = []
      const data: (number | null)[] = []
      for (let i = 0; i < count; i++) {
        const d = new Date(start.getFullYear(), start.getMonth() + i, 1)
        const key = `${d.getFullYear()}-${d.getMonth()}`
        labels.push(monthNames[d.getMonth()])
        data.push(monthMap.get(key) ?? null)
      }
      return { labels, data }
    }

    if (range === '3M') {
      const today = new Date()
      const start = new Date(today.getFullYear(), today.getMonth() - 2, 1)
      return buildMonthBuckets(start, 3)
    }

    if (range === '6M') {
      const today = new Date()
      const start = new Date(today.getFullYear(), today.getMonth() - 5, 1)
      return buildMonthBuckets(start, 6)
    }

    if (range === '1Y') {
      const today = new Date()
      const start = new Date(today.getFullYear(), today.getMonth() - 11, 1)
      return buildMonthBuckets(start, 12)
    }

    if (range === 'ALL') {
      if (sorted.length === 0) return { labels: [], data: [] }
      const first = new Date(sorted[0].createdAt)
      const today = new Date()
      const monthsDiff =
        (today.getFullYear() - first.getFullYear()) * 12 +
        (today.getMonth() - first.getMonth())
      const start = new Date(first.getFullYear(), first.getMonth(), 1)
      return buildMonthBuckets(start, monthsDiff + 1)
    }

    return { labels: [], data: [] }
  }

  return (
    <div className={`weight-chart ${className}`.trim()}>
      <div className='header'>
        <h3 className='title'>Weight</h3>
      </div>
      <div className='chart-wrapper'>
        <LineChart data={data} interpolateGaps={true} />
      </div>
      <LineChartControls value={range} onChange={setRange} />
    </div>
  )
}
