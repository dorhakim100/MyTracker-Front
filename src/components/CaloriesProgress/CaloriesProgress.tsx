import { Card, Typography } from '@mui/material'
import { CircularProgress } from '../CircularProgress/CircularProgress'

import FlagIcon from '@mui/icons-material/Flag'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { useState } from 'react'

interface CaloriesProgressProps {
  percentageValue: number
  current: number
  goal: number
  label?: string
}

export function CaloriesProgress({
  percentageValue,
  current,
  goal,
  label = 'Calories',
}: CaloriesProgressProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const [valueToShow, setValueToShow] = useState<number | string>(current)
  const [isPercentage, setIsPercentage] = useState(false)

  const onChangeDisplay = () => {
    const stateToSet = !isPercentage
    setIsPercentage(stateToSet)
    setValueToShow(stateToSet ? current : `${percentageValue}%`)
  }

  return (
    <Card
      className={`card calories-progress ${prefs.isDarkMode ? 'dark' : ''}`}
      onClick={onChangeDisplay}
    >
      <Typography variant='h6'>{label}</Typography>
      <div className='goal-container'>
        <div className='banner'>
          <Typography variant='body1'>
            {current}/{goal}
          </Typography>
          <FlagIcon />
        </div>
      </div>
      <CircularProgress value={percentageValue} text={`${valueToShow}`} />
    </Card>
  )
}
