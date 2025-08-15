import { Card, IconButton, Typography } from '@mui/material'
import { CircularProgress } from '../CircularProgress/CircularProgress'

import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { useState } from 'react'

import { EditIcon } from '../EditIcon/EditIcon'

import FlagIcon from '@mui/icons-material/Flag'

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

  const edit = () => {
    console.log('edit')
  }

  return (
    <Card
      className={`card calories-progress ${prefs.isDarkMode ? 'dark' : ''}`}
      onClick={onChangeDisplay}
    >
      <Typography variant='h6'>{label}</Typography>
      <EditIcon onClick={edit} />
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
