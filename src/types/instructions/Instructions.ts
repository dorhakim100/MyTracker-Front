import { ExerciseInstructions } from '../exercise/ExerciseInstructions'

export interface Instructions {
  _id?: string
  workoutId: string
  exercises: ExerciseInstructions[]
  weekNumber: number
  isDone: boolean
}
