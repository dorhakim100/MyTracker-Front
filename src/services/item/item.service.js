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
  getMaxPage,

  // Search-related operations
  searchByTerm,
  hasCachedResults,
  saveSearchResults,
  clearSearchCache,
  getCachedSearchTerms,

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

async function getById(itemId, filter) {
  try {
    const res = await httpService.get(`${KEY}/${itemId}`, filter)
    return res
  } catch (err) {
    throw err
  }
}

async function remove(itemId) {
  try {
    return await httpService.delete(`${KEY}/${itemId}`)
  } catch (err) {
    throw err
  }
}

async function save(item) {
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
async function searchByTerm(searchTerm, options = {}) {
  try {
    const items = await httpService.get(`${KEY}/search`, {
      term: searchTerm,
      ...options,
    })
    return items
  } catch (err) {
    throw err
  }
}

async function hasCachedResults(searchTerm) {
  try {
    const result = await httpService.get(`${KEY}/search/check`, {
      term: searchTerm,
    })
    return result
  } catch (err) {
    throw err
  }
}

async function saveSearchResults(searchTerm, items) {
  try {
    const result = await httpService.post(`${KEY}/search`, {
      term: searchTerm,
      items: items,
    })
    return result
  } catch (err) {
    throw err
  }
}

async function clearSearchCache() {
  try {
    return await httpService.delete(`${KEY}/search/cache`)
  } catch (err) {
    throw err
  }
}

async function getCachedSearchTerms() {
  try {
    const terms = await httpService.get(`${KEY}/search/terms`)
    return terms
  } catch (err) {
    throw err
  }
}

// Item lookup operations
async function getBySearchId(searchId) {
  try {
    const item = await httpService.get(`${KEY}/search-id`, { searchId })
    return item
  } catch (err) {
    throw err
  }
}

async function searchByName(name, options = {}) {
  try {
    const items = await httpService.get(`${KEY}/search-name`, {
      name,
      ...options,
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

async function getMaxPage(filterBy) {
  const PAGE_SIZE = 20
  try {
    const items = await query({ ...filterBy, isAll: true })
    let maxPage = items.length / PAGE_SIZE
    maxPage = Math.ceil(maxPage)
    return maxPage
  } catch (err) {}
}
