import { israelTodayKey } from './activity-dates'

let healthDayKey: string | null = null

export function markTodayHealthReady() {
  healthDayKey = israelTodayKey()
}

export function clearTodayHealthReady() {
  healthDayKey = null
}

export function isTodayHealthReady() {
  return healthDayKey === israelTodayKey()
}
