import { ExerciseDetail } from '../../types/exercise/Exercise'
import { Workout } from '../../types/workout/Workout'

export const workoutService = {
  getEmptyWorkout,
  getEmptyExerciseDetail,
}

function getEmptyWorkout(): Workout {
  return {
    name: '',
    exercises: [],
    muscleGroups: [],
    details: '',
  }
}

function getEmptyExerciseDetail(): ExerciseDetail {
  return {
    sets: {
      expected: 3,
      actual: 0,
    },
    reps: {
      expected: 8,
      actual: 0,
    },
    weight: {
      expected: 10,
      actual: 0,
    },
    rpe: {
      expected: 8,
      actual: 0,
    },
  }
}
