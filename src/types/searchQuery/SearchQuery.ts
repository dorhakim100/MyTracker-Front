export interface SearchQuery {
  txt?: string
  source?: 'usda' | 'open-food-facts'
  favoriteItems?: {
    food: string[]
    product: string[]
  }
}
