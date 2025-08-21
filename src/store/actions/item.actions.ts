import { itemService } from '../../services/item/item.service'
import { store } from '../store'
import { SET_ITEMS, SET_ITEM, SET_ITEM_FILTER } from '../reducers/item.reducer'
import { ItemFilter } from '../../types/itemFilter/ItemFilter'
import { Item } from '../../types/item/Item'

export async function loadItems(filterBy: ItemFilter): Promise<Item[]> {
  try {
    const items = await itemService.query(filterBy)
    store.dispatch(getCmdSetItems(items))
    store.dispatch({ type: SET_ITEM_FILTER, filter: filterBy })
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

function getCmdSetItems(items: Item[]) {
  return {
    type: SET_ITEMS,
    items,
  }
}

function getCmdSetItem(item: Item) {
  return {
    type: SET_ITEM,
    item,
  }
}
