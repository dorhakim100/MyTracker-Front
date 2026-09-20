import { searchTypes } from '../../assets/config/search-types'
import { Item } from '../../types/item/Item'
import { MealItem } from '../../types/mealItem/MealItem'
import {
  AiLogEstimate,
  AiLogLine,
  averageGrams,
  scaleMacros,
  servingsFromGrams,
} from '../../types/aiLog/AiLog'
import { Macros } from '../../types/macros/Macros'
import { itemNameService } from '../item/item-name.service'

function lineToMealItem(line: AiLogLine): MealItem {
  const grams = averageGrams(line.gramsMin, line.gramsMax)
  const numberOfServings = servingsFromGrams(grams)
  const macros = scaleMacros(line.per100g, 100 * numberOfServings)
  const catalog = line.item

  return {
    ...(catalog || {}),
    name: catalog?.name || { default: line.name },
    image: catalog?.image,
    macros,
    type: catalog?.type || 'custom',
    searchId: catalog?.searchId,
    categories: catalog?.categories,
    unit: catalog?.unit,
    servingSize: 100,
    numberOfServings,
    source:
      line.source === 'catalog'
        ? catalog?.type || searchTypes.usda
        : searchTypes.custom,
  }
}

function sumMacros(items: MealItem[]): Macros {
  return items.reduce(
    (acc, item) => ({
      calories: acc.calories + (item.macros?.calories || 0),
      protein: acc.protein + (item.macros?.protein || 0),
      carbs: acc.carbs + (item.macros?.carbs || 0),
      fat: acc.fat + (item.macros?.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )
}

export function estimateToItem(estimate: AiLogEstimate): Item {
  const name = itemNameService.toLocalizedName(estimate.name)

  if (estimate.mode === 'meal') {
    const items = estimate.items.map(lineToMealItem)
    return {
      name,
      image: estimate.imageUrl,
      macros: sumMacros(items),
      type: 'meal',
      items,
    }
  }

  const line = estimate.items[0]
  const per100g = line?.per100g || {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  }

  return {
    name,
    image: estimate.imageUrl,
    macros: per100g,
    type: 'custom',
    unit: 'g',
    items: undefined,
    searchId: undefined,
  }
}

export function estimateToServingSize(_estimate: AiLogEstimate) {
  return 100
}

export function matchAiLine(
  item: Item | MealItem | null | undefined,
  estimate: AiLogEstimate | null | undefined
): AiLogLine | null {
  if (!item || !estimate?.items?.length) return null
  if (item.type === 'meal' || item.items?.length) return null

  if (estimate.mode === 'custom' || estimate.items.length === 1) {
    return estimate.items[0]
  }

  const searchId = item.searchId
  if (searchId) {
    const bySearchId = estimate.items.find(
      (line) => line.item?.searchId === searchId
    )
    if (bySearchId) return bySearchId
  }

  const itemName = itemNameService.getItemSearchText(item.name).trim().toLowerCase()
  if (!itemName) return null

  return (
    estimate.items.find((line) => {
      const lineName = (line.name || '').trim().toLowerCase()
      const catalogName = line.item
        ? itemNameService
            .getItemSearchText(line.item.name)
            .trim()
            .toLowerCase()
        : ''
      return lineName === itemName || catalogName === itemName
    }) || null
  )
}

export function estimateForLine(
  estimate: AiLogEstimate | null | undefined,
  index: number
): AiLogEstimate | null {
  const line = estimate?.items[index]
  if (!line || !estimate) return null
  return {
    mode: 'custom',
    name: line.name,
    imageUrl: estimate.imageUrl,
    items: [line],
  }
}
