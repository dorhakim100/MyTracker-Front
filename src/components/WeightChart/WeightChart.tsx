import { useEffect, useMemo, useState } from 'react'
import LineChart from '../LineChart/LineChart'
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
import { Card, Typography } from '@mui/material'

import ScaleIcon from '@mui/icons-material/Scale'
import FlagIcon from '@mui/icons-material/Flag'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import CircleIcon from '@mui/icons-material/Circle'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'
import Settings from '@mui/icons-material/Settings'
import { CustomAlertDialog } from '../../CustomMui/CustomAlertDialog/CustomAlertDialog'
import { ColorPicker } from '../ColorPicker/ColorPicker'
import { setPrefs } from '../../store/actions/system.actions'
import { CustomIOSSwitch } from '../../CustomMui/CustomIOSSwitch/CustomIOSSwitch'
import { prepareSeries } from '../../services/util.service'

interface WeightChartProps {
  className?: string
  setSelectedDate?: (date: Date) => void
}

interface Stats {
  selectedDate: Date
  selectedWeight: number | string
  message: string
  isGoal: boolean
}

const LABEL = 'Weight'
const GOAL_WEIGHT = 94

const DEFAULT_MOVING_AVERAGE_PERIOD = 7

export function WeightChart({
  className = '',
  setSelectedDate,
}: WeightChartProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const user = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.user
  )

  const [range, setRange] = useState<LineChartRangeKey>('1M')

  const [weights, setWeights] = useState<Weight[]>([])
  const [previousWeights, setPreviousWeights] = useState<Weight[]>([])

  const [stats, setStats] = useState<Stats>({
    selectedDate: new Date(),
    selectedWeight: 0,
    message: '',
    isGoal: false,
  })

  const [openSettings, setOpenSettings] = useState(false)

  const data = useMemo(() => {
    const series = prepareSeries(
      range,
      weights.map((weight) => ({
        createdAt: new Date(weight.createdAt),
        value: weight.kg,
      })) as (Weight & { createdAt: string; value: number })[],
      false,
      range
    )
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
  }, [weights])

  const movingAverageData = useMemo(() => {
    const series = prepareSeries(
      range,
      weights.map((weight) => ({
        createdAt: new Date(weight.createdAt),
        value: weight.kg,
      })) as (Weight & { createdAt: string; value: number })[],
      false,
      range
    )
    const data = series?.data ?? []

    const previousWeightsToSend = previousWeights.map((weight) => {
      const weightToSend = {
        createdAt: new Date(weight.createdAt),
        value: weight.kg,
      }

      return weightToSend
    })

    const previousSeries = prepareSeries(
      '7D',
      previousWeightsToSend as (Weight & {
        createdAt: string
        value: number
      })[],
      true,
      range
    )
    const previousData = previousSeries?.data ?? []

    const combinedData = [...previousData, ...data]

    const calcPeriod = (array: number[] | null[]) => {
      return +(
        array.reduce((acc: number, curr: number | null) => {
          if (curr === null) return acc
          return acc + curr
        }, 0) / DEFAULT_MOVING_AVERAGE_PERIOD
      ).toFixed(1)
    }

    const res = data.map((_, index) => {
      const period = combinedData.slice(
        index,
        index + DEFAULT_MOVING_AVERAGE_PERIOD
      )

      if (
        period.includes(null) ||
        period.length !== DEFAULT_MOVING_AVERAGE_PERIOD
      )
        return null

      return calcPeriod(period as number[] | null[])
    })

    return res
  }, [weights, previousWeights, range])

  useEffect(() => {
    const fetchWeights = async () => {
      let fromDate
      let toDate
      let limit = 0
      switch (range) {
        case '1M':
          limit = 30
          break
        case '3M':
          limit = 90
          break
        case '6M':
          limit = 180
          break
        case '1Y':
          limit = 365
          break
        case 'ALL':
          limit = 0
          break
      }
      if (range !== 'ALL') {
        fromDate = new Date()
        toDate = new Date()
        fromDate.setDate(fromDate.getDate() - limit)
        toDate.setDate(toDate.getDate() + 1)
      } else {
        fromDate = null
        toDate = null
      }

      const weights = await weightService.query({
        userId: user?._id,
        fromDate: fromDate ? fromDate.toISOString() : null,
        toDate: toDate ? toDate.toISOString() : null,
      })

      const fromDateMinusWeek = fromDate
        ? new Date(fromDate.getTime() - 86400000 * 7).toISOString()
        : null
      const toDateMinusWeek = fromDate
        ? new Date(fromDate.getTime()).toISOString()
        : null

      const previousWeight = await weightService.query({
        userId: user?._id,
        fromDate: fromDateMinusWeek,
        toDate: toDateMinusWeek,
      })

      setWeights(weights)
      setPreviousWeights(previousWeight)

      setStats({
        selectedDate: new Date(),
        selectedWeight: weights[0].kg,
        message: '',
        isGoal: false,
      })
    }
    fetchWeights()
  }, [user?._id, range, user?.lastWeight])

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
      weight = user?.currGoal.targetWeight || GOAL_WEIGHT
    } else if (!weight && estimatedValue) {
      messageToSet = 'Estimated weight'
    } else if (!weight && !estimatedValue) {
      messageToSet = 'No weight logged'
    }

    setStats({
      selectedDate: getFullDate(data.labels[index]),
      selectedWeight: weight ?? estimatedValue,
      message: messageToSet || '',
      isGoal: isBaseline || false,
    })
    setSelectedDate?.(getFullDate(data.labels[index]))
  }

  const onOpenSettings = () => {
    setOpenSettings(true)
  }

  const onCloseSettings = () => {
    setOpenSettings(false)
  }

  return (
    <>
      <div className={`weight-chart ${className}`}>
        <Card
          variant="outlined"
          className={`card weight   ${prefs.isDarkMode ? 'dark-mode' : ''}`}
        >
          <div className="header">
            <div className="weight-container">
              <h3 className="title">
                {stats.isGoal ? <FlagIcon /> : <ScaleIcon />}
                {stats.selectedWeight}
                {stats.selectedWeight && <span className="kg">kg</span>}
              </h3>

              {stats.message && (
                <Typography variant="caption" className="message">
                  <CircleIcon />
                  {stats.message}
                </Typography>
              )}
            </div>
            <div className="date-container">
              <CalendarTodayIcon />
              <TimesContainer
                selectedDay={stats.selectedDate}
                isClock={false}
              />
            </div>
            <div className="setting-button-container">
              <CustomButton
                isIcon={true}
                icon={<Settings />}
                onClick={onOpenSettings}
                backgroundColor="transparent"
              />
            </div>
          </div>
          <div className="chart-container">
            <LineChart
              data={data}
              interpolateGaps={true}
              spanGaps={true}
              onLineClick={handleLineClick}
              baseline={user?.currGoal?.targetWeight}
              baselineLabel="Goal weight"
              isDarkMode={prefs.isDarkMode}
              movingAverageData={movingAverageData}
            />
          </div>
        </Card>
        <LineChartControls value={range} onChange={setRange} />
        {/* <WeightCard /> */}
      </div>

      <CustomAlertDialog
        open={openSettings}
        onClose={onCloseSettings}
        title="Settings"
      >
        <ModalWeightChartSettings />
      </CustomAlertDialog>
    </>
  )
}

const ModalWeightChartSettings = () => {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )
  const onChangeMovingAverageColor = (color: string) => {
    setPrefs({
      ...prefs,
      weightChartSettings: {
        ...prefs.weightChartSettings,
        movingAverageColor: color,
      },
    })
  }

  const onDisplayMovingAverage = (display: boolean) => {
    setPrefs({
      ...prefs,
      weightChartSettings: {
        ...prefs.weightChartSettings,
        isMovingAverage: display,
      },
    })
  }

  return (
    <div className="weight-chart-settings-container">
      <div
        className="display-moving-average-container"
        onClick={() =>
          onDisplayMovingAverage(!prefs.weightChartSettings.isMovingAverage)
        }
      >
        <Typography variant="h6">Display Weakly Average</Typography>

        <CustomIOSSwitch
          checked={prefs.weightChartSettings.isMovingAverage}
          color={prefs.favoriteColor}
        />
      </div>
      <div className="color-picker-container">
        <Typography variant="h6">Weakly Average Color</Typography>
        <ColorPicker
          pickedColor={prefs.weightChartSettings.movingAverageColor}
          onColorPick={onChangeMovingAverageColor}
        />
      </div>
    </div>
  )
}
