import { ExpectedActual } from '../expectedActual/ExpectedActual'

export interface Exercise {
  name: string
  muscleGroups: string[]
  image: string
  equipments: string[]
  exerciseId: string
  mainMuscles?: string[]
  secondaryMuscles?: string[]
  details?: ExerciseDetail
  gifUrl?: string
  isNew?: boolean
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
  sessionId?: string
  isDone?: boolean
  exerciseId?: string

  // just for editing
}
