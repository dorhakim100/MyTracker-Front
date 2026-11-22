import { httpService } from '../http.service'
import { SessionDay } from '../../types/workout/SessionDay'
import { workoutService } from '../workout/workout.service'
import { ExerciseInstructions } from '../../types/exercise/ExerciseInstructions'
import { Exercise } from '../../types/exercise/Exercise'
import { getExerciseById } from '../exersice-search/exersice-search'

const KEY = 'session'

export const sessionService = {
  query,
  listByWorkoutWeek,
  getById,
  save,
  remove,
  playWorkout,
  playEmptyWorkout,
  getEmptySessionDay,
  getDefaultFilter,
}

async function query(
  filterBy: {
    userId?: string
    date?: string
    workoutId?: string
    weekNumber?: number
  } = {}
) {
  try {
    const session = await httpService.get(KEY, filterBy)
    if (!session?.instructions) return session

    // const instructionsWithDetails =
    //   await instructionsService.getExercisesFromInstructions(
    //     session.instructions
    //   )

    return session
    // return { ...session, instructions: instructionsWithDetails }
  } catch (err) {
    throw err
  }
}
async function listByWorkoutWeek(
  userId: string,
  workoutId: string,
  weekNumber: number
) {
  try {
    return await httpService.get(`${KEY}/workout/${workoutId}`, {
      userId,
      weekNumber,
    })
  } catch (err) {
    throw err
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getById(goalId: string, filter: any) {
  try {
    const res = await httpService.get(`${KEY}/${goalId}`, filter)
    return res
  } catch (err) {
    throw err
  }
}

async function remove(goalId: string) {
  try {
    return await httpService.delete(`${KEY}/${goalId}`, null)
  } catch (err) {
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
    throw err
  }
}

function detailsByExerciseId(session: SessionDay) {
  const listed = [
    ...(session.workout?.exercises || []),
    ...(session.workout?.instructionExercises || []),
  ]
  return new Map(
    listed
      .filter((exercise) => exercise.exerciseId)
      .map((exercise) => [exercise.exerciseId, exercise])
  )
}

type PlayDetails = {
  name: string
  image?: string
  muscleGroups?: string[]
  equipments?: string[]
  mainMuscles?: string[]
  secondaryMuscles?: string[]
}

function playDetails(value: unknown): PlayDetails | null {
  if (!value || typeof value !== 'object' || !('name' in value)) return null
  if (typeof value.name !== 'string' || !value.name) return null
  const exercise = value as PlayDetails
  return {
    name: exercise.name,
    image: exercise.image,
    muscleGroups: exercise.muscleGroups,
    equipments: exercise.equipments,
    mainMuscles: exercise.mainMuscles,
    secondaryMuscles: exercise.secondaryMuscles,
  }
}

async function exerciseForPlay(
  exercise: ExerciseInstructions,
  known: Map<string, Exercise>
) {
  const details =
    playDetails(known.get(exercise.exerciseId)) ||
    playDetails(await getExerciseById(exercise.exerciseId).catch(() => null))

  return {
    ...exercise,
    name: details?.name || exercise.name,
    image: details?.image || exercise.image,
    muscleGroups: details?.muscleGroups || exercise.muscleGroups,
    equipments: details?.equipments || exercise.equipments,
    mainMuscles: details?.mainMuscles,
    secondaryMuscles: details?.secondaryMuscles,
    sets: (exercise.sets || []).map((set) => ({ ...set, isDone: false })),
    withoutExpected: exercise.withoutExpected,
  }
}

async function playWorkout(sessionDay: SessionDay, userId: string) {
  try {
    const session = await httpService.put(`${KEY}/play/${sessionDay._id}`, {
      workoutId: sessionDay.workoutId,
      userId: userId,
    })

    if (!session?.instructions?.exercises) return session

    const known = detailsByExerciseId(session)
    const exercises = await Promise.all(
      session.instructions.exercises.map((exercise: ExerciseInstructions) =>
        exerciseForPlay(exercise, known)
      )
    )

    return {
      ...session,
      instructions: {
        ...session.instructions,
        exercises,
      },
    }
  } catch (err) {
    throw err
  }
}
async function playEmptyWorkout(userId: string) {
  try {
    const session = await httpService.put(`${KEY}/play/empty`, {
      userId: userId,
    })

    return session
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
