import { ExpectedActual } from '../expectedActual/ExpectedActual'
import { Set } from './Exercise'
export interface ExerciseInstructions {
  exerciseId: string
  sets: Set[]
  rpe: ExpectedActual<number>
  notes: ExpectedActual<string>
}
