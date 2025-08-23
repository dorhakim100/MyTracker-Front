import { Macros } from '../macros/Macros'

export interface Item {
  _id?: string
  name: string
  searchId?: string
  //   categories: string[]
  image?: string
  macros: Macros
  type: 'food' | 'product'
}
