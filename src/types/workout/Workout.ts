import { Exercise } from '../exercise/Exercise'

export interface Workout {
  _id?: string
  forUserId?: string
  name: string
  exercises: Exercise[]
  muscleGroups: string[]
  details?: string
  isActive: boolean
  isNewInstructions?: boolean
}
