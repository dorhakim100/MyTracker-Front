import { itemService } from '../../services/item/item.service'
import { store } from '../store'
import {
  SET_ITEMS,
  SET_ITEM,
  SET_EDIT_MEAL_ITEM,
  SET_SELECTED_MEAL,
  SET_FAVORITE_ITEMS,
  ADD_FAVORITE_ITEM,
  REMOVE_FAVORITE_ITEM,
} from '../reducers/item.reducer'
import { Item } from '../../types/item/Item'
import { Log } from '../../types/log/Log'

export async function loadItems(): Promise<Item[]> {
  try {
    const items = await itemService.query()
    // console.log('items', items)
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

export function setFavoriteItems(favoriteItems: Item[]) {
  store.dispatch(getCmdSetFavoriteItems(favoriteItems))
}

export function addFavoriteItem(favoriteItem: Item) {
  store.dispatch(getCmdAddFavoriteItem(favoriteItem))
}

export function removeFavoriteItem(favoriteItem: Item) {
  store.dispatch(getCmdRemoveFavoriteItem(favoriteItem))
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

function getCmdSetFavoriteItems(favoriteItems: Item[]) {
  return {
    type: SET_FAVORITE_ITEMS,
    favoriteItems,
  }
}

function getCmdAddFavoriteItem(favoriteItem: Item) {
  return {
    type: ADD_FAVORITE_ITEM,
    favoriteItem,
  }
}

function getCmdRemoveFavoriteItem(favoriteItem: Item) {
  return {
    type: REMOVE_FAVORITE_ITEM,
    favoriteItem,
  }
}
