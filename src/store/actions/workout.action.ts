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
  REMOVE_CURRENT_EXERCISE,
  SET_CURRENT_EXERCISE,
  REMOVE_TIMER,
  SET_TIMER,
  REMOVE_TODAY_SESSION_DAY,
  SET_TODAY_SESSION_DAY,
  SET_CURR_UPDATED_EXERCISE_SETTINGS,
} from '../reducers/workout.reducer'
import { Workout } from '../../types/workout/Workout'
import { WorkoutFilter } from '../../types/workoutFilter/WorkoutFilter'
import { User } from '../../types/user/User'
import { SessionDay } from '../../types/workout/SessionDay'
import { sessionService } from '../../services/session/session.service'
import { ExerciseInstructions } from '../../types/exercise/ExerciseInstructions'
import type { CurrUpdatedExerciseSettings } from '../../types/workout/CurrUpdatedExerciseSettings'
import { indexedDbService } from '../../services/indexeddb.service'
import { Timer } from '../../types/timer/Timer'
import { DEFAULT_RESTING_TIME } from '../../assets/config/times'

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

    setSelectedSessionDay(sessionWithInstructions)
    setTodaySessionDay(sessionWithInstructions)

    return sessionWithInstructions
  } catch (err) {
    throw err
  }
}

export async function playEmptyWorkout(userId: string) {
  try {
    const session = await sessionService.playEmptyWorkout(userId)
    setSelectedSessionDay(session)
    setTodaySessionDay(session)
    return session
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

export function setCurrentExercise(exercise: ExerciseInstructions) {
  store.dispatch({ type: SET_CURRENT_EXERCISE, exercise })
}

export function removeCurrentExercise() {
  store.dispatch({ type: REMOVE_CURRENT_EXERCISE })
}

export async function setTimer(timer: Timer) {
  try {
    // If the resting time is not set, make sure to set it to the default resting time
    timer.currentExercise.restingTime =
      timer.currentExercise.restingTime || DEFAULT_RESTING_TIME
    const savedTimer = await indexedDbService.post('timer', timer)
    store.dispatch({ type: SET_TIMER, timer: savedTimer })
  } catch (err) {
    throw err
  }
}

export async function removeTimer(timerId: string) {
  try {
    await indexedDbService.remove('timer', timerId)
    store.dispatch({ type: REMOVE_TIMER })
  } catch (err) {
    throw err
  }
}

export function setTodaySessionDay(todaySessionDay: SessionDay) {
  store.dispatch({ type: SET_TODAY_SESSION_DAY, todaySessionDay })
}

export function removeTodaySessionDay() {
  store.dispatch({ type: REMOVE_TODAY_SESSION_DAY })
}

export function setCurrUpdatedExerciseSettings(
  currUpdatedExerciseSettings: CurrUpdatedExerciseSettings
) {
  store.dispatch({
    type: SET_CURR_UPDATED_EXERCISE_SETTINGS,
    currUpdatedExerciseSettings,
  })
}
