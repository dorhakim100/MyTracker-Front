export type Gender = 'male' | 'female'

export interface BmrInput {
  ageYears: number
  gender: Gender
  heightCm: number
  weightKg: number
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

export const bmrService = {
  calculate: calculateBMRMifflinStJeor,
}
