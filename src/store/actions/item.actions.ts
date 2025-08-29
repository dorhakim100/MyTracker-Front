import { itemService } from '../../services/item/item.service'
import { store } from '../store'
import {
  SET_ITEMS,
  SET_ITEM,
  SET_EDIT_MEAL_ITEM,
  SET_SELECTED_MEAL,
} from '../reducers/item.reducer'
import { Item } from '../../types/item/Item'
import { Log } from '../../types/log/Log'

export async function loadItems(): Promise<Item[]> {
  try {
    const items = await itemService.query()
    store.dispatch(getCmdSetItems(items))
    // store.dispatch({ type: SET_ITEM_FILTER, filter: filterBy })
    return items
  } catch (err) {
    throw err
  }
}

export function setItem(item: Item) {
  store.dispatch(getCmdSetItem(item))
}

export async function loadItem(itemId: string): Promise<Item> {
  try {
    const item = await itemService.getById(itemId)
    store.dispatch(getCmdSetItem(item))
    return item
  } catch (err) {
    throw err
  }
}

export function setEditMealItem(editMealItem: Log | null) {
  store.dispatch(getCmdSetEditMealItem(editMealItem))
}

export function setSelectedMeal(selectedMeal: string | null) {
  store.dispatch(getCmdSetSelectedMeal(selectedMeal))
}

function getCmdSetItems(items: Item[]) {
  return {
    type: SET_ITEMS,
    items,
  }
}

function getCmdSetEditMealItem(editMealItem: Log | null) {
  return {
    type: SET_EDIT_MEAL_ITEM,
    editMealItem,
  }
}

function getCmdSetItem(item: Item) {
  return {
    type: SET_ITEM,
    item,
  }
}

function getCmdSetSelectedMeal(selectedMeal: string | null) {
  return {
    type: SET_SELECTED_MEAL,
    selectedMeal,
  }
}
