import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import LineChart from '../LineChart/LineChart'
import {
  LineChartControls,
  LineChartRangeKey,
} from '../LineChart/LineChartControls'

import { colors } from '../../assets/config/colors'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { weightService } from '../../services/weight/weight.service'
import { WeightChartSeries } from '../../types/chart/ChartSeries'

import { TimesContainer } from '../TimesContainer/TimesContainer'
import { getFullDate, getColor } from '../../services/util.service'
import { Card, LinearProgress, Typography } from '@mui/material'

import ScaleIcon from '@mui/icons-material/Scale'
import TimelineIcon from '@mui/icons-material/Timeline'
import FlagIcon from '@mui/icons-material/Flag'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import CircleIcon from '@mui/icons-material/Circle'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'
import Settings from '@mui/icons-material/Settings'
import { CustomAlertDialog } from '../../CustomMui/CustomAlertDialog/CustomAlertDialog'
import { ColorPicker } from '../ColorPicker/ColorPicker'
import { setPrefs } from '../../store/actions/system.actions'
import { CustomIOSSwitch } from '../../CustomMui/CustomIOSSwitch/CustomIOSSwitch'
import { User } from '../../types/user/User'
import { WeightChangeDisplay } from '../WeightChangeDisplay/WeightChangeDisplay'
import CustomSkeleton from '../../CustomMui/CustomSkeleton/CustomSkeleton'
import { RollingNumber } from '../RollingNumber/RollingNumber'

interface WeightChartProps {
  className?: string
  setSelectedDate?: (date: Date) => void
  sentUser: User | undefined
  onOpenStatistics?: () => void
}

interface Stats {
  selectedDate: Date
  selectedWeight: number | string
  message: string
  isGoal: boolean
}

const GOAL_WEIGHT = 94

const DEFAULT_MOVING_AVERAGE_PERIOD = 7

const EMPTY_CHART: WeightChartSeries = {
  labels: [],
  data: [],
  movingAverage: [],
  previousAverage: null,
}

export function WeightChart({
  className = '',
  setSelectedDate,
  sentUser,
  onOpenStatistics,
}: WeightChartProps) {
  const { t } = useTranslation()
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const user = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.user
  )

  const [chartLoading, setChartLoading] = useState(false)

  const [range, setRange] = useState<LineChartRangeKey>('1M')

  const [chart, setChart] = useState<WeightChartSeries>(EMPTY_CHART)
  const [stats, setStats] = useState<Stats>({
    selectedDate: new Date(),
    selectedWeight: 0,
    message: '',
    isGoal: false,
  })

  const [openSettings, setOpenSettings] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const data = useMemo(() => {
    return {
      labels: chart.labels,
      datasets: [
        {
          label: t('weight.weight'),
          data: chart.data,
          borderColor:
            colors[prefs.favoriteColor as keyof typeof colors] ||
            colors.primary,
          tension: 0.3,
        },
      ],
    }
  }, [chart, t])

  const movingAverageData = chart.movingAverage

  const weeklyChange = useMemo(() => {
    if (selectedIndex == null) return 0
    const currAverage = movingAverageData[selectedIndex]
    const prevAverage =
      movingAverageData[selectedIndex - DEFAULT_MOVING_AVERAGE_PERIOD] ||
      chart.previousAverage

    if (!currAverage || !prevAverage) {
      return 0
    }

    const diff = +(currAverage - prevAverage).toFixed(1)

    return diff
  }, [chart, movingAverageData, selectedIndex])

  const rangeChange = useMemo(() => {
    const firstAverage = movingAverageData.find((average) => average !== null)
    const reversedMovingAverageData = [...movingAverageData].reverse()
    const lastAverage = reversedMovingAverageData.find(
      (average) => average !== null
    )
    if (!firstAverage || !lastAverage) {
      return 0
    }
    const diff = +(lastAverage - firstAverage).toFixed(1)
    return diff
  }, [movingAverageData, range])

  const weeklyAverageValue =
    selectedIndex != null ? movingAverageData[selectedIndex] : null

  useEffect(() => {
    const fetchChart = async () => {
      setChartLoading(true)
      const nextChart = await weightService.getChart({
        userId: sentUser?._id || user?._id,
        range,
      })
      const latestKg = [...nextChart.data].reverse().find((kg) => kg != null)

      setChart(nextChart)
      setStats({
        selectedDate: new Date(),
        selectedWeight: latestKg || 0,
        message: '',
        isGoal: false,
      })
      setChartLoading(false)
    }
    fetchChart()
  }, [sentUser?._id, user?._id, range, user?.lastWeight])

  const handleLineClick = (
    index: number,
    estimatedValue: number,
    isBaseline?: boolean
  ) => {
    estimatedValue = +estimatedValue.toFixed(1)

    let weight = data.datasets[0].data[index]

    let messageToSet = ''

    if (isBaseline) {
      messageToSet = t('weight.goalWeight')
      weight =
        sentUser?.currGoal.targetWeight ||
        user?.currGoal.targetWeight ||
        GOAL_WEIGHT
    } else if (!weight && estimatedValue) {
      messageToSet = t('weight.estimatedWeight')
    } else if (!weight && !estimatedValue) {
      messageToSet = t('weight.noWeightLogged')
    }

    setSelectedIndex(index)

    const label = data.labels[index]
    if (!label) return

    setStats({
      selectedDate: getFullDate(label),
      selectedWeight: weight ?? estimatedValue,
      message: messageToSet || '',
      isGoal: isBaseline || false,
    })
    setSelectedDate?.(getFullDate(label))
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
          variant='outlined'
          className={`card weight   ${prefs.isDarkMode ? 'dark-mode' : ''} ${
            prefs.favoriteColor
          }`}
        >
          <div className='header'>
            {onOpenStatistics && (
              <div className='statistics-button-container'>
                <CustomButton
                  borderIcon
                  isIcon
                  icon={<TimelineIcon />}
                  onClick={onOpenStatistics}
                  ariaLabel={t('weight.statistics')}
                  className={prefs.favoriteColor}
                />
              </div>
            )}
            <div className='weight-container'>
              <h3 className='title'>
                {stats.isGoal ? <FlagIcon /> : <ScaleIcon />}
                {chartLoading ? (
                  <CustomSkeleton
                    variant='text'
                    width={90}
                    height={60}
                    isDarkMode={prefs.isDarkMode}
                    className='chart-legend-skeleton'
                  />
                ) : (
                  <>
                    <RollingNumber
                      value={+stats.selectedWeight}
                      className='weight-value'
                    />
                    {stats.selectedWeight && (
                      <span className='kg'>{t('weight.kg')}</span>
                    )}
                  </>
                )}
              </h3>

              {prefs.weightChartSettings.isDisplayWeeklyChange &&
                !stats.isGoal &&
                !chartLoading && (
                  <WeightChangeDisplay
                    value={rangeChange}
                    range={range}
                  />
                )}

              {stats.message && (
                <Typography
                  variant='caption'
                  className='message'
                >
                  <CircleIcon />
                  {stats.message}
                </Typography>
              )}
            </div>
            <div className='date-container'>
              <CalendarTodayIcon />
              <TimesContainer
                selectedDay={stats.selectedDate}
                isClock={false}
              />
              {prefs.weightChartSettings.isDisplayWeeklyChange &&
                !stats.isGoal && <WeightChangeDisplay value={weeklyChange} />}
            </div>

            <div className='setting-button-container'>
              <CustomButton
                isIcon={true}
                icon={<Settings />}
                onClick={onOpenSettings}
                tooltipTitle={t('weight.settings')}
                variant='flat'
              />
            </div>
          </div>

          <div className='chart-container'>
            <LineChart
              data={data}
              interpolateGaps={true}
              spanGaps={true}
              selectedIndex={selectedIndex}
              onLineClick={handleLineClick}
              readoutAfterLabel={t('weight.kg')}
              baseline={
                sentUser?.currGoal?.targetWeight || user?.currGoal?.targetWeight
              }
              baselineLabel={t('weight.goalWeight')}
              isDarkMode={prefs.isDarkMode}
              secondData={movingAverageData}
              secondDataLabel={t('weight.weeklyAverage')}
            />
            {chartLoading ? (
              <CustomSkeleton
                variant='text'
                width={180}
                height={24}
                isDarkMode={prefs.isDarkMode}
                className='chart-legend-skeleton'
              />
            ) : (
              prefs.weightChartSettings.isMovingAverage && (
                <div
                  className={`chart-legend container ${
                    prefs.isDarkMode ? 'dark-mode' : ''
                  }`}
                >
                  <span
                    className='legend-swatch'
                    style={{
                      backgroundColor: getColor(
                        prefs.weightChartSettings.movingAverageColor
                      ),
                    }}
                  />
                  <Typography
                    variant='caption'
                    className='legend-label'
                  >
                    {t('weight.weeklyAverage')}
                  </Typography>
                  {weeklyAverageValue != null && (
                    <Typography
                      variant='caption'
                      className='legend-value'
                    >
                      {weeklyAverageValue}
                      <span className='kg'>{t('weight.kg')}</span>
                    </Typography>
                  )}
                </div>
              )
            )}
          </div>
          {chartLoading && (
            <LinearProgress
              className={`${prefs.isDarkMode ? 'dark-mode' : ''} ${
                prefs.favoriteColor
              }`}
            />
          )}
        </Card>
        <LineChartControls
          value={range}
          onChange={setRange}
        />
        {/* <WeightCard /> */}
      </div>

      <CustomAlertDialog
        open={openSettings}
        onClose={onCloseSettings}
        title={t('weight.settings')}
      >
        <ModalWeightChartSettings />
      </CustomAlertDialog>
    </>
  )
}

const ModalWeightChartSettings = () => {
  const { t } = useTranslation()
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

  const onToggleDisplay = (
    type: 'isMovingAverage' | 'isDisplayWeeklyChange'
  ) => {
    const newValue = !prefs.weightChartSettings[type]
    setPrefs({
      ...prefs,
      weightChartSettings: {
        ...prefs.weightChartSettings,
        [type]: newValue,
      },
    })
  }

  return (
    <div className='weight-chart-settings-container'>
      <div
        className='display-moving-average-container'
        onClick={() => onToggleDisplay('isMovingAverage')}
      >
        <Typography variant='h6'>{t('weight.displayWeeklyAverage')}</Typography>

        <CustomIOSSwitch
          checked={prefs.weightChartSettings.isMovingAverage}
          color={prefs.favoriteColor}
        />
      </div>
      <div
        className='display-moving-average-container'
        onClick={() => onToggleDisplay('isDisplayWeeklyChange')}
      >
        <Typography variant='h6'>{t('weight.displayWeightChange')}</Typography>

        <CustomIOSSwitch
          checked={prefs.weightChartSettings.isDisplayWeeklyChange}
          color={prefs.favoriteColor}
        />
      </div>
      <div className='color-picker-container'>
        <Typography variant='h6'>{t('weight.weeklyAverageColor')}</Typography>
        <ColorPicker
          pickedColor={prefs.weightChartSettings.movingAverageColor}
          onColorPick={onChangeMovingAverageColor}
        />
      </div>
    </div>
  )
}
