import { Workout } from './Workout'
import { Set } from '../exercise/Exercise'
import { WorkoutSet } from '../set/Set'

export interface SessionDay {
  _id?: string
  date: string
  workoutId: string
  workout: Workout
  sets: WorkoutSet[]
  seetsIds?: string[]
}
