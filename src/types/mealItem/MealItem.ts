import { Item } from '../item/Item'

export interface MealItem extends Item {
  servingSize: number
  numberOfServings: number
}
