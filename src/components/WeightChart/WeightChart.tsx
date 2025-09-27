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

import { TimesContainer } from '../TimesContainer/TimesContainer'
import { getFullDate } from '../../services/util.service'
import { Typography } from '@mui/material'
import { WeightCard } from '../WeightCard/WeightCard'

interface WeightChartProps {
  className?: string
}

interface Stats {
  selectedDate: Date
  selectedWeight: number | string
  message: string
}

const LABEL = 'Weight'
const GOAL_WEIGHT = 94

export function WeightChart({ className = '' }: WeightChartProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const user = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.user
  )

  const [range, setRange] = useState<LineChartRangeKey>('1M')

  const [weights, setWeights] = useState<Weight[]>([])

  const [stats, setStats] = useState<Stats>({
    selectedDate: new Date(),
    selectedWeight: 0,
    message: '',
  })

  const data = useMemo(() => {
    const series = prepareSeries(range, weights)
    const labelsToShow = series?.labels
    const kgs = series?.data ?? []

    return {
      labels: labelsToShow,
      datasets: [
        {
          label: LABEL,
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
      setStats({
        selectedDate: new Date(),
        selectedWeight: weights[0].kg,
        message: '',
      })
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

  const handleLineClick = (
    index: number,
    estimatedValue: number,
    isBaseline?: boolean
  ) => {
    estimatedValue = +estimatedValue.toFixed(1)

    let weight = data.datasets[0].data[index]
    let messageToSet = ''

    if (isBaseline) {
      messageToSet = 'Goal weight'
      weight = GOAL_WEIGHT
    } else if (!weight && estimatedValue) {
      messageToSet = 'Estimated weight'
    }

    setStats({
      selectedDate: getFullDate(data.labels[index]),
      selectedWeight: weight ?? estimatedValue,
      message: messageToSet || '',
    })
  }

  return (
    <div className={`weight-chart ${className}`}>
      <div className='header'>
        <div className='weight-container'>
          <h3 className='title'>
            {stats.selectedWeight}{' '}
            {stats.selectedWeight && <span className='kg'>kg</span>}
          </h3>

          {stats.message && (
            <Typography variant='caption'>{stats.message}</Typography>
          )}
        </div>

        <TimesContainer selectedDay={stats.selectedDate} isClock={false} />
      </div>
      <div className='chart-container'>
        <LineChart
          data={data}
          interpolateGaps={true}
          spanGaps={true}
          onLineClick={handleLineClick}
          baseline={GOAL_WEIGHT}
          baselineLabel='Goal weight'
          isDarkMode={prefs.isDarkMode}
        />
      </div>
      <LineChartControls value={range} onChange={setRange} />
      <WeightCard />
    </div>
  )
}
