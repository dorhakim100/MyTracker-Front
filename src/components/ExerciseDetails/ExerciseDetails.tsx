import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { getExerciseSummary } from '../../services/exersice-search/exersice-search'
import { setService } from '../../services/set/set.service'
import { Exercise } from '../../types/exercise/Exercise'

import { Badge, Divider, Typography } from '@mui/material'
import { RootState } from '../../store/store'
import { translateService } from '../../services/translate/translate.service'
import { ExpectedActual } from '../../types/expectedActual/ExpectedActual'
import { exerciseImage as exerciseImageObject } from '../../assets/config/exercise-image'
import { CustomAccordion } from '../../CustomMui/CustomAccordion/CustomAccordion'
import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import { Set } from '../../types/exercise/Exercise'
import {
  capitalizeFirstLetter,
  getDateFromLineChartRangeKey,
  getDateFromISO,
  prepareSeries,
} from '../../services/util.service'
import SetsTable from '../SetsTable/SetsTable'
import LineChart from '../LineChart/LineChart'
import {
  LineChartControls,
  LineChartRangeKey,
} from '../LineChart/LineChartControls'
import { colors } from '../../assets/config/colors'
import { CustomSelect } from '../../CustomMui/CustomSelect/CustomSelect'
import { SetFilter } from '../../types/setFilter/SetFilter'
import { useSets } from '../../hooks/useSets'
import { BottomReachIndicator } from '../BottomReachIndicator/BottomReachIndicator'
import { showErrorMsg } from '../../services/event-bus.service'
export interface ExerciseWithDetails extends Exercise {
  notes?: ExpectedActual<string>
  rpe?: ExpectedActual<number>
  rir?: ExpectedActual<number>
  instructions?: string[]
  sets?: ExpectedActual<number>
}
interface ExerciseDetailsProps {
  exercise: ExerciseWithDetails | null
}

export function ExerciseDetails({ exercise }: ExerciseDetailsProps) {
  const { t } = useTranslation()

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
  const [viewBy, setViewBy] = useState<string>('Weight')
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
  const stringifiedGroupedSets = useMemo(() => JSON.stringify(groupedSets), [groupedSets])
  const setsData = useMemo(() => {
    return Object.values(groupedSets)
      .reverse()
      .map((date) =>
        date.find((set) => {
          return set.weight.actual ===
            Math.max(...date.map((set) => set.weight.actual))
            ? { weight: set.weight.actual, createdAt: set.createdAt }
            : null
        })
      )
  }, [stringifiedGroupedSets])

  const data = useMemo(() => {
    const key = viewBy === 'Weight' ? 'weight' : 'reps'

    const dateToSend = setsData.map((set) => ({
      createdAt: set?.createdAt as unknown as string,
      value: set?.[key]?.actual as number,
    }))
    const series = prepareSeries(
      range,
      dateToSend as (Set & { createdAt: string; value: number })[],
      false,
      range
    )

    const labelsToShow = series?.labels
    const firstData = series?.data ?? []

    const dataToSend = {
      labels: labelsToShow,
      datasets: [
        {
          label: [viewBy],
          data: firstData,
          borderColor:
            colors[prefs.favoriteColor as keyof typeof colors] ||
            colors.primary,
          tension: 0.3,
        },
      ],
    }

    const secondKey = viewBy === 'Weight' ? 'reps' : 'weight'

    const secondDateToSend = setsData.map((set) => ({
      createdAt: set?.createdAt as unknown as string,
      value: set?.[secondKey]?.actual as number,
    }))

    const secondSeries = prepareSeries(
      range,
      secondDateToSend as (Set & { createdAt: string; value: number })[],
      false,
      range
    )

    if (secondSeries?.data?.length) {
      dataToSend.datasets.push({
        label: [capitalizeFirstLetter(secondKey)],
        data: secondSeries?.data ?? [],
        borderColor: 'transparent',
        tension: 0,
      })
    }

    return dataToSend
  }, [setsData, viewBy])

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
  }, [exercise?.exerciseId, traineeUser?._id, user?._id, setsGraphFilter, range])

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

  const renderExerciseInstructions = (instruction: string) => {
    const cleaned = instruction.replace(/^Step:\d+\s*/, '')

    return <p key={instruction}>{cleaned}</p>
  }

  const getNotesClass = (notes: string) => {
    return translateService.isLtrString(notes)
      ? 'english-notes'
      : 'hebrew-notes'
  }

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
      <Divider className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`} />
      {/* <div className="exercise-details"> */}
      {exercise?.notes?.expected && (
        <>
          <Typography
            variant='h5'
            className='bold-header'
          >
            {t('exercise.notes')}
          </Typography>
          <div
            className={`notes-container ${getNotesClass(
              exercise?.notes?.expected || ''
            )}`}
          >
            {exercise?.notes?.expected}
          </div>
        </>
      )}

      <CustomAccordion
        title={t('exercise.instructions')}
        cmp={exerciseInstructions?.map(renderExerciseInstructions)}
        icon={<AutoStoriesIcon />}
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
            values={[t('exercise.weight'), t('exercise.reps')]}
            value={
              viewBy === 'Weight' ? t('exercise.weight') : t('exercise.reps')
            }
            onChange={(val) => setViewBy(val)}
            className={`${prefs.favoriteColor}`}
          />
        </div>
        <LineChart
          isDisplayPoints={true}
          data={data as any}
          isDarkMode={prefs.isDarkMode}
          interpolateGaps={true}
          spanGaps={true}
          isDisplaySecondLine={false}
          secondDataLabel={
            viewBy === 'Weight' ? t('exercise.reps') : t('exercise.weight')
          }
        />
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
          groupedSetsForTable as Record<string, (Set & { exerciseId: string })[]>
        }
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
