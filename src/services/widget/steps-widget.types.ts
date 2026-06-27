import type { Lang } from '../../types/system/Prefs'

export type StepsWidgetPayload = {
  steps: number
  goal: number
  calories: number
  caloriesGoal: number
  distance: number
  burnedCalories: number
  flightsClimbed: number
  proteinCurrent: number
  proteinGoal: number
  carbsCurrent: number
  carbsGoal: number
  fatsCurrent: number
  fatsGoal: number
  favoriteColor: string
  accentHex: string
  isDarkMode: boolean
  lang: Lang
  updatedAt: number
}

export interface StepsWidgetPlugin {
  update(options: StepsWidgetPayload): Promise<void>
}
