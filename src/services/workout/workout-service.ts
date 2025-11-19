import { Workout } from '../../types/workout/Workout'

export const workoutService = {
  getEmptyWorkout,
}

function getEmptyWorkout(): Workout {
  return {
    name: '',
    exercises: [],
    details: '',
  }
}
