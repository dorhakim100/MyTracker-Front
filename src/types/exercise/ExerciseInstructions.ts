import { ExpectedActual } from '../expectedActual/ExpectedActual'
import { Set } from './Exercise'
export interface ExerciseInstructions {
  exerciseId: string
  sets: Set[]

  restingTime?: number
  setIndex?: number
  restMarkSets?: Set[]
  restMarkIndex?: number
  restMarkExerciseId?: string

  notes: ExpectedActual<string>
  name?: string
  image?: string
  muscleGroups?: string[]
  equipments?: string[]
  instructions?: string[]
  withoutExpected?: boolean
}
