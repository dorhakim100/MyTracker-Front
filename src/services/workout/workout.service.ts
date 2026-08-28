import { Workout } from '../../types/workout/Workout'
import { httpService } from '../http.service'
import {
  DEFAULT_PAST_ROUTINES_RANGE,
  PAST_ROUTINES_RANGES,
  PastRoutinesRange,
  WorkoutFilter,
} from '../../types/workoutFilter/WorkoutFilter'
import { ExerciseFilter } from '../../types/exerciseFilter/ExerciseFilter'
import { getDateFromISO } from '../util.service'

const KEY = 'workout'

export const workoutService = {
  query,
  getById,
  save,
  remove,
  getEmptyWorkout,
  getEmptyExerciseDetail,
  getEmptyExerciseFilter,
  getPastRoutinesFilter,
}

async function query(filterBy: WorkoutFilter = { forUserId: '' }) {
  try {
    const params: WorkoutFilter = { forUserId: filterBy.forUserId }
    if (filterBy.from) params.from = filterBy.from
    if (filterBy.to) params.to = filterBy.to
    if (filterBy.limit) params.limit = filterBy.limit
    if (filterBy.all) params.all = true
    if (filterBy.isActive !== undefined) params.isActive = filterBy.isActive

    const workouts = await httpService.get(KEY, params)

    return workouts
  } catch (err) {
    throw err
  }
}

function getPastRoutinesFilter(
  forUserId: string,
  range: PastRoutinesRange = DEFAULT_PAST_ROUTINES_RANGE
): WorkoutFilter {
  if (range === PAST_ROUTINES_RANGES.LAST_6) {
    return { forUserId, limit: 6 }
  }

  if (range === PAST_ROUTINES_RANGES.ALL) {
    return { forUserId, all: true }
  }

  const fromDate = new Date()
  if (range === PAST_ROUTINES_RANGES.LAST_3_MONTHS) {
    fromDate.setMonth(fromDate.getMonth() - 3)
  } else if (range === PAST_ROUTINES_RANGES.LAST_6_MONTHS) {
    fromDate.setMonth(fromDate.getMonth() - 6)
  } else {
    fromDate.setFullYear(fromDate.getFullYear() - 1)
  }

  return {
    forUserId,
    from: getDateFromISO(fromDate.toISOString()),
    to: getDateFromISO(new Date().toISOString()),
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getById(workoutId: string, filter: any) {
  try {
    const res = await httpService.get(`${KEY}/${workoutId}`, filter)
    return res
  } catch (err) {
    throw err
  }
}

async function remove(workoutId: string) {
  try {
    return await httpService.delete(`${KEY}/${workoutId}`, null)
  } catch (err) {
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
    throw err
  }
}

function getEmptyWorkout(): Workout {
  return {
    name: '',
    exercises: [],
    muscleGroups: [],
    details: '',
    isActive: true,
  }
}

function getEmptyExerciseFilter(): ExerciseFilter {
  return {
    searchValue: '',
    muscleGroupValue: 'All',
    equipmentValue: 'All',
  }
}

function getEmptyExerciseDetail() {
  return {
    sets: {
      expected: 3,
      actual: 0,
    },
    weight: {
      expected: 15,
      actual: 15,
    },
    reps: {
      expected: 10,
      actual: 8,
    },
    rpe: {
      expected: 8,
      actual: 7,
    },
    notes: {
      expected: '',
      actual: '',
    },
  }
}
