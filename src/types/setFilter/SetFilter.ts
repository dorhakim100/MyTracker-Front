export interface SetFilter {
  exerciseId?: string
  sessionId?: string
  workoutId?: string
  userId?: string
  from?: Date
  to?: Date
  skip?: number
  limit?: number
  calculation?: 'daily_volume' | 'weekly_volume'
}

