import { Macros } from '../macros/Macros'

export interface Item {
  _id: string
  name: string
  //   categories: string[]
  image?: string
  macros: Macros
}
