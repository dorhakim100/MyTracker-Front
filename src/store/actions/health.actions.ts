import { healthService } from '../../services/health/health.service'
import { googleHealthService } from '../../services/health/google-health.service'
import { store } from '../store'
import {
  SET_STEPS,
  SET_BURNED_CALORIES,
  SET_PERMITTED,
  SET_DISTANCE,
  SET_FLIGHTS_CLIMBED,
  SET_GOOGLE_HEALTH_CONNECTED,
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

export async function loadGoogleHealthConnection(userId: string) {
  if (!healthService.isGoogleHealthPlatform()) return false

  const status = await googleHealthService.getStatus(userId)
  await setGoogleHealthConnected(status.connected)
  return status.connected
}

export async function reloadHealthForCurrentProvider(userId?: string) {
  if (!userId) return

  if (healthService.isGoogleHealthPlatform()) {
    const connected = await loadGoogleHealthConnection(userId)
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
  const userId = store.getState().userModule.user?._id
  const data = await healthService.getTodayActivitySummary(userId)
  if (data.status === 'ok') {
    setSteps(data.steps)
    setBurnedCalories(data.activeCaloriesKcal)
    setDistance(data.distance)
    setFlightsClimbed(data.flightsClimbed)
  }
  if (data.status === 'not_connected') {
    // await setGoogleHealthConnected(false)
  }
  if (data.status === 'error') {
    throw new Error(data.message)
  }
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
