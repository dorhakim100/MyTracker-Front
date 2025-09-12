import { Goal } from '../goal/Goal'
import { LoggedToday } from '../loggedToday/LoggedToday'
import { Meal } from '../meal/Meal'

export interface User {
  _id: string

  fullname: string

  email: string
  password?: string
  imgUrl?: string

  currGoal: Goal
  goals: Goal[]

  loggedToday: LoggedToday
  // favoriteItems: {
  //   food: string[]
  //   product: string[]
  // }

  favoriteItems: string[]
  meals: Meal[]
}
