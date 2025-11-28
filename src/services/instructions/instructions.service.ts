import { httpService } from '../http.service'
import { Instructions } from '../../types/instructions/Instructions'
const KEY = 'instructions'

export const instructionsService = {
  query,
  getById,
  save,
  remove,
  getByWorkoutId,
  getEmptyInstructions,
  getEmptySet,
  getEmptyExpectedActual,
}

async function query(
  filterBy = {
    workoutId: '',
    forUserId: '',
  }
) {
  try {
    const allUsersInstructions = await httpService.get(KEY, filterBy)

    return allUsersInstructions
  } catch (err) {
    // // console.log(err)
    throw err
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getById(instructionId: string, filter: any) {
  try {
    const res = await httpService.get(`${KEY}/${instructionId}`, filter)
    return res
  } catch (err) {
    // // console.log(err)
    throw err
  }
}

async function remove(instructionId: string) {
  try {
    return await httpService.delete(`${KEY}/${instructionId}`, null)
  } catch (err) {
    // // console.log(err)
    throw err
  }
}
async function save(instructions: Instructions) {
  try {
    let savedInstructions
    if (instructions._id) {
      savedInstructions = await httpService.put(
        `${KEY}/${instructions._id}`,
        instructions
      )
    } else {
      savedInstructions = await httpService.post(KEY, instructions)
    }
    return savedInstructions
  } catch (err) {
    // // console.log(err)
    throw err
  }
}

async function getByWorkoutId(
  filter = { workoutId: '', forUserId: '', weekNumber: 1 }
) {
  try {
    const instructions = await httpService.get(
      `${KEY}/workout/${filter.workoutId}`,
      { forUserId: filter.forUserId, weekNumber: filter.weekNumber }
    )
    return instructions
  } catch (err) {
    throw err
  }
}

function getEmptyInstructions() {
  return {
    _id: '',
    workoutId: '',
    exercises: [],
    weekNumber: 1,
  }
}

function getEmptySet() {
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

function getEmptyExpectedActual(type: 'weight' | 'reps' | 'rpe' | 'notes') {
  switch (type) {
    case 'weight':
      return {
        expected: 15,
        actual: 15,
      }
    case 'reps':
      return {
        expected: 8,
        actual: 8,
      }
    case 'rpe':
      return {
        expected: 8,
        actual: 8,
      }
    case 'notes':
      return {
        expected: '',
        actual: '',
      }
      break

    default:
      break
  }
}
