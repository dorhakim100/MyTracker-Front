import { Typography } from '@mui/material'
import { CustomIcon } from '../../../CustomMui/CustomIcon/CustomIcon'
import { CustomSelect } from '../../../CustomMui/CustomSelect/CustomSelect'
import { BottomReachIndicator } from '../../BottomReachIndicator/BottomReachIndicator'
import LineChart, { LineChartProps } from '../../LineChart/LineChart'
import { LineChartControls, LineChartRangeKey } from '../../LineChart/LineChartControls'
import SetsTable from '../../SetsTable/SetsTable'
import { Set } from '../../../types/exercise/Exercise'
import { MessageRole } from '../../../types/message/Message'
import type { User } from '../../../types/user/User'
import { ExerciseViewBy, isVolumeView } from '../../../services/set/set.helpers'

const VIEW_BY_VALUES: ExerciseViewBy[] = [
  'weight',
  'reps',
  'daily_volume',
  'weekly_volume',
]

interface ProgressProps {
  isDarkMode: boolean
  favoriteColor: string
  showNewSection: boolean
  hasHistory: boolean
  viewBy: ExerciseViewBy
  onViewByChange: (value: string) => void
  chart: {
    data: LineChartProps['data']
    secondaryData: Array<number | null | undefined>
  }
  range: LineChartRangeKey
  onRangeChange: (value: LineChartRangeKey) => void
  groupedSets: Record<string, (Set & { exerciseId: string })[]>
  workoutId?: string
  workoutName: string
  exerciseName: string
  chatRole: MessageRole
  displayUser: User | null
  hasMore: boolean
  isLoadingMore: boolean
  onReachBottom: () => void
  labels: {
    noSetsYet: string
    maxProgress: string
    viewBy: string
    weight: string
    reps: string
    dailyVolume: string
    weeklyVolume: string
    pastSessions: string
    kg: string
    sets: string
  }
}

function formatReadoutNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

export function Progress({
  isDarkMode,
  favoriteColor,
  showNewSection,
  hasHistory,
  viewBy,
  onViewByChange,
  chart,
  range,
  onRangeChange,
  groupedSets,
  workoutId,
  workoutName,
  exerciseName,
  chatRole,
  displayUser,
  hasMore,
  isLoadingMore,
  onReachBottom,
  labels,
}: ProgressProps) {
  return (
    <>
      {showNewSection && (
        <div
          className={`new-exercise-section line-chart-paper ${
            isDarkMode ? 'dark-mode' : ''
          } ${favoriteColor}`}
        >
          <CustomIcon
            name='workout'
            size='m'
            variant='subtle'
          />
          <div className='new-exercise-copy'>
            <Typography
              variant='h5'
              className='bold-header'
            >
              {labels.noSetsYet}
            </Typography>
          </div>
        </div>
      )}
      {hasHistory && (
        <div className='line-chart-container'>
          <div className='chart-header-container'>
            <Typography
              variant='h5'
              className='bold-header'
            >
              {labels.maxProgress}
            </Typography>
            <CustomSelect
              label={labels.viewBy}
              values={VIEW_BY_VALUES}
              value={viewBy}
              valueLabels={{
                weight: labels.weight,
                reps: labels.reps,
                daily_volume: labels.dailyVolume,
                weekly_volume: labels.weeklyVolume,
              }}
              onChange={onViewByChange}
              className={favoriteColor}
            />
          </div>
          <div
            className={`line-chart-paper ${isDarkMode ? 'dark-mode' : ''} ${
              favoriteColor
            }`}
          >
            <LineChart
              isDisplayPoints={true}
              data={chart.data}
              isDarkMode={isDarkMode}
              interpolateGaps={true}
              spanGaps={true}
              isDisplaySecondLine={false}
              showReadout={true}
              formatReadout={(index, value) => {
                const subtitle = chart.data.labels[index] ?? ''
                if (value == null) return { title: '—', subtitle }

                if (isVolumeView(viewBy)) {
                  const secondary = chart.secondaryData[index]
                  const unit =
                    viewBy === 'weekly_volume' ? labels.sets : labels.reps
                  if (secondary == null) {
                    return {
                      title: `${formatReadoutNumber(value)} ${labels.kg}`,
                      subtitle,
                    }
                  }
                  return {
                    title: `${formatReadoutNumber(value)} ${
                      labels.kg
                    } · ${formatReadoutNumber(secondary)} ${unit}`,
                    subtitle,
                  }
                }

                const mainUnit = viewBy === 'weight' ? labels.kg : labels.reps
                const secondary = chart.secondaryData[index]
                if (secondary == null) {
                  return {
                    title: `${formatReadoutNumber(value)} ${mainUnit}`,
                    subtitle,
                  }
                }

                const secondaryUnit = viewBy === 'weight' ? labels.reps : labels.kg
                return {
                  title: `${formatReadoutNumber(
                    value
                  )} ${mainUnit} · ${formatReadoutNumber(
                    secondary
                  )} ${secondaryUnit}`,
                  subtitle,
                }
              }}
            />
          </div>
          <LineChartControls
            value={range}
            onChange={onRangeChange}
          />
        </div>
      )}
      {hasHistory && (
        <Typography
          variant='h5'
          className='bold-header past-sessions'
        >
          {labels.pastSessions}
        </Typography>
      )}
      {hasHistory && (
        <>
          <SetsTable
            groupedSets={groupedSets}
            mainValue={viewBy}
            workoutId={workoutId}
            workoutName={workoutName}
            exerciseName={exerciseName}
            chatRole={chatRole}
            displayUser={displayUser}
          />
          <BottomReachIndicator
            hasMore={hasMore}
            isLoading={isLoadingMore}
            onReachBottom={onReachBottom}
          />
        </>
      )}
    </>
  )
}
