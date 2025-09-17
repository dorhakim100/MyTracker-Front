import { httpService } from '../http.service'
import type { Meal } from '../../types/meal/Meal'
import { searchUrls } from '../../assets/config/search.urls'

const KEY = 'meal'

export const mealService = {
  query,
  getById,
  save,
  remove,
  getEmptyMeal,
  modifyMeal,
}

async function query(filterBy: Partial<Meal> | Record<string, unknown>) {
  try {
    const meals = await httpService.get(KEY, filterBy)
    return meals.map((meal: Meal) => modifyMeal(meal as Meal))
  } catch (err) {
    throw err
  }
}

async function getById(mealId: string) {
  try {
    const meal = await httpService.get(`${KEY}/${mealId}`, null)
    return modifyMeal(meal as Meal)
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
    return modifyMeal(saved)
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
    image: '',
  }
}

function modifyMeal(meal: Meal): Meal {
  const firstImage = meal.items.find((item) => item.image)?.image

  return {
    ...meal,
    image: firstImage || searchUrls.DEFAULT_IMAGE,
  }
}
