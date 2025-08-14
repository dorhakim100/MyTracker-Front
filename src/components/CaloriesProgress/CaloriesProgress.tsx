import { Card, Typography } from '@mui/material'
import { CircularProgress } from '../CircularProgress/CircularProgress'

import FlagIcon from '@mui/icons-material/Flag'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'

interface CaloriesProgressProps {
  value: number
  current: number
  goal: number
  label?: string
}

export function CaloriesProgress({
  value,
  current,
  goal,
  label = 'Calories',
}: CaloriesProgressProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  return (
    <Card
      className={`calories-progress-card ${prefs.isDarkMode ? 'dark' : ''}`}
    >
      <Typography variant='h6'>{label}</Typography>
      <div className='goal-container'>
        <Typography variant='body1'>
          {current}/{goal}
        </Typography>
        <FlagIcon />
      </div>
      <CircularProgress value={value} text={`${value}%`} />
    </Card>
  )
}
