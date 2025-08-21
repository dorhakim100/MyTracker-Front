import { Macros } from '../macros/Macros'

export interface Item {
  _id: string
  title: string
  //   categories: string[]
  images: string[]
  macros: Macros
}
