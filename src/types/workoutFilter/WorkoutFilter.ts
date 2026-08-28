export const PAST_ROUTINES_RANGES = {
  LAST_6: 'last-6',
  LAST_3_MONTHS: 'last-3-months',
  LAST_6_MONTHS: 'last-6-months',
  LAST_YEAR: 'last-year',
  ALL: 'all',
} as const

export type PastRoutinesRange =
  (typeof PAST_ROUTINES_RANGES)[keyof typeof PAST_ROUTINES_RANGES]

export const PAST_ROUTINES_RANGE_VALUES: PastRoutinesRange[] = [
  PAST_ROUTINES_RANGES.LAST_6,
  PAST_ROUTINES_RANGES.LAST_3_MONTHS,
  PAST_ROUTINES_RANGES.LAST_6_MONTHS,
  PAST_ROUTINES_RANGES.LAST_YEAR,
  PAST_ROUTINES_RANGES.ALL,
]

export const DEFAULT_PAST_ROUTINES_RANGE: PastRoutinesRange =
  PAST_ROUTINES_RANGES.LAST_6

export interface WorkoutFilter {
  forUserId: string
  from?: string
  to?: string
  isActive?: boolean
  limit?: number
  all?: boolean
}
