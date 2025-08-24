import axios from 'axios'
import { SearchFilter } from '../../types/searchFilter/SearchFilter'
import { searchTypes } from '../../assets/config/search-types'
import { calculateCaloriesFromMacros } from '../macros/macros.service'

const OPEN_FOOD_FACTS_API_URL = 'https://world.openfoodfacts.org/cgi/search.pl'
const USDA_API_URL = 'https://api.nal.usda.gov/fdc/v1/foods/search'
const OPEN_FOOD_FACTS_API_URL_BY_ID =
  'https://world.openfoodfacts.org/api/v3/product/'
const OPEN_FOOD_FACTS_BATCH_URL =
  'https://world.openfoodfacts.org/api/v2/search'
const USDA_FOODS_URL = 'https://api.nal.usda.gov/fdc/v1/foods'

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
  searchById,
  getProductsByIds,
  getFoodsByIds,
}

type OFFProduct = {
  code: string
  product_name: string
  brands?: string
  nutriments: {
    proteins_100g?: number
    carbohydrates_100g?: number
    fat_100g?: number
    ['energy-kcal_100g']?: number
    ['energy-kcal']?: number
  }
  image_small_url?: string
}

type FDCNutrient = {
  nutrientName?: string
  value?: number
  amount?: number
  nutrient?: { name?: string }
}
type FDCFood = {
  fdcId: number
  description: string
  foodNutrients: FDCNutrient[]
}

async function search(filter: SearchFilter) {
  try {
    const { txt, source, favoriteItems } = filter
    let res

    // if (!txt) return []

    if (!txt && favoriteItems) {
      const favoriteFoods = favoriteItems.food || []
      const favoriteProducts = favoriteItems.product || []

      const promises = [
        getFoodsByIds(favoriteFoods),
        getProductsByIds(favoriteProducts),
      ]

      const [foods, products] = await Promise.all(promises)
      res = [...foods, ...products]
      return res
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

async function searchById(id: string, source: string) {
  try {
    let res
    switch (source) {
      case searchTypes.openFoodFacts:
        res = await getProductById(id)
        break
      case searchTypes.usda:
        res = await getFoodById(id)
        break
    }

    return res
  } catch (err) {
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

    return data.products.map((product: OFFProduct) => {
      const proteins = +(product.nutriments?.proteins_100g ?? 0)
      const carbs = +(product.nutriments?.carbohydrates_100g ?? 0)
      const fats = +(product.nutriments?.fat_100g ?? 0)
      const calories =
        +(product.nutriments?.['energy-kcal_100g'] ?? 0) ||
        +(product.nutriments?.['energy-kcal'] ?? 0) ||
        calculateCaloriesFromMacros({ protein: proteins, carbs, fats }).total

      return {
        searchId: product.code,
        name: product.brands
          ? `${product.product_name} - ${product.brands}`
          : product.product_name,
        macros: { calories, protein: proteins, carbs, fat: fats },
        image: product.image_small_url || DEFAULT_IMAGE,
        type: 'product',
      }
    })
  } catch (err) {
    // console.error(err)
    throw err
  }
}

async function getProductById(id: string) {
  try {
    const { data } = await axios.get(
      `${OPEN_FOOD_FACTS_API_URL_BY_ID}${id}.json`
    )
    const product: OFFProduct = data.product

    return {
      searchId: product.code,
      name: product.product_name,
      macros: (() => {
        const protein = +(product.nutriments?.proteins_100g ?? 0)
        const carbs = +(product.nutriments?.carbohydrates_100g ?? 0)
        const fats = +(product.nutriments?.fat_100g ?? 0)
        const calories =
          +(product.nutriments?.['energy-kcal_100g'] ?? 0) ||
          +(product.nutriments?.['energy-kcal'] ?? 0) ||
          calculateCaloriesFromMacros({ protein, carbs, fats }).total

        return { protein, carbs, fat: fats, calories }
      })(),
      image: product.image_small_url || DEFAULT_IMAGE,
      type: 'product',
    }
  } catch (err) {
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

    return foods.map((food: FDCFood) => {
      const macros = _getMacrosFromUSDA(food)

      return {
        searchId: food.fdcId + '',
        name: food.description,
        macros,
        image: DEFAULT_IMAGE,
        type: 'food',
      }
    })
  } catch (error) {
    throw error
  }
}

async function getFoodById(id: string) {
  try {
    const { data } = await axios.get(USDA_FOODS_URL, {
      params: {
        api_key: USDA_API_KEY,
        fdcIds: id,
      },
    })
    const food: FDCFood = Array.isArray(data) ? data[0] : data.foods[0]

    const macros = _getMacrosFromUSDA(food)

    return {
      searchId: food.fdcId + '',
      name: food.description,
      macros,
      image: DEFAULT_IMAGE,
      type: 'food',
    }
  } catch (err) {
    throw err
  }
}

function _getMacrosFromUSDA(food: FDCFood) {
  const match = (target: string) =>
    food.foodNutrients.find(
      (n: FDCNutrient) => (n.nutrientName || n.nutrient?.name) === target
    )

  const proteinEntry = match('Protein')
  const carbsEntry = match('Carbohydrate, by difference')
  const fatEntry = match('Total lipid (fat)')

  const protein = (proteinEntry?.value ?? proteinEntry?.amount ?? 0) as number
  const carbs = (carbsEntry?.value ?? carbsEntry?.amount ?? 0) as number
  const fats = (fatEntry?.value ?? fatEntry?.amount ?? 0) as number

  const calories = calculateCaloriesFromMacros({
    protein,
    carbs,
    fats,
  }).total

  return {
    protein,
    carbs,
    fat: fats,
    calories,
  }
}

async function getProductsByIds(ids: string[]) {
  try {
    if (!ids || !ids.length) return []
    const { data } = await axios.get(OPEN_FOOD_FACTS_BATCH_URL, {
      params: {
        code: ids.join(','),
        fields: FIELDS,
      },
      headers: { 'User-Agent': 'MyTracker/1.0 (you@example.com)' },
    })

    const products: OFFProduct[] = data.products || []

    return products.map((product: OFFProduct) => {
      const proteins = +(product.nutriments?.proteins_100g ?? 0)
      const carbs = +(product.nutriments?.carbohydrates_100g ?? 0)
      const fats = +(product.nutriments?.fat_100g ?? 0)
      const calories =
        +(product.nutriments?.['energy-kcal_100g'] ?? 0) ||
        +(product.nutriments?.['energy-kcal'] ?? 0) ||
        calculateCaloriesFromMacros({ protein: proteins, carbs, fats }).total

      return {
        searchId: product.code,
        name: product.brands
          ? `${product.product_name} - ${product.brands}`
          : product.product_name,
        macros: { calories, protein: proteins, carbs, fat: fats },
        image: product.image_small_url || DEFAULT_IMAGE,
        type: 'product',
      }
    })
  } catch (err) {
    throw err
  }
}

async function getFoodsByIds(ids: string[]) {
  try {
    if (!ids || !ids.length) return []
    const { data } = await axios.get(USDA_FOODS_URL, {
      params: {
        api_key: USDA_API_KEY,
        fdcIds: ids.join(','),
      },
    })

    const foods: FDCFood[] = Array.isArray(data)
      ? (data as FDCFood[])
      : data.foods

    return foods.map((food: FDCFood) => {
      const macros = _getMacrosFromUSDA(food)
      return {
        searchId: food.fdcId + '',
        name: food.description,
        macros,
        image: DEFAULT_IMAGE,
        type: 'food',
      }
    })
  } catch (err) {
    throw err
  }
}
