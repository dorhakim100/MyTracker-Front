import Picker from 'react-mobile-picker'
import {
  capitalizeFirstLetter,
  getArrayOfNumbers,
  getFixedNumber,
} from '../../services/util.service'
import { setUserToEdit } from '../../store/actions/user.actions'
import { User } from '../../types/user/User'
import {
  calculateCarbCalories,
  calculateFatCalories,
  calculateProteinCalories,
} from '../../services/macros/macros.service'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { useEffect, useState } from 'react'
import { Box, Typography } from '@mui/material'
import { Goal } from '../../types/goal/Goal'
import { Macros as MacrosType } from '../../types/macros/Macros'
import { SaveCancel } from '../SaveCancel/SaveCancel'

interface EditMacrosProps {
  goalToEdit?: Goal | Partial<Goal>
  goalRef?: React.RefObject<Goal | Partial<Goal>>
  isCustomLog?: boolean
  protein?: number
  carbs?: number
  fats?: number
  editCustomLog?: (macros: MacrosType) => void
  onCancel?: () => void
  onSave?: () => void
}

const CARBS_LIMIT = 800
const PROTEIN_LIMIT = 350
const FATS_LIMIT = 200

// const macrosAddButtons = {
//   carbs: {
//     value: 35,
//     limit: CARBS_LIMIT,
//   },
//   protein: {
//     value: 20,
//     limit: PROTEIN_LIMIT,
//   },
//   fats: {
//     value: 10,
//     limit: FATS_LIMIT,
//   },
// }

interface PickerValue {
  carbs: number
  protein: number
  fats: number
  [key: string]: number
}
export function EditMacros({
  goalToEdit,
  goalRef,
  isCustomLog = false,
  protein,
  carbs,
  fats,
  editCustomLog,
  onCancel,
  onSave,
}: EditMacrosProps) {
  const macros = {
    carbs: getArrayOfNumbers(0, CARBS_LIMIT),
    protein: getArrayOfNumbers(0, PROTEIN_LIMIT),
    fats: getArrayOfNumbers(0, FATS_LIMIT),
  }

  const userToEdit = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.userToEdit
  )

  const user = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.user
  )

  const [pickerValue, setPickerValue] = useState<PickerValue>({
    carbs: getFixedNumber(
      (isCustomLog && carbs) ||
        goalToEdit?.macros?.carbs ||
        userToEdit?.currGoal?.macros.carbs ||
        user?.currGoal?.macros.carbs ||
        0
    ),
    protein: getFixedNumber(
      (isCustomLog && protein) ||
        goalToEdit?.macros?.protein ||
        userToEdit?.currGoal?.macros.protein ||
        user?.currGoal?.macros.protein ||
        0
    ),
    fats: getFixedNumber(
      (isCustomLog && fats) ||
        goalToEdit?.macros?.fat ||
        userToEdit?.currGoal?.macros.fat ||
        user?.currGoal?.macros.fat ||
        0
    ),
  })

  const macroKeys = Object.keys(macros) as (keyof typeof macros)[]

  useEffect(() => {
    pickerValue.protein = +pickerValue.protein.toFixed(0)
    pickerValue.carbs = +pickerValue.carbs.toFixed(0)
    pickerValue.fats = +pickerValue.fats.toFixed(0)
  }, [userToEdit, user, goalToEdit])

  useEffect(() => {
    const proteinCalories = calculateProteinCalories(pickerValue.protein)
    const carbsCalories = calculateCarbCalories(pickerValue.carbs)
    const fatsCalories = calculateFatCalories(pickerValue.fats)

    const totalCalories = proteinCalories + carbsCalories + fatsCalories

    if (isCustomLog) {
      editCustomLog?.({
        calories: totalCalories,
        carbs: pickerValue.carbs,
        protein: pickerValue.protein,
        fat: pickerValue.fats,
      })

      return
    }

    const goalToUpdate = {
      ...goalToEdit,
      dailyCalories: totalCalories,
      macros: {
        ...goalToEdit?.macros,
        carbs: pickerValue.carbs,
        protein: pickerValue.protein,
        fat: pickerValue.fats,
      },
    } as Goal

    if (goalToEdit && goalRef) {
      goalRef.current = goalToUpdate as Goal
      return
    }

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
    <Box className="edit-macros-container">
      <div className="picker-container">
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
                      {({ selected }) => (
                        <Typography
                          variant="h5"
                          className={`${selected ? 'selected' : ''}`}
                        >
                          {option}
                        </Typography>
                      )}
                    </Picker.Item>
                  )
                })}
              </Picker.Column>
            )
          })}
        </Picker>
      </div>

      <div className="macros-title-container">
        {macroKeys.map((name) => {
          const macroName = name as string

          // const getButtonDisabled = () => {
          //   return (
          //     pickerValue[macroName] +
          //       macrosAddButtons[macroName as keyof typeof macrosAddButtons]
          //         .value >
          //     macrosAddButtons[macroName as keyof typeof macrosAddButtons].limit
          //   )
          // }

          // const buttonValue =
          //   macrosAddButtons[macroName as keyof typeof macrosAddButtons].value

          return (
            <div className="macro-container" key={`name-${macroName}`}>
              <div className={`banner ${macroName}`}>
                <span className="title">
                  {capitalizeFirstLetter(macroName)}
                </span>
              </div>
              <Typography variant="h6" className="value">
                {pickerValue[macroName].toFixed(0)}g
              </Typography>
              {/* <div className="add-remove-buttons-container">
                <CustomButton
                  text={`${buttonValue}`}
                  icon={<AddIcon />}
                  isIconReverse
                  disabled={getButtonDisabled()}
                  onClick={() =>
                    setPickerValue({
                      ...pickerValue,
                      [macroName]: pickerValue[macroName] + buttonValue,
                    })
                  }
                />
                <CustomButton
                  text={`${buttonValue}`}
                  icon={<RemoveIcon />}
                  isIconReverse
                  disabled={pickerValue[macroName] - buttonValue < 0}
                  onClick={() =>
                    setPickerValue({
                      ...pickerValue,
                      [macroName]: pickerValue[macroName] - buttonValue,
                    })
                  }
                />
              </div> */}
            </div>
          )
        })}
      </div>
      <SaveCancel onCancel={onCancel} onSave={onSave} />
    </Box>
  )
}
