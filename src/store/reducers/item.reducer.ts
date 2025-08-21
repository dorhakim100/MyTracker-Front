import { itemService } from '../../services/item/item.service'

import { Item } from '../../types/item/Item'
import { ItemFilter } from '../../types/itemFilter/ItemFilter'

export const SET_ITEMS = 'SET_ITEMS'
export const SET_ITEM = 'SET_ITEM'
export const SET_ITEM_FILTER = 'SET_ITEM_FILTER'

export interface ItemState {
  items: Item[]
  item: Item
  filter: ItemFilter
  lastRemovedItem?: Item
}

const initialState: ItemState = {
  items: [],
  item: itemService.getEmptyItem(),
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
    case SET_ITEM_FILTER:
      newState = { ...state, filter: action.filter }
      break
    default:
  }
  return newState
}
