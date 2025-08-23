import axios from 'axios'
import { SearchQuery } from '../../types/searchQuery/SearchQuery'
import { searchTypes } from '../../assets/config/search-types'
import { calculateCaloriesFromMacros } from '../macros/macros.service'

const OPEN_FOOD_FACTS_API_URL = 'https://world.openfoodfacts.org/cgi/search.pl'
const USDA_API_URL = 'https://api.nal.usda.gov/fdc/v1/foods/search'

const DEFAULT_IMAGE = 'https://cdn-icons-png.flaticon.com/512/5235/5235253.png'

const USDA_API_KEY = import.meta.env.VITE_USDA_API_KEY

const PAGE = 1
const SIZE = 20
const FIELDS =
  'product_name,brands,code,serving_size,nutriments,image_small_url'
const LC = 'he'
const CC = 'il'

export const searchService = {
  search,
}

async function search(query: SearchQuery) {
  try {
    const { txt, source, favoriteItems } = query
    let res

    if (favoriteItems) {
      // const favoriteFoods = favoriteItems.food || []
      // const favoriteProducts = favoriteItems.product || []
    }

    switch (source) {
      case searchTypes.openFoodFacts:
        res = await searchOpenFoodFacts(txt)
        break
      case searchTypes.usda:
        res = await searchRawUSDA(txt)
        break
    }
    // console.log(res)
    return res
  } catch (err) {
    console.error(err)
    throw err
  }
}

async function searchOpenFoodFacts(query: string) {
  try {
    const { data } = await axios.get(OPEN_FOOD_FACTS_API_URL, {
      params: {
        search_terms: query,
        search_simple: 1,
        action: 'process',
        json: 1,
        page: PAGE,
        page_size: SIZE,
        fields: FIELDS,
        lc: LC,
        cc: CC,
        countries_tags_en: 'Israel',
        sort_by: 'popularity_key',
      },
      headers: { 'User-Agent': 'MyTracker/1.0 (you@example.com)' },
    })
    console.log(data.products[0])
    return data.products.map((product: any) => ({
      searchId: product.code,
      name: product.brands
        ? `${product.product_name} - ${product.brands}`
        : product.product_name,
      macros: {
        calories:
          +product.nutriments['energy-kcal_100g'] ||
          +product.nutriments['energy-kcal'] ||
          calculateCaloriesFromMacros({
            protein: +product.nutriments.proteins_100g || 0,
            carbs: +product.nutriments.carbohydrates_100g || 0,
            fats: +product.nutriments.fat_100g || 0,
          }).total,
        protein: +product.nutriments.proteins_100g,
        carbs: +product.nutriments.carbohydrates_100g,
        fat: +product.nutriments.fat_100g,
      },
      image: product.image_small_url || DEFAULT_IMAGE,
      type: 'product',
    }))
  } catch (err) {
    // console.error(err)
    throw err
  }
}

async function searchRawUSDA(query: string) {
  try {
    const { data } = await axios.get(USDA_API_URL, {
      params: {
        api_key: USDA_API_KEY,
        query,
        pageSize: 10,
        dataType: 'Foundation,SR Legacy',
      },
    })

    const { foods } = data

    return foods.map((food: any) => {
      const protein = food.foodNutrients.find(
        (nutrient: any) => nutrient.nutrientName === 'Protein'
      )?.value

      const carbs = food.foodNutrients.find(
        (nutrient: any) =>
          nutrient.nutrientName === 'Carbohydrate, by difference'
      )?.value

      const fat = food.foodNutrients.find(
        (nutrient: any) => nutrient.nutrientName === 'Total lipid (fat)'
      )?.value

      const calories = calculateCaloriesFromMacros({
        protein: protein || 0,
        carbs: carbs || 0,
        fats: fat || 0,
      }).total

      return {
        searchId: food.fdcId + '',
        name: food.description,
        macros: {
          protein: protein || 0,
          carbs: carbs || 0,
          fat: fat || 0,
          calories: calories || 0,
        },
        image: DEFAULT_IMAGE,
        type: 'food',
      }
    })
  } catch (error) {
    throw error
  }
}
