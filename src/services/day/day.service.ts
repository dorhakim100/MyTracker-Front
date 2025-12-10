import { httpService } from '../http.service'
import { makeId } from '../util.service'
import { LoggedToday } from '../../types/loggedToday/LoggedToday'

const KEY = 'day'

export const dayService = {
  query,
  getById,
  save,
  remove,
  getEmptyDay,
  getDefaultFilter,
  // getMaxPage,
}

async function query(filterBy: any) {
  try {
    const items = await httpService.get(KEY, filterBy)

    return items
  } catch (err) {
    throw err
  }
}

async function getById(dayId: string, filter: any) {
  try {
    const res = await httpService.get(`${KEY}/${dayId}`, filter)
    return res
  } catch (err) {
    throw err
  }
}

async function remove(dayId: string) {
  try {
    return await httpService.delete(`${KEY}/${dayId}`, null)
  } catch (err) {
    throw err
  }
}
async function save(day: LoggedToday) {
  try {
    let savedDay
    if (day._id) {
      savedDay = await httpService.put(`${KEY}/${day._id}`, day)
    } else {
      savedDay = await httpService.post(KEY, day)
    }
    return savedDay
  } catch (err) {
    throw err
  }
}

function getEmptyDay() {
  return {
    _id: makeId(),
    date: '',
    logs: [],
    calories: 0,
  }
}

function getDefaultFilter() {
  return {
    userId: '',
    date: '',
  }
}
