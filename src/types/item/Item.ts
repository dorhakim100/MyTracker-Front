import { Macros } from '../macros/Macros'
import { MealItem } from '../mealItem/MealItem'

export interface Item {
  _id?: string
  name: string
  searchId?: string
  //   categories: string[]
  image?: string
  macros: Macros
  type: 'food' | 'product' | 'meal' | 'custom' | ''
  items?: MealItem[] // for meal type
}
