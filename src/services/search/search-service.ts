import axios from 'axios'
//import { storageService } from '../async-storage.service'
import { indexedDbService } from '../indexeddb.service'
import { SearchFilter } from '../../types/searchFilter/SearchFilter'
import { searchTypes } from '../../assets/config/search-types'
import { calculateCaloriesFromMacros } from '../macros/macros.service'
import { Item } from '../../types/item/Item'
import { User } from '../../types/user/User'
import { searchUrls } from '../../assets/config/search.urls'
import { openFoodFactsQueryingParams } from '../../assets/config/querying.opp.params'
import type { OFFProduct } from '../../types/openFoodFacts/OFFProduct'
import type { FDCFood } from '../../types/usda/FDCFood'
import type { FDCNutrient } from '../../types/usda/FDCNutrient'
import { cache } from '../../assets/config/cache'
import { Log } from '../../types/log/Log'
import { sourceTypes } from '../../assets/config/source.types'
import { translateService } from '../translate/translate.service'
import { imageService } from '../image/image.service'
const {
  OPEN_FOOD_FACTS_API_URL,
  OPEN_FOOD_FACTS_API_URL_BY_ID,
  OPEN_FOOD_FACTS_BATCH_URL,
  USDA_API_URL,
  USDA_FOODS_URL,
  DEFAULT_IMAGE,
} = searchUrls
const { PAGE, SIZE, FIELDS, LC, CC } = openFoodFactsQueryingParams
const { FAVORITE_CACHE, ITEMS_CACHE } = cache
const USDA_API_KEY = import.meta.env.VITE_USDA_API_KEY

export const searchService = {
  search,
  searchBulkIds,
  searchById,
  getProductsByIds,
  getFoodsByIds,
  isFavorite,
  addToCache,
  removeFromCache,
  searchFavoriteItems,
  handleResSorting,
  handleImageError,
}

const LONGEST_FOOD_ID_LENGTH = 10

// await Promise.all(
//   Object.values(cache).map((storeName) => indexedDbService.clear(storeName))
// )

async function search(filter: SearchFilter) {
  try {
    const { txt, favoriteItems } = filter
    let res: Item[] = []
    // const { food, product } = favoriteItems || { food: [], product: [] }
    // const isFavoriteItems = food.length > 0 || product.length > 0

    if (!txt && favoriteItems && favoriteItems.length > 0) {
      res = await searchFavoriteItems(favoriteItems)
      return res
    }

    const safeTxt = txt ?? ''

    const isEnglishWord = translateService.isEnglishWord(safeTxt)
    let translatedTxt = ''

    if (!isEnglishWord) {
      translatedTxt = await translateService.translate(safeTxt)
    } else translatedTxt = safeTxt

    let cachedRes = await indexedDbService.query<Item>(translatedTxt, 0)

    if (cachedRes.length > 0) {
      cachedRes = filterDuplicates(cachedRes)
      cachedRes = handleResSorting(
        cachedRes,
        safeTxt,
        favoriteItems,
        translatedTxt
      )
      return cachedRes
    }

    // Fetch both sources in parallel, tolerate failures
    const [offRes, usdaRes, offResTranslated, usdaResTranslated] =
      await Promise.allSettled([
        searchOpenFoodFacts(safeTxt),
        searchRawUSDA(safeTxt),
        searchOpenFoodFacts(translatedTxt),
        searchRawUSDA(translatedTxt),
      ])

    const openFoodFacts: Item[] =
      offRes.status === 'fulfilled' ? offRes.value : []
    const usda: Item[] = usdaRes.status === 'fulfilled' ? usdaRes.value : []

    const openFoodFactsTranslated: Item[] =
      offResTranslated.status === 'fulfilled' ? offResTranslated.value : []
    const usdaTranslated: Item[] =
      usdaResTranslated.status === 'fulfilled' ? usdaResTranslated.value : []

    res = [
      ...openFoodFacts,
      ...openFoodFactsTranslated,
      ...usda,
      ...usdaTranslated,
    ]

    res = filterDuplicates(res)

    if (res.length > 0) {
      res.forEach((item) => {
        addToCache(item as Item, translatedTxt)
        addToCache(item as Item, ITEMS_CACHE)
      })
    }

    res = handleResSorting(res, safeTxt, favoriteItems, translatedTxt)

    return res
  } catch (err) {
    console.error(err)
    throw err
  }
}

function handleResSorting(
  res: Item[],
  txt: string,
  favoriteItems: string[] = [],
  translatedTxt: string = ''
) {
  return res.sort(
    (a, b) =>
      computeRelevanceScore(txt, b, favoriteItems, translatedTxt) -
      computeRelevanceScore(txt, a, favoriteItems, translatedTxt)
  )
}

function filterDuplicates(res: Item[]) {
  return res.filter(
    (item, index, self) =>
      index === self.findIndex((t) => t.searchId === item.searchId)
  )
}

async function searchFavoriteItems(favoriteItems: string[]) {
  try {
    const res: Item[] = []
    const cached = await indexedDbService.query<Item>(FAVORITE_CACHE, 0)

    const favoriteCopy = [...favoriteItems]

    const favoriteFoods =
      favoriteItems.filter((id) => id.length <= LONGEST_FOOD_ID_LENGTH) || []
    const favoriteProducts =
      favoriteItems.filter((id) => id.length >= LONGEST_FOOD_ID_LENGTH) || []

    if (cached && cached.length) {
      cached.forEach((item: Item) => {
        const indexToRemove = favoriteCopy.findIndex(
          (id) => id === item.searchId
        )

        if (indexToRemove !== -1) {
          favoriteCopy.splice(indexToRemove, 1)
          const indexToAdd = favoriteItems.findIndex(
            (id) => id === item.searchId
          )
          res[indexToAdd] = item

          if (favoriteFoods.includes(item.searchId as string)) {
            favoriteFoods.splice(
              favoriteFoods.indexOf(item.searchId as string),
              1,
              ''
            )
          }
          if (favoriteProducts.includes(item.searchId as string)) {
            favoriteProducts.splice(
              favoriteProducts.indexOf(item.searchId as string),
              1,
              ''
            )
          }
        }
      })
    }

    if (favoriteItems.every((id, idx) => id === res[idx]?.searchId)) return res

    const promises = [
      getFoodsByIds(favoriteFoods),
      getProductsByIds(favoriteProducts),
    ]

    const [foods, products] = await Promise.all(promises)

    foods.forEach((item) => {
      const originalIndex = favoriteItems.findIndex(
        (id) => id === item.searchId
      )
      if (originalIndex !== -1) {
        res[originalIndex] = item as Item
      }
    })
    products.forEach((item) => {
      const originalIndex = favoriteItems.findIndex(
        (id) => id === item.searchId
      )

      if (originalIndex !== -1) {
        res[originalIndex] = item as Item
      }
    })

    res.forEach((item) => {
      addToCache(item as Item, FAVORITE_CACHE)
    })
    return res
  } catch (err) {
    throw err
  }
}

async function searchBulkIds(logs: Log[]) {
  try {
    const productsIds = logs
      .filter((log) => log.source === sourceTypes.product)
      .map((log) => log.itemId)
    const foodsIds = logs
      .filter((log) => log.source === sourceTypes.food)
      .map((log) => log.itemId)

    if (!productsIds.length && !foodsIds.length) return []

    const promises = [getProductsByIds(productsIds), getFoodsByIds(foodsIds)]

    const [products, foods] = await Promise.all(promises)
    const res = [...products, ...foods]

    res.forEach((item) => {
      addToCache(item as Item, ITEMS_CACHE)
    })
    return res
  } catch (err) {
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

    if (res) {
      await addToCache(res as Item, ITEMS_CACHE)
    }

    return res
  } catch (err) {
    throw err
  }
}

async function addToCache(item: Item, key: string) {
  const cached = await indexedDbService.query<Item>(key)

  const index = cached.findIndex((i: Item) => i.searchId === item.searchId)

  if (index === -1) {
    await indexedDbService.post(key, item)
  } else {
    const itemToUpdate = {
      ...item,
      _id: cached[index]._id,
    }
    await indexedDbService.put(key, itemToUpdate)
  }
}

async function handleImageError(newItem: Item) {
  await Promise.all([
    addToCache(newItem, ITEMS_CACHE),
    addToCache(newItem, FAVORITE_CACHE),
  ])
}

async function removeFromCache(item: Item, key: string) {
  const id = item._id || item.searchId
  if (!id) throw new Error('Item not found in cache')
  const cached = await indexedDbService.query<Item>(key, 0)

  const isInCache = cached.find((i: Item) => i.searchId === id)

  if (isInCache) {
    await indexedDbService.remove(key, id)
  } // else throw new Error('Item not found in cache')
}

/* ====== Open Food Facts API ====== */

// Search for products
async function searchOpenFoodFacts(query: string) {
  if (!query || query === '') return []
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
      // headers: { 'User-Agent': 'MyTracker/1.0 (you@example.com)' },
    })

    const res = await Promise.all(
      data.products.map(async (product: OFFProduct) => {
        const proteins = Math.floor(+(product.nutriments?.proteins_100g ?? 0))
        const carbs = Math.floor(+(product.nutriments?.carbohydrates_100g ?? 0))
        const fats = Math.floor(+(product.nutriments?.fat_100g ?? 0))
        const calories = Math.floor(
          +(product.nutriments?.['energy-kcal_100g'] ?? 0) ||
            +(product.nutriments?.['energy-kcal'] ?? 0) ||
            calculateCaloriesFromMacros({ protein: proteins, carbs, fats })
              .total
        ).toFixed(0)

        if (!product.nutriments?.['energy-kcal_100g']) return null

        let image = product.image_small_url

        if (!image) {
          const isEnglishWord = translateService.isEnglishWord(
            product.product_name
          )
          let translatedTxt = product.product_name
          if (!isEnglishWord) {
            translatedTxt = await translateService.translate(translatedTxt)
          }
          image =
            (await imageService.getSingleImage(translatedTxt)) || DEFAULT_IMAGE
        }

        return {
          searchId: product.code,
          name: product.brands
            ? `${product.product_name} - ${product.brands}`
            : product.product_name,
          macros: { calories, protein: proteins, carbs, fat: fats },
          image: image,
          type: 'product',
        }
      })
    )
    return res.filter((product: OFFProduct) => product !== null)
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

    let image = product.image_small_url
    if (!image) {
      const isEnglishWord = translateService.isEnglishWord(product.product_name)
      let translatedTxt = product.product_name
      if (!isEnglishWord) {
        translatedTxt = await translateService.translate(translatedTxt)
      }

      image =
        (await imageService.getSingleImage(translatedTxt)) || DEFAULT_IMAGE
    }

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
      image: image,
      type: 'product',
    }
  } catch (err) {
    throw err
  }
}

// Get products by array of IDs
async function getProductsByIds(ids: string[]) {
  try {
    if (!ids || !ids.length) return []
    const filteredIds = ids.filter((id) => id !== '')

    if (filteredIds.length === 0) return []

    const { data } = await axios.get(OPEN_FOOD_FACTS_BATCH_URL, {
      params: {
        code: filteredIds.join(','),
        fields: FIELDS,
      },
      //headers: { 'User-Agent': 'MyTracker/1.0 (you@example.com)' },
    })

    const isEnglishWord = translateService.isEnglishWord(
      data.products[0].product_name
    )
    let translatedTxt = data.products[0].product_name

    if (!isEnglishWord) {
      translatedTxt = await translateService.translate(translatedTxt)
    }

    const images = await imageService.getImage(translatedTxt)
    let currImageIdx = 0

    const products: OFFProduct[] = data.products || []

    return products.map((product: OFFProduct) => {
      const proteins = +(product.nutriments?.proteins_100g ?? 0)
      const carbs = +(product.nutriments?.carbohydrates_100g ?? 0)
      const fats = +(product.nutriments?.fat_100g ?? 0)
      const calories =
        +(product.nutriments?.['energy-kcal_100g'] ?? 0) ||
        +(product.nutriments?.['energy-kcal'] ?? 0) ||
        calculateCaloriesFromMacros({ protein: proteins, carbs, fats }).total

      let image = product.image_small_url
      if (!image) {
        image = images[currImageIdx].webformatURL || DEFAULT_IMAGE

        currImageIdx++
      }

      return {
        searchId: product.code,
        name: product.brands
          ? `${product.product_name} - ${product.brands}`
          : product.product_name,
        macros: { calories, protein: proteins, carbs, fat: fats },
        image: image,
        type: 'product',
      }
    })
  } catch (err) {
    throw err
  }
}

/* ====== USDA API ====== */

// Search for foods
async function searchRawUSDA(query: string) {
  if (!query || query === '') return []
  try {
    const images = await imageService.getImage(query)
    let currImageIdx = 0
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

      const image = images[currImageIdx].webformatURL || DEFAULT_IMAGE
      currImageIdx++

      return {
        searchId: food.fdcId + '',
        name: food.description,
        macros,
        image: image,
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

    if (!data.foods[0]) return null

    const images = await imageService.getImage(data.foods[0].description)
    let currImageIdx = 0
    const food: FDCFood = Array.isArray(data) ? data[0] : data.foods[0]

    const macros = _getMacrosFromUSDA(food)

    const image = images[currImageIdx].webformatURL || DEFAULT_IMAGE
    currImageIdx++

    return {
      searchId: food.fdcId + '',
      name: food.description,
      macros,
      image: image,
      type: 'food',
    }
  } catch (err) {
    throw err
  }
}

// Get macros from USDA food
function _getMacrosFromUSDA(food: FDCFood) {
  // Takes care of both object structures of the USDA API
  const match = (target: string) =>
    food.foodNutrients.find(
      (n: FDCNutrient) => (n.nutrientName || n.nutrient?.name) === target
    )

  const proteinEntry = match('Protein')
  const carbsEntry = match('Carbohydrate, by difference')
  const fatEntry = match('Total lipid (fat)')

  const protein = Math.abs(
    proteinEntry?.value ?? proteinEntry?.amount ?? 0
  ) as number
  const carbs = Math.abs(carbsEntry?.value ?? carbsEntry?.amount ?? 0) as number
  const fats = Math.abs(fatEntry?.value ?? fatEntry?.amount ?? 0) as number

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

async function getFoodsByIds(ids: string[]) {
  try {
    if (!ids || !ids.length) return []
    const filteredIds = ids.filter((id) => id !== '')

    if (filteredIds.length === 0) return []
    const { data } = await axios.get(USDA_FOODS_URL, {
      params: {
        api_key: USDA_API_KEY,
        fdcIds: filteredIds.join(','),
      },
    })

    const images = await Promise.all(
      data.map(
        async (food: FDCFood) =>
          await imageService.getSingleImage(food.description)
      )
    )
    let currImageIdx = 0

    const foods: FDCFood[] = Array.isArray(data)
      ? (data as FDCFood[])
      : data.foods

    return foods.map((food: FDCFood) => {
      const macros = _getMacrosFromUSDA(food)
      const image = images[currImageIdx] || DEFAULT_IMAGE
      currImageIdx++
      return {
        searchId: food.fdcId + '',
        name: food.description,
        macros,
        image: image,
        type: 'food',
      }
    })
  } catch (err) {
    throw err
  }
}

// Utils functions related to the search service

function isFavorite(item: Item, user: User | null) {
  return user?.favoriteItems?.includes(item.searchId || '')
}

function normalizeText(s: string) {
  if (translateService.isEnglishWord(s))
    return s
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()

  return s
}
function getTokens(s: string) {
  return normalizeText(s).split(' ').filter(Boolean)
}
function computeRelevanceScore(
  query: string,
  item: Item,
  favoriteIds?: string[],
  translatedTxt: string = ''
) {
  const q = normalizeText(query)
  const name = normalizeText(item.name || '')

  const isEnglishWord = translateService.isEnglishWord(q)

  let translatedName = name

  if (!isEnglishWord) {
    translatedName = normalizeText(translatedTxt)
  }

  if (!q || !name) return 0

  let score = 0
  if (name === q) score += 100
  if (translatedName === q) score += 100

  if (name.startsWith(q)) score += 50
  if (translatedName.startsWith(q)) score += 50

  const qTokens = getTokens(q)
  const nTokens = getTokens(name)
  const translatedNTokens = getTokens(translatedName)

  const overlap = qTokens.filter((t) => nTokens.includes(t)).length
  const translatedOverlap = qTokens.filter((t) =>
    translatedNTokens.includes(t)
  ).length

  score += Math.floor((overlap / Math.max(qTokens.length, 1)) * 40) // up to +40
  score += Math.floor((translatedOverlap / Math.max(qTokens.length, 1)) * 40) // up to +40

  if (favoriteIds?.includes(item.searchId || '')) score += 20

  return score
}
