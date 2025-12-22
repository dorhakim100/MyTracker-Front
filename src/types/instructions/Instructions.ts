import { ExerciseInstructions } from '../exercise/ExerciseInstructions'
import { Workout } from '../workout/Workout'

export interface Instructions {
  _id?: string
  workoutId: string
  workout?: Workout
  exercises: ExerciseInstructions[]
  weekNumber: number
  timesPerWeek: number
  isDone: boolean // isDone is used to mark the session as done, not the exercises
  isFinished?: boolean // isFinished is used to mark the session as finished, including all exercises
}
