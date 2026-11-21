import { ActivityLevel, Gender } from '../../services/bmr/bmr.service'
import { Goal } from '../goal/Goal'
import { LoggedToday } from '../loggedToday/LoggedToday'
import { Meal } from '../meal/Meal'
import { Weight } from '../weight/Weight'

export interface User {
  _id: string

  details: UserDetails

  email: string
  password?: string

  currGoal: Goal
  goals: Goal[]

  loggedToday: LoggedToday

  favoriteItems: string[]
  meals: Meal[]

  weights?: Weight[]
  lastWeight?: Weight

  isTrainer?: boolean
  trainees?: User[]
  trainersIds?: string[]

  isFixedMenu?: boolean
  activeWorkoutsCount?: number
  streaks?: UserStreaks
}

export const streakTypes = {
  steps: 'steps',
  consumed: 'consumed',
  burned: 'burned',
} as const

export type StreakType = (typeof streakTypes)[keyof typeof streakTypes]

export interface StreakStat<T extends StreakType = StreakType> {
  type: T
  count: number
  countsToday: boolean
}

export interface UserStreaks {
  steps: StreakStat<typeof streakTypes.steps>
  consumed: StreakStat<typeof streakTypes.consumed>
  burned: StreakStat<typeof streakTypes.burned>
}

export interface UserDetails {
  fullname: string
  birthdate: number
  height: number
  gender: Gender
  imgUrl: string
  activity: ActivityLevel
  dailyStepsGoal?: number
}
