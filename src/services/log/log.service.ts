import { httpService } from '../http.service'
import { makeId } from '../util.service'
import { Log } from '../../types/log/Log'

const KEY = 'log'

export const logService = {
  query,
  getById,
  save,
  remove,
  getEmptyLog,
  getDefaultFilter,
  // getMaxPage,
}

async function query(
  filterBy = {
    userId: '',
    date: '',
  }
) {
  try {
    const items = await httpService.get(KEY, filterBy)

    return items
  } catch (err) {
    throw err
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getById(logId: string, filter: any) {
  try {
    const res = await httpService.get(`${KEY}/${logId}`, filter)
    return res
  } catch (err) {
    throw err
  }
}

async function remove(logId: string) {
  try {
    return await httpService.delete(`${KEY}/${logId}`, null)
  } catch (err) {
    throw err
  }
}
async function save(log: Log) {
  try {
    let savedLog
    if (log._id) {
      savedLog = await httpService.put(`${KEY}/${log._id}`, log)
    } else {
      savedLog = await httpService.post(KEY, log)
    }
    return savedLog
  } catch (err) {
    throw err
  }
}

function getEmptyLog() {
  return {
    _id: makeId(),
    itemId: '',
    searchId: '',
    meal: '',
    macros: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    time: 0,
    name: '',
    servingSize: 0,
    numberOfServings: 0,
    image: '',
    source: '',
  }
}

function getDefaultFilter() {
  return {
    userId: '',
    date: '',
  }
}
