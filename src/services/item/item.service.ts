import { storageService } from '../async-storage.service'
import { makeId } from '../util.service'

import { ItemFilter } from '../../types/itemFilter/ItemFilter'
import { Item } from '../../types/item/Item'

const STORAGE_KEY = 'item'
const PAGE_SIZE = 20

export const itemService = {
  query,
  getById,
  remove,
  getEmptyItem,
  getDefaultFilter,
  getMaxPage,
}

async function query(
  filterBy: ItemFilter = { txt: '', sortDir: 0, pageIdx: 0, isAll: false }
): Promise<Item[]> {
  try {
    let items: Item[] = await storageService.query(STORAGE_KEY)
    const { txt, sortDir, pageIdx, isAll } = filterBy

    if (isAll) return items

    if (txt) {
      const regex = new RegExp(txt, 'i')
      items = items.filter((item: Item) => regex.test(item.name))
    }

    if (sortDir) {
      items.sort((a: Item, b: Item) => a.name.localeCompare(b.name) * sortDir)
    }

    if (pageIdx !== undefined) {
      const startIdx = pageIdx * PAGE_SIZE
      items = items.slice(startIdx, startIdx + PAGE_SIZE)
    }

    return items
  } catch (err) {
    throw err
  }
}

function getById(itemId: string): Promise<Item> {
  try {
    return storageService.get(STORAGE_KEY, itemId)
  } catch (error) {
    throw error
  }
}

async function remove(itemId: string) {
  try {
    await storageService.remove(STORAGE_KEY, itemId)
  } catch (error) {
    throw error
  }
}

function getEmptyItem(): Item {
  return {
    _id: makeId(),
    name: '',
    image: '',
    macros: { calories: 0, protein: 0, carbs: 0, fat: 0 },
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

async function getMaxPage(filterBy: ItemFilter): Promise<number | undefined> {
  try {
    const items = await query({ ...filterBy, isAll: true })
    let maxPage = items.length / PAGE_SIZE
    maxPage = Math.ceil(maxPage)
    return maxPage
  } catch (err) {
    // noop
  }
}
