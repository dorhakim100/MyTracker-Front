import { User } from '../../types/user/User'

export interface MacrosInGrams {
  protein: number
  carbs: number
  fats: number
}

export interface MacroCaloriesBreakdown {
  protein: number
  carbs: number
  fats: number
  total: number
}

const CALORIES_PER_GRAM = {
  protein: 4,
  carbs: 4,
  fats: 9,
} as const

// from grams to calories

export function calculateProteinCalories(proteinGrams: number): number {
  return Math.abs(Math.round(proteinGrams * CALORIES_PER_GRAM.protein))
}

export function calculateCarbCalories(carbsGrams: number): number {
  return Math.abs(Math.round(carbsGrams * CALORIES_PER_GRAM.carbs))
}

export function calculateFatCalories(fatsGrams: number): number {
  return Math.abs(Math.round(fatsGrams * CALORIES_PER_GRAM.fats))
}

// from calories to grams

export function calculateProteinFromCalories(calories: number): number {
  return Math.abs(Math.round(calories / CALORIES_PER_GRAM.protein))
}

export function calculateCarbsFromCalories(calories: number): number {
  return Math.abs(Math.round(calories / CALORIES_PER_GRAM.carbs))
}

export function calculateFatFromCalories(calories: number): number {
  return Math.abs(Math.round(calories / CALORIES_PER_GRAM.fats))
}

export function calculateCaloriesFromMacros(
  macros: MacrosInGrams
): MacroCaloriesBreakdown {
  const protein = calculateProteinCalories(macros.protein)
  const carbs = calculateCarbCalories(macros.carbs)
  const fats = calculateFatCalories(macros.fats)
  const total = Math.abs(protein + carbs + fats)
  return { protein, carbs, fats, total }
}

export function roundToNearest50(value: number): number {
  // return Math.round(value / 50) * 50
  return Math.round(value)
}

export function roundCaloriesToNearest50(value: number): number {
  return Math.round(value / 50) * 50
  return Math.round(value)
}

export function getPercentageValue(type = 'calories', user: User | null) {
  if (user) {
    let percentage = 0
    switch (type) {
      case 'calories':
        percentage = Math.round(
          (user.loggedToday.calories / user?.currGoal?.dailyCalories) * 100
        )
        break
      case 'protein':
        percentage = Math.round(
          (getMacrosAmount('protein', user) / user?.currGoal?.macros.protein) *
            100
        )
        break
      case 'carbs':
        percentage = Math.round(
          (getMacrosAmount('carbs', user) / user?.currGoal?.macros.carbs) * 100
        )
        break
      case 'fat':
        percentage = Math.round(
          (getMacrosAmount('fat', user) / user?.currGoal?.macros.fat) * 100
        )
        break
    }
    return percentage > 100 ? 100 : percentage
  }
  return 0
}

export function getMacrosAmount(
  macro: 'protein' | 'carbs' | 'fat',
  user: User
) {
  return user
    ? Math.round(
        user.loggedToday.logs.reduce((acc, log) => acc + log.macros[macro], 0)
      )
    : 0
}
