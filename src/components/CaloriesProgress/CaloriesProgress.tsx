import { Card, Typography, Box } from '@mui/material'
// import {Slider} from '@mui/material'
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

import CircularSlider from 'react-circular-slider-svg'

function EditComponent() {
  const [calories, setCalories] = useState<number>(3000)

  const MIN = 1200
  const MAX = 5000
  const STEP = 50

  const color = 'var(--secondary-color)'
  const arcBackgroundColor = 'var(--secondary-color-background)'

  const clampToStep = (value: number) => {
    const clamped = Math.min(MAX, Math.max(MIN, value))
    return Math.round(clamped / STEP) * STEP
  }

  const handleChange = (value: number) => {
    setCalories(clampToStep(value))
  }

  return (
    <>
      <Box sx={{ p: 2 }}>
        <Box
          sx={{ position: 'relative' }}
          className='calories-amount-container'
        >
          <Typography variant='h3' className='calories-amount'>
            {calories} kcal
          </Typography>
          <div className='circular-slider-container'>
            <CircularSlider
              size={380}
              trackWidth={14}
              minValue={MIN}
              maxValue={MAX}
              startAngle={180}
              endAngle={360}
              handle1={{ value: calories, onChange: handleChange }}
              arcColor={color}
              arcBackgroundColor={arcBackgroundColor}
            />
          </div>
        </Box>
      </Box>
    </>
  )
}
