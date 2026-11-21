import { httpService } from '../http.service'
import { Instructions } from '../../types/instructions/Instructions'
import { getExerciseById } from '../exersice-search/exersice-search'
import { restOf, withStoredType } from '../set/set-type'
const KEY = 'instructions'

export const instructionsService = {
  query,
  getById,
  save,
  remove,
  getByWorkoutId,
  getWeekNumberDone,
  getNotesBySessionIdAndExerciseId,
  getExercisesFromInstructions,
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
    throw err
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getById(instructionId: string, filter: any) {
  try {
    const res = await httpService.get(`${KEY}/${instructionId}`, filter)
    if (!res?.exercises) return res
    return getExercisesFromInstructions(res)
  } catch (err) {
    throw err
  }
}

async function remove(instructionId: string) {
  try {
    return await httpService.delete(`${KEY}/${instructionId}`, null)
  } catch (err) {
    throw err
  }
}
function slimInstructions(instructions: Instructions) {
  return {
    ...instructions,
    exercises: (instructions.exercises || []).map((exercise) => ({
      exerciseId: exercise.exerciseId,
      withoutExpected: exercise.withoutExpected,
      sets: (exercise.sets || []).map((set) => ({
        ...withStoredType(set),
        restingTime: restOf(set, exercise.restingTime),
      })),
    })),
  }
}

async function save(instructions: Instructions) {
  try {
    const payload = slimInstructions(instructions)
    const savedInstructions = instructions._id
      ? await httpService.put(`${KEY}/${instructions._id}`, payload)
      : await httpService.post(KEY, payload)
    return {
      ...instructions,
      ...savedInstructions,
      exercises: instructions.exercises,
    }
  } catch (err) {
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

async function getWeekNumberDone(workoutId: string) {
  try {
    const weeksStatus = await httpService.get(`${KEY}/weekNumberDone`, {
      workoutId,
    })
    return weeksStatus
  } catch (err) {
    throw err
  }
}

async function getNotesBySessionIdAndExerciseId(
  sessionId: string,
  exerciseId: string
) {
  try {
    const notes = await httpService.get(`${KEY}/notes`, {
      sessionId,
      exerciseId,
    })

    return notes
  } catch (err) {
    throw err
  }
}
async function getExercisesFromInstructions(instructions: Instructions) {
  try {
    const exercises = instructions.exercises

    const exercisesWithDetails = await Promise.all(
      exercises.map(async (exercise) => {
        const fullExercise = await getExerciseById(exercise.exerciseId).catch(
          () => null
        )
        if (!fullExercise) return exercise
        return {
          ...exercise,
          ...fullExercise,
          sets: exercise.sets,
          withoutExpected: exercise.withoutExpected,
        }
      })
    )

    // return { ...instructions, exercises }
    return { ...instructions, exercises: exercisesWithDetails }
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
    timesPerWeek: 1,
    isDone: false,
  }
}

function getEmptySet() {
  return {
    type: { expected: 'normal' as const, actual: 'normal' as const },
    reps: {
      expected: 8,
      actual: 8,
    },
    weight: {
      expected: 15,
      actual: 15,
    },
    rpe: {
      expected: 8,
      actual: 8,
    },
  }
}

function getEmptyExpectedActual(
  type: 'weight' | 'reps' | 'rpe' | 'notes' | 'rir'
) {
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
    case 'rir':
      return {
        expected: 2,
        actual: 2,
      }
      break
    default:
      break
  }
}
