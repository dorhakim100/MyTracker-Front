import { BmrFormState } from '../../types/bmrForm/BmrForm'

export type Gender = 'male' | 'female'

export interface BmrInput {
  ageYears: number
  gender: Gender
  heightCm: number
  weightKg: number
}

export type ActivityLevel =
  | 'bmr'
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'daily'
  | 'very_intense'

export const bmrService = {
  calculate: calculateBMRMifflinStJeor,
  calculateActivityBuffer,
  calculateTDEE,
  getDefaultFormState,
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

/**
 * Calculates BMR using the Mifflin–St Jeor equation.
 * male: 10*weight + 6.25*height - 5*age + 5
 * female: 10*weight + 6.25*height - 5*age - 161
 */
export function calculateBMRMifflinStJeor({
  ageYears,
  gender,
  heightCm,
  weightKg,
}: BmrInput): number {
  if (
    !isFiniteNumber(ageYears) ||
    !isFiniteNumber(heightCm) ||
    !isFiniteNumber(weightKg)
  )
    return 0

  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears
  return Math.round(base + (gender === 'male' ? 5 : -161))
}

function getActivityFactor(level: ActivityLevel): number {
  switch (level) {
    case 'bmr':
      return 1.0
    case 'sedentary':
      return 1.2 // little to no exercise
    case 'light':
      return 1.375 // 1-3 a week
    case 'moderate':
      return 1.465 // 4-5 a week
    case 'daily':
      return 1.55 // daily
    case 'very_intense':
      return 1.9 // very intense job
    default:
      return 1.0
  }
}

/** Returns the additional calories above BMR based on activity */
export function calculateActivityBuffer(
  bmr: number,
  level: ActivityLevel
): number {
  if (!isFiniteNumber(bmr) || bmr <= 0) return 0
  const factor = getActivityFactor(level)
  const tdee = bmr * factor
  return Math.round(tdee - bmr)
}

export function calculateTDEE(bmr: number, level: ActivityLevel): number {
  if (!isFiniteNumber(bmr) || bmr <= 0) return 0
  const factor = getActivityFactor(level)
  return Math.round(bmr * factor)
}

export function getDefaultFormState(): BmrFormState {
  return {
    ageYears: '25',
    gender: 'male',
    heightCm: '170',
    weightKg: '70',
    activity: 'bmr',
  }
}
