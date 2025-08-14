import { Goal } from '../goal/Goal'

export interface User {
  _id: string

  fullname: string

  email: string
  password?: string
  imgUrl?: string

  goals: Goal[]
}
