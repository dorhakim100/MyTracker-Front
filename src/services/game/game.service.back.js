import { httpService } from '../http.service'
import { makeId } from '../util.service'

const KEY = 'item'

export const gameService = {
  query,
  getById,
  save,
  remove,
  getEmptyItem,
  getDefaultFilter,
  getMaxPage,
}

async function query(
  filterBy = {
    txt: '',
    maxPrice: 0,
    sortDir: '',
    types: [],
    pageIdx: 0,
    isAll: false,
  }
) {
  try {
    const items = await httpService.get(KEY, filterBy)

    return items
  } catch (err) {
    // // console.log(err)
    throw err
  }
}

async function getById(itemId, filter) {
  try {
    const res = await httpService.get(`${KEY}/${itemId}`, filter)
    return res
  } catch (err) {
    // // console.log(err)
    throw err
  }
}

async function remove(itemId) {
  try {
    return await httpService.delete(`${KEY}/${itemId}`)
  } catch (err) {
    // // console.log(err)
    throw err
  }
}
async function save(item) {
  try {
    var savedItem
    if (item._id) {
      savedItem = await httpService.put(`${KEY}/${item._id}`, item)
    } else {
      savedItem = await httpService.post(KEY, item)
    }
    return savedItem
  } catch (err) {
    // // console.log(err)
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
    var items = await query({ ...filterBy, isAll: true })

    let maxPage = items.length / PAGE_SIZE
    maxPage = Math.ceil(maxPage)
    return maxPage
  } catch (err) {
    // // console.log(err)
  }
}
