import { Divider, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { formatToHoursAndMinutes } from '../../services/util.service'
import { capitalizeFirstLetter } from '../../services/util.service'
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
import { useState } from 'react'
import { SlideDialog } from '../SlideDialog/SlideDialog'
import {
  ExerciseDetails,
  ExerciseWithDetails,
} from '../ExerciseDetails/ExerciseDetails'
import { CustomAnimatedText } from '../../CustomMui/CustomAnimatedText/CustomAnimatedText'

interface SessionStatsProps {
  recap: SessionStatsRecap | null
  workoutId?: string
  workoutName?: string
  exercises?: Exercise[]
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

  const volumeLabel =
    recap.volumePlanned > 0
      ? `${Math.round(recap.volumeActual)} / ${Math.round(recap.volumePlanned)}`
      : `${Math.round(recap.volumeActual)}`

  const vsLastLabel =
    recap.vsLastPercent == null
      ? t('noPrevious')
      : `${Math.round(recap.vsLastPercent)}%`

  return (
    <>
      <div className='session-stats-container'>
        <div className='hero-container'>
          <div className='duration-block'>
            <Typography
              variant='body2'
              className='opacity-70'
            >
              {t('duration')}
            </Typography>
            <Typography
              variant='h4'
              className='bold-header'
            >
              {formatToHoursAndMinutes(recap.durationMs)}
            </Typography>
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
          <div className='summary-item'>
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
              {volumeLabel}
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
              {vsLastLabel}
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
              {recap.setsDone} / {recap.setsPlanned}
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
                    {exercise.prs.map((pr) => (
                      <span
                        key={pr.type}
                        className={`pr-badge ${pr.type} ${
                          prefs.isDarkMode ? 'dark' : ''
                        }`}
                      >
                        {pr.type === 'weight' ? t('weightPr') : t('volumePr')}
                      </span>
                    ))}
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
