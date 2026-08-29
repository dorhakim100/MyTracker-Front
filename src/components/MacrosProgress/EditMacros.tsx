import { useTranslation } from 'react-i18next'
import {
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
import { Box, Typography } from '@mui/material'
import { Goal } from '../../types/goal/Goal'
import { Macros as MacrosType } from '../../types/macros/Macros'
import { ClockPicker } from '../Pickers/ClockPicker'
import type { ClockPickerValues } from '../Pickers/ClockPicker'

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
  const { t } = useTranslation()
  const userToEdit = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.userToEdit
  )
  const user = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.user
  )

  const initialValues = {
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
  }

  const macroNameKeys: Record<string, string> = {
    carbs: 'macros.carbs',
    protein: 'macros.protein',
    fats: 'macros.fats',
  }

  function applyMacros(values: ClockPickerValues) {
    const nextCarbs = +values.carbs.toFixed(0)
    const nextProtein = +values.protein.toFixed(0)
    const nextFats = +values.fats.toFixed(0)
    const totalCalories =
      calculateProteinCalories(nextProtein) +
      calculateCarbCalories(nextCarbs) +
      calculateFatCalories(nextFats)

    if (isCustomLog) {
      editCustomLog?.({
        calories: totalCalories,
        carbs: nextCarbs,
        protein: nextProtein,
        fat: nextFats,
      })
      return
    }

    const goalToUpdate = {
      ...goalToEdit,
      dailyCalories: totalCalories,
      macros: {
        ...goalToEdit?.macros,
        carbs: nextCarbs,
        protein: nextProtein,
        fat: nextFats,
      },
    } as Goal

    if (goalToEdit && goalRef) {
      goalRef.current = goalToUpdate
      return
    }

    const userToUpdate = {
      ...userToEdit,
      currGoal: {
        ...userToEdit?.currGoal,
        dailyCalories: totalCalories,
        macros: {
          ...userToEdit?.currGoal?.macros,
          carbs: nextCarbs,
          protein: nextProtein,
          fat: nextFats,
        },
      },
    } as User

    setUserToEdit(userToUpdate)
  }

  function handleSave(values: ClockPickerValues) {
    applyMacros(values)
    onSave?.()
  }

  function getLabel(name: string) {
    return (macroValue: number) => (
      <div className='macro-container'>
        <div className={`banner ${name}`}>
          <span className='label'>{t(macroNameKeys[name])}</span>
        </div>
        <Typography
          variant='h6'
          className='value'
        >
          {macroValue.toFixed(0)}
          {t('macros.gram')}
        </Typography>
      </div>
    )
  }

  return (
    <Box className='edit-macros-container'>
      <ClockPicker
        columns={[
          {
            name: 'carbs',
            values: getArrayOfNumbers(0, CARBS_LIMIT) as number[],
            label: getLabel('carbs'),
          },
          {
            name: 'protein',
            values: getArrayOfNumbers(0, PROTEIN_LIMIT) as number[],
            label: getLabel('protein'),
          },
          {
            name: 'fats',
            values: getArrayOfNumbers(0, FATS_LIMIT) as number[],
            label: getLabel('fats'),
          },
        ]}
        columnValues={initialValues}
        labelsClassName='macros-title-container'
        buttonsValues={[]}
        height={150}
        onSaveValues={handleSave}
        onClose={onCancel}
      />
    </Box>
  )
}
