import { Workout } from './Workout'

export interface SessionDay extends Workout {
  date: string
  workoutId: string
}
