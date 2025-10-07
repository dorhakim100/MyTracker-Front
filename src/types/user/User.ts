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
}

export interface UserDetails {
  fullname: string
  birthdate: number
  height: number
  gender: Gender
  imgUrl: string
  activity: ActivityLevel
}
