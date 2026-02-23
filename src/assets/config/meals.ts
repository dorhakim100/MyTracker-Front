import type { TFunction } from 'i18next'
import React from 'react'
import WbTwilightIcon from '@mui/icons-material/WbTwilight'
import LightModeIcon from '@mui/icons-material/LightMode'
import BedtimeIcon from '@mui/icons-material/Bedtime'
import IcecreamIcon from '@mui/icons-material/Icecream'

export type MealPeriodKey =
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'snacks'

interface MealPeriodConfig {
  period: MealPeriodKey
  labelKey: string
  rangeLabel?: string
  rangeLabelKey?: string
  Icon: React.ComponentType
}

const mealPeriodsConfig: MealPeriodConfig[] = [
  {
    period: 'breakfast',
    labelKey: 'meals.breakfast',
    rangeLabel: '06:00 – 12:00',
    Icon: WbTwilightIcon,
  },
  {
    period: 'lunch',
    labelKey: 'meals.lunch',
    rangeLabel: '12:00 – 18:00',
    Icon: LightModeIcon,
  },
  {
    period: 'dinner',
    labelKey: 'meals.dinner',
    rangeLabel: '18:00 – 00:00',
    Icon: BedtimeIcon,
  },
  {
    period: 'snacks',
    labelKey: 'meals.snacks',
    rangeLabelKey: 'meals.duringTheDay',
    Icon: IcecreamIcon,
  },
]

export interface MealConfig {
  label: string
  period: string
  rangeLabel: string
  icon: React.ReactNode
}

export function getMeals(t: TFunction): MealConfig[] {
  return mealPeriodsConfig.map(
    ({ period, labelKey, rangeLabel, rangeLabelKey, Icon }) => ({
      label: t(labelKey),
      period,
      rangeLabel: rangeLabelKey ? t(rangeLabelKey) : (rangeLabel as string),
      icon: React.createElement(Icon),
    })
  )
}
