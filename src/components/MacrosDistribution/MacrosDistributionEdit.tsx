import Slider from 'rc-slider'
import { setUserToEdit } from '../../store/actions/user.actions'
import { User } from '../../types/user/User'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { useEffect, useMemo, useState } from 'react'
import {
  calculateProteinCalories,
  calculateCarbCalories,
  calculateFatCalories,
  calculateProteinFromCalories,
  calculateCarbsFromCalories,
  calculateFatFromCalories,
} from '../../services/macros/macros.service'

import { proteinColor, carbsColor, fatsColor } from './MacrosDistribution'
import { Box, Typography } from '@mui/material'

import { roundToNearest50 } from '../../services/macros/macros.service'
import { Goal } from '../../types/goal/Goal'
import { SaveCancel } from '../SaveCancel/SaveCancel'

interface MacrosDistributionEditProps {
  goalToEdit?: Goal | Partial<Goal>
  goalRef?: React.RefObject<Goal | Partial<Goal>>
  onCancel?: () => void
  onSave?: () => void
}

export function MacrosDistributionEdit({
  goalToEdit,
  goalRef,
  onCancel,
  onSave,
}: MacrosDistributionEditProps) {
  const user = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.user
  )

  const userToEdit = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.userToEdit
  )

  const [proteinPercentage, setProteinPercentage] = useState(30)
  const [carbsPercentage, setCarbsPercentage] = useState(40)
  const [fatPercentage, setFatPercentage] = useState(40)

  useEffect(() => {
    if (!user) return
    const currCalories =
      goalToEdit?.dailyCalories || user?.currGoal?.dailyCalories

    const proteinUserPercentage = Math.round(
      (calculateProteinCalories(
        goalToEdit?.macros?.protein || user?.currGoal?.macros.protein || 0
      ) /
        (currCalories || 0)) *
        100
    )

    const carbsUserPercentage = Math.round(
      (calculateCarbCalories(
        goalToEdit?.macros?.carbs || user?.currGoal?.macros.carbs || 0
      ) /
        (currCalories || 0)) *
        100
    )

    const fatUserPercentage = Math.round(
      (calculateFatCalories(
        goalToEdit?.macros?.fat || user?.currGoal?.macros.fat || 0
      ) /
        (currCalories || 0)) *
        100
    )

    setProteinPercentage(proteinUserPercentage || 30)
    setCarbsPercentage(carbsUserPercentage || 40)
    setFatPercentage(fatUserPercentage || 30)
  }, [user, goalToEdit])

  const macros = useMemo(() => {
    if (!goalToEdit && !user) return []
    const dailyCalories =
      goalToEdit?.dailyCalories || user?.currGoal.dailyCalories
    if (!dailyCalories) return []
    const proteinCalories = (proteinPercentage / 100) * dailyCalories
    const carbsCalories = (carbsPercentage / 100) * dailyCalories
    const fatCalories = (fatPercentage / 100) * dailyCalories

    return [
      {
        name: 'Protein',
        value: proteinPercentage,
        calories: proteinCalories,
        onChange: (value: number) => handleChange('protein', value),
        color: proteinColor,
      },
      {
        name: 'Carbs',
        value: carbsPercentage,
        calories: carbsCalories,
        onChange: (value: number) => handleChange('carbs', value),
        color: carbsColor,
      },
      {
        name: 'Fat',
        value: fatPercentage,
        calories: fatCalories,
        onChange: (value: number) => handleChange('fat', value),
        color: fatsColor,
      },
    ]
  }, [proteinPercentage, carbsPercentage, fatPercentage, user])

  const handleChange = (macro: 'protein' | 'carbs' | 'fat', value: number) => {
    // Clamp between 0–100
    let p = proteinPercentage,
      c = carbsPercentage,
      f = fatPercentage

    switch (macro) {
      case 'protein':
        p = value
        break
      case 'carbs':
        c = value
        break
      case 'fat':
        f = value
        break
      default:
        break
    }

    // Normalize so total = 100
    const total = p + c + f

    if (total !== 100) {
      const factor = 100 / total
      p = Math.round(p * factor)
      c = Math.round(c * factor)
      f = Math.round(f * factor)
    }

    setProteinPercentage(p)
    setCarbsPercentage(c)
    setFatPercentage(f)
  }

  useEffect(() => {
    if (!goalToEdit && !userToEdit) return
    // not best practice, but macros is
    // a special case
    const caloriesToSet =
      goalToEdit?.dailyCalories || user?.currGoal?.dailyCalories

    const proteinToSet = calculateProteinFromCalories(macros[0].calories)
    const carbsToSet = calculateCarbsFromCalories(macros[1].calories)
    const fatToSet = calculateFatFromCalories(macros[2].calories)

    const goalToSet = goalToEdit
      ? {
          ...goalToEdit,
          dailyCalories: caloriesToSet,
          macros: {
            ...goalToEdit?.macros,
            protein: proteinToSet,
            carbs: carbsToSet,
            fat: fatToSet,
          },
        }
      : {
          ...userToEdit?.currGoal,
          dailyCalories: caloriesToSet,
          macros: {
            ...userToEdit?.currGoal?.macros,
            protein: proteinToSet,
            carbs: carbsToSet,
            fat: fatToSet,
          },
        }

    if (goalToEdit && goalRef) {
      //   return () => {
      //     setEditGoal(goalToSet as Goal)
      //   }

      goalRef.current = goalToSet as Goal
      return
    }

    const userToUpdate = {
      ...userToEdit,
      currGoal: goalToSet,
    } as User

    setUserToEdit(userToUpdate)
  }, [macros])

  return (
    <Box>
      <div className="edit-macros-container distribution">
        <Typography variant="h5">Distribution</Typography>
        {macros.map((macro) => (
          <div
            className="macro-container"
            key={`percantage-edit-${macro.name}`}
          >
            <div className="macro-title">
              <Typography variant="h6">{macro.name}</Typography>
              <Typography variant="body1">{macro.value}%</Typography>
              <Typography variant="body1">
                ~{roundToNearest50(macro.calories)} kcal
              </Typography>
            </div>
            <Slider
              value={macro.value}
              onChange={(v) => macro.onChange(v as number)}
              max={80}
              min={10}
              step={2}
              handleStyle={{
                // borderColor: '#000',
                // backgroundColor: '#fff',
                width: '20px',
                height: '20px',
                padding: '0px',
                // marginBottom: '0px',
                marginTop: '-8px',
                // marginLeft: '0px',
                // marginRight: '0px',
              }}
              // railStyle={{ backgroundColor: '#eee' }}
              trackStyle={{ backgroundColor: macro.color }}
            />
          </div>
        ))}
        <SaveCancel onCancel={onCancel} onSave={onSave} />
      </div>
    </Box>
  )
}
