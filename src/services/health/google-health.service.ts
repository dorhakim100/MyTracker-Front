import { httpService } from '../http.service'

export type GoogleHealthStatus = {
  connected: boolean
  googleEmail: string | null
  provider: 'google' | null
}

export type GoogleHealthTodaySummary =
  | {
      status: 'ok'
      steps: number
      activeCaloriesKcal: number
      distance: number
      flightsClimbed: number
      window: { startIso: string; endIso: string }
    }
  | { status: 'not_connected' }
  | { status: 'error'; message: string }

export const googleHealthService = {
  getStatus,
  getTodayActivitySummary,
  disconnect,
}

async function getStatus(userId: string): Promise<GoogleHealthStatus> {
  try {
    return httpService.get('health/google/status', { userId })
  } catch (err) {
    throw err
  }
}

async function disconnect(userId: string) {
  return httpService.post('health/google/disconnect', { userId })
}

async function getTodayActivitySummary(
  userId: string
): Promise<GoogleHealthTodaySummary> {
  try {
    return httpService.get('health/google/today', { userId })
  } catch (err) {
    throw err
  }
}
