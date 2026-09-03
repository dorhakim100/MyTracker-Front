// Category art: Google Noto Animated Emoji (Apache 2.0).
// https://googlefonts.github.io/noto-emoji-animation/
import beveragesImg from '../item-categories/beverages.webp'
import beveragesStill from '../item-categories/beverages.png'
import carbsImg from '../item-categories/carbs.webp'
import carbsStill from '../item-categories/carbs.png'
import condimentsImg from '../item-categories/condiments.webp'
import condimentsStill from '../item-categories/condiments.png'
import dairyImg from '../item-categories/dairy.webp'
import dairyStill from '../item-categories/dairy.png'
import fatsOilsImg from '../item-categories/fatsOils.webp'
import fatsOilsStill from '../item-categories/fatsOils.png'
import favoritesImg from '../item-categories/favorites.webp'
import favoritesStill from '../item-categories/favorites.png'
import fruitsImg from '../item-categories/fruits.webp'
import fruitsStill from '../item-categories/fruits.png'
import mealsImg from '../item-categories/meals.webp'
import mealsStill from '../item-categories/meals.png'
import nutsSeedsImg from '../item-categories/nutsSeeds.webp'
import nutsSeedsStill from '../item-categories/nutsSeeds.png'
import preparedImg from '../item-categories/prepared.webp'
import preparedStill from '../item-categories/prepared.png'
import proteinsImg from '../item-categories/proteins.webp'
import proteinsStill from '../item-categories/proteins.png'
import snacksImg from '../item-categories/snacks.webp'
import snacksStill from '../item-categories/snacks.png'
import sweetsImg from '../item-categories/sweets.webp'
import sweetsStill from '../item-categories/sweets.png'
import vegetablesImg from '../item-categories/vegetables.webp'
import vegetablesStill from '../item-categories/vegetables.png'

export const ITEM_CATEGORY_IDS = [
  'proteins',
  'carbs',
  'vegetables',
  'fruits',
  'dairy',
  'nutsSeeds',
  'fatsOils',
  'prepared',
  'snacks',
  'beverages',
  'condiments',
  'sweets',
] as const

export type ItemCategoryId = (typeof ITEM_CATEGORY_IDS)[number]

export type BrowseView = ItemCategoryId | 'favorites' | 'meals'

export type ItemCategoryArt = {
  animated: string
  still: string
}

export const ITEM_YOURS_ART: Record<'favorites' | 'meals', ItemCategoryArt> = {
  favorites: { animated: favoritesImg, still: favoritesStill },
  meals: { animated: mealsImg, still: mealsStill },
}

export const ITEM_CATEGORY_ART: Record<ItemCategoryId, ItemCategoryArt> = {
  proteins: { animated: proteinsImg, still: proteinsStill },
  carbs: { animated: carbsImg, still: carbsStill },
  vegetables: { animated: vegetablesImg, still: vegetablesStill },
  fruits: { animated: fruitsImg, still: fruitsStill },
  dairy: { animated: dairyImg, still: dairyStill },
  nutsSeeds: { animated: nutsSeedsImg, still: nutsSeedsStill },
  fatsOils: { animated: fatsOilsImg, still: fatsOilsStill },
  prepared: { animated: preparedImg, still: preparedStill },
  snacks: { animated: snacksImg, still: snacksStill },
  beverages: { animated: beveragesImg, still: beveragesStill },
  condiments: { animated: condimentsImg, still: condimentsStill },
  sweets: { animated: sweetsImg, still: sweetsStill },
}

export const ITEM_CATEGORY_COLORS: Record<
  ItemCategoryId,
  { light: string; dark: string }
> = {
  proteins: {
    light: 'var(--picker-color-red)',
    dark: 'var(--picker-color-red-light)',
  },
  carbs: {
    light: 'var(--picker-color-yellow)',
    dark: 'var(--picker-color-yellow-light)',
  },
  vegetables: {
    light: 'var(--picker-color-green)',
    dark: 'var(--picker-color-green-light)',
  },
  fruits: {
    light: 'var(--picker-color-orange)',
    dark: 'var(--picker-color-orange-light)',
  },
  dairy: {
    light: 'var(--picker-color-blue)',
    dark: 'var(--picker-color-blue-light)',
  },
  nutsSeeds: {
    light: 'var(--picker-color-orange-dark)',
    dark: 'var(--picker-color-orange)',
  },
  fatsOils: {
    light: 'var(--picker-color-yellow-dark)',
    dark: 'var(--picker-color-yellow)',
  },
  prepared: {
    light: 'var(--picker-color-deep-purple)',
    dark: 'var(--picker-color-deep-purple-light)',
  },
  snacks: {
    light: 'var(--picker-color-pink)',
    dark: 'var(--picker-color-pink-light)',
  },
  beverages: {
    light: 'var(--picker-color-blue-dark)',
    dark: 'var(--picker-color-blue-light)',
  },
  condiments: {
    light: 'var(--picker-color-purple)',
    dark: 'var(--picker-color-purple-light)',
  },
  sweets: {
    light: 'var(--picker-color-pink-dark)',
    dark: 'var(--picker-color-pink-light)',
  },
}

export const ITEM_CATEGORY_LABELS: Record<
  ItemCategoryId,
  { eng: string; he: string; aliases: string[] }
> = {
  proteins: {
    eng: 'Proteins',
    he: 'חלבונים',
    aliases: ['protein', 'חלבון', 'חלבונים'],
  },
  carbs: {
    eng: 'Carbs',
    he: 'פחמימות',
    aliases: ['carb', 'carbohydrate', 'carbohydrates', 'פחמימה', 'פחמימות'],
  },
  vegetables: {
    eng: 'Vegetables',
    he: 'ירקות',
    aliases: ['vegetable', 'veggie', 'veggies', 'ירק', 'ירקות'],
  },
  fruits: {
    eng: 'Fruits',
    he: 'פירות',
    aliases: ['fruit', 'פרי', 'פירות'],
  },
  dairy: {
    eng: 'Dairy',
    he: 'חלב ומוצריו',
    aliases: ['dairy'],
  },
  nutsSeeds: {
    eng: 'Nuts & seeds',
    he: 'אגוזים וזרעים',
    aliases: ['nuts', 'seeds', 'אגוזים', 'זרעים'],
  },
  fatsOils: {
    eng: 'Fats & oils',
    he: 'שמנים ושומנים',
    aliases: ['fats', 'oils', 'שמנים', 'שומנים'],
  },
  prepared: {
    eng: 'Prepared dishes',
    he: 'מנות מוכנות',
    aliases: ['prepared', 'dishes', 'מנות', 'מוכן'],
  },
  snacks: {
    eng: 'Snacks',
    he: 'חטיפים',
    aliases: ['snack', 'חטיף', 'חטיפים'],
  },
  beverages: {
    eng: 'Beverages',
    he: 'משקאות',
    aliases: ['drinks', 'drink', 'beverage', 'משקה', 'משקאות'],
  },
  condiments: {
    eng: 'Condiments',
    he: 'רטבים ותבלינים',
    aliases: ['condiment', 'רטבים'],
  },
  sweets: {
    eng: 'Sweets',
    he: 'מתוקים',
    aliases: ['sweet', 'dessert', 'מתוק', 'מתוקים', 'קינוח'],
  },
}

function normalizeLabel(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0591-\u05C7]/g, '')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[״׳'"]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function isItemCategoryId(value: string): value is ItemCategoryId {
  return (ITEM_CATEGORY_IDS as readonly string[]).includes(value)
}

export function isNutritionBrowseView(
  view: BrowseView | null
): view is ItemCategoryId {
  return !!view && isItemCategoryId(view)
}

export function matchItemCategoryLabel(txt: string): ItemCategoryId | null {
  const query = normalizeLabel(txt)
  if (!query) return null

  for (const id of ITEM_CATEGORY_IDS) {
    const labels = ITEM_CATEGORY_LABELS[id]
    const candidates = [id, labels.eng, labels.he, ...labels.aliases].map(
      normalizeLabel
    )
    if (candidates.includes(query)) return id
  }
  return null
}
