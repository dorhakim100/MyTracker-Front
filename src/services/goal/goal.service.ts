import { httpService } from '../http.service'
import { Goal } from '../../types/goal/Goal'

const KEY = 'goal'

export const goalService = {
  query,
  getById,
  save,
  remove,
  getEmptyGoal,
  getDefaultFilter,
  // getMaxPage,
}

async function query(
  filterBy = {
    userId: '',
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

async function getById(goalId: string, filter: any) {
  try {
    const res = await httpService.get(`${KEY}/${goalId}`, filter)
    return res
  } catch (err) {
    // // console.log(err)
    throw err
  }
}

async function remove(goalId: string) {
  try {
    return await httpService.delete(`${KEY}/${goalId}`, null)
  } catch (err) {
    // // console.log(err)
    throw err
  }
}
async function save(goal: Goal) {
  try {
    let savedGoal
    if (goal._id) {
      savedGoal = await httpService.put(`${KEY}/${goal._id}`, goal)
    } else {
      savedGoal = await httpService.post(KEY, goal)
    }
    return savedGoal
  } catch (err) {
    // // console.log(err)
    throw err
  }
}

function getEmptyGoal() {
  return {
    _id: '',
    isSelected: false,
    title: '',
    updatedAt: new Date().getTime(),
    dailyCalories: 2400,
    macros: { protein: 180, carbs: 300, fat: 53 },
    startDate: new Date().getTime(),
    endDate: new Date(
      new Date().getTime() + 30 * 24 * 60 * 60 * 1000
    ).getTime(), // 30 days
    target: 'maintain',
    targetWeight: 80,
  }
}

function getDefaultFilter() {
  return {
    userId: '',
  }
}

// async function getMaxPage(filterBy) {
//   const PAGE_SIZE = 20

//   try {
//     var items = await query({ ...filterBy, isAll: true })

//     let maxPage = items.length / PAGE_SIZE
//     maxPage = Math.ceil(maxPage)
//     return maxPage
//   } catch (err) {
//     // // console.log(err)
//   }
// }
