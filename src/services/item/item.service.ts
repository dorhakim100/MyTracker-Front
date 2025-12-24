import { httpService } from '../http.service'
import { makeId } from '../util.service'

import { Item } from '../../types/item/Item'
import { ItemFilter } from '../../types/itemFilter/ItemFilter'

const KEY = 'item'

export const itemService = {
  // Main CRUD operations
  query,
  getById,
  save,
  remove,
  getEmptyItem,
  getDefaultFilter,

  // Search-related operations
  searchByTerm,
  hasCachedResults,
  saveSearchResults,
  clearSearchCache,
  getCachedSearchTerms,
  getBulkBySearchIds,

  // Item lookup operations
  getBySearchId,
  searchByName,
}

// Main CRUD operations
async function query(
  filterBy = { txt: '', sortDir: '', pageIdx: 0, isAll: false }
) {
  try {
    const items = await httpService.get(KEY, filterBy)
    return items
  } catch (err) {
    throw err
  }
}

async function getById(itemId: string, filter: ItemFilter) {
  try {
    const res = await httpService.get(`${KEY}/${itemId}`, filter)
    return res
  } catch (err) {
    throw err
  }
}

async function remove(itemId: string) {
  try {
    return await httpService.delete(`${KEY}/${itemId}`, null)
  } catch (err) {
    throw err
  }
}

async function save(item: Item) {
  try {
    let savedItem
    if (item._id) {
      savedItem = await httpService.put(`${KEY}/${item._id}`, item)
    } else {
      savedItem = await httpService.post(KEY, item)
    }
    return savedItem
  } catch (err) {
    throw err
  }
}

// Search-related operations
async function searchByTerm(searchTerm: string) {
  try {
    const items = await httpService.get(`${KEY}/search`, {
      searchTerm,
    })
    return items
  } catch (err) {
    throw err
  }
}

async function hasCachedResults(searchTerm: string) {
  try {
    const result = await httpService.get(`${KEY}/search/check`, {
      searchTerm,
    })
    return result
  } catch (err) {
    throw err
  }
}

async function saveSearchResults(searchTerm: string, items: Item[]) {
  try {
    const result = await httpService.post(`${KEY}/search`, {
      searchTerm,
      items,
    })
    return result
  } catch (err) {
    throw err
  }
}

async function clearSearchCache() {
  try {
    return await httpService.delete(`${KEY}/search/cache`, null)
  } catch (err) {
    throw err
  }
}

async function getBulkBySearchIds(searchIds: string[]) {
  try {
    const items = await httpService.get(`${KEY}/search-id/bulk`, { searchIds })
    return items
  } catch (err) {
    throw err
  }
}
async function getCachedSearchTerms() {
  try {
    const terms = await httpService.get(`${KEY}/search/terms`, null)
    return terms
  } catch (err) {
    throw err
  }
}

// Item lookup operations
async function getBySearchId(searchId: string) {
  try {
    const item = await httpService.get(`${KEY}/search-id`, { searchId })
    return item
  } catch (err) {
    throw err
  }
}

async function searchByName(name: string) {
  try {
    const items = await httpService.get(`${KEY}/search-name`, {
      name,
    })
    return items
  } catch (err) {
    throw err
  }
}

function getEmptyItem() {
  return {
    _id: makeId(),
    name: '',
    image: '',
    macros: { calories: 0, protein: 0, carbs: 0, fat: 0 },
  }
}

function getDefaultFilter() {
  return {
    txt: '',
    sortDir: '',
    pageIdx: 0,
  }
}
