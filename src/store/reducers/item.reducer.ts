import { itemService } from '../../services/item/item.service'

import { Item } from '../../types/item/Item'
import { ItemFilter } from '../../types/itemFilter/ItemFilter'
import { Log } from '../../types/log/Log'

export const SET_ITEMS = 'SET_ITEMS'
export const SET_ITEM = 'SET_ITEM'
export const SET_ITEM_FILTER = 'SET_ITEM_FILTER'
export const SET_EDIT_MEAL_ITEM = 'SET_EDIT_MEAL_ITEM'
export const SET_SELECTED_MEAL = 'SET_SELECTED_MEAL'

export interface ItemState {
  items: Item[]
  item: Item
  editMealItem: Log | null
  selectedMeal: string | null
  filter: ItemFilter
  lastRemovedItem?: Item
}

const initialState: ItemState = {
  items: [],
  item: itemService.getEmptyItem(),
  selectedMeal: null,
  editMealItem: null,
  filter: itemService.getDefaultFilter(),
}

export function itemReducer(state = initialState, action: any) {
  let newState = state
  switch (action.type) {
    case SET_ITEMS:
      newState = { ...state, items: action.items }
      break
    case SET_ITEM:
      newState = { ...state, item: action.item }
      break
    case SET_EDIT_MEAL_ITEM:
      newState = { ...state, editMealItem: action.editMealItem }
      break
    case SET_SELECTED_MEAL:
      newState = { ...state, selectedMeal: action.selectedMeal }
      break
    case SET_ITEM_FILTER:
      newState = { ...state, filter: action.filter }
      break
    default:
  }
  return newState
}
