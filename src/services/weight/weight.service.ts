import { httpService } from '../http.service'
import type { Weight, WeightFilter } from '../../types/weight/Weight'

const KEY = 'weight'

export const weightService = {
  query,
  getById,
  save,
  remove,
  getEmpty,
  getDefaultFilter,
}

async function query(filterBy: WeightFilter = {}) {
  try {
    return await httpService.get(KEY, filterBy)
  } catch (err) {
    throw err
  }
}

async function getById(weightId: string) {
  try {
    return await httpService.get(`${KEY}/${weightId}`, null)
  } catch (err) {
    throw err
  }
}

async function save(weight: Weight | Partial<Weight>) {
  try {
    if (weight._id) {
      return await httpService.put(`${KEY}/${weight._id}`, weight)
    } else {
      return await httpService.post(KEY, weight)
    }
  } catch (err) {
    throw err
  }
}

async function remove(weightId: string) {
  try {
    return await httpService.delete(`${KEY}/${weightId}`, null)
  } catch (err) {
    throw err
  }
}

function getEmpty(partials?: Partial<Weight>): Weight {
  const nowIso = new Date().toISOString()
  return {
    userId: '',
    createdAt: nowIso,
    kg: 0,
    note: '',
    ...partials,
  }
}

function getDefaultFilter(): WeightFilter {
  const todayIso = new Date().toISOString().split('T')[0]
  return {
    fromDate: todayIso,
    toDate: todayIso,
    limit: 30,
  }
}
