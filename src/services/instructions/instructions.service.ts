import { httpService } from '../http.service'
import { Instructions } from '../../types/workout/Instructions'

const KEY = 'instructions'

export const instructionsService = {
  query,
  getById,
  save,
  remove,
  getEmptyInstructions,
}

interface InstructionsFilter {
  userId?: string
  workoutId?: string
  weekNumber?: number
}

async function query(filterBy: InstructionsFilter = {}) {
  try {
    const instructions = await httpService.get(KEY, filterBy)
    return instructions
  } catch (err) {
    throw err
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getById(instructionsId: string, filter: any = {}) {
  try {
    const res = await httpService.get(`${KEY}/${instructionsId}`, filter)
    return res
  } catch (err) {
    throw err
  }
}

async function remove(instructionsId: string) {
  try {
    return await httpService.delete(`${KEY}/${instructionsId}`, null)
  } catch (err) {
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
    throw err
  }
}

function getEmptyInstructions(): Instructions {
  return {
    userId: '',
    workoutId: '',
    details: ,
    weekNumber: 1,
  }
}
