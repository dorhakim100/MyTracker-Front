import { useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { Divider, Typography } from '@mui/material'

import { LocalNotifications } from '@capacitor/local-notifications'

import { CustomLinearProgress } from '../../CustomMui/CustomLinearProgress/CustomLinearProgress'
import { capitalizeFirstLetter, formatTime } from '../../services/util.service'
import { SECOND_IN_MS } from '../../assets/config/times'
import { showErrorMsg } from '../../services/event-bus.service'
import { setTimer } from '../../store/actions/workout.action'
import { SlideAnimation } from '../SlideAnimation/SlideAnimation'
import { SlideDialog } from '../SlideDialog/SlideDialog'
import { ExerciseDetails } from '../ExerciseDetails/ExerciseDetails'
import { Exercise } from '../../types/exercise/Exercise'
import { useTranslation } from 'react-i18next'
import { CachedImage } from '../CachedImage/CachedImage'
import { exerciseImage } from '../../assets/config/exercise-image'

interface ExerciseDialogOptions {
  open: boolean
  exercise: Exercise | null
}

export function Timer() {
  const { t } = useTranslation()
  const prefs = useSelector((state: RootState) => state.systemModule.prefs)
  const isLocalNotificationsPermitted = useSelector(
    (state: RootState) => state.systemModule.isLocalNotificationsPermitted
  )
  const currentExercise = useSelector(
    (state: RootState) => state.workoutModule.currentExercise
  )
  const timer = useSelector((state: RootState) => state.workoutModule.timer)
  const sessionDay = useSelector(
    (state: RootState) => state.workoutModule.sessionDay
  )

  const [secondsPassedState, setSecondsPassedState] = useState<number>(0)
  const [isExiting, setIsExiting] = useState(false)
  const [showTimer, setShowTimer] = useState(false)
  const lastExerciseRef = useRef(currentExercise)
  const [exerciseDialogOptions, setExerciseDialogOptions] =
    useState<ExerciseDialogOptions>({
      open: false,
      exercise: null,
    })

  const displayExercise = currentExercise || lastExerciseRef.current

  useEffect(() => {
    if (currentExercise) {
      lastExerciseRef.current = currentExercise
    }
  }, [currentExercise])

  const percentage = useMemo(() => {
    if (!displayExercise || !displayExercise.restingTime) return 0
    const percentage =
      ((secondsPassedState * SECOND_IN_MS) / displayExercise.restingTime!) *
      100

    if (percentage >= 100) {
    }

    return percentage
  }, [displayExercise, secondsPassedState])

  const doneSets = useMemo(() => {
    return displayExercise?.sets.filter((set) => set.isDone).length
  }, [displayExercise])

  const totalSets = useMemo(() => {
    return displayExercise?.sets.length
  }, [displayExercise])

  useEffect(() => {
    if (timer) {
      setShowTimer(true)
      setIsExiting(false)
      return
    }

    if (!showTimer) return

    setIsExiting(true)
    const timeout = setTimeout(() => {
      setShowTimer(false)
      setIsExiting(false)
    }, 280)

    return () => clearTimeout(timeout)
  }, [timer, showTimer])

  useEffect(() => {
    const interval = setInterval(() => {
      if (timer) {
        setSecondsPassedState(
          (new Date().getTime() - timer.startTime) / SECOND_IN_MS
        )
      }
    }, SECOND_IN_MS / 10)
    return () => {
      clearInterval(interval)
    }
  }, [timer])

  useEffect(() => {
    startSet()
    if (isLocalNotificationsPermitted && !currentExercise) {
      cancelNotification()
    }
  }, [currentExercise])

  async function startSet() {
    try {
      if (!currentExercise || !currentExercise.restingTime) return

      setSecondsPassedState(0)

      await setTimer({
        currentExercise: currentExercise,
        startTime: new Date().getTime(),
      })

      if (isLocalNotificationsPermitted) {
        await cancelNotification()

        setNotification(currentExercise.restingTime)
      }
    } catch {
      showErrorMsg(t('messages.error.startTimer'))
    }
  }

  function openExerciseDialog() {
    const exercise = sessionDay?.workout.exercises.find(
      (e) => e.exerciseId === displayExercise?.exerciseId
    )
    if (!exercise) return
    setExerciseDialogOptions({ open: true, exercise: exercise })
  }

  async function setNotification(secondsFromNowInMiliseconds: number) {
    const alarmTime = new Date(Date.now() + secondsFromNowInMiliseconds)

    await LocalNotifications.schedule({
      notifications: [
        {
          title: t('timer.timer'),
          body: t('timer.timeForNextSet'),
          id: 1,
          schedule: { at: alarmTime, allowWhileIdle: true },
          channelId: '1',
          sound: 'ding',
        },
      ],
    })
  }

  async function cancelNotification() {
    await LocalNotifications.cancel({
      notifications: [
        {
          id: 1,
        },
      ],
    })
  }

  if (!showTimer) return null

  if (!displayExercise || !displayExercise.restingTime) return null

  return (
    <>
      <div
        className={`timer-container ${prefs.isDarkMode ? 'dark-mode' : ''} ${
          prefs.favoriteColor
        } ${isExiting ? 'is-exiting' : ''}`}
        onClick={isExiting ? undefined : openExerciseDialog}
      >
        <SlideAnimation
          motionKey={doneSets || 0}
          direction={1}
          duration={0.25}
        >
          <div className='timer'>
            <CachedImage
              url={displayExercise?.image || exerciseImage.ERROR_IMAGE}
              fallback={exerciseImage.ERROR_IMAGE}
              alt='timer'
              className='timer-image'
            />
            <div className='text-container'>
              <div className='times-container'>
                <Typography
                  variant='body1'
                  className='bold-header opacity-1 time-left'
                >
                  {displayExercise?.restingTime &&
                  secondsPassedState * SECOND_IN_MS <
                    displayExercise?.restingTime
                    ? formatTime(
                        displayExercise?.restingTime -
                          secondsPassedState * SECOND_IN_MS +
                          1000,
                        false
                      )
                    : '0:00'}
                </Typography>
                <Divider
                  orientation='vertical'
                  flexItem
                  className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`}
                />
                <Typography
                  variant='body1'
                  className='bold-header opacity-1 time-past'
                >
                  {formatTime(secondsPassedState * SECOND_IN_MS, false)}
                </Typography>
              </div>
              <Typography
                variant='h6'
                className='bold-header sets-text'
              >
                {t('timer.sets')}: {doneSets} / {totalSets}
              </Typography>
            </div>
            <CustomLinearProgress value={percentage} />
          </div>
        </SlideAnimation>
      </div>
      <SlideDialog
        open={exerciseDialogOptions.open}
        onClose={() =>
          setExerciseDialogOptions({ open: false, exercise: null })
        }
        component={
          <ExerciseDetails exercise={exerciseDialogOptions.exercise} />
        }
        title={capitalizeFirstLetter(
          exerciseDialogOptions.exercise?.name || ''
        )}
        type='full'
      />
    </>
  )
}
