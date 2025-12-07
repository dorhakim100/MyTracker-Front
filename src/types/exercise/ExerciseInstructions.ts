import { ExpectedActual } from '../expectedActual/ExpectedActual'
import { Set } from './Exercise'
export interface ExerciseInstructions {
  exerciseId: string
  sets: Set[]

  notes: ExpectedActual<string>
  name?: string
  image?: string
  muscleGroups?: string[]
  equipment?: string[]
  instructions?: string[]
}
