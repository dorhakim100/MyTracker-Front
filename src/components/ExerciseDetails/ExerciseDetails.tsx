import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { getExerciseSummary } from '../../services/exersice-search/exersice-search'
import { setService } from '../../services/set/set.service'
import { Exercise } from '../../types/exercise/Exercise'
import { MessageRole } from '../../types/message/Message'

import { Divider, Typography } from '@mui/material'
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
  isVolumeView,
  pickBestSet,
  VolumePoint,
} from '../../services/set/set.helpers'
import { exerciseDetailsNs } from './locals'
import { getExerciseBodyParts } from '../../assets/config/body-parts'

const VIEW_BY_VALUES: ExerciseViewBy[] = [
  'weight',
  'reps',
  'daily_volume',
  'weekly_volume',
]

function formatReadoutNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

function formatChartDay(date: Date) {
  return `${date.getDate()}/${date.getMonth() + 1}`
}

function formatWeekLabel(createdAt: string) {
  const start = new Date(createdAt)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  return `${formatChartDay(start)}-${formatChartDay(end)}`
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
  const { t: tDetails } = useTranslation(exerciseDetailsNs)
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
  const displayUser = traineeUser || user

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
  const [volumePoints, setVolumePoints] = useState<VolumePoint[]>([])
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
    enabled: Boolean(exercise?.exerciseId),
  })

  const hasHistory = exercise?.isNew === false || setsQuery.items.length > 0
  const showNewSection =
    !hasHistory && (exercise?.isNew === true || setsQuery.isFetched)

  const groupedSetsForTable = useMemo(
    () => groupSetsByDate([...setsQuery.items]),
    [setsQuery.items]
  )
  const setsData = useMemo(() => {
    if (isVolumeView(viewBy)) {
      return volumePoints.filter(
        (point) => Boolean(point.createdAt) && point.value != null
      )
    }

    const pickMetric = getPickMetric(viewBy)
    const secondaryMetric = pickMetric === 'weight' ? 'reps' : 'weight'

    return Object.values(groupedSets)
      .reverse()
      .map((daySets) => {
        const createdAt = daySets[0]?.createdAt as unknown as string
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
        ): item is {
          createdAt: string
          value: number
          secondary: number | undefined
        } => Boolean(item.createdAt) && item.value != null
      )
  }, [groupedSets, viewBy, volumePoints])

  const chart = useMemo(() => {
    const borderColor =
      colors[prefs.favoriteColor as keyof typeof colors] || colors.primary
    const label = isVolumeView(viewBy)
      ? tDetails(viewBy === 'daily_volume' ? 'dailyVolume' : 'weeklyVolume')
      : t(`exercise.${viewBy}`)

    if (viewBy === 'weekly_volume') {
      const sorted = [...setsData].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
      return {
        data: {
          labels: sorted.map((point) => formatWeekLabel(point.createdAt)),
          datasets: [
            {
              label,
              data: sorted.map((point) => point.value),
              borderColor,
              tension: 0.3,
            },
          ],
        },
        secondaryData: sorted.map((point) => point.secondary ?? null),
      }
    }

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
          label,
          data: series?.data ?? [],
          borderColor,
          tension: 0.3,
        },
      ],
    }

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

    return { data, secondaryData: secondSeries?.data ?? [] }
  }, [setsData, viewBy, range, prefs.favoriteColor, t, tDetails])

  useEffect(() => {
    let cancelled = false

    const getExerciseSets = async () => {
      if (!exercise?.exerciseId || (!traineeUser?._id && !user?._id)) return
      try {
        const result = await setService.query(setsGraphFilter)
        if (cancelled) return

        if (isVolumeView(setsGraphFilter.calculation)) {
          setVolumePoints(result as VolumePoint[])
          return
        }

        setGroupedSets(groupSetsByDate(result as Set[]))
      } catch {
        if (!cancelled) showErrorMsg(t('messages.error.getSets'))
      }
    }
    getExerciseSets()

    return () => {
      cancelled = true
    }
  }, [
    exercise?.exerciseId,
    exercise?.isNew,
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
    setSetsGraphFilter((prev) => ({
      exerciseId: exercise?.exerciseId,
      userId: traineeUser?._id || user?._id,
      from: from,
      to: to,
      ...(prev.calculation ? { calculation: prev.calculation } : {}),
    }))
  }

  const exerciseTags = getExerciseBodyParts({
    mainMuscles: exercise?.mainMuscles,
    secondaryMuscles: exercise?.secondaryMuscles,
  })
  const exerciseTag = capitalizeFirstLetter(exerciseTags[0] || '')

  const muscleGroupsText = capitalizeFirstLetter(
    exercise?.mainMuscles
      ?.concat(exercise?.secondaryMuscles || [])
      .filter(
        (tag) =>
          tag.replace(/ /g, '').toLowerCase() !==
          exerciseTag.replace(/ /g, '').toLowerCase()
      )
      .filter(Boolean)
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
            className='exercise-muscle-groups bold-header'
          >
            {muscleGroupsText}
          </MarqueeText>
        ) : null}
      </div>
      <Divider className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`} />

      <CustomAccordion
        title={t('exercise.instructions')}
        cmp={
          <CustomAnimatedText typeSpeed={8}>
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
      {showNewSection && (
        <div
          className={`new-exercise-section line-chart-paper ${
            prefs.isDarkMode ? 'dark-mode' : ''
          } ${prefs.favoriteColor || ''}`}
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
              {tDetails('noSetsYet')}
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
              {t('exercise.maxProgress')}
            </Typography>
            <CustomSelect
              label={t('exercise.viewBy')}
              values={VIEW_BY_VALUES}
              value={viewBy}
              valueLabels={{
                weight: t('exercise.weight'),
                reps: t('exercise.reps'),
                daily_volume: tDetails('dailyVolume'),
                weekly_volume: tDetails('weeklyVolume'),
              }}
              onChange={(val) => {
                if (!VIEW_BY_VALUES.includes(val as ExerciseViewBy)) return
                const next = val as ExerciseViewBy
                setViewBy(next)
                setVolumePoints([])
                setSetsGraphFilter((prev) => {
                  if (isVolumeView(next)) return { ...prev, calculation: next }
                  const { calculation, ...rest } = prev
                  return calculation ? rest : prev
                })
              }}
              className={`${prefs.favoriteColor}`}
            />
          </div>
          <div
            className={`line-chart-paper ${
              prefs.isDarkMode ? 'dark-mode' : ''
            } ${prefs.favoriteColor || ''}`}
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

                if (isVolumeView(viewBy)) {
                  const secondary = chart.secondaryData[index]
                  const unit =
                    viewBy === 'weekly_volume'
                      ? tDetails('sets')
                      : t('exercise.reps')
                  if (secondary == null) {
                    return {
                      title: `${formatReadoutNumber(value)} ${t('weight.kg')}`,
                      subtitle,
                    }
                  }
                  return {
                    title: `${formatReadoutNumber(value)} ${t(
                      'weight.kg'
                    )} · ${formatReadoutNumber(secondary)} ${unit}`,
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
      )}
      {hasHistory && (
        <Typography
          variant='h5'
          className='bold-header past-sessions'
        >
          {t('exercise.pastSessions')}
        </Typography>
      )}
      {hasHistory && (
        <>
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
            displayUser={displayUser}
          />
          <BottomReachIndicator
            hasMore={Boolean(setsQuery.hasNextPage)}
            isLoading={setsQuery.isFetchingNextPage}
            onReachBottom={() => {
              setsQuery.fetchNextPage()
            }}
          />
        </>
      )}
    </div>
    // </div>
  )
}
