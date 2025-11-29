import { Workout } from './Workout'

import { Instructions } from '../instructions/Instructions'

export interface SessionDay {
  _id?: string
  date: string
  workoutId: string
  workout: Workout
  instructions: Instructions
}
