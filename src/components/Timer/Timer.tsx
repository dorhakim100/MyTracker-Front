import { useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { Divider, Typography } from '@mui/material'

import { CustomLinearProgress } from '../../CustomMui/CustomLinearProgress/CustomLinearProgress'
import { formatTime } from '../../services/util.service'
import { SECOND_IN_MS } from '../../assets/config/times'

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
      setSecondsPassedState((prev) => prev + 0.1)
    }, SECOND_IN_MS / 10)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!currentExercise || !currentExercise.restingTime) return
    setSecondsPassedState(0)
  }, [currentExercise])

  if (!currentExercise || !currentExercise.restingTime) return null

  return (
    <div
      className={`timer-container ${prefs.isDarkMode ? 'dark-mode' : ''} ${
        prefs.favoriteColor
      }`}
    >
      <img src={currentExercise?.image} alt="timer" className="timer-image" />
      <div className="text-container">
        <Typography variant="h6" className="bold-header">
          Done Sets: {doneSets} / {totalSets}
        </Typography>
        <div className="times-container">
          <Typography variant="body1">
            Rested Time: {formatTime(secondsPassedState * SECOND_IN_MS, false)}
          </Typography>
          <Divider
            orientation="vertical"
            flexItem
            className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`}
          />
          <Typography variant="body1">
            Time Left:{' '}
            {currentExercise?.restingTime &&
            secondsPassedState * SECOND_IN_MS < currentExercise?.restingTime
              ? formatTime(
                  currentExercise?.restingTime -
                    secondsPassedState * SECOND_IN_MS,
                  false
                )
              : '00:00'}
          </Typography>
        </div>
      </div>
      <CustomLinearProgress
        value={percentage}
        color={colorMap[prefs.favoriteColor]}
      />
    </div>
  )
}
