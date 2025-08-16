import { Card, Typography, Box, Stack, Button } from '@mui/material'
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

import Slider from 'rc-slider'
// import CircularSlider from '@fseehawer/react-circular-slider'
import CircularSlider from 'react-circular-slider-svg'

function EditComponent() {
  const [calories, setCalories] = useState<number>(2000)

  const marks = [
    { value: 0, label: '0' },
    { value: 1000, label: '1k' },
    { value: 2000, label: '2k' },
    { value: 3000, label: '3k' },
    { value: 4000, label: '4k' },
  ]

  const handleChange = (value: number) => {
    const valueToSet = Math.round(value / 50) * 50

    setCalories(valueToSet)
  }

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    e.preventDefault()
    console.log('clicked')
    // setCalories(1600)
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box
        sx={{
          position: 'relative',
          // height: 200,
        }}
        className='calories-amount-container'
      >
        <Typography
          variant='h3'
          onClick={handleClick}
          className='calories-amount'
        >
          {calories} kcal
        </Typography>
        <div className='circular-slider-container'>
          <CircularSlider
            size={300}
            trackWidth={12}
            minValue={1600}
            maxValue={4000}
            startAngle={180} // start at left
            endAngle={360} // end at right (half circle)
            handle1={{
              value: calories,
              onChange: handleChange,
            }}
            arcColor='#009688'
            arcBackgroundColor='#3A3F47'
          />
        </div>
      </Box>
      {/* <Stack direction='row' spacing={1} justifyContent='center'>
        <Button
          variant='outlined'
          onClick={() => setCalories((v) => Math.max(0, v - 50))}
        >
          -50
        </Button>
        <Button
          variant='outlined'
          onClick={() => setCalories((v) => Math.min(4000, v + 50))}
        >
          +50
        </Button>
      </Stack> */}
    </Box>
  )
}
