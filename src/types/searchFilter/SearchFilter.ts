export interface SearchFilter {
  txt?: string
  source?: 'usda' | 'open-food-facts'
  // favoriteItems?: {
  //   food: string[]
  //   product: string[]
  // }
  favoriteItems?: string[]
}
