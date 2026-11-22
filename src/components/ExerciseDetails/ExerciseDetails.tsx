import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { getExerciseSummary } from '../../services/exersice-search/exersice-search'
import { setService } from '../../services/set/set.service'
import { MessageRole } from '../../types/message/Message'

import { RootState } from '../../store/store'
import { ExpectedActual } from '../../types/expectedActual/ExpectedActual'
import { exerciseImage as exerciseImageObject } from '../../assets/config/exercise-image'
import { Exercise, Set } from '../../types/exercise/Exercise'
import {
  getDateFromLineChartRangeKey,
  getDateFromISO,
  prepareSeries,
} from '../../services/util.service'
import { LineChartProps } from '../LineChart/LineChart'
import { LineChartRangeKey } from '../LineChart/LineChartControls'
import { colors } from '../../assets/config/colors'
import { SetFilter } from '../../types/setFilter/SetFilter'
import { useSets } from '../../hooks/useSets'
import { useChatRole } from '../../hooks/useChatRole'
import { showErrorMsg } from '../../services/event-bus.service'
import { capitalizeFirstLetter } from '../../services/util.service'
import { CustomTabPanel } from '../../CustomMui/CustomTabs/CustomTabs'
import { tabToOpen } from '../../CustomMui/CustomTabs/tab-focus'
import { SlideDialog } from '../SlideDialog/SlideDialog'
import { useSlideDialogTabs } from '../SlideDialog/slide-dialog-tabs'
import { Details } from './Details/Details'
import { Instructions } from './Instructions/Instructions'
import { Progress } from './Progress/Progress'
import {
  ExerciseViewBy,
  getPickMetric,
  isVolumeView,
  pickBestSet,
  VolumePoint,
} from '../../services/set/set.helpers'
import { countsInVolume, setTypeOf } from '../../services/set/set-type'
import { exerciseDetailsNs } from './locals'
import { getExerciseBodyParts } from '../../assets/config/body-parts'

const VIEW_BY_VALUES: ExerciseViewBy[] = [
  'weight',
  'reps',
  'daily_volume',
  'weekly_volume',
]

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
type ExerciseDetailsPage = 'details' | 'progress' | 'instructions'

const detailTabs: { value: ExerciseDetailsPage }[] = [
  { value: 'details' },
  { value: 'progress' },
  { value: 'instructions' },
]

function initialDetailsPage(): ExerciseDetailsPage {
  const saved = tabToOpen(detailTabs)
  const match = detailTabs.find((tab) => tab.value === saved)
  return match?.value ?? detailTabs[0].value
}

interface ExerciseDetailsProps {
  exercise: ExerciseWithDetails | null
  workoutId?: string
  workoutName?: string
  chatRole?: MessageRole
  disableAnimation?: boolean
}

export function ExerciseDetails({
  exercise,
  workoutId,
  workoutName = '',
  chatRole,
  disableAnimation = false,
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
  const [page, setPage] = useState<ExerciseDetailsPage>(initialDetailsPage)
  const [similarExercise, setSimilarExercise] = useState<Exercise | null>(null)
  const onPageChange = useCallback((next: string) => {
    if (next !== 'details' && next !== 'progress' && next !== 'instructions')
      return
    setPage(next)
  }, [])

  const dialogTabs = useMemo(
    () => ({
      options: [
        { value: 'details', label: tDetails('details') },
        { value: 'progress', label: tDetails('progress') },
        { value: 'instructions', label: tDetails('instructions') },
      ],
      variant: 'fullWidth' as const,
      value: page,
      onChange: onPageChange,
      disableAnimation,
    }),
    [disableAnimation, onPageChange, page, tDetails]
  )

  useSlideDialogTabs(dialogTabs)

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
        const best = pickBestSet(
          daySets.filter((set) => countsInVolume(setTypeOf(set))),
          pickMetric
        )
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

  const onViewByChange = (val: string) => {
    if (!VIEW_BY_VALUES.includes(val as ExerciseViewBy)) return
    const next = val as ExerciseViewBy
    setViewBy(next)
    setVolumePoints([])
    setSetsGraphFilter((prev) => {
      if (isVolumeView(next)) return { ...prev, calculation: next }
      const { calculation, ...rest } = prev
      return calculation ? rest : prev
    })
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

  const instructionsText =
    exerciseInstructions
      ?.map((instruction) => instruction.replace(/^Step:\d+\s*/, ''))
      .join('\n\n') || ''

  function onImageError() {
    setExerciseImage(exerciseImageObject.ERROR_IMAGE)
  }

  function renderPage() {
    if (page === 'details') {
      return (
        <Details
          exercise={exercise}
          image={exerciseImage}
          muscleGroupsText={muscleGroupsText}
          isDarkMode={prefs.isDarkMode}
          onImageError={onImageError}
          onOpenExercise={setSimilarExercise}
        />
      )
    }

    if (page === 'progress') {
      return (
        <Progress
          isDarkMode={prefs.isDarkMode}
          favoriteColor={prefs.favoriteColor || ''}
          showNewSection={showNewSection}
          hasHistory={hasHistory}
          viewBy={viewBy}
          onViewByChange={onViewByChange}
          chart={chart}
          range={range}
          onRangeChange={onRangeChange}
          groupedSets={
            groupedSetsForTable as Record<
              string,
              (Set & { exerciseId: string })[]
            >
          }
          workoutId={workoutId}
          workoutName={workoutName}
          exerciseName={exercise?.name || ''}
          chatRole={role}
          displayUser={displayUser}
          hasMore={Boolean(setsQuery.hasNextPage)}
          isLoadingMore={setsQuery.isFetchingNextPage}
          onReachBottom={() => {
            setsQuery.fetchNextPage()
          }}
          labels={{
            noSetsYet: tDetails('noSetsYet'),
            maxProgress: t('exercise.maxProgress'),
            viewBy: t('exercise.viewBy'),
            weight: t('exercise.weight'),
            reps: t('exercise.reps'),
            dailyVolume: tDetails('dailyVolume'),
            weeklyVolume: tDetails('weeklyVolume'),
            pastSessions: t('exercise.pastSessions'),
            kg: t('weight.kg'),
            sets: tDetails('sets'),
          }}
        />
      )
    }

    return (
      <Instructions
        name={exercise?.name}
        image={exerciseImage}
        text={instructionsText}
        exerciseId={exercise?.exerciseId}
        onImageError={onImageError}
      />
    )
  }

  return (
    <>
      <CustomTabPanel
        value={page}
        options={dialogTabs.options}
        disableAnimation={disableAnimation}
        className='slide-dialog-tab-panel'
      >
        <div
          className={`exercise-details-container ${
            prefs.isDarkMode ? 'dark-mode' : ''
          }           ${isDashboard ? 'dashboard' : ''}`}
        >
          {renderPage()}
        </div>
      </CustomTabPanel>
      <SlideDialog
        open={Boolean(similarExercise)}
        onClose={() => setSimilarExercise(null)}
        title={capitalizeFirstLetter(similarExercise?.name || '')}
        type='full'
        component={
          similarExercise ? (
            <ExerciseDetails
              exercise={similarExercise}
              disableAnimation={disableAnimation}
            />
          ) : (
            <></>
          )
        }
      />
    </>
  )
}
