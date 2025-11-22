export interface Exercise {
  name: string
  muscleGroups: string[]
  image: string
  equipment: string[]
  exerciseId: string
  details?: ExerciseDetail
}

export interface ExerciseDetail {
  actualSets?: Set[]
  sets: ExpectedActual
  rpe: ExpectedActual
  weight: ExpectedActual
  reps: ExpectedActual
  notes?: Notes
}

export interface Set {
  reps: number
  weight: number
}

interface ExpectedActual {
  expected: number
  actual: number
}

interface Notes {
  expected: string
  actual: string
}
