import { workoutService } from '../../services/workout/workout.service'
import { store } from '../store'
import {
  SET_WORKOUTS,
  SET_WORKOUT,
  ADD_WORKOUT,
  UPDATE_WORKOUT,
  REMOVE_WORKOUT,
  SET_SELECTED_SESSION_DAY,
} from '../reducers/workout.reducer'
import { Workout } from '../../types/workout/Workout'
import { WorkoutFilter } from '../../types/workoutFilter/WorkoutFilter'
import { User } from '../../types/user/User'
import { SessionDay } from '../../types/workout/SessionDay'
import { sessionService } from '../../services/session/session.service'

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

export async function handleSessionDayChange(dateToCheck: string, user: User) {
  try {
    const filter = {
      date: dateToCheck,
      userId: user._id,
    }

    if (!user) return

    return await sessionService.query(filter)
  } catch (err) {
    throw err
  }
}

export function setSelectedSessionDay(sessionDay: SessionDay) {
  store.dispatch({
    type: SET_SELECTED_SESSION_DAY,
    sessionDay,
  })
}

export async function saveSessionDay(sessionDay: SessionDay) {
  try {
    const sessionToSave = {
      ...sessionDay,
      setsIds: sessionDay.sets.map((set) => set._id),
    }
    const savedSessionDay = await sessionService.save(sessionToSave)
    store.dispatch({
      type: SET_SELECTED_SESSION_DAY,
      sessionDay: savedSessionDay,
    })
  } catch (err) {
    throw err
  }
}
