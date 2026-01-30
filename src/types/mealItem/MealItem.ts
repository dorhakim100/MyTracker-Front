import { Item } from '../item/Item'

export interface MealItem extends Item {
  mealId?: string
  servingSize: number
  numberOfServings: number
  source?: string
}
