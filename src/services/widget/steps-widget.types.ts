import type { Lang } from '../../types/system/Prefs'

export type StepsWidgetHealthOverrides = {
  steps: number
  burnedCalories: number
  distance: number
  flightsClimbed: number
}

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
  userId?: string
  authToken?: string
  apiBaseUrl?: string
}

export interface StepsWidgetPlugin {
  update(options: StepsWidgetPayload): Promise<void>
  clearAuth(): Promise<void>
  reloadTimelines(): Promise<void>
}
