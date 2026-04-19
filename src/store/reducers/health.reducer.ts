export const SET_PERMITTED = 'SET_PERMITTED'
export const SET_STEPS = 'SET_STEPS'
export const SET_BURNED_CALORIES = 'SET_BURNED_CALORIES'
export const SET_DISTANCE = 'SET_DISTANCE'
export const SET_RESTING_HEART_RATE = 'SET_RESTING_HEART_RATE'

export interface HealthState {
permited: boolean
  steps: number
  burnedCalories: number
  distance: number
  restingHeartRate: number
}

const initialState: HealthState = {
  permited: false,
  steps: 0,
  burnedCalories: 0,
  distance: 0,
  restingHeartRate: 0,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function healthReducer(state = initialState, action: any): HealthState {
  let newState = state
  switch (action.type) {
    case SET_PERMITTED:
      newState = { ...state, permited: action.permited }
      break
    case SET_STEPS:
      newState = { ...state, steps: action.steps }
      break
    case SET_BURNED_CALORIES:
      newState = { ...state, burnedCalories: action.burnedCalories }
      break
    case SET_DISTANCE:
      newState = { ...state, distance: action.distance }
      break
    case SET_RESTING_HEART_RATE:
      newState = { ...state, restingHeartRate: action.restingHeartRate }
      break
    default:
      newState = state
  }
  return newState
}