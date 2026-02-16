import { workoutService } from '../../services/workout/workout.service'
import { Workout } from '../../types/workout/Workout'
import { SessionDay } from '../../types/workout/SessionDay'
import { ExerciseInstructions } from '../../types/exercise/ExerciseInstructions'
import { CurrUpdatedExerciseSettings } from '../../types/workout/CurrUpdatedExerciseSettings'

export const SET_WORKOUTS = 'SET_WORKOUTS'
export const SET_WORKOUT = 'SET_WORKOUT'
export const ADD_WORKOUT = 'ADD_WORKOUT'
export const UPDATE_WORKOUT = 'UPDATE_WORKOUT'
export const REMOVE_WORKOUT = 'REMOVE_WORKOUT'
export const SET_SELECTED_SESSION_DAY = 'SET_SELECTED_SESSION_DAY'
export const REMOVE_SESSION_DAY = 'REMOVE_SESSION_DAY'
export const SET_CURRENT_EXERCISE = 'SET_CURRENT_EXERCISE'
export const REMOVE_CURRENT_EXERCISE = 'REMOVE_CURRENT_EXERCISE'
export const SET_TIMER = 'SET_TIMER'
export const REMOVE_TIMER = 'REMOVE_TIMER'
export const SET_TODAY_SESSION_DAY = 'SET_TODAY_SESSION_DAY'
export const REMOVE_TODAY_SESSION_DAY = 'REMOVE_TODAY_SESSION_DAY'
export const SET_CURR_UPDATED_EXERCISE_SETTINGS =
  'SET_CURR_UPDATED_EXERCISE_SETTINGS'

export interface WorkoutState {
  workouts: Workout[]
  workout: Workout
  sessionDay: SessionDay | null
  currentExercise: ExerciseInstructions | null
  timer: any | null
  todaySessionDay: SessionDay | null
  currUpdatedExerciseSettings: CurrUpdatedExerciseSettings
}

const initialCurrUpdatedExerciseSettings: CurrUpdatedExerciseSettings = {
  exerciseId: '',
  setIndex: -1,
}

const initialState: WorkoutState = {
  workouts: [],
  workout: workoutService.getEmptyWorkout(),
  sessionDay: null,
  currentExercise: null,
  timer: null,
  todaySessionDay: null,
  currUpdatedExerciseSettings: initialCurrUpdatedExerciseSettings,
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
    case REMOVE_SESSION_DAY:
      newState = { ...state, sessionDay: null }
      break
    case SET_CURRENT_EXERCISE:
      newState = { ...state, currentExercise: action.exercise }
      break
    case REMOVE_CURRENT_EXERCISE:
      newState = { ...state, currentExercise: null }
      break
    case SET_TIMER:
      newState = { ...state, timer: action.timer }
      break
    case REMOVE_TIMER:
      newState = { ...state, timer: null }
      break
    case SET_TODAY_SESSION_DAY:
      newState = { ...state, todaySessionDay: action.todaySessionDay }
      break
    case REMOVE_TODAY_SESSION_DAY:
      newState = { ...state, todaySessionDay: null }
      break
    case SET_CURR_UPDATED_EXERCISE_SETTINGS:
      newState = {
        ...state,
        currUpdatedExerciseSettings: action.currUpdatedExerciseSettings,
      }
      break
    default:
  }
  return newState
}
