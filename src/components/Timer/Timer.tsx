import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { Divider, Typography } from '@mui/material'

import { CustomLinearProgress } from '../../CustomMui/CustomLinearProgress/CustomLinearProgress'
import { formatTime } from '../../services/util.service'
import { SECOND_IN_MS } from '../../assets/config/times'
import { showErrorMsg } from '../../services/event-bus.service'
import { messages } from '../../assets/config/messages'
import { setTimer } from '../../store/actions/workout.action'
import { SlideAnimation } from '../SlideAnimation/SlideAnimation'

const colorMap: Record<string, string> = {
  primary: 'var(--primary-color)',
  blue: 'var(--picker-color-blue)',
  yellow: 'var(--picker-color-yellow)',
  red: 'var(--picker-color-red)',
  orange: 'var(--picker-color-orange)',
  green: 'var(--picker-color-green)',
  deepPurple: 'var(--picker-color-deep-purple)',
  purple: 'var(--picker-color-purple)',
  pink: 'var(--picker-color-pink)',
}

export function Timer() {
  const prefs = useSelector((state: RootState) => state.systemModule.prefs)

  const currentExercise = useSelector(
    (state: RootState) => state.workoutModule.currentExercise
  )

  const [secondsPassedState, setSecondsPassedState] = useState<number>(0)

  const timer = useSelector((state: RootState) => state.workoutModule.timer)

  const percentage = useMemo(() => {
    if (!currentExercise || !currentExercise.restingTime) return 0
    return (
      ((secondsPassedState * SECOND_IN_MS) / currentExercise.restingTime!) * 100
    )
  }, [currentExercise, secondsPassedState])

  const doneSets = useMemo(() => {
    return currentExercise?.sets.filter((set) => set.isDone).length
  }, [currentExercise])

  const totalSets = useMemo(() => {
    return currentExercise?.sets.length
  }, [currentExercise])

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
  }, [currentExercise])

  async function startSet() {
    try {
      if (!currentExercise || !currentExercise.restingTime) return

      setSecondsPassedState(0)

      await setTimer({
        currentExercise: currentExercise,
        startTime: new Date().getTime(),
      })
    } catch (err) {
      console.error(err)
      showErrorMsg(messages.error.startTimer)
    }
  }

  if (!timer) return null

  if (!currentExercise || !currentExercise.restingTime) return null

  return (
    <SlideAnimation
      motionKey={doneSets || 0}
      direction={1}
      duration={0.25}
      className={`timer-container ${prefs.isDarkMode ? 'dark-mode' : ''} ${
        prefs.favoriteColor
      }`}
    >
      {/* <div className={`timer-container ${prefs.isDarkMode ? 'dark-mode' : ''} ${
        prefs.favoriteColor
      }`}> */}
      <img src={currentExercise?.image} alt="timer" className="timer-image" />
      <div className="text-container">
        <Typography variant="h6" className="bold-header">
          Done Sets: {doneSets} / {totalSets}
        </Typography>
        <div className="times-container">
          <Typography variant="body1" className="bold-header opacity-1">
            Rested Time: {formatTime(secondsPassedState * SECOND_IN_MS, false)}
          </Typography>
          <Divider
            orientation="vertical"
            flexItem
            className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`}
          />
          <Typography
            variant="body1"
            className="bold-header opacity-1 time-left"
          >
            Time Left:{' '}
            {currentExercise?.restingTime &&
            secondsPassedState * SECOND_IN_MS < currentExercise?.restingTime
              ? formatTime(
                  currentExercise?.restingTime -
                    secondsPassedState * SECOND_IN_MS,
                  false
                )
              : '0:00'}
          </Typography>
        </div>
      </div>
      <CustomLinearProgress
        value={percentage}
        color={colorMap[prefs.favoriteColor]}
      />
      {/* </div> */}
    </SlideAnimation>
  )
}
