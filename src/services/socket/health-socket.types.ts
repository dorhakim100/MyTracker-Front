export type HealthSocketPayload = {
  status: 'ok'
  steps: number
  activeCaloriesKcal: number
  distance: number
  flightsClimbed: number
  window: { startIso: string; endIso: string }
  updatedAt?: string
}

export function isHealthSocketPayload(
  payload: unknown
): payload is HealthSocketPayload {
  if (!payload || typeof payload !== 'object') {
    return false
  }

  const data = payload as Partial<HealthSocketPayload>
  return (
    data.status === 'ok' &&
    typeof data.steps === 'number' &&
    typeof data.activeCaloriesKcal === 'number' &&
    typeof data.distance === 'number' &&
    typeof data.flightsClimbed === 'number' &&
    !!data.window &&
    typeof data.window.startIso === 'string' &&
    typeof data.window.endIso === 'string'
  )
}
