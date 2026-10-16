import { useTranslation } from 'react-i18next'
import Slider from 'rc-slider'
import { setUserToEdit } from '../../store/actions/user.actions'
import { User } from '../../types/user/User'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { useEffect, useMemo, useRef, useState } from 'react'
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
import { RollingNumber } from '../RollingNumber/RollingNumber'

interface MacrosDistributionEditProps {
  goalToEdit?: Goal | Partial<Goal>
  goalRef?: React.RefObject<Goal | Partial<Goal>>
  onCancel?: () => void
  onSave?: () => void
}

type MacroKey = 'protein' | 'carbs' | 'fat'

interface MacroShares {
  protein: number
  carbs: number
  fat: number
}

interface DistributionState {
  percent: MacroShares
  calories: MacroShares
}

const SLIDER_MIN = 10
const SLIDER_MAX = 80
const MACRO_KEYS: MacroKey[] = ['protein', 'carbs', 'fat']

function roundSharesToHundred(raw: MacroShares): MacroShares {
  const total = raw.protein + raw.carbs + raw.fat
  const scaled = MACRO_KEYS.map((key) => (total ? (raw[key] / total) * 100 : 0))
  const rounded = scaled.map((value) => Math.floor(value))
  let remainder = 100 - rounded.reduce((sum, value) => sum + value, 0)
  const byFraction = scaled
    .map((value, index) => ({ index, fraction: value - rounded[index] }))
    .sort((a, b) => b.fraction - a.fraction)

  for (const item of byFraction) {
    if (remainder <= 0) break
    rounded[item.index] += 1
    remainder -= 1
  }

  return {
    protein: rounded[0],
    carbs: rounded[1],
    fat: rounded[2],
  }
}

function sharesFromGrams(
  proteinGrams: number,
  carbsGrams: number,
  fatGrams: number,
  dailyCalories: number
): MacroShares {
  const proteinCalories = calculateProteinCalories(proteinGrams)
  const carbsCalories = calculateCarbCalories(carbsGrams)
  const fatCalories = calculateFatCalories(fatGrams)
  const basis = dailyCalories || proteinCalories + carbsCalories + fatCalories

  if (!basis) return { protein: 30, carbs: 40, fat: 30 }

  return roundSharesToHundred({
    protein: (proteinCalories / basis) * 100,
    carbs: (carbsCalories / basis) * 100,
    fat: (fatCalories / basis) * 100,
  })
}

// Keep the macro the user moved. Split what's left by the previous ratio.
function redistribute(
  current: MacroShares,
  macro: MacroKey,
  value: number
): MacroShares {
  const nextValue = Math.min(
    SLIDER_MAX,
    Math.max(SLIDER_MIN, Math.round(value))
  )
  const others = MACRO_KEYS.filter((key) => key !== macro)
  const remaining = 100 - nextValue
  const othersTotal = others.reduce((sum, key) => sum + current[key], 0)

  let first =
    othersTotal > 0
      ? Math.round((current[others[0]] / othersTotal) * remaining)
      : Math.round(remaining / others.length)
  let second = remaining - first

  if (first < SLIDER_MIN) {
    first = SLIDER_MIN
    second = remaining - first
  } else if (second < SLIDER_MIN) {
    second = SLIDER_MIN
    first = remaining - second
  }

  if (first > SLIDER_MAX) {
    first = SLIDER_MAX
    second = remaining - first
  } else if (second > SLIDER_MAX) {
    second = SLIDER_MAX
    first = remaining - second
  }

  return {
    ...current,
    [macro]: nextValue,
    [others[0]]: first,
    [others[1]]: second,
  }
}

function shiftCalories(
  current: MacroShares,
  macro: MacroKey,
  deltaPercent: number,
  dailyCalories: number
): MacroShares {
  if (!deltaPercent || !dailyCalories) return current

  const deltaCalories = (deltaPercent / 100) * dailyCalories
  const next: MacroShares = {
    ...current,
    [macro]: Math.max(0, current[macro] + deltaCalories),
  }
  const others = MACRO_KEYS.filter((key) => key !== macro)
  const othersTotal = others.reduce((sum, key) => sum + current[key], 0)
  const toSpread = -deltaCalories

  if (othersTotal <= 0) {
    const share = toSpread / others.length
    others.forEach((key) => {
      next[key] = Math.max(0, current[key] + share)
    })
    return next
  }

  others.forEach((key) => {
    next[key] = Math.max(
      0,
      current[key] + toSpread * (current[key] / othersTotal)
    )
  })
  return next
}

function distributionFromSource(
  goalToEdit: Goal | Partial<Goal> | undefined,
  user: User | null
): DistributionState {
  const protein =
    goalToEdit?.macros?.protein || user?.currGoal?.macros.protein || 0
  const carbs = goalToEdit?.macros?.carbs || user?.currGoal?.macros.carbs || 0
  const fat = goalToEdit?.macros?.fat || user?.currGoal?.macros.fat || 0
  const dailyCalories =
    goalToEdit?.dailyCalories || user?.currGoal?.dailyCalories || 0

  return {
    percent: sharesFromGrams(protein, carbs, fat, dailyCalories),
    calories: {
      protein: calculateProteinCalories(protein),
      carbs: calculateCarbCalories(carbs),
      fat: calculateFatCalories(fat),
    },
  }
}

export function MacrosDistributionEdit({
  goalToEdit,
  goalRef,
  onCancel,
  onSave,
}: MacrosDistributionEditProps) {
  const { t } = useTranslation()
  const user = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.user
  )

  const userToEdit = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.userToEdit
  )

  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const [distribution, setDistribution] = useState<DistributionState>(() =>
    distributionFromSource(goalToEdit, user)
  )

  const {
    protein: proteinPercentage,
    carbs: carbsPercentage,
    fat: fatPercentage,
  } = distribution.percent

  const dailyCalories =
    goalToEdit?.dailyCalories || user?.currGoal?.dailyCalories || 0
  const dailyCaloriesRef = useRef(dailyCalories)
  dailyCaloriesRef.current = dailyCalories

  useEffect(() => {
    if (!user && !goalToEdit) return
    setDistribution(distributionFromSource(goalToEdit, user))
  }, [user, goalToEdit])

  const handleChange = (macro: MacroKey, value: number) => {
    setDistribution((current) => {
      const delta = Math.round(value) - current.percent[macro]
      return {
        percent: redistribute(current.percent, macro, value),
        calories: shiftCalories(
          current.calories,
          macro,
          delta,
          dailyCaloriesRef.current
        ),
      }
    })
  }

  const macros = useMemo(() => {
    if (!goalToEdit && !user) return []
    if (!dailyCalories) return []
    const proteinCalories = distribution.calories.protein
    const carbsCalories = distribution.calories.carbs
    const fatCalories = distribution.calories.fat

    return [
      {
        nameKey: 'macros.protein',
        name: 'Protein',
        value: proteinPercentage,
        calories: proteinCalories,
        onChange: (value: number) => handleChange('protein', value),
        color: proteinColor,
      },
      {
        nameKey: 'macros.carbs',
        name: 'Carbs',
        value: carbsPercentage,
        calories: carbsCalories,
        onChange: (value: number) => handleChange('carbs', value),
        color: carbsColor,
      },
      {
        nameKey: 'macros.fat',
        name: 'Fat',
        value: fatPercentage,
        calories: fatCalories,
        onChange: (value: number) => handleChange('fat', value),
        color: fatsColor,
      },
    ]
  }, [
    proteinPercentage,
    carbsPercentage,
    fatPercentage,
    distribution.calories,
    dailyCalories,
    user,
    goalToEdit,
  ])

  useEffect(() => {
    if ((!goalToEdit && !userToEdit) || !macros.length) return
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
      <div
        className={`edit-macros-container distribution ${
          prefs.favoriteColor || ''
        }`}
      >
        <Typography variant='h5'>{t('macros.distribution')}</Typography>
        {macros.map((macro) => (
          <div
            className='macro-container'
            key={`percentage-edit-${macro.nameKey}`}
          >
            <div className='macro-title'>
              <Typography variant='h6'>{t(macro.nameKey)}</Typography>
              <Typography variant='body1'>{macro.value}%</Typography>
              <Typography variant='body1'>
                ~<RollingNumber value={roundToNearest50(macro.calories)} />{' '}
                {t('macros.kcal')}
              </Typography>
            </div>
            <Slider
              value={macro.value}
              onChange={(v) => macro.onChange(v as number)}
              max={SLIDER_MAX}
              min={SLIDER_MIN}
              step={2}
              trackStyle={{ backgroundColor: macro.color }}
            />
          </div>
        ))}
        <SaveCancel
          onCancel={onCancel}
          onSave={onSave}
        />
      </div>
    </Box>
  )
}
