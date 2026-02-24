import { Macros } from '../macros/Macros'

export interface Log {
  _id?: string
  itemId: string | undefined
  searchId?: string
  meal: string
  macros: Macros
  time: number
  image?: string
  name?: string
  servingSize?: number
  numberOfServings?: number
  source?: string
  mealId?: string
  isFixedMenuLog?: boolean
}
