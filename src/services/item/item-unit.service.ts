import { ItemName } from '../../types/item/LocalizedName'
import { ItemUnit } from '../../types/item/ItemUnit'
import { itemNameService } from './item-name.service'

const DRINK_KEYWORDS = [
  'water',
  'juice',
  'soda',
  'cola',
  'milk',
  'coffee',
  'tea',
  'beer',
  'wine',
  'smoothie',
  'shake',
  'beverage',
  'drink',
  'מים',
  'מיץ',
  'סודה',
  'חלב',
  'קפה',
  'תה',
  'בירה',
  'יין',
  'שייק',
  'משקה',
  'סמוזי',
]

const UNSURE_KEYWORDS = [
  'soup',
  'stew',
  'yogurt',
  'yoghurt',
  'cream',
  'honey',
  'syrup',
  'dressing',
  'mayo',
  'mayonnaise',
  'ice cream',
  'icecream',
  'מרק',
  'יוגורט',
  'שמנת',
  'דבש',
  'סירופ',
  'מיונז',
  'גלידה',
]

const UNSURE_CATEGORIES = ['fatsOils', 'sauces']

export type ClassifiedUnit = ItemUnit | undefined

function normalizeName(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0591-\u05C7]/g, '')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function nameBlob(name: ItemName | undefined) {
  return normalizeName(itemNameService.getItemSearchText(name))
}

function hasKeyword(blob: string, keywords: string[]) {
  return keywords.some((keyword) => {
    const needle = normalizeName(keyword)
    if (!needle) return false
    if (/[\u0590-\u05FF]/.test(needle)) return blob.includes(needle)
    return new RegExp(`(?:^|\\s)${needle}(?:$|\\s)`).test(` ${blob} `)
  })
}

export function getItemUnit(item?: unknown): ItemUnit {
  if (!item || typeof item !== 'object') return 'g'
  const unit = (item as { unit?: ItemUnit }).unit
  return unit === 'ml' ? 'ml' : 'g'
}

export function getMealUnit(
  items: Array<{ unit?: ItemUnit }> | null | undefined
): ItemUnit {
  if (!items?.length) return 'g'
  if (items.every((item) => getItemUnit(item) === 'ml')) return 'ml'
  return 'g'
}

export function classifyItemUnit(item: {
  name?: ItemName
  categories?: string[]
}): ClassifiedUnit {
  const categories = item.categories || []
  const blob = nameBlob(item.name)

  if (categories.includes('drinks') || hasKeyword(blob, DRINK_KEYWORDS)) {
    return 'ml'
  }

  if (
    categories.some((id) => UNSURE_CATEGORIES.includes(id)) ||
    hasKeyword(blob, UNSURE_KEYWORDS)
  ) {
    return undefined
  }

  return 'g'
}

export function withClassifiedUnit<
  T extends { name?: ItemName; categories?: string[]; unit?: ItemUnit }
>(item: T): T {
  if (item.unit === 'g' || item.unit === 'ml') return item
  const unit = classifyItemUnit(item)
  if (!unit) return item
  return { ...item, unit }
}

export const itemUnitService = {
  getItemUnit,
  getMealUnit,
  classifyItemUnit,
  withClassifiedUnit,
}
