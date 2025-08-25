export type OFFProduct = {
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
