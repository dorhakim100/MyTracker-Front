import { Exercise } from '../../types/exercise/Exercise'
import { ExerciseInstructions } from '../../types/exercise/ExerciseInstructions'
import { Instructions } from '../../types/instructions/Instructions'
import { SessionDay } from '../../types/workout/SessionDay'
import { Workout } from '../../types/workout/Workout'

export function weekTimes(instructions: Instructions | null) {
  return {
    doneTimes: instructions?.doneTimes ?? 0,
    timesPerWeek: instructions?.timesPerWeek || 1,
  }
}

export function weekState(doneTimes: number, timesPerWeek: number) {
  if (doneTimes <= 0) return 'planned' as const
  if (doneTimes >= timesPerWeek) return 'finished' as const
  return 'progress' as const
}

export function statusCopy(status: ReturnType<typeof weekState>) {
  if (status === 'planned') return 'plannedNotDone'
  if (status === 'finished') return 'weekFinished'
  return 'inProgress'
}

export function toExercise(
  instruction: ExerciseInstructions,
  workout: Workout
): Exercise {
  const fromWorkout = workout.exercises.find(
    (exercise) => exercise.exerciseId === instruction.exerciseId
  )
  if (fromWorkout) return fromWorkout
  return {
    name: instruction.name || instruction.exerciseId,
    image: instruction.image || '',
    exerciseId: instruction.exerciseId,
    muscleGroups: instruction.muscleGroups || [],
    equipments: instruction.equipments || [],
  }
}

export function toSessionList(value: unknown): SessionDay[] {
  if (Array.isArray(value)) return value as SessionDay[]
  if (value && typeof value === 'object' && 'date' in value) {
    return [value as SessionDay]
  }
  return []
}

export function finishedSessions(
  value: unknown,
  workoutId: string,
  weekNumber: number
) {
  return toSessionList(value)
    .filter((session) => {
      if (session.workoutId && session.workoutId !== workoutId) return false
      if (session.instructions?.weekNumber !== weekNumber) return false
      return Boolean(session.statsId || session.instructions?.isFinished)
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function formatSessionDate(date: string, lang: string) {
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return date
  return parsed.toLocaleDateString(lang === 'he' ? 'he' : 'en', {
    day: 'numeric',
    month: 'short',
  })
}
