export interface Exercise {
  name: string
  muscleGroups: string[]
  image: string
  equipment: string[]
  exerciseId: string
  details?: ExerciseDetail
}

export interface ExerciseDetail {
  sets: {
    expected: number
    actual: number
    notes?: string
  }
  reps: {
    expected: number
    actual: number
    notes?: string
  }
  weight: {
    expected: number
    actual: number
    notes?: string
  }
  rpe: {
    expected: number
    actual: number
    notes?: string
  }
}
