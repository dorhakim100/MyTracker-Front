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
} from '../reducers/workout.reducer'
import { Workout } from '../../types/workout/Workout'
import { WorkoutFilter } from '../../types/workoutFilter/WorkoutFilter'
import { User } from '../../types/user/User'
import { SessionDay } from '../../types/workout/SessionDay'
import { sessionService } from '../../services/session/session.service'
import { ExerciseInstructions } from '../../types/exercise/ExerciseInstructions'
import { indexedDbService } from '../../services/indexeddb.service'
import { setService } from '../../services/set/set.service'
import { Set } from '../../types/exercise/Exercise'
import { instructionsService } from '../../services/instructions/instructions.service'

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

export function setCurrentExercise(exercise: ExerciseInstructions) {
  store.dispatch({ type: SET_CURRENT_EXERCISE, exercise })
}

export function removeCurrentExercise() {
  store.dispatch({ type: REMOVE_CURRENT_EXERCISE })
}

export async function setTimer(timer: any) {
  try {
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

export async function markAsDoneSession(isBulkSetUpdate: boolean = false) {
  try {
    const sessionDay = store.getState().workoutModule.sessionDay
    if (!sessionDay) return
    const timer = store.getState().workoutModule.timer
    if (timer) {
      await removeTimer(timer._id)
    }
    removeCurrentExercise()
    const newExercises = sessionDay.instructions.exercises.map(
      (exercise: ExerciseInstructions) => {
        return {
          ...exercise,
          isDone: true,
          sets: exercise.sets.map((set: Set) => {
            return {
              ...set,
              isDone: true,
            }
          }),
        }
      }
    )
    const newInstructions = {
      ...sessionDay.instructions,
      isFinished: true,
      exercises: newExercises,
    }
    const newSessionDay = {
      ...sessionDay,
      instructions: newInstructions,
    }
    const savedInstructions = await instructionsService.save(newInstructions)

    store.dispatch({
      type: SET_SELECTED_SESSION_DAY,
      sessionDay: newSessionDay,
    })
    if (!isBulkSetUpdate) return
    const promises = savedInstructions.exercises.map(
      async (exercise: ExerciseInstructions) => {
        await markExerciseAsDone(exercise.exerciseId, true)
      }
    )
    await Promise.all(promises)
    console.log('savedInstructions', savedInstructions)
  } catch (err) {
    console.error(err)
    throw err
  }
}

export async function markExerciseAsDone(
  exerciseId: string,
  isDoneToSet: boolean
) {
  try {
    const sessionDay = store.getState().workoutModule.sessionDay
    if (!sessionDay) return
    if (!sessionDay._id) return
    const sets = await setService.getSetsBySessionIdAndExerciseId(
      sessionDay._id,
      exerciseId
    )

    const promises = sets.map(async (set: Set) => {
      let cleanedSet: Set = {
        ...set,
        isDone: isDoneToSet,
      }
      // Remove the unused RPE/RIR field - only keep the one that's actually used
      if (cleanedSet.rir) {
        const { rpe, ...setWithoutRpe } = cleanedSet
        cleanedSet = setWithoutRpe
      } else if (cleanedSet.rpe) {
        const { rir, ...setWithoutRir } = cleanedSet
        cleanedSet = setWithoutRir
      }

      await setService.save(cleanedSet)
    })

    await Promise.all(promises)
  } catch (err) {
    console.error(err)
    throw err
  }
}
