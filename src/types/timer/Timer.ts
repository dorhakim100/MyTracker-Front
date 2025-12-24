import { ExerciseInstructions } from '../exercise/ExerciseInstructions'

export interface Timer {
  _id?: string
  currentExercise: ExerciseInstructions
  startTime: number
}
