import { Log } from '../log/Log'
import { Weight } from '../weight/Weight'

export interface LoggedToday {
  _id?: string
  date: string
  logs: Log[]
  calories: number
  weight?: Weight
}
