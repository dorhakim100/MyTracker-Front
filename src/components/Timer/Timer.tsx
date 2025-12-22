import { useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { Divider, Typography } from '@mui/material'

import { CustomLinearProgress } from '../../CustomMui/CustomLinearProgress/CustomLinearProgress'

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

// 150 seconds
const CONSTANT_RESTING_TIME = 150 * 1000

export function Timer() {
  const prefs = useSelector((state: RootState) => state.systemModule.prefs)

  const [percentage, setPercentage] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      if (percentage >= 100) {
        clearInterval(interval)
        return
      }
      setPercentage((prev) => prev + 0.01)
    }, 10)
    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className={`timer-container ${prefs.isDarkMode ? 'dark-mode' : ''} ${
        prefs.favoriteColor
      }`}
    >
      <img
        src="https://static.exercisedb.dev/media/wQ2c4XD.gif"
        alt="timer"
        className="timer-image"
      />
      <div className="text-container">
        <Typography variant="h6" className="bold-header">
          Set: 2 / 3
        </Typography>
        <div className="times-container">
          <Typography variant="body1">Rested Time: 00:00</Typography>
          <Divider
            orientation="vertical"
            flexItem
            className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`}
          />
          <Typography variant="body1">Time Left: 00:00</Typography>
        </div>
      </div>
      <CustomLinearProgress
        value={percentage}
        color={colorMap[prefs.favoriteColor]}
      />
    </div>
  )
}
