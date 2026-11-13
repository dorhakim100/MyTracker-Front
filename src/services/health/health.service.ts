import { Capacitor, registerPlugin } from '@capacitor/core'
import { Health } from '@capgo/capacitor-health'
import type {
  AuthorizationStatus,
  HealthDataType,
} from '@capgo/capacitor-health'
import {
  HEALTH_READ_DATA_TYPES,
  HEALTH_WRITE_DATA_TYPES,
  type HealthAvailabilityResult,
  type HealthReadAuthorizationResult,
  type HealthReadDataType,
  type TodayActivitySummary,
} from './health.types'
import { googleHealthService } from './google-health.service'
import { getFixedNumber, metersToKilometers } from '../util.service'
import { store } from '../../store/store'

const PhoneHealthSettings = registerPlugin<{
  open: () => Promise<{ opened: boolean }>
}>('PhoneHealthSettings')

const READ_OPTIONS: { read: HealthDataType[] } = {
  read: [...HEALTH_READ_DATA_TYPES],
}

export const WRITE_OPTIONS: { write: HealthDataType[] } = {
  write: [...HEALTH_WRITE_DATA_TYPES],
}

export const healthService = {
  getAvailability,
  requestReadAuthorization,
  getTodayActivitySummary,
  saveWeight,
  isGoogleHealthPlatform,
  isPhoneHealthAuthorized,
  getPhoneHealthPermission,
  requestPhoneHealthPermission,
  openPhoneHealthSettings,
}

function isGoogleHealthPlatform() {
  if (!Capacitor.isNativePlatform()) {
    return true
  }

  const healthProvider =
    store.getState().systemModule.prefs.healthProvider ?? 'native'
  return healthProvider === 'google'
}

async function getAvailability(
  userId?: string
): Promise<HealthAvailabilityResult> {
  if (isGoogleHealthPlatform() && userId && userId !== '') {
    const status = await googleHealthService.getStatus(userId)
    if (status.connected) {
      return { status: 'available' }
    }
    return {
      status: 'unavailable',
      reason: 'google_health_not_connected',
      platform: 'web',
    }
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

async function requestReadAuthorization(
  userId?: string
): Promise<HealthReadAuthorizationResult> {
  if (isGoogleHealthPlatform() && userId && userId !== '') {
    const status = await googleHealthService.getStatus(userId)
    if (status.connected) {
      return { status: 'ok', stepsAuthorized: true, caloriesAuthorized: true }
    }
    return { status: 'unavailable', reason: 'not_native' }
  }

  if (!isPhoneHealthInUse()) {
    return { status: 'unavailable', reason: 'phone_health_off' }
  }

  const status = await Health.requestAuthorization({
    read: READ_OPTIONS.read,
    write: WRITE_OPTIONS.write,
  })
  return { status: 'ok', ...mapReadFlags(status) }
}

async function getTodayActivitySummary(
  userId?: string
): Promise<TodayActivitySummary> {
  if (await readsGoogleHealth(userId)) {
    return getGoogleTodayActivitySummary(userId as string)
  }

  if (!userId || !isPhoneHealthInUse()) {
    return { status: 'not_connected' }
  }

  return getNativeTodayActivitySummary()
}

async function readsGoogleHealth(userId?: string) {
  if (!userId) return false
  if (!Capacitor.isNativePlatform() || isGoogleHealthPlatform()) return true

  try {
    const status = await googleHealthService.getStatus(userId)
    return status.connected
  } catch {
    return store.getState().healthModule.googleHealthConnected
  }
}

async function getGoogleTodayActivitySummary(
  userId: string
): Promise<TodayActivitySummary> {
  try {
    const summary = await googleHealthService.getTodayActivitySummary(userId)
    if (summary.status === 'not_connected') {
      return { status: 'not_connected' }
    }
    if (summary.status === 'error') {
      return { status: 'error', message: summary.message }
    }

    return {
      status: 'ok',
      steps: getFixedNumber(summary.steps),
      activeCaloriesKcal: getFixedNumber(summary.activeCaloriesKcal),
      distance: getFixedNumber(summary.distance, 2),
      flightsClimbed: getFixedNumber(summary.flightsClimbed),
      window: summary.window,
    }
  } catch (err) {
    return toErrorResult(err)
  }
}

async function getNativeTodayActivitySummary(): Promise<TodayActivitySummary> {
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
    auth = await Health.checkAuthorization({
      read: READ_OPTIONS.read,
      write: WRITE_OPTIONS.write,
    })
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
    ;[steps, activeCaloriesKcal, distance, flightsClimbed] = await Promise.all([
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

async function saveWeight(weight: number) {
  if (!Capacitor.isNativePlatform()) {
    return
  }

  await Health.saveSample({
    dataType: 'weight',
    value: weight,
  })
}

function isPhoneHealthInUse() {
  return store.getState().systemModule.prefs.usePhoneHealth !== false
}

async function isPhoneHealthAuthorized() {
  if (!Capacitor.isNativePlatform() || !isPhoneHealthInUse()) return false
  return getPhoneHealthPermission()
}

async function getPhoneHealthPermission() {
  if (!Capacitor.isNativePlatform()) return false

  try {
    const auth = await Health.checkAuthorization({
      read: READ_OPTIONS.read,
      write: WRITE_OPTIONS.write,
    })
    return isPhoneHealthGranted(auth)
  } catch {
    return false
  }
}

async function requestPhoneHealthPermission() {
  if (!Capacitor.isNativePlatform()) return false

  const status = await Health.requestAuthorization({
    read: READ_OPTIONS.read,
    write: WRITE_OPTIONS.write,
  })
  return isPhoneHealthGranted(status)
}

function isPhoneHealthGranted(auth: AuthorizationStatus) {
  if (Capacitor.getPlatform() === 'ios') {
    return auth.writeAuthorized.includes('weight')
  }
  return auth.readAuthorized.includes('steps')
}

async function openPhoneHealthSettings() {
  const platform = Capacitor.getPlatform()

  if (platform === 'android') {
    await Health.openHealthConnectSettings()
    return
  }

  if (platform === 'ios') {
    const opened = await openIosHealthAccessSettings()
    if (opened) return
    window.open(
      'settings-navigation://com.apple.Settings.Apps/com.apple.Health/SOURCES_ITEM',
      '_blank'
    )
  }
}

async function openIosHealthAccessSettings() {
  try {
    const result = await PhoneHealthSettings.open()
    return result.opened
  } catch {
    return false
  }
}

function mapReadFlags(status: AuthorizationStatus) {
  return {
    stepsAuthorized: status.readAuthorized.includes('steps'),
    caloriesAuthorized: status.readAuthorized.includes('calories'),
  }
}

function missingReadTypes(status: AuthorizationStatus): HealthReadDataType[] {
  return HEALTH_READ_DATA_TYPES.filter(
    (t) => !status.readAuthorized.includes(t)
  )
}

function getLocalTodayWindow(): { startIso: string; endIso: string } {
  const now = new Date()
  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0
  )
  const endExclusive = new Date(now.getTime() + 1)
  return { startIso: start.toISOString(), endIso: endExclusive.toISOString() }
}

async function sumAggregatedInWindow(
  dataType: 'steps' | 'calories' | 'distance' | 'flightsClimbed',
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
