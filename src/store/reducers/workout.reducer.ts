import { workoutService } from '../../services/workout/workout.service'
import { Workout } from '../../types/workout/Workout'
import { SessionDay } from '../../types/workout/SessionDay'

export const SET_WORKOUTS = 'SET_WORKOUTS'
export const SET_WORKOUT = 'SET_WORKOUT'
export const ADD_WORKOUT = 'ADD_WORKOUT'
export const UPDATE_WORKOUT = 'UPDATE_WORKOUT'
export const REMOVE_WORKOUT = 'REMOVE_WORKOUT'
export const SET_SELECTED_SESSION_DAY = 'SET_SELECTED_SESSION_DAY'

export interface WorkoutState {
  workouts: Workout[]
  workout: Workout
  sessionDay: SessionDay | null
}

const initialState: WorkoutState = {
  workouts: [],
  workout: workoutService.getEmptyWorkout(),
  sessionDay: null,
}

export function workoutReducer(state = initialState, action: any) {
  let newState = state
  switch (action.type) {
    case SET_WORKOUTS:
      newState = { ...state, workouts: action.workouts }
      break
    case SET_WORKOUT:
      newState = { ...state, workout: action.workout }
      break
    case ADD_WORKOUT:
      newState = { ...state, workouts: [...state.workouts, action.workout] }
      break
    case UPDATE_WORKOUT:
      newState = {
        ...state,
        workouts: state.workouts.map((workout: Workout) =>
          workout._id === action.workout._id ? action.workout : workout
        ),
      }
      break
    case REMOVE_WORKOUT:
      newState = {
        ...state,
        workouts: state.workouts.filter(
          (workout: Workout) => workout._id !== action.workoutId
        ),
      }
      break
    case SET_SELECTED_SESSION_DAY:
      newState = { ...state, sessionDay: action.sessionDay }
      break
    default:
  }
  return newState
}
