import { Divider, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import {
  capitalizeFirstLetter,
  getTimeFromISO,
} from '../../services/util.service'
import {
  SessionStatsExercise,
  SessionStatsRecap,
} from '../../types/stats/Stats'
import { Exercise } from '../../types/exercise/Exercise'
import { CachedImage } from '../CachedImage/CachedImage'
import { MarqueeText } from '../MarqueeText/MarqueeText'
import { exerciseImage } from '../../assets/config/exercise-image'
import { HardnessGauge } from '../HardnessGauge/HardnessGauge'
import { sessionStatsNs } from './locals'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { useEffect, useMemo, useState } from 'react'
import { SlideDialog } from '../SlideDialog/SlideDialog'
import {
  ExerciseDetails,
  ExerciseWithDetails,
} from '../ExerciseDetails/ExerciseDetails'
import { CustomAnimatedText } from '../../CustomMui/CustomAnimatedText/CustomAnimatedText'
import { RollingNumber } from '../RollingNumber/RollingNumber'
import { PrBadge } from '../PrBadge/PrBadge'
import { ActivityMedal } from '../ActivityMedal/ActivityMedal.tsx'
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded'

interface SessionStatsProps {
  recap: SessionStatsRecap | null
  workoutId?: string
  workoutName?: string
  exercises?: Exercise[]
}

const detDurationHours = (durationMs: number) => {
  return Math.floor(durationMs / (1000 * 60 * 60))
}
const detDurationMinutes = (durationMs: number) => {
  return Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))
}
const detDurationSeconds = (durationMs: number) => {
  return Math.floor((durationMs % (1000 * 60)) / 1000)
}

export function SessionStats({
  recap,
  workoutId,
  workoutName = '',
  exercises = [],
}: SessionStatsProps) {
  const { t } = useTranslation(sessionStatsNs)
  const prefs = useSelector((state: RootState) => state.systemModule.prefs)

  const [selectedExercise, setSelectedExercise] =
    useState<ExerciseWithDetails | null>(null)

  const [modalSettings, setModalSettings] = useState<{
    open: boolean
  }>({
    open: false,
  })

  const [now, setNow] = useState(new Date())

  const activeDuration = useMemo(() => {
    if (!recap?.startTime) return 0
    const duration = now.getTime() - new Date(recap.startTime).getTime()
    return duration
  }, [recap?.startTime, now, recap?.isFinished])

  useEffect(() => {
    if (recap?.isFinished) return
    const interval = setInterval(() => {
      setNow(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [recap?.isFinished])

  const onExerciseClick = (statsExercise: SessionStatsExercise) => {
    const fromWorkout = exercises.find(
      (exercise) => exercise.exerciseId === statsExercise.exerciseId
    )
    setSelectedExercise(
      fromWorkout ?? {
        name: statsExercise.name,
        image: statsExercise.image || '',
        exerciseId: statsExercise.exerciseId,
        muscleGroups: [],
        equipments: [],
      }
    )
    setModalSettings({
      open: true,
    })
  }

  const onCloseModal = () => {
    setSelectedExercise(null)
    setModalSettings({
      open: false,
    })
  }

  if (!recap) {
    return (
      <div className='session-stats-container'>
        <Typography variant='body1'>{t('placeholder')}</Typography>
      </div>
    )
  }

  const isAllExercisesDone =
    recap.setsPlanned > 0 && recap.setsDone === recap.setsPlanned
  const volumeActual = Math.round(recap.volumeActual)
  const volumePlanned = Math.round(recap.volumePlanned)
  const vsLast =
    recap.vsLastPercent == null ? null : Math.round(recap.vsLastPercent)
  const durationHours = detDurationHours(recap.durationMs)
  const durationMinutes = detDurationMinutes(recap.durationMs)
  const activeDurationHours = detDurationHours(activeDuration)
  const activeDurationMinutes = detDurationMinutes(activeDuration)
  const activeDurationSeconds = detDurationSeconds(activeDuration)
  let prStep = 0

  return (
    <>
      <div className='session-stats-container'>
        <div className='hero-container'>
          {isAllExercisesDone && (
            <ActivityMedal
              yellow={prefs.favoriteColor === 'yellow'}
              icon={<FitnessCenterRoundedIcon />}
              className='workout-medal'
            />
          )}
          <div className='duration-block'>
            <Typography
              variant='body2'
              className='opacity-70'
            >
              {t('duration')}
            </Typography>
            <Typography
              variant='h4'
              className='bold-header duration-value'
            >
              {recap.isFinished ||
              (!recap.isFinished && activeDurationHours > 0) ? (
                <>
                  <RollingNumber
                    value={
                      recap.isFinished ? durationHours : activeDurationHours
                    }
                    fromZero
                  />
                  <span className='duration-colon'>:</span>
                </>
              ) : null}
              <RollingNumber
                value={
                  recap.isFinished ? durationMinutes : activeDurationMinutes
                }
                fromZero
                format={{ minimumIntegerDigits: 2 }}
              />
              {!recap.isFinished && (
                <>
                  <span className='duration-colon'>:</span>
                  <RollingNumber
                    value={activeDurationSeconds}
                    fromZero
                    format={{ minimumIntegerDigits: 2 }}
                  />
                </>
              )}
            </Typography>
            {recap.startTime && (
              <Typography
                variant='body2'
                className='opacity-70'
              >
                {t('startTime')} {getTimeFromISO(recap.startTime)}
              </Typography>
            )}
          </div>
          <HardnessGauge
            size='big'
            actualRpe={recap.actualRpe}
            accuracy={recap.accuracy}
          />
        </div>
        <div className='average-intensity-container'>
          <Typography
            variant='body2'
            className='opacity-70 average-accuracy-label'
          >
            {t('averageAccuracy')}
          </Typography>
          <Typography
            variant='h6'
            className='opacity-70 average-intensity-label'
          >
            {t('averageIntensity')}
          </Typography>
          <Divider
            className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`}
          />
        </div>

        <div className='summary-row'>
          <div className='summary-item volume'>
            <Typography
              variant='body2'
              className='opacity-70'
            >
              {t('volumeVsPlan')}
            </Typography>
            <Typography
              variant='body1'
              className='summary-value'
            >
              <RollingNumber
                value={volumeActual}
                fromZero
              />
              {volumePlanned > 0 && (
                <>
                  {' / '}
                  <RollingNumber
                    value={volumePlanned}
                    fromZero
                  />
                </>
              )}
            </Typography>
          </div>
          <div className='summary-item'>
            <Typography
              variant='body2'
              className='opacity-70'
            >
              {t('vsLast')}
            </Typography>
            <Typography
              variant='body1'
              className='summary-value'
            >
              {vsLast == null ? (
                t('noPrevious')
              ) : (
                <RollingNumber
                  value={vsLast}
                  fromZero
                  suffix='%'
                />
              )}
            </Typography>
          </div>
          <div className='summary-item'>
            <Typography
              variant='body2'
              className='opacity-70'
            >
              {t('setsDone')}
            </Typography>
            <Typography
              variant='body1'
              className='summary-value'
            >
              <RollingNumber
                value={recap.setsDone}
                fromZero
              />
              {' / '}
              <RollingNumber
                value={recap.setsPlanned}
                fromZero
              />
            </Typography>
          </div>
        </div>

        <Divider className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`} />

        <div className='accuracy-text-container'>
          <CustomAnimatedText>
            {t('accuracyText', {
              accuracy: Math.round(recap.accuracy ?? 0),
            })}
          </CustomAnimatedText>
        </div>

        <Divider className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`} />

        <div className='exercises-list'>
          {recap.exercises.map((exercise) => (
            <div
              key={exercise.exerciseId}
              className='exercise-row'
              onClick={() => onExerciseClick(exercise)}
            >
              <CachedImage
                url={exercise.image || exerciseImage.ERROR_IMAGE}
                fallback={exerciseImage.ERROR_IMAGE}
                alt={exercise.name}
                className='exercise-row-image'
              />
              <div className='texts-container'>
                <MarqueeText
                  variant='body1'
                  className='exercise-row-title bold-header'
                >
                  {capitalizeFirstLetter(exercise.name)}
                </MarqueeText>
                {exercise.prs.length > 0 && (
                  <div className='pr-badges'>
                    {t('prs')}:
                    {exercise.prs.map((pr) => {
                      const delay = prStep * 80
                      prStep += 1
                      return (
                        <PrBadge
                          key={pr.type}
                          type={pr.type}
                          animationDelayMs={delay}
                        />
                      )
                    })}
                  </div>
                )}
                {exercise.accuracy != null && (
                  <span className='exercise-accuracy'>
                    {t('expectedAccuracy', {
                      accuracy: Math.round(exercise.accuracy),
                    })}
                  </span>
                )}
              </div>
              <div className='hardness-gauge-container'>
                <HardnessGauge
                  size='small'
                  actualRpe={exercise.actualRpe}
                  accuracy={exercise.accuracy}
                />
                <Typography
                  variant='caption'
                  className='opacity-70'
                >
                  {t('RPE')}:{' '}
                  {exercise.actualRpe != null
                    ? exercise.actualRpe.toFixed(1)
                    : ''}
                </Typography>
              </div>
            </div>
          ))}
        </div>
      </div>
      {selectedExercise && (
        <SlideDialog
          open={modalSettings.open}
          onClose={onCloseModal}
          component={
            <ExerciseDetails
              exercise={selectedExercise}
              workoutId={workoutId}
              workoutName={workoutName}
            />
          }
          title={capitalizeFirstLetter(selectedExercise.name)}
          type='full'
          isFromAlertDialog={true}
        />
      )}
    </>
  )
}
