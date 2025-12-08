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
  rpe?: ExpectedActual<number>
  rir?: ExpectedActual<number>
  notes?: ExpectedActual<string>
  // just for editing
  reps?: ExpectedActual<number>
  weight?: ExpectedActual<number>
}

export interface Set {
  _id?: string
  reps: ExpectedActual<number>
  weight: ExpectedActual<number>
  rpe?: ExpectedActual<number>
  rir?: ExpectedActual<number>
  setNumber?: number
  createdAt?: Date
  // just for editing
}
