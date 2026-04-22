import { Capacitor } from '@capacitor/core'
import { Health } from '@capgo/capacitor-health'
import type { AuthorizationStatus, HealthDataType } from '@capgo/capacitor-health'
import {
  HEALTH_READ_DATA_TYPES,
  type HealthAvailabilityResult,
  type HealthReadAuthorizationResult,
  type HealthReadDataType,
  type TodayActivitySummary,
} from './health.types'
import { getFixedNumber, metersToKilometers } from '../util.service'

const READ_OPTIONS: { read: HealthDataType[] } = {
  read: [...HEALTH_READ_DATA_TYPES],
}

export const healthService = {
  getAvailability,
  requestReadAuthorization,
  getTodayActivitySummary,
}

async function getAvailability(): Promise<HealthAvailabilityResult> {
  if (!Capacitor.isNativePlatform()) {
    return { status: 'unavailable', reason: 'not_native' }
  }

  const result = await Health.isAvailable()
  if (result.available) {
    return { status: 'available' }
  }
  return {
    status: 'unavailable',
    reason: result.reason ?? 'health_unavailable',
    platform: result.platform,
  }
}

async function requestReadAuthorization(): Promise<HealthReadAuthorizationResult> {
  if (!Capacitor.isNativePlatform()) {
    return { status: 'unavailable', reason: 'not_native' }
  }

  const status = await Health.requestAuthorization(READ_OPTIONS)
  return { status: 'ok', ...mapReadFlags(status) }
}

async function getTodayActivitySummary(): Promise<TodayActivitySummary> {
  if (!Capacitor.isNativePlatform()) {
    return { status: 'unavailable', reason: 'not_native' }
  }

  const availability = await Health.isAvailable()
  if (!availability.available) {
    return {
      status: 'unavailable',
      reason: 'sdk_unavailable',
      detail: availability.reason,
      platform: availability.platform,
    }
  }

  let auth: AuthorizationStatus
  try {
    auth = await Health.checkAuthorization(READ_OPTIONS)
  } catch (err) {
    return toErrorResult(err)
  }

  const missingRead = missingReadTypes(auth)
  if (missingRead.length > 0) {
    return { status: 'permission_required', missingRead }
  }

  const window = getLocalTodayWindow()
  let steps: number
  let activeCaloriesKcal: number
  let distance: number
  let flightsClimbed: number
  try {
    ;[steps, activeCaloriesKcal, distance, flightsClimbed
    ] = await Promise.all([
      sumAggregatedInWindow('steps', window.startIso, window.endIso),
      sumAggregatedInWindow('calories', window.startIso, window.endIso),
      sumAggregatedInWindow('distance', window.startIso, window.endIso),
      sumAggregatedInWindow('flightsClimbed', window.startIso, window.endIso),
    ])
    activeCaloriesKcal = getFixedNumber(activeCaloriesKcal)
    steps = getFixedNumber(steps)
    distance = metersToKilometers(getFixedNumber(distance, 2))
    flightsClimbed = getFixedNumber(flightsClimbed)
  } catch (err) {
    return toErrorResult(err)
  }

  return {
    status: 'ok',
    steps,
    activeCaloriesKcal,
    distance,
    flightsClimbed,
    window: { startIso: window.startIso, endIso: window.endIso },
  }
}

function mapReadFlags(status: AuthorizationStatus) {
  return {
    stepsAuthorized: status.readAuthorized.includes('steps'),
    caloriesAuthorized: status.readAuthorized.includes('calories'),
  }
}

function missingReadTypes(status: AuthorizationStatus): HealthReadDataType[] {
  return HEALTH_READ_DATA_TYPES.filter((t) => !status.readAuthorized.includes(t))
}

/** Local calendar day from midnight to now; end is slightly past now so exclusive endDate on the plugin still includes “now”. */
function getLocalTodayWindow(): { startIso: string; endIso: string } {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
  const endExclusive = new Date(now.getTime() + 1)
  return { startIso: start.toISOString(), endIso: endExclusive.toISOString() }
}

async function sumAggregatedInWindow(
  dataType: 'steps' | 'calories' | 'distance' | 'flightsClimbed' ,
  startIso: string,
  endIso: string
): Promise<number> {
  const { samples } = await Health.queryAggregated({
    dataType,
    startDate: startIso,
    endDate: endIso,
    bucket: 'day',
    aggregation: 'sum',
  })

  return samples.reduce((acc, s) => {
    const v = s.value
    return acc + (typeof v === 'number' && Number.isFinite(v) ? v : 0)
  }, 0)
}

function toErrorResult(err: unknown): TodayActivitySummary {
  const message = err instanceof Error ? err.message : String(err)
  return { status: 'error', message }
}

