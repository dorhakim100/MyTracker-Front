import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import CloseIcon from '@mui/icons-material/Close'
import { CircularProgress, Typography } from '@mui/material'
import { RootState } from '../../../../../store/store'
import { Exercise } from '../../../../../types/exercise/Exercise'
import {
  DistributionExercise,
  DistributionSlice,
  DistributionSummary,
  DistributionTimeframe,
} from '../../../../../types/stats/WorkoutStats'
import { statsService } from '../../../../../services/stats/stats.service'
import { showErrorMsg } from '../../../../../services/event-bus.service'
import { capacitorService } from '../../../../../services/capacitor.service'
import { CustomButton } from '../../../../../CustomMui/CustomButton/CustomButton'
import { CustomList } from '../../../../../CustomMui/CustomList/CustomList'
import { CustomSkeleton } from '../../../../../CustomMui/CustomSkeleton/CustomSkeleton'
import { SlideDialog } from '../../../../../components/SlideDialog/SlideDialog'
import { ExerciseDetails } from '../../../../../components/ExerciseDetails/ExerciseDetails'
import { RadarChart } from '../../../../../components/RadarChart/RadarChart'
import { muscleDistributionNs } from './locals'
import { StatCardItem, StatCards } from './StatCards/StatCards'
import { RoutineCards } from './RoutineCards/RoutineCards'
import './locals'
import { capitalizeFirstLetter } from '../../../../../services/util.service'

const RANGES: DistributionTimeframe[] = ['thisWeek', '7d', '30d', 'year', 'all']

interface MuscleDistributionProps {
  forUserId: string
}

function rangeLabel(
  range: DistributionTimeframe,
  translate: (key: string) => string
) {
  if (range === '7d') return '7D'
  if (range === '30d') return '30D'
  return translate(range)
}

function formatAmount(value: number) {
  const rounded = Math.round(value * 10) / 10
  return Number.isInteger(rounded)
    ? String(rounded.toLocaleString('en-US'))
    : String(Number(rounded.toFixed(0)).toLocaleString('en-US'))
}

function toExercise(row: DistributionExercise): Exercise {
  return {
    exerciseId: row.exerciseId,
    name: row.name,
    image: row.image || '',
    muscleGroups: [],
    equipments: [],
  }
}

export function MuscleDistribution({ forUserId }: MuscleDistributionProps) {
  const { t } = useTranslation(muscleDistributionNs)
  const prefs = useSelector((state: RootState) => state.systemModule.prefs)
  const [timeframe, setTimeframe] = useState<DistributionTimeframe>('thisWeek')
  const [summary, setSummary] = useState<DistributionSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [list, setList] = useState<'routines' | 'exercises' | null>(null)
  const [exercise, setExercise] = useState<Exercise | null>(null)
  const skipHaptic = useRef(true)
  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const next = await statsService.getDistribution(forUserId, timeframe)
        console.log('next', next)
        if (!cancelled) setSummary(next)
      } catch (error) {
        console.log('error', error)
        if (!cancelled) showErrorMsg(t('loadFailed'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    if (forUserId) load()
    return () => {
      cancelled = true
    }
  }, [forUserId, timeframe])

  useEffect(() => {
    if (skipHaptic.current) {
      skipHaptic.current = false
      return
    }
    capacitorService.vibrate('Light')
  }, [selectedId])

  const slice: DistributionSlice | null = useMemo(() => {
    if (!summary) return null
    if (!selectedId) return summary.total
    return (
      summary.groups.find((group) => group.id === selectedId) || summary.total
    )
  }, [summary, selectedId])

  const routineIds = useMemo(
    () => slice?.routines.map((item) => item.id) ?? [],
    [slice]
  )

  useEffect(() => {
    if (!slice) return
    if (list === 'routines' && slice.routineCount === 0) setList(null)
    if (list === 'exercises' && slice.exerciseCount === 0) setList(null)
  }, [slice, list])

  function onRange(next: DistributionTimeframe) {
    if (next === timeframe) return
    setTimeframe(next)
    setSelectedId(null)
    setList(null)
    setExercise(null)
  }

  function onSelect(id: string) {
    setSelectedId((current) => (current === id ? null : id))
  }

  const points =
    summary?.groups.map((group) => ({
      id: group.id,
      label: t(group.id),
      value: group.sets,
      previous: summary.previous
        ? summary.previous.groups.find((item) => item.id === group.id)?.sets ??
          0
        : undefined,
    })) || []

  const textSkeleton = (
    <CustomSkeleton
      variant='text'
      width={56}
      height={28}
      isDarkMode={prefs.isDarkMode}
    />
  )

  const cards: StatCardItem[] = [
    {
      id: 'routines',
      label: t('routines'),
      value: loading ? textSkeleton : String(slice?.routineCount ?? 0),
      onOpen:
        !loading && slice && slice.routineCount > 0
          ? () => setList('routines')
          : undefined,
    },
    {
      id: 'exercises',
      label: t('exercises'),
      value: loading ? textSkeleton : String(slice?.exerciseCount ?? 0),
      onOpen:
        !loading && slice && slice.exerciseCount > 0
          ? () => setList('exercises')
          : undefined,
    },
    {
      id: 'volume',
      label: t('volume'),
      value: loading
        ? textSkeleton
        : t('kg', { value: formatAmount(slice?.volume ?? 0) }),
    },
    {
      id: 'sets',
      label: t('sets'),
      value: loading ? textSkeleton : formatAmount(slice?.sets ?? 0),
    },
  ]

  return (
    <div className='muscle-distribution-container'>
      <div className='selection-header'>
        <Typography
          variant='h5'
          className='bold-header'
        >
          {selectedId ? t(selectedId) : t('allMuscles')}
        </Typography>
        {selectedId && (
          <CustomButton
            isIcon
            variant='flat'
            icon={<CloseIcon />}
            ariaLabel={t('clearSelection')}
            shouldVibrate={false}
            onClick={() => setSelectedId(null)}
          />
        )}
      </div>

      {loading ? (
        <div className='radar-loading-container'>
          <CircularProgress
            size={100}
            className={`${prefs.isDarkMode ? 'dark-mode' : ''} ${
              prefs.favoriteColor
            }`}
          />
        </div>
      ) : (
        <RadarChart
          points={points}
          selectedId={selectedId}
          onSelect={onSelect}
          reduceMotion={reduceMotion}
        />
      )}
      <div className='range-controls'>
        {RANGES.map((range) => (
          <CustomButton
            key={range}
            text={rangeLabel(range, t)}
            className={`control-btn ${timeframe === range ? 'active' : ''} ${
              prefs.favoriteColor
            }`}
            onClick={() => onRange(range)}
            disabled={timeframe === range}
            shouldVibrate={false}
            variant='thin'
          />
        ))}
      </div>
      <StatCards cards={cards} />

      <SlideDialog
        open={list === 'routines'}
        onClose={() => setList(null)}
        title={t('routines')}
        type='full'
        component={
          <RoutineCards
            routineIds={routineIds}
            forUserId={forUserId}
          />
        }
      />
      <SlideDialog
        open={list === 'exercises'}
        onClose={() => setList(null)}
        title={t('exercises')}
        type='full'
        component={
          <CustomList
            items={slice?.exercises || []}
            getKey={(item) => item.exerciseId}
            className={`${prefs.isDarkMode ? 'dark-mode' : ''}`}
            renderLeft={(item) => (
              <img
                className='distribution-exercise-image'
                src={item.image || '/muscles/all.webp'}
                alt=''
              />
            )}
            renderPrimaryText={(item) => capitalizeFirstLetter(item.name)}
            renderSecondaryText={(item) =>
              `${item.sets} · ${t('kg', { value: formatAmount(item.volume) })}`
            }
            onItemClick={(item) => setExercise(toExercise(item))}
          />
        }
      />
      <SlideDialog
        open={Boolean(exercise)}
        onClose={() => setExercise(null)}
        title={exercise?.name || ''}
        type='full'
        component={<ExerciseDetails exercise={exercise} />}
      />
    </div>
  )
}
