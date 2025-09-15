import { MealItem } from '../mealItem/MealItem'
import { Macros } from '../macros/Macros'

export interface Meal {
  _id: string
  name: string
  items: MealItem[]
  macros: Macros
  createdBy: string
}
