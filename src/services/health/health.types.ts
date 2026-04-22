import type { HealthDataType } from '@capgo/capacitor-health'

/** Read scopes used for v1 activity summary (active energy + steps). */
export const HEALTH_READ_DATA_TYPES = ['steps', 'calories', 'distance', 'flightsClimbed'] as const satisfies readonly HealthDataType[]
export const HEALTH_WRITE_DATA_TYPES = ['weight'] as const satisfies readonly HealthDataType[]


export type HealthReadDataType = (typeof HEALTH_READ_DATA_TYPES)[number]
export type HealthWriteDataType = (typeof HEALTH_WRITE_DATA_TYPES)[number]

export type HealthAvailabilityResult =
  | { status: 'available' }
  | { status: 'unavailable'; reason: string; platform?: 'ios' | 'android' | 'web' }

export type HealthReadAuthorizationResult =
  | { status: 'unavailable'; reason: 'not_native' }
  | { status: 'ok'; stepsAuthorized: boolean; caloriesAuthorized: boolean }

export type TodayActivitySummary =
  | {
      status: 'ok'
      steps: number
      activeCaloriesKcal: number
      distance: number
      flightsClimbed: number
      window: { startIso: string; endIso: string }
    }
  | {
      status: 'unavailable'
      reason: 'not_native' | 'sdk_unavailable'
      detail?: string
      platform?: 'ios' | 'android' | 'web'
    }
  | { status: 'permission_required'; missingRead: HealthReadDataType[] }
  | { status: 'error'; message: string }
