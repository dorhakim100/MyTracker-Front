export type WeightMeasureField =
  | 'kg'
  | 'waistCm'
  | 'bodyFat'
  | 'neckCm'
  | 'chestCm'
  | 'armsCm'
  | 'hipsCm'
  | 'thighCm'
  | 'calfCm'

export interface Weight {
  _id?: string
  userId: string
  createdAt: number
  kg?: number
  waistCm?: number
  bodyFat?: number
  neckCm?: number
  chestCm?: number
  armsCm?: number
  hipsCm?: number
  thighCm?: number
  calfCm?: number
  imageUrl?: string
  note?: string
}

export type WeightWrite = Partial<Omit<Weight, 'imageUrl'>> &
  Partial<Record<WeightMeasureField, number | null>> & {
    imageUrl?: string | null
  }

export interface WeightFilter {
  userId?: string
  fromDate?: string | null // ISO date string
  toDate?: string | null // ISO date string
  skip?: number
  limit?: number
}
