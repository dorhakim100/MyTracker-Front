import { Macros } from '../macros/Macros'

export interface Goal {
  _id: string
  isSelected: boolean
  title: string
  updatedAt: Date

  dailyCalories: number
  macros: Macros | Partial<Macros>
  startDate: Date
  endDate: Date

  target: 'lose' | 'maintain' | 'gain'
}
