export interface Weight {
  _id?: string
  userId: string
  createdAt: number
  kg: number
  note?: string
}

export interface WeightFilter {
  userId?: string
  fromDate?: string | null // ISO date string
  toDate?: string | null // ISO date string
  limit?: number
}
