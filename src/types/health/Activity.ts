export type ActivityMetric = 'steps' | 'calories'
export type ActivityFrame = 'week' | 'month' | 'quarter' | 'year'
export type ActivityVendor = 'google' | 'native'
export type GoalTarget = 'lose' | 'maintain' | 'gain'
export type ActivityTag = GoalTarget | 'steps' | 'burned'

export type ActivityBar = {
  start: string
  end: string
  value: number
  goalHit: boolean
  logged?: boolean
  goal?: number
  target?: GoalTarget | null
  rangeLow?: number
  rangeHigh?: number
}

export type ActivityPage = {
  metric: ActivityMetric
  frame: ActivityFrame
  start: string
  end: string
  goal: number
  target?: GoalTarget | null
  axisHeight: number
  average: number
  goalDays: number
  total: number
  streak: number
  liveStreak: number
  canGoPrevious: boolean
  canGoNext: boolean
  canGoCurrent: boolean
  bars: ActivityBar[]
  cards: ActivityBar[]
}

export type ActivityDayInput = {
  date: string
  steps: number
  calories: number
}
