// import { storageService } from '../async-storage.service'
import { makeId } from '../util.service'
import { indexedDbService } from '../indexeddb.service'

import { ItemFilter } from '../../types/itemFilter/ItemFilter'
import { Item } from '../../types/item/Item'
import { cache } from '../../assets/config/cache'
import { Meal } from '../../types/meal/Meal'
import { MealItem } from '../../types/mealItem/MealItem'
import { searchUrls } from '../../assets/config/search.urls'

const STORAGE_KEY = cache.ITEMS_CACHE

// const PAGE_SIZE = 20

export const itemService = {
  query,
  getById,
  remove,
  getEmptyItem,
  getDefaultFilter,
  isItem,
  convertMealToItem,
  // getMaxPage,
}

async function query(): Promise<Item[]> {
  try {
    const items: Item[] = await indexedDbService.query(STORAGE_KEY)

    return items
  } catch (err) {
    throw err
  }
}

function getById(itemId: string): Promise<Item> {
  try {
    return indexedDbService.get(STORAGE_KEY, itemId)
  } catch (error) {
    throw error
  }
}

async function remove(itemId: string) {
  try {
    await indexedDbService.remove(STORAGE_KEY, itemId)
  } catch (error) {
    throw error
  }
}

function isItem(value: Item | Partial<Item> | null | undefined): value is Item {
  if (!value) return false
  const candidate = value as Item
  const hasName = typeof candidate.name === 'string'
  const hasMacros =
    typeof candidate.macros === 'object' && candidate.macros !== null
  const hasType = typeof candidate.type === 'string'
  return hasName && hasMacros && hasType
}

function getEmptyItem(): Item {
  return {
    _id: makeId(),
    name: '',
    searchId: '',
    image: '',
    macros: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    type: '',
  }
}

function getDefaultFilter(): ItemFilter {
  return {
    txt: '',
    sortDir: 1,
    pageIdx: 0,
    isAll: false,
  }
}

function convertMealToItem(meal: Meal): Item {
  const mealAsItem: Item & { items: MealItem[] } = {
    _id: meal._id,
    name: meal.name,
    macros: meal.macros,
    type: 'meal',
    items: meal.items,
    image: searchUrls.DEFAULT_IMAGE,
  }
  return mealAsItem
}

// async function getMaxPage(filterBy: ItemFilter): Promise<number | undefined> {
//   try {
//     const items = await query({ ...filterBy, isAll: true })
//     let maxPage = items.length / PAGE_SIZE
//     maxPage = Math.ceil(maxPage)
//     return maxPage
//   } catch (err) {
//     // noop
//   }
// }
