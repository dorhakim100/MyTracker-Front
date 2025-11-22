import { Workout } from './Workout'

export interface SessionDay {
  _id?: string
  date: string
  workoutId: string
  workout: Workout
}
