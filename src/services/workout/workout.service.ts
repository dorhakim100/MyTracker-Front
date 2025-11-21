import { ExerciseDetail } from '../../types/exercise/Exercise'
import { Workout } from '../../types/workout/Workout'
import { httpService } from '../http.service'
import { WorkoutFilter } from '../../types/workoutFilter/WorkoutFilter'

const KEY = 'workout'

export const workoutService = {
  query,
  getById,
  save,
  remove,
  getEmptyWorkout,
  getEmptyExerciseDetail,
}

async function query(filterBy: WorkoutFilter = { forUserId: '' }) {
  try {
    const workouts = await httpService.get(KEY, filterBy)

    return workouts
  } catch (err) {
    // // console.log(err)
    throw err
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getById(workoutId: string, filter: any) {
  try {
    const res = await httpService.get(`${KEY}/${workoutId}`, filter)
    return res
  } catch (err) {
    // // console.log(err)
    throw err
  }
}

async function remove(workoutId: string) {
  try {
    return await httpService.delete(`${KEY}/${workoutId}`, null)
  } catch (err) {
    // // console.log(err)
    throw err
  }
}
async function save(workout: Workout) {
  try {
    let savedWorkout
    if (workout._id) {
      savedWorkout = await httpService.put(`${KEY}/${workout._id}`, workout)
    } else {
      savedWorkout = await httpService.post(KEY, workout)
    }
    return savedWorkout
  } catch (err) {
    // // console.log(err)
    throw err
  }
}

function getEmptyWorkout(): Workout {
  return {
    name: '',
    exercises: [],
    muscleGroups: [],
    details: '',
  }
}

function getEmptyExerciseDetail(): ExerciseDetail {
  return {
    sets: {
      expected: 3,
      actual: 0,
    },
    reps: {
      expected: 8,
      actual: 0,
    },
    weight: {
      expected: 10,
      actual: 0,
    },
    rpe: {
      expected: 8,
      actual: 0,
    },
    notes: {
      expected: '',
      actual: '',
    },
  }
}
