import { httpService } from '../http.service'
import { Set } from '../../types/exercise/Exercise'
import { SetFilter } from '../../types/setFilter/SetFilter'

const KEY = 'set'

export const setService = {
  query,
  getById,
  save,
  remove,
  saveSetBySessionIdAndExerciseId,
  getEmptySet,
}

async function query(filterBy: SetFilter = {}) {
  try {
    const sets = await httpService.get(KEY, filterBy)
    return sets
  } catch (err) {
    // // console.log(err)
    throw err
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getById(setId: string, filter: any) {
  try {
    const res = await httpService.get(`${KEY}/${setId}`, filter)
    return res
  } catch (err) {
    // // console.log(err)
    throw err
  }
}

async function remove(setId: string) {
  try {
    return await httpService.delete(`${KEY}/${setId}`, null)
  } catch (err) {
    // // console.log(err)
    throw err
  }
}

async function save(set: Set & { _id?: string }) {
  try {
    let savedSet
    if (set._id) {
      savedSet = await httpService.put(`${KEY}/${set._id}`, set)
    } else {
      savedSet = await httpService.post(KEY, set)
    }
    return savedSet
  } catch (err) {
    // // console.log(err)
    throw err
  }
}

async function saveSetBySessionIdAndExerciseId(
  sessionId: string,
  exerciseId: string,
  set: Set | (Set & { userId: string }),
  setIndex: number,
  isNew: boolean
) {
  try {
    const savedSet = await httpService[isNew ? 'post' : 'put'](
      `${KEY}/session/${sessionId}/exercise/${exerciseId}/${setIndex}`,
      set
    )
    return savedSet
  } catch (err) {
    // // console.log(err)
    throw err
  }
}

function getEmptySet(): Set {
  return {
    reps: {
      expected: 8,
      actual: 8,
    },
    weight: {
      expected: 15,
      actual: 15,
    },
  }
}
