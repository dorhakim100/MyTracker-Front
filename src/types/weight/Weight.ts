export interface Weight {
  _id?: string
  userId: string
  createdAt: string // ISO date string
  kg: number
  note?: string
}

export interface WeightFilter {
  userId?: string
  fromDate?: string // ISO date string
  toDate?: string // ISO date string
  limit?: number
}
