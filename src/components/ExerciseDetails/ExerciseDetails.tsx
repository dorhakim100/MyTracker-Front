import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { getExerciseSummary } from '../../services/exersice-search/exersice-search'
import { setService } from '../../services/set/set.service'
import { Exercise } from '../../types/exercise/Exercise'
import { MessageRole } from '../../types/message/Message'

import { Badge, Divider, Typography } from '@mui/material'
import { RootState } from '../../store/store'
import { ExpectedActual } from '../../types/expectedActual/ExpectedActual'
import { exerciseImage as exerciseImageObject } from '../../assets/config/exercise-image'
import { CustomAccordion } from '../../CustomMui/CustomAccordion/CustomAccordion'
import { CustomAnimatedText } from '../../CustomMui/CustomAnimatedText/CustomAnimatedText'
import { CustomIcon } from '../../CustomMui/CustomIcon/CustomIcon'
import { Set } from '../../types/exercise/Exercise'
import {
  getDateFromLineChartRangeKey,
  getDateFromISO,
  prepareSeries,
} from '../../services/util.service'
import SetsTable from '../SetsTable/SetsTable'
import LineChart, { LineChartProps } from '../LineChart/LineChart'
import {
  LineChartControls,
  LineChartRangeKey,
} from '../LineChart/LineChartControls'
import { colors } from '../../assets/config/colors'
import { CustomSelect } from '../../CustomMui/CustomSelect/CustomSelect'
import { SetFilter } from '../../types/setFilter/SetFilter'
import { useSets } from '../../hooks/useSets'
import { useChatRole } from '../../hooks/useChatRole'
import { BottomReachIndicator } from '../BottomReachIndicator/BottomReachIndicator'
import { showErrorMsg } from '../../services/event-bus.service'
import { capitalizeFirstLetter } from '../../services/util.service'
import { MarqueeText } from '../MarqueeText/MarqueeText'
import { BodyPartBadges } from '../BodyPartBadge/BodyPartBadge'
import {
  ExerciseViewBy,
  getPickMetric,
  getSessionVolume,
  pickBestSet,
} from '../../services/set/set.helpers'

const VIEW_BY_VALUES: ExerciseViewBy[] = ['weight', 'reps', 'volume']

function formatReadoutNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

export interface ExerciseWithDetails extends Exercise {
  notes?: ExpectedActual<string>
  rpe?: ExpectedActual<number>
  rir?: ExpectedActual<number>
  instructions?: string[]
  sets?: ExpectedActual<number>
}
interface ExerciseDetailsProps {
  exercise: ExerciseWithDetails | null
  workoutId?: string
  workoutName?: string
  chatRole?: MessageRole
}

export function ExerciseDetails({
  exercise,
  workoutId,
  workoutName = '',
  chatRole,
}: ExerciseDetailsProps) {
  const { t } = useTranslation()
  const watchedRole = useChatRole()
  const role = chatRole ?? watchedRole

  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const user = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.user
  )
  const traineeUser = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.traineeUser
  )

  const isDashboard = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.isDashboard
  )

  const [exerciseInstructions, setExerciseInstructions] = useState<
    string[] | null
  >(null)

  const [exerciseImage, setExerciseImage] = useState<string>(
    exercise?.image || ''
  )

  const [groupedSets, setGroupedSets] = useState<Record<string, Set[]>>({})
  const [range, setRange] = useState<LineChartRangeKey>('1M')
  const [viewBy, setViewBy] = useState<ExerciseViewBy>('weight')
  const [setsGraphFilter, setSetsGraphFilter] = useState<SetFilter>({
    exerciseId: exercise?.exerciseId,
    userId: traineeUser?._id || user?._id,
    from: getDateFromLineChartRangeKey(range),
    to: new Date(),
  })

  const setsQuery = useSets({
    exerciseId: exercise?.exerciseId,
    userId: traineeUser?._id || user?._id,
    limit: 20,
  })

  const groupedSetsForTable = useMemo(
    () => groupSetsByDate([...setsQuery.items]),
    [setsQuery.items]
  )
  const setsData = useMemo(() => {
    const pickMetric = getPickMetric(viewBy)
    const secondaryMetric = pickMetric === 'weight' ? 'reps' : 'weight'

    return Object.values(groupedSets)
      .reverse()
      .map((daySets) => {
        const createdAt = daySets[0]?.createdAt as unknown as string
        if (viewBy === 'volume') {
          return {
            createdAt,
            value: getSessionVolume(daySets),
          }
        }

        const best = pickBestSet(daySets, pickMetric)
        return {
          createdAt,
          value: best?.[pickMetric].actual,
          secondary: best?.[secondaryMetric].actual,
        }
      })
      .filter(
        (
          item
        ): item is { createdAt: string; value: number; secondary?: number } =>
          Boolean(item.createdAt) && item.value != null
      )
  }, [groupedSets, viewBy])

  const chart = useMemo(() => {
    const dateToSend = setsData.map((set) => ({
      createdAt: set.createdAt,
      value: set.value,
    }))
    const series = prepareSeries(
      range,
      dateToSend as (Set & { createdAt: string; value: number })[],
      false,
      range
    )

    const data: LineChartProps['data'] = {
      labels: series?.labels ?? [],
      datasets: [
        {
          label: t(`exercise.${viewBy}`),
          data: series?.data ?? [],
          borderColor:
            colors[prefs.favoriteColor as keyof typeof colors] ||
            colors.primary,
          tension: 0.3,
        },
      ],
    }

    let secondaryData: (number | null)[] = []
    if (viewBy !== 'volume') {
      const secondDateToSend = setsData.map((set) => ({
        createdAt: set.createdAt,
        value: set.secondary as number,
      }))
      const secondSeries = prepareSeries(
        range,
        secondDateToSend as (Set & { createdAt: string; value: number })[],
        false,
        range
      )
      secondaryData = secondSeries?.data ?? []
    }

    return { data, secondaryData }
  }, [setsData, viewBy, range, prefs.favoriteColor, t])

  useEffect(() => {
    const getExerciseSets = async () => {
      if (!exercise?.exerciseId || (!traineeUser?._id && !user?._id)) return
      try {
        const sets = await setService.query(setsGraphFilter)
        const groupedSetsToSet = groupSetsByDate(sets as Set[])
        setGroupedSets(groupedSetsToSet)
      } catch {
        showErrorMsg(t('messages.error.getSets'))
      }
    }
    getExerciseSets()
  }, [
    exercise?.exerciseId,
    traineeUser?._id,
    user?._id,
    setsGraphFilter,
    range,
  ])

  useEffect(() => {
    const getWorkoutInstructions = async () => {
      try {
        if (exercise?.instructions) {
          setExerciseInstructions(exercise.instructions)
          return
        }
        const exerciseId = exercise?.exerciseId
        if (!exerciseId) return

        const instructions = await getExerciseSummary(exerciseId)
        setExerciseInstructions(instructions)
      } catch {
        setExerciseInstructions([t('exercise.noInstructions')])
      }
    }

    getWorkoutInstructions()
  }, [exercise, t])

  function groupSetsByDate(sets: Set[]) {
    return sets
      .sort(
        (a, b) =>
          new Date(b.createdAt || '').getTime() -
          new Date(a.createdAt || '').getTime()
      )
      .reduce((acc: Record<string, Set[]>, set: Set) => {
        if (!set.createdAt) return acc
        const date = getDateFromISO(new Date(set.createdAt).toISOString())
        if (!acc[date]) {
          acc[date] = []
        }
        acc[date].push(set)
        return acc
      }, {} as Record<string, Set[]>)
  }

  const onRangeChange = (val: LineChartRangeKey) => {
    setRange(val)
    const from = getDateFromLineChartRangeKey(val)
    const to = new Date()
    setSetsGraphFilter({
      exerciseId: exercise?.exerciseId,
      userId: traineeUser?._id || user?._id,
      from: from,
      to: to,
    })
  }

  const muscleGroupsText = capitalizeFirstLetter(
    exercise?.mainMuscles
      ?.concat(exercise?.secondaryMuscles || [])
      .join(', ') || ''
  )

  return (
    <div
      className={`exercise-details-container ${
        prefs.isDarkMode ? 'dark-mode' : ''
      } ${isDashboard ? 'dashboard' : ''}`}
    >
      <img
        src={exerciseImage}
        alt={exercise?.name}
        onError={() => setExerciseImage(exerciseImageObject.ERROR_IMAGE)}
      />
      <div className='exercise-body-parts-container'>
        <BodyPartBadges
          exercise={exercise}
          size='l'
        />
        {muscleGroupsText ? (
          <MarqueeText
            variant='body2'
            className='exercise-muscle-groups'
          >
            {muscleGroupsText}
          </MarqueeText>
        ) : null}
      </div>
      <Divider className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`} />

      <CustomAccordion
        title={t('exercise.instructions')}
        cmp={
          <CustomAnimatedText typeSpeed={20}>
            {exerciseInstructions
              ?.map((instruction) => instruction.replace(/^Step:\d+\s*/, ''))
              .join('\n\n')}
          </CustomAnimatedText>
        }
        icon={
          <CustomIcon
            name='instructions'
            size='m'
            variant='subtle'
          />
        }
        className='instructions-accordion'
      />
      <div className='line-chart-container'>
        <div className='chart-header-container'>
          <Typography
            variant='h5'
            className='bold-header'
          >
            {t('exercise.maxProgress')}
          </Typography>
          <CustomSelect
            label={t('exercise.viewBy')}
            values={VIEW_BY_VALUES}
            value={viewBy}
            valueLabels={{
              weight: t('exercise.weight'),
              reps: t('exercise.reps'),
              volume: t('exercise.volume'),
            }}
            onChange={(val) => {
              if (VIEW_BY_VALUES.includes(val as ExerciseViewBy)) {
                setViewBy(val as ExerciseViewBy)
              }
            }}
            className={`${prefs.favoriteColor}`}
          />
        </div>
        <div
          className={`line-chart-paper ${prefs.isDarkMode ? 'dark-mode' : ''} ${
            prefs.favoriteColor || ''
          }`}
        >
          <LineChart
            isDisplayPoints={true}
            data={chart.data}
            isDarkMode={prefs.isDarkMode}
            interpolateGaps={true}
            spanGaps={true}
            isDisplaySecondLine={false}
            showReadout={true}
            formatReadout={(index, value) => {
              const subtitle = chart.data.labels[index] ?? ''
              if (value == null) return { title: '—', subtitle }

              if (viewBy === 'volume') {
                return {
                  title: `${formatReadoutNumber(value)} ${t('weight.kg')}`,
                  subtitle,
                }
              }

              const mainUnit =
                viewBy === 'weight' ? t('weight.kg') : t('exercise.reps')
              const secondary = chart.secondaryData[index]
              if (secondary == null) {
                return {
                  title: `${formatReadoutNumber(value)} ${mainUnit}`,
                  subtitle,
                }
              }

              const secondaryUnit =
                viewBy === 'weight' ? t('exercise.reps') : t('weight.kg')
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
          onChange={(val) => onRangeChange(val)}
        />
      </div>
      <Typography
        variant='h5'
        className='bold-header past-sessions'
      >
        {t('exercise.pastSessions')}
      </Typography>
      {/* {exerciseSets.length === 0} */}
      {setsQuery.items.length === 0 && (
        <Badge
          badgeContent={t('common.new')}
          className={`${prefs.favoriteColor} new`}
        ></Badge>
      )}
      <SetsTable
        groupedSets={
          groupedSetsForTable as Record<
            string,
            (Set & { exerciseId: string })[]
          >
        }
        mainValue={viewBy}
        workoutId={workoutId}
        workoutName={workoutName}
        exerciseName={exercise?.name || ''}
        chatRole={role}
      />
      <BottomReachIndicator
        hasMore={Boolean(setsQuery.hasNextPage)}
        isLoading={setsQuery.isFetchingNextPage}
        onReachBottom={() => {
          setsQuery.fetchNextPage()
        }}
      />
    </div>
    // </div>
  )
}
