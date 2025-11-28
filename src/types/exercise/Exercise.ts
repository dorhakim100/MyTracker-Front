import { ExpectedActual } from '../expectedActual/ExpectedActual'

export interface Exercise {
  name: string
  muscleGroups: string[]
  image: string
  equipment: string[]
  exerciseId: string
  details?: ExerciseDetail
}

export interface ExerciseDetail {
  sets: Set[]
  rpe: ExpectedActual<number>
  notes?: ExpectedActual<string>
}

export interface Set {
  expected: ExpectedActual<number>
  actual: ExpectedActual<number>
}
