import { httpService } from '../http.service'
import { WorkoutSet } from '../../types/set/Set'

const KEY = 'set'

export const setService = {
  query,
  getById,
  save,
  remove,
  getEmptySet,
}

interface SetFilter {
  exerciseId?: string
  workoutId?: string
  forUserId?: string
}

async function query(filterBy: SetFilter = {}) {
  try {
    const sets = await httpService.get(KEY, filterBy)
    return sets
  } catch (err) {
    throw err
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getById(setId: string, filter: any = {}) {
  try {
    const res = await httpService.get(`${KEY}/${setId}`, filter)
    return res
  } catch (err) {
    throw err
  }
}

async function remove(setId: string) {
  try {
    return await httpService.delete(`${KEY}/${setId}`, null)
  } catch (err) {
    throw err
  }
}

async function save(set: WorkoutSet) {
  try {
    let savedSet
    if (set._id) {
      savedSet = await httpService.put(`${KEY}/${set._id}`, set)
    } else {
      savedSet = await httpService.post(KEY, set)
    }
    return savedSet
  } catch (err) {
    throw err
  }
}

function getEmptySet(): WorkoutSet {
  return {
    exerciseId: '',
    workoutId: '',
    reps: 0,
    weight: 0,
  }
}
