export type WeekMode = 'thisWeek' | 'last7'

export type DistributionTimeframe = 'thisWeek' | '7d' | '30d' | 'year' | 'all'

export interface WeekDay {
  date: string
  isToday: boolean
  isFuture: boolean
  hasWorkout: boolean
}

export interface WeekRecord {
  type: 'weight' | 'volume'
  exerciseId: string
  name: string
  image?: string
  current: number
}

export interface WeekSummary {
  mode: WeekMode
  days: WeekDay[]
  done: number
  target: number
  records: WeekRecord[]
}

export interface DistributionRoutine {
  id: string
  name: string
}

export interface DistributionExercise {
  exerciseId: string
  name: string
  image?: string
  sets: number
  volume: number
}

export interface DistributionSlice {
  sets: number
  volume: number
  routineCount: number
  exerciseCount: number
  routines: DistributionRoutine[]
  exercises: DistributionExercise[]
}

export interface DistributionGroup extends DistributionSlice {
  id: string
}

export interface DistributionPreviousGroup {
  id: string
  sets: number
}

export interface DistributionSummary {
  timeframe: DistributionTimeframe
  groups: DistributionGroup[]
  total: DistributionSlice
  previous: {
    groups: DistributionPreviousGroup[]
  } | null
}
