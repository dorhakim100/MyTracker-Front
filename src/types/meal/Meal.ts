import { Macros } from '../macros/Macros'

export interface Meal {
  _id: string
  name: string
  items: string[]
  macros: Macros
}
