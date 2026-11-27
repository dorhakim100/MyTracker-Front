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
import { getDateFromISO } from '../../services/util.service'
import { LineChartProps } from '../LineChart/LineChart'
import { LineChartRangeKey } from '../LineChart/LineChartControls'
import { colors } from '../../assets/config/colors'
import { SetChartSeries } from '../../types/chart/ChartSeries'
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
import { ExerciseViewBy, isVolumeView } from '../../services/set/set.helpers'
import { exerciseDetailsNs } from './locals'
import { getExerciseBodyParts } from '../../assets/config/body-parts'

const VIEW_BY_VALUES: ExerciseViewBy[] = [
  'weight',
  'reps',
  'daily_volume',
  'weekly_volume',
]

const EMPTY_CHART: SetChartSeries = { labels: [], data: [], secondary: [] }

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

  const [chartSeries, setChartSeries] = useState<SetChartSeries>(EMPTY_CHART)
  const [range, setRange] = useState<LineChartRangeKey>('1M')
  const [viewBy, setViewBy] = useState<ExerciseViewBy>('weight')

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
  const chart = useMemo(() => {
    const borderColor =
      colors[prefs.favoriteColor as keyof typeof colors] || colors.primary
    const label = isVolumeView(viewBy)
      ? tDetails(viewBy === 'daily_volume' ? 'dailyVolume' : 'weeklyVolume')
      : t(`exercise.${viewBy}`)

    const data: LineChartProps['data'] = {
      labels: chartSeries.labels,
      datasets: [
        {
          label,
          data: chartSeries.data,
          borderColor,
          tension: 0.3,
        },
      ],
    }

    return { data, secondaryData: chartSeries.secondary }
  }, [chartSeries, viewBy, prefs.favoriteColor, t, tDetails])

  useEffect(() => {
    let cancelled = false

    const getExerciseChart = async () => {
      if (!exercise?.exerciseId || (!traineeUser?._id && !user?._id)) return
      try {
        const series = await setService.getChart({
          exerciseId: exercise.exerciseId,
          userId: traineeUser?._id || user?._id,
          range,
          viewBy,
        })
        if (!cancelled) setChartSeries(series)
      } catch {
        if (!cancelled) showErrorMsg(t('messages.error.getSets'))
      }
    }
    getExerciseChart()

    return () => {
      cancelled = true
    }
  }, [
    exercise?.exerciseId,
    exercise?.isNew,
    traineeUser?._id,
    user?._id,
    range,
    viewBy,
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
      .reduce(
        (acc: Record<string, Set[]>, set: Set) => {
          if (!set.createdAt) return acc
          const date = getDateFromISO(new Date(set.createdAt).toISOString())
          if (!acc[date]) {
            acc[date] = []
          }
          acc[date].push(set)
          return acc
        },
        {} as Record<string, Set[]>
      )
  }

  const onViewByChange = (val: string) => {
    if (!VIEW_BY_VALUES.includes(val as ExerciseViewBy)) return
    setViewBy(val as ExerciseViewBy)
  }

  const onRangeChange = (val: LineChartRangeKey) => {
    setRange(val)
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
