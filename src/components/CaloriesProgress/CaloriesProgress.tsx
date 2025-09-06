import { Card, Typography, Box, Button } from '@mui/material'
// import {Slider} from '@mui/material'
import { CircularProgress } from '../CircularProgress/CircularProgress'

import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { useMemo, useState, useEffect } from 'react'
import {
  optimisticUpdateUser,
  updateUser,
} from '../../store/actions/user.actions'
import { setIsLoading } from '../../store/actions/system.actions'

import { EditIcon } from '../EditIcon/EditIcon'
import { SlideDialog } from '../SlideDialog/SlideDialog'
import { GoalBanner } from '../GoalBanner/GoalBanner'

// import FlagIcon from '@mui/icons-material/Flag'

interface CaloriesProgressProps {
  percentageValue?: number
  current: number
  goal: number
  label?: string
}

export function CaloriesProgress({
  // percentageValue,
  current,
  // goal,
  label = 'Calories',
}: CaloriesProgressProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const user = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.user
  )

  const userToEdit = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.userToEdit
  )

  // const [valueToShow, setValueToShow] = useState<number | string>(current)
  // const [isPercentage, setIsPercentage] = useState(false)

  // const onChangeDisplay = () => {
  //   const stateToSet = !isPercentage
  //   setIsPercentage(stateToSet)

  //   setValueToShow(stateToSet ? current : `${percentageValue}%`)
  // }
  const [openModal, setOpenModal] = useState(false)

  const edit = () => {
    setOpenModal(true)
  }

  const onClose = () => {
    setOpenModal(false)
  }

  const onSave = async () => {
    try {
      if (!userToEdit || !user) return
      setIsLoading(true)
      optimisticUpdateUser(userToEdit)
      onClose()
      await updateUser(userToEdit)
      showSuccessMsg(messages.success.updateCalories)
    } catch (err) {
      console.log('err', err)
      showErrorMsg(messages.error.updateCalories)
      optimisticUpdateUser(user as User)
    } finally {
      setIsLoading(false)
    }
  }

  function getPercentageValue() {
    return (current / (user?.currGoal?.dailyCalories || 1)) * 100
    // return user?.currGoal?.dailyCalories
    //   ? (current / user?.currGoal?.dailyCalories) * 100
    //   : 0
  }

  return (
    <>
      <Card
        className={`card calories-progress ${prefs.isDarkMode ? 'dark' : ''}`}
        // onClick={onChangeDisplay}
      >
        <Typography variant='h6'>{label}</Typography>
        <EditIcon onClick={edit} />
        <div className='goal-container'>
          <GoalBanner
            current={current}
            goal={roundToNearest50(user?.currGoal?.dailyCalories || 0)}
          />
        </div>
        <CircularProgress
          value={getPercentageValue()}
          // text={`${valueToShow}`}
          text={`${current}`}
        />
      </Card>
      <SlideDialog
        open={openModal}
        onClose={onClose}
        component={<EditComponent />}
        title='Edit Calories'
        onSave={onSave}
      />
    </>
  )
}

import { getArrayOfNumbers } from '../../services/util.service'
import Picker from 'react-mobile-picker'
import { setUserToEdit } from '../../store/actions/user.actions'
import { User } from '../../types/user/User'
import {
  calculateCarbsFromCalories,
  roundToNearest50,
} from '../../services/macros/macros.service'
import { showErrorMsg, showSuccessMsg } from '../../services/event-bus.service'
import { messages } from '../../assets/config/messages'

function EditComponent() {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const MIN = 1200
  const MAX = 5000
  const STEP = 50

  const options = useMemo(
    () => getArrayOfNumbers(MIN, MAX).filter((n) => n % STEP === 0),
    []
  )

  const user = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.user
  )

  const userToEdit = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.userToEdit
  )

  const [pickerCalories, setPickerCalories] = useState<{ calories: number }>({
    calories: user?.currGoal?.dailyCalories || 2400,
  })

  const onFixedChange = (value: number) => {
    const valueToSet = pickerCalories.calories + value
    if (valueToSet > MAX) {
      setPickerCalories({ calories: MAX })
    } else if (valueToSet < MIN) {
      setPickerCalories({ calories: MIN })
    } else {
      setPickerCalories({ calories: valueToSet })
    }
  }

  useEffect(() => {
    const currCalories = user?.currGoal?.dailyCalories
    if (!currCalories) return
    const diff = (currCalories - pickerCalories.calories) * -1

    const carbsToEdit = calculateCarbsFromCalories(diff)
    const originalCarbs = user?.currGoal?.macros.carbs

    const newCarbs = originalCarbs + carbsToEdit

    const userToUpdate = {
      ...userToEdit,
      currGoal: {
        ...userToEdit?.currGoal,
        dailyCalories: roundToNearest50(pickerCalories.calories),
        macros: {
          ...userToEdit?.currGoal?.macros,
          carbs: newCarbs,
        },
      },
    } as User

    setUserToEdit(userToUpdate)
  }, [pickerCalories.calories])

  return (
    <>
      <Box sx={{ p: 2 }}>
        <Box
          sx={{ position: 'relative' }}
          className='calories-amount-container'
        >
          <Typography variant='h3' className='calories-amount'>
            {pickerCalories.calories} kcal
          </Typography>
          <div className='picker-container'>
            <Picker
              value={pickerCalories}
              onChange={(next) =>
                setPickerCalories(next as unknown as { calories: number })
              }
              height={150}
            >
              <Picker.Column name='calories'>
                {options.map((calorie) => (
                  <Picker.Item key={calorie} value={calorie}>
                    {({ selected }) => (
                      <Typography
                        variant='h5'
                        sx={{
                          fontWeight: selected ? 700 : 400,
                          opacity: selected ? 1 : 0.45,

                          transform: selected ? 'scale(1)' : 'scale(0.8)',
                          transition: 'all 160ms ease',
                          position: 'relative',
                        }}
                      >
                        {`${calorie}`}
                        {/* {selected && <span className='kcal'>kcal</span>} */}
                      </Typography>
                    )}
                  </Picker.Item>
                ))}
              </Picker.Column>
            </Picker>
            <div className='buttons-container'>
              <Button
                onClick={() => onFixedChange(-400)}
                variant='contained'
                color='primary'
                className={`${prefs.favoriteColor}`}
              >
                -400
              </Button>
              <Button
                onClick={() => onFixedChange(400)}
                variant='contained'
                color='primary'
                className={`${prefs.favoriteColor}`}
              >
                +400
              </Button>
            </div>
          </div>
          {/* <Typography variant='h3' className='calories-amount'>
            {calories} kcal
          </Typography> */}
          {/* <div className='circular-slider-container'>
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
          </div> */}
        </Box>
      </Box>
    </>
  )
}
