import { getArrayOfNumbers } from '../../services/util.service'
import Picker from 'react-mobile-picker'
import { setUserToEdit } from '../../store/actions/user.actions'
import { User } from '../../types/user/User'
import {
  calculateCarbsFromCalories,
  roundCaloriesToNearest50,
} from '../../services/macros/macros.service'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { useEffect, useMemo, useState } from 'react'
import { Box, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import { Goal } from '../../types/goal/Goal'

interface CaloriesEditProps {
  goalToEdit?: Goal | Partial<Goal>
  goalRef?: React.RefObject<Goal | Partial<Goal>>
}

export function CaloriesEdit({ goalToEdit, goalRef }: CaloriesEditProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const MIN = 1200
  const MAX = 5000
  const STEP = 50

  const options = useMemo(
    () =>
      (getArrayOfNumbers(MIN, MAX) as number[]).filter((n) => n % STEP === 0),
    []
  )

  const user = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.user
  )

  const userToEdit = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.userToEdit
  )

  const [pickerCalories, setPickerCalories] = useState<{ calories: number }>({
    calories: roundCaloriesToNearest50(
      goalToEdit?.dailyCalories || user?.currGoal?.dailyCalories || 2400
    ),
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
    if (goalRef && goalRef.current) {
      setPickerCalories({ calories: goalRef.current.dailyCalories as number })
    }
  }, [])

  useEffect(() => {
    const currCalories =
      goalToEdit?.dailyCalories || user?.currGoal?.dailyCalories

    if (!currCalories) return
    const diff = (currCalories - pickerCalories.calories) * -1

    let carbsToEdit = calculateCarbsFromCalories(diff)

    if (diff < 0) {
      carbsToEdit *= -1
    }
    const originalCarbs =
      goalToEdit?.macros?.carbs || user?.currGoal?.macros.carbs || 0

    const newCarbs = originalCarbs + carbsToEdit
    if (goalToEdit && goalRef) {
      goalRef.current = {
        ...goalToEdit,
        dailyCalories: pickerCalories.calories,
        macros: {
          ...goalToEdit?.macros,
          carbs: newCarbs,
        },
      } as Goal
      return
    }

    const userToUpdate = {
      ...userToEdit,
      currGoal: {
        ...userToEdit?.currGoal,
        dailyCalories: roundCaloriesToNearest50(pickerCalories.calories),
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
          <Typography
            variant='h3'
            className={`calories-amount ${prefs.favoriteColor || ''}`}
          >
            {roundCaloriesToNearest50(pickerCalories.calories)} kcal
          </Typography>
          <div className='picker-container'>
            <Picker
              value={pickerCalories}
              onChange={(next) =>
                // setPickerCalories(next as unknown as { calories: number })
                setPickerCalories({ calories: next.calories as number })
              }
              height={150}
            >
              <Picker.Column name='calories'>
                {options.map((calorie) => (
                  <Picker.Item key={calorie} value={calorie}>
                    {({ selected }) => (
                      <Typography
                        variant='h5'
                        className={`${selected ? 'selected' : ''}`}
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
              <CustomButton
                onClick={() => onFixedChange(-400)}
                icon={<RemoveIcon />}
                className={`${prefs.favoriteColor}`}
                text='400'
              />
              <CustomButton
                onClick={() => onFixedChange(400)}
                icon={<AddIcon />}
                className={`${prefs.favoriteColor}`}
                text='400'
              />
            </div>
          </div>
        </Box>
      </Box>
    </>
  )
}
