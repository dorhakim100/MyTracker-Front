import { workoutService } from '../../services/workout/workout.service'
import { store } from '../store'
import {
  SET_WORKOUTS,
  SET_WORKOUT,
  ADD_WORKOUT,
  UPDATE_WORKOUT,
  REMOVE_WORKOUT,
} from '../reducers/workout.reducer'
import { Workout } from '../../types/workout/Workout'
import { WorkoutFilter } from '../../types/workoutFilter/WorkoutFilter'

export async function loadWorkouts(filter: WorkoutFilter) {
  try {
    const workouts = await workoutService.query(filter)
    store.dispatch({ type: SET_WORKOUTS, workouts })
    return workouts
  } catch (err) {
    throw err
  }
}

export async function saveWorkout(workout: Workout) {
  try {
    const savedWorkout = await workoutService.save(workout)
    if (workout._id) {
      store.dispatch({ type: UPDATE_WORKOUT, workout: savedWorkout })
    } else {
      store.dispatch({ type: ADD_WORKOUT, workout: savedWorkout })
    }
    return savedWorkout
  } catch (err) {
    throw err
  }
}

export async function removeWorkout(workoutId: string) {
  try {
    await workoutService.remove(workoutId)
    store.dispatch({ type: REMOVE_WORKOUT, workoutId })
  } catch (err) {
    throw err
  }
}

export async function toggleActivateWorkout(workout: Workout) {
  try {
    workout.isActive = !workout.isActive
    const savedWorkout = await workoutService.save(workout)
    store.dispatch({ type: UPDATE_WORKOUT, workout: savedWorkout })
  } catch (err) {
    throw err
  }
}
