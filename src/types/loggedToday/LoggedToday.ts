import { Log } from '../log/Log'

export interface LoggedToday {
  _id?: string
  date: string
  logs: Log[]
  calories: number
}
