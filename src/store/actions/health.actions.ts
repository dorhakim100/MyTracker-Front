import {healthService} from "../../services/health/health.service"

import { store } from "../store"
  import { SET_STEPS, SET_BURNED_CALORIES, SET_PERMITTED, SET_DISTANCE, SET_FLIGHTS_CLIMBED } from "../reducers/health.reducer"

export async function setPermitted(permitted: boolean) {
  store.dispatch({ type: SET_PERMITTED, permitted })
}

export async function setHealthData() {
  const data = await healthService.getTodayActivitySummary()
  if(data.status === 'ok') {
    setSteps(data.steps)
    setBurnedCalories(data.activeCaloriesKcal)
    setDistance(data.distance)
    setFlightsClimbed(data.flightsClimbed)
  }
  if(data.status === 'error') {
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