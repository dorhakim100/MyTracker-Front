import { Card, Typography } from '@mui/material'
import { CircularProgress } from '../CircularProgress/CircularProgress'

import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { useState } from 'react'

import { EditIcon } from '../EditIcon/EditIcon'
import { SlideDialog } from '../SlideDialog/SlideDialog'

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
  const [openModal, setOpenModal] = useState(false)

  const edit = () => {
    setOpenModal(true)
  }

  const onClose = () => {
    setOpenModal(false)
  }

  return (
    <>
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
      <SlideDialog
        open={openModal}
        onClose={onClose}
        component={<EditComponent />}
        title='Edit Calories'
      />
    </>
  )
}

function EditComponent() {
  return <div>EditComponent</div>
}
