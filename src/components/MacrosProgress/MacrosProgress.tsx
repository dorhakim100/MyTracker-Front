import { useEffect, useState } from 'react'

import { Box, Card, Typography } from '@mui/material'

import { CircularProgress } from '../CircularProgress/CircularProgress'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { EditIcon } from '../EditIcon/EditIcon'
import { SlideDialog } from '../SlideDialog/SlideDialog'
import { GoalBanner } from '../GoalBanner/GoalBanner'

const proteinColor = 'var(--macro-protein)'
const carbsColor = 'var(--macro-carbs)'
const fatsColor = 'var(--macro-fats)'

const proteinColorDarkMode = 'var(--macro-protein-dark)'
const carbsColorDarkMode = 'var(--macro-carbs-dark)'
const fatsColorDarkMode = 'var(--macro-fats-dark)'

interface Macro {
  percentage: number
  gram: number
}
interface MacrosProgressProps {
  protein: Macro
  carbs: Macro
  fats: Macro
}

export function MacrosProgress({ protein, carbs, fats }: MacrosProgressProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const userToEdit = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.userToEdit
  )

  const [openModal, setOpenModal] = useState(false)

  const macros = [
    {
      name: 'Carbs',
      value: carbs,
      color: prefs.isDarkMode ? carbsColorDarkMode : carbsColor,
    },
    {
      name: 'Protein',
      value: protein,
      color: prefs.isDarkMode ? proteinColorDarkMode : proteinColor,
    },
    {
      name: 'Fats',
      value: fats,
      color: prefs.isDarkMode ? fatsColorDarkMode : fatsColor,
    },
  ]

  const edit = () => {
    setOpenModal(true)
  }

  const onClose = () => {
    setOpenModal(false)
  }

  const onSave = async () => {
    try {
      if (!userToEdit) return
      setIsLoading(true)
      await updateUser(userToEdit)
      showSuccessMsg(messages.success.updateMacros)
      onClose()
    } catch (err) {
      console.log(err)
      showErrorMsg(messages.error.updateMacros)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Card
        className={`card macros-progress ${
          prefs.isDarkMode ? 'dark-mode' : ''
        }`}
      >
        <Typography variant='h6'>Macros</Typography>
        <EditIcon onClick={edit} />
        <div className='macros-container'>
          {macros.map((macro) => (
            <div
              className={`macro-container ${macro.name.toLowerCase()}`}
              key={`progress-${macro.name}`}
            >
              <CircularProgress
                value={macro.value.percentage}
                text={`${macro.value.gram.toFixed(0)}`}
                color={macro.color}
              />
              <span>{macro.name}</span>
              <GoalBanner
                current={(
                  (macro.value.percentage / 100) *
                  macro.value.gram
                ).toFixed(0)}
                goal={macro.value.gram.toFixed(0)}
              />
            </div>
          ))}
        </div>
      </Card>
      <SlideDialog
        open={openModal}
        onClose={onClose}
        component={<EditComponent />}
        title='Edit Macros'
        onSave={onSave}
      />
    </>
  )
}

import Picker from 'react-mobile-picker'
import {
  capitalizeFirstLetter,
  getArrayOfNumbers,
  getFixedNumber,
} from '../../services/util.service'
import { setIsLoading } from '../../store/actions/system.actions'
import { setUserToEdit, updateUser } from '../../store/actions/user.actions'
import { User } from '../../types/user/User'
import { showErrorMsg, showSuccessMsg } from '../../services/event-bus.service'
import { messages } from '../../assets/config/messages'
import {
  calculateCarbCalories,
  calculateFatCalories,
  calculateProteinCalories,
} from '../../services/macros/macros.service'

function EditComponent() {
  interface PickerValue {
    carbs: number
    protein: number
    fats: number
    [key: string]: number
  }

  const macros = {
    carbs: getArrayOfNumbers(0, 400),
    protein: getArrayOfNumbers(0, 300),
    fats: getArrayOfNumbers(0, 150),
  }

  const userToEdit = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.userToEdit
  )

  const user = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.user
  )

  const [pickerValue, setPickerValue] = useState<PickerValue>({
    carbs: getFixedNumber(
      userToEdit?.currGoal?.macros.carbs || user?.currGoal?.macros.carbs || 0
    ),
    protein: getFixedNumber(
      userToEdit?.currGoal?.macros.protein ||
        user?.currGoal?.macros.protein ||
        0
    ),
    fats: getFixedNumber(
      userToEdit?.currGoal?.macros.fat || user?.currGoal?.macros.fat || 0
    ),
  })

  const macroKeys = Object.keys(macros) as (keyof typeof macros)[]

  useEffect(() => {
    pickerValue.protein = +pickerValue.protein.toFixed(0)
    pickerValue.carbs = +pickerValue.carbs.toFixed(0)
    pickerValue.fats = +pickerValue.fats.toFixed(0)
  }, [userToEdit, user])

  useEffect(() => {
    const proteinCalories = calculateProteinCalories(pickerValue.protein)
    const carbsCalories = calculateCarbCalories(pickerValue.carbs)
    const fatsCalories = calculateFatCalories(pickerValue.fats)

    const totalCalories = proteinCalories + carbsCalories + fatsCalories

    const userToUpdate = {
      ...userToEdit,
      currGoal: {
        ...userToEdit?.currGoal,
        dailyCalories: totalCalories,
        macros: {
          ...userToEdit?.currGoal?.macros,
          carbs: pickerValue.carbs,
          protein: pickerValue.protein,
          fat: pickerValue.fats,
        },
      },
    } as User

    setUserToEdit(userToUpdate)
  }, [pickerValue])

  useEffect(() => {
    const userToSet = {
      ...userToEdit,
      currGoal: {
        ...userToEdit?.currGoal,
        macros: {
          ...userToEdit?.currGoal?.macros,
          carbs: pickerValue.carbs,
          protein: pickerValue.protein,
          fat: pickerValue.fats,
        },
      },
    } as User

    setUserToEdit(userToSet)
  }, [user])

  return (
    <Box className='edit-macros-container'>
      <div className='picker-container'>
        <Picker
          value={pickerValue}
          onChange={(next) => setPickerValue(next as unknown as PickerValue)}
          height={150}
        >
          {macroKeys.map((name) => {
            const macroName = name as string
            return (
              <Picker.Column key={`${macroName}-picker`} name={macroName}>
                {macros[name].map((option: number | string) => {
                  if (typeof option === 'string') {
                    option = +option
                  }

                  return (
                    <Picker.Item
                      key={`${option.toFixed(0)}-${macroName}`}
                      value={option}
                    >
                      {/* {option.toFixed(0)} */}
                      {({ selected }) => (
                        <Typography
                          variant='h5'
                          className={`${selected ? 'selected' : ''}`}
                        >
                          {option}
                        </Typography>
                      )}
                      {/* {option} */}
                    </Picker.Item>
                  )
                })}
              </Picker.Column>
            )
          })}
        </Picker>
      </div>

      <div className='macros-title-container'>
        {macroKeys.map((name) => {
          const macroName = name as string
          return (
            <div className='macro-container' key={`name-${macroName}`}>
              <div className={`banner ${macroName}`}>
                <span className='title'>
                  {capitalizeFirstLetter(macroName)}
                </span>
              </div>
              <Typography variant='h6' className='value'>
                {pickerValue[macroName].toFixed(0)}g
              </Typography>
            </div>
          )
        })}
      </div>
    </Box>
  )
}
