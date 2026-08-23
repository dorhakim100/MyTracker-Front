import { useTranslation } from 'react-i18next'
import { getArrayOfNumbers } from '../../services/util.service'
import { setUserToEdit } from '../../store/actions/user.actions'
import { User } from '../../types/user/User'
import {
  calculateCarbsFromCalories,
  roundCaloriesToNearest50,
} from '../../services/macros/macros.service'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { useMemo } from 'react'
import { Box, Typography } from '@mui/material'
import { Goal } from '../../types/goal/Goal'
import { ClockPicker } from '../Pickers/ClockPicker'
import type { ClockPickerValues } from '../Pickers/ClockPicker'

interface CaloriesEditProps {
  goalToEdit?: Goal | Partial<Goal>
  goalRef?: React.RefObject<Goal | Partial<Goal>>
  onCancel?: () => void
  onSave?: () => void
}

const MIN = 1200
const MAX = 5000
const STEP = 50

export function CaloriesEdit({
  goalToEdit,
  goalRef,
  onCancel,
  onSave,
}: CaloriesEditProps) {
  const { t } = useTranslation()
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )
  const user = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.user
  )
  const userToEdit = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.userToEdit
  )

  const options = useMemo(
    () =>
      (getArrayOfNumbers(MIN, MAX) as number[]).filter((n) => n % STEP === 0),
    []
  )

  const initialCalories = roundCaloriesToNearest50(
    (goalRef?.current?.dailyCalories as number) ||
      goalToEdit?.dailyCalories ||
      user?.currGoal?.dailyCalories ||
      2400
  )

  function applyCalories(calories: number) {
    const currCalories =
      goalToEdit?.dailyCalories || user?.currGoal?.dailyCalories

    if (!currCalories) return
    const diff = (currCalories - calories) * -1

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
        dailyCalories: calories,
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
        dailyCalories: roundCaloriesToNearest50(calories),
        macros: {
          ...userToEdit?.currGoal?.macros,
          carbs: newCarbs,
        },
      },
    } as User

    setUserToEdit(userToUpdate)
  }

  function handleSave(values: ClockPickerValues) {
    applyCalories(values.calories)
    onSave?.()
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box
        sx={{ position: 'relative' }}
        className='calories-amount-container'
      >
        <ClockPicker
          columns={[{ name: 'calories', values: options }]}
          columnValues={{ calories: initialCalories }}
          header={(values) => (
            <Typography
              variant='h3'
              className={`calories-amount ${prefs.favoriteColor || ''}`}
            >
              {roundCaloriesToNearest50(values.calories)} {t('macros.kcal')}
            </Typography>
          )}
          incrementButtons={[-400, 400]}
          buttonsValues={[]}
          height={150}
          onSaveValues={handleSave}
          onClose={onCancel}
        />
      </Box>
    </Box>
  )
}
