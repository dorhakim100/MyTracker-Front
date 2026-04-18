import {healthService} from "../../services/health/health.service"

import { store } from "../store"
import { SET_STEPS, SET_BURNED_CALORIES, SET_PERMITTED } from "../reducers/health.reducer"

export async function setPermitted(permitted: boolean) {
  store.dispatch({ type: SET_PERMITTED, permitted })
}

export async function setSteps() {
  const data = await healthService.getTodayActivitySummary()
  if(data.status === 'ok') {
    store.dispatch({ type: SET_STEPS, steps: data.steps })
  }
  if(data.status === 'error') {
    throw new Error(data.message)
  }
}

export async function setBurnedCalories() {
  const data = await healthService.getTodayActivitySummary()
  if(data.status === 'ok') {
    store.dispatch({ type: SET_BURNED_CALORIES, burnedCalories: data.activeCaloriesKcal })
  }
  if(data.status === 'error') {
    throw new Error(data.message)
  }
}