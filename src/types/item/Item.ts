import { Macros } from '../macros/Macros'
import { MealItem } from '../mealItem/MealItem'
import { ItemName } from './LocalizedName'

export interface Item {
  _id?: string
  name: ItemName
  searchId?: string
  image?: string
  macros: Macros
  type: 'food' | 'product' | 'meal' | 'custom' | ''
  items?: MealItem[]
  popularity?: number
  isCurated?: boolean
  searchTerms?: string[]
  categories?: string[]
}
