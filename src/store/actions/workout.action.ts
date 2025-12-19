import { workoutService } from '../../services/workout/workout.service'
import { store } from '../store'
import {
  SET_WORKOUTS,
  // SET_WORKOUT,
  ADD_WORKOUT,
  UPDATE_WORKOUT,
  REMOVE_WORKOUT,
  SET_SELECTED_SESSION_DAY,
  REMOVE_SESSION_DAY,
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

export async function saveWorkout(workout: Workout, timesPerWeek?: number) {
  try {
    const savedWorkout = await workoutService.save(workout)
    const action = workout._id ? UPDATE_WORKOUT : ADD_WORKOUT
    store.dispatch({
      type: action,
      workout: {
        ...savedWorkout,
        isNewInstructions: true,
        timesPerWeek,
        doneTimes: 0,
      },
    })
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
    const res = await sessionService.query(filter)

    return res
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

export async function playWorkout(sessionDay: SessionDay, userId: string) {
  try {
    const sessionWithInstructions = await sessionService.playWorkout(
      sessionDay,
      userId
    )
    store.dispatch({
      type: SET_SELECTED_SESSION_DAY,
      sessionDay: sessionWithInstructions,
    })

    return sessionWithInstructions
  } catch (err) {
    throw err
  }
}

export async function saveSessionDay(sessionDay: SessionDay) {
  try {
    const savedSessionDay = await sessionService.save(sessionDay)
    store.dispatch({
      type: SET_SELECTED_SESSION_DAY,
      sessionDay: savedSessionDay,
    })
  } catch (err) {
    throw err
  }
}

export async function removeSessionDay(sessionDayId: string) {
  try {
    await sessionService.remove(sessionDayId)
    store.dispatch({ type: REMOVE_SESSION_DAY, sessionDayId })
  } catch (err) {
    throw err
  }
}
