import type { FDCNutrient } from './FDCNutrient'

export type FDCFood = {
  fdcId: number
  description: string
  foodNutrients: FDCNutrient[]
}
