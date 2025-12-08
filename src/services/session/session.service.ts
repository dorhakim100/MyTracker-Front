import { httpService } from '../http.service'
import { SessionDay } from '../../types/workout/SessionDay'
import { workoutService } from '../workout/workout.service'
import { instructionsService } from '../instructions/instructions.service'

const KEY = 'session'

export const sessionService = {
  query,
  getById,
  save,
  remove,
  playWorkout,
  getEmptySessionDay,
  getDefaultFilter,
}

async function query(
  filterBy = {
    userId: '',
  }
) {
  try {
    const session = await httpService.get(KEY, filterBy)
    if (!session.instructions) return session

    const instructionsWithDetails =
      await instructionsService.getExercisesFromInstructions(
        session.instructions
      )

    return { ...session, instructions: instructionsWithDetails }
  } catch (err) {
    // // console.log(err)
    throw err
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getById(goalId: string, filter: any) {
  try {
    const res = await httpService.get(`${KEY}/${goalId}`, filter)
    return res
  } catch (err) {
    // // console.log(err)
    throw err
  }
}

async function remove(goalId: string) {
  try {
    return await httpService.delete(`${KEY}/${goalId}`, null)
  } catch (err) {
    // // console.log(err)
    throw err
  }
}
async function save(sessionDay: SessionDay) {
  try {
    let savedGoal
    if (sessionDay._id) {
      savedGoal = await httpService.put(`${KEY}/${sessionDay._id}`, sessionDay)
    } else {
      savedGoal = await httpService.post(KEY, sessionDay)
    }
    return savedGoal
  } catch (err) {
    // // console.log(err)
    throw err
  }
}

async function playWorkout(sessionDay: SessionDay, userId: string) {
  try {
    const session = await httpService.put(`${KEY}/play/${sessionDay._id}`, {
      workoutId: sessionDay.workoutId,
      userId: userId,
    })

    const instructionsWithDetails =
      await instructionsService.getExercisesFromInstructions(
        session.instructions
      )

    return {
      ...session,
      instructions: { ...instructionsWithDetails, isDone: true },
    }
  } catch (err) {
    throw err
  }
}
function getEmptySessionDay() {
  return {
    ...workoutService.getEmptyWorkout(),
    date: new Date().getTime(),
  }
}

function getDefaultFilter() {
  return {
    date: new Date().getTime(),
    userId: '',
  }
}
