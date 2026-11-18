import { healthService } from '../../services/health/health.service'
import { googleHealthService } from '../../services/health/google-health.service'
import {
  syncStepsWidget,
  toStepsWidgetHealthOverrides,
} from '../../services/widget/steps-widget.service'
import type { HealthSocketPayload } from '../../services/socket/health-socket.types'
import { store } from '../store'
import {
  SET_STEPS,
  SET_BURNED_CALORIES,
  SET_PERMITTED,
  SET_DISTANCE,
  SET_FLIGHTS_CLIMBED,
  SET_GOOGLE_HEALTH_CONNECTED,
  SET_HEALTH_LOADING,
  SET_HEALTH_SNAPSHOT,
} from '../reducers/health.reducer'

export async function setPermitted(permitted: boolean) {
  store.dispatch({ type: SET_PERMITTED, permitted })
}

export async function setGoogleHealthConnected(connected: boolean) {
  store.dispatch({
    type: SET_GOOGLE_HEALTH_CONNECTED,
    googleHealthConnected: connected,
  })
  await setPermitted(connected)
}

export function setGoogleHealthFlag(connected: boolean) {
  store.dispatch({
    type: SET_GOOGLE_HEALTH_CONNECTED,
    googleHealthConnected: connected,
  })
}

type ShownHealth = {
  day: string
  provider: 'google' | 'native'
  steps: number
  burnedCalories: number
  distance: number
  flightsClimbed: number
}

let healthReadId = 0
let shownHealth: ShownHealth | null = null

export function clearHealthSnapshot() {
  healthReadId += 1
  shownHealth = null
  setHealthLoading(false)
  store.dispatch({
    type: SET_HEALTH_SNAPSHOT,
    steps: 0,
    burnedCalories: 0,
    distance: 0,
    flightsClimbed: 0,
  })
}

export async function loadGoogleHealthConnection(userId: string) {
  const status = await googleHealthService.getStatus(userId)
  if (healthService.isGoogleHealthPlatform()) {
    await setGoogleHealthConnected(status.connected)
  } else {
    setGoogleHealthFlag(status.connected)
  }
  return status.connected
}

export async function reloadHealthForCurrentProvider(userId?: string) {
  if (!userId) return

  const connected = await loadGoogleHealthConnection(userId)
  if (healthService.activeHealthSource() === 'google') {
    if (connected) {
      await setHealthData()
    } else {
      await setGoogleHealthConnected(false)
    }
    return
  }

  const permissions = await healthService.requestReadAuthorization(userId)
  await setPermitted(permissions.status === 'ok')
  if (permissions.status === 'ok') {
    await setHealthData()
  }
}

export async function setHealthData() {
  const readId = ++healthReadId
  const userId = store.getState().userModule.user?._id
  setHealthLoading(true)
  try {
    const data = await healthService.getTodayActivitySummary(userId)
    if (readId !== healthReadId) return
    if (data.status === 'ok') {
      await applyHealthSnapshot(data)
    }
    if (data.status === 'not_connected') {
      // await setGoogleHealthConnected(false)
    }
    if (data.status === 'error') {
      // throw new Error(data.message)
    }
  } catch (err) {
    if (readId !== healthReadId) return
    throw err
  } finally {
    if (readId === healthReadId) setHealthLoading(false)
  }
}

export async function applyHealthSnapshot(payload: HealthSocketPayload) {
  const day = new Date().toDateString()
  const provider = healthService.activeHealthSource()
  const previous =
    shownHealth && shownHealth.day === day && shownHealth.provider === provider
      ? shownHealth
      : null

  const steps = Math.max(previous?.steps ?? 0, payload.steps)
  const burnedCalories = Math.max(
    previous?.burnedCalories ?? 0,
    payload.activeCaloriesKcal
  )
  const distance = Math.max(previous?.distance ?? 0, payload.distance)
  const flightsClimbed = Math.max(
    previous?.flightsClimbed ?? 0,
    payload.flightsClimbed
  )

  if (
    previous &&
    previous.steps === steps &&
    previous.burnedCalories === burnedCalories &&
    previous.distance === distance &&
    previous.flightsClimbed === flightsClimbed
  ) {
    return
  }

  shownHealth = {
    day,
    provider,
    steps,
    burnedCalories,
    distance,
    flightsClimbed,
  }

  store.dispatch({
    type: SET_HEALTH_SNAPSHOT,
    steps,
    burnedCalories,
    distance,
    flightsClimbed,
  })
  await syncStepsWidget(
    toStepsWidgetHealthOverrides({
      steps,
      activeCaloriesKcal: burnedCalories,
      distance,
      flightsClimbed,
    })
  )
}

export async function setSteps(steps: number) {
  store.dispatch({ type: SET_STEPS, steps: steps })
}

export async function setBurnedCalories(burnedCalories: number) {
  store.dispatch({ type: SET_BURNED_CALORIES, burnedCalories: burnedCalories })
}

export async function setDistance(distance: number) {
  store.dispatch({ type: SET_DISTANCE, distance: distance })
}

export async function setFlightsClimbed(flightsClimbed: number) {
  store.dispatch({ type: SET_FLIGHTS_CLIMBED, flightsClimbed: flightsClimbed })
}

export async function setHealthLoading(loading: boolean) {
  store.dispatch({ type: SET_HEALTH_LOADING, healthLoading: loading })
}
