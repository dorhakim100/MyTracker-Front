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
  return Math.round(proteinGrams * CALORIES_PER_GRAM.protein)
}

export function calculateCarbCalories(carbsGrams: number): number {
  return Math.round(carbsGrams * CALORIES_PER_GRAM.carbs)
}

export function calculateFatCalories(fatsGrams: number): number {
  return Math.round(fatsGrams * CALORIES_PER_GRAM.fats)
}

// from calories to grams

export function calculateProteinFromCalories(calories: number): number {
  return Math.round(calories / CALORIES_PER_GRAM.protein)
}

export function calculateCarbsFromCalories(calories: number): number {
  return Math.round(calories / CALORIES_PER_GRAM.carbs)
}

export function calculateFatFromCalories(calories: number): number {
  return Math.round(calories / CALORIES_PER_GRAM.fats)
}

export function calculateCaloriesFromMacros(
  macros: MacrosInGrams
): MacroCaloriesBreakdown {
  const protein = calculateProteinCalories(macros.protein)
  const carbs = calculateCarbCalories(macros.carbs)
  const fats = calculateFatCalories(macros.fats)
  const total = protein + carbs + fats
  return { protein, carbs, fats, total }
}

export function roundToNearest50(value: number): number {
  return Math.round(value / 50) * 50
}
