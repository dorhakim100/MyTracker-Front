import { httpService } from '../http.service'
import type { Meal } from '../../types/meal/Meal'

const KEY = 'meal'

export const mealService = {
  query,
  getById,
  save,
  remove,
  getEmptyMeal,
}

async function query(filterBy: Partial<Meal> | Record<string, unknown>) {
  try {
    const meals = await httpService.get(KEY, filterBy)
    return meals as Meal[]
  } catch (err) {
    throw err
  }
}

async function getById(mealId: string) {
  try {
    const meal = await httpService.get(`${KEY}/${mealId}`, null)
    return meal as Meal
  } catch (err) {
    throw err
  }
}

async function remove(mealId: string) {
  try {
    return await httpService.delete(`${KEY}/${mealId}`, null)
  } catch (err) {
    throw err
  }
}

async function save(meal: Meal | Partial<Meal>) {
  try {
    let saved: Meal
    if (meal._id) {
      saved = await httpService.put(`${KEY}/${meal._id}`, meal)
    } else {
      saved = await httpService.post(KEY, meal)
    }
    return saved
  } catch (err) {
    throw err
  }
}

function getEmptyMeal(): Partial<Meal> {
  return {
    _id: '',
    name: '',
    items: [],
    macros: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    },
  }
}
