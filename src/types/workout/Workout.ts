import { Exercise } from '../exercise/Exercise'

export interface Workout {
  name: string
  exercises: Exercise[]
  muscleGroups: string[]
  details: string
}
