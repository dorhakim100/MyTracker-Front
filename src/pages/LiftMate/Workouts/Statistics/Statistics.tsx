import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { CircularProgress } from '../../../../components/CircularProgress/CircularProgress'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { RootState } from '../../../../store/store'
import { Exercise } from '../../../../types/exercise/Exercise'
import {
  WeekMode,
  WeekRecord,
  WeekSummary,
} from '../../../../types/stats/WorkoutStats'
import { statsService } from '../../../../services/stats/stats.service'
import { indexedDbService } from '../../../../services/indexeddb.service'
import { STATISTICS_WEEK_MODE_STORE_NAME } from '../../../../constants/store.constants'
import { showErrorMsg } from '../../../../services/event-bus.service'
import { CustomSelect } from '../../../../CustomMui/CustomSelect/CustomSelect'
import { CustomList } from '../../../../CustomMui/CustomList/CustomList'
import { CustomSkeleton } from '../../../../CustomMui/CustomSkeleton/CustomSkeleton'
import { SlideDialog } from '../../../../components/SlideDialog/SlideDialog'
import { ExerciseDetails } from '../../../../components/ExerciseDetails/ExerciseDetails'
import { CachedImage } from '../../../../components/CachedImage/CachedImage'
import { PrBadge } from '../../../../components/PrBadge/PrBadge'
import { exerciseImage } from '../../../../assets/config/exercise-image'
import { statisticsNs } from './locals'
import { WeekStrip } from './WeekStrip/WeekStrip'
import { MuscleDistribution } from './MuscleDistribution/MuscleDistribution'
import './locals'
import {
  capitalizeFirstLetter,
  getArrayOfNumbers,
} from '../../../../services/util.service'
import { Typography } from '@mui/material'

interface StatisticsProps {
  forUserId: string
}

function formatAmount(value: number) {
  const rounded = Math.round(value * 10) / 10
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
}

async function readWeekMode(userId: string): Promise<WeekMode> {
  try {
    const saved = await indexedDbService.get<{ _id: string; mode: WeekMode }>(
      STATISTICS_WEEK_MODE_STORE_NAME,
      userId,
    )
    if (saved?.mode === 'thisWeek' || saved?.mode === 'last7') return saved.mode
  } catch {
    return 'thisWeek'
  }
  return 'thisWeek'
}

async function writeWeekMode(userId: string, mode: WeekMode) {
  try {
    await indexedDbService.put(STATISTICS_WEEK_MODE_STORE_NAME, {
      _id: userId,
      mode,
    })
  } catch {
    return
  }
}

export function Statistics({ forUserId }: StatisticsProps) {
  const { t } = useTranslation(statisticsNs)
  const { t: tDistribution } = useTranslation('MuscleDistribution')
  const prefs = useSelector((state: RootState) => state.systemModule.prefs)
  const [mode, setMode] = useState<WeekMode | null>(null)
  const [summary, setSummary] = useState<WeekSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [distributionOpen, setDistributionOpen] = useState(false)
  const [record, setRecord] = useState<WeekRecord | null>(null)

  console.log('summary', summary)

  useEffect(() => {
    if (!forUserId) return
    let cancelled = false
    setMode(null)
    readWeekMode(forUserId).then((saved) => {
      if (!cancelled) setMode(saved)
    })
    return () => {
      cancelled = true
    }
  }, [forUserId])

  useEffect(() => {
    if (!forUserId || !mode) return
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const next = await statsService.getWeek(forUserId, mode as WeekMode)
        if (!cancelled) setSummary(next)
      } catch {
        if (!cancelled) showErrorMsg(t('loadFailed'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [forUserId, mode])

  async function onMode(next: string) {
    const weekMode = next as WeekMode
    setMode(weekMode)
    await writeWeekMode(forUserId, weekMode)
  }

  const percent = useMemo(() => {
    return summary && summary.target > 0
      ? Math.min(100, (summary.done / summary.target) * 100)
      : 0
  }, [summary])

  const recordExercise: Exercise | null = record
    ? {
        exerciseId: record.exerciseId,
        name: record.name,
        image: record.image || '',
        muscleGroups: [],
        equipments: [],
      }
    : null

  return (
    <div className='statistics-container'>
      <div className='week-bar'>
        {loading && (
          <div className='week-strip'>
            {getArrayOfNumbers(0, 6).map((index) => (
              <CustomSkeleton
                key={index}
                height='64px'
                width='calc(100%  / 7)'
                variant='rounded'
                isDarkMode={prefs.isDarkMode}
              />
            ))}
          </div>
        )}
        {!loading && summary && (
          <WeekStrip
            days={summary.days}
            lang={prefs.lang}
            isDarkMode={prefs.isDarkMode}
          />
        )}
        <Typography
          variant='h5'
          className='bold-header week-routines-header'
        >
          {t('doneRoutines')}
        </Typography>
        {mode && (
          <CustomSelect
            label={t('period')}
            values={['thisWeek', 'last7']}
            value={mode}
            onChange={onMode}
            valueLabels={{
              thisWeek: t('thisWeek'),
              last7: t('last7'),
            }}
            width={132}
            className={prefs.favoriteColor}
          />
        )}
      </div>

      <div className='week-ring'>
        <CircularProgress
          value={percent}
          text={`${summary?.done}`}
          afterText={`${summary?.target}`}
        />
      </div>

      {summary && summary.records.length > 0 && (
        <div className='week-records-container'>
          <Typography
            variant='h6'
            className='bold-header'
          >
            {t('weekRecords')}
          </Typography>

          <div className='week-records'>
            <CustomList
              items={summary.records}
              className={`${prefs.isDarkMode ? 'dark-mode' : ''}`}
              getKey={(item) => `${item.exerciseId}-${item.type}`}
              renderLeft={(item) => (
                <CachedImage
                  url={item.image || exerciseImage.ERROR_IMAGE}
                  fallback={exerciseImage.ERROR_IMAGE}
                  alt={item.name}
                  className='record-image'
                />
              )}
              renderPrimaryText={(item) => capitalizeFirstLetter(item.name)}
              renderSecondaryText={(item) => (
                <span className='record-secondary'>
                  <PrBadge type={item.type} />
                  {tDistribution('kg', {
                    value: formatAmount(item.current),
                  })}
                </span>
              )}
              renderRight={() => (
                <ChevronRightIcon
                  className='page-chevron'
                  fontSize='small'
                />
              )}
              onItemClick={(item) => setRecord(item)}
            />
          </div>
        </div>
      )}

      <CustomList
        className={`statistics-pages ${prefs.isDarkMode ? 'dark-mode' : ''}`}
        variant='card'
        items={[{ id: 'muscle-distribution' }]}
        getKey={(item) => item.id}
        renderLeft={() => (
          <img
            className='page-row-image'
            src='/muscles/all.webp'
            alt=''
          />
        )}
        renderPrimaryText={() => t('muscleDistribution')}
        renderSecondaryText={() => t('muscleDistributionHint')}
        renderRight={() => (
          <ChevronRightIcon
            className='page-chevron'
            fontSize='small'
          />
        )}
        onItemClick={() => setDistributionOpen(true)}
      />

      <SlideDialog
        open={distributionOpen}
        onClose={() => setDistributionOpen(false)}
        title={t('muscleDistribution')}
        type='full'
        component={<MuscleDistribution forUserId={forUserId} />}
      />
      <SlideDialog
        open={Boolean(record)}
        onClose={() => setRecord(null)}
        title={record?.name || ''}
        type='full'
        component={<ExerciseDetails exercise={recordExercise} />}
      />
    </div>
  )
}
