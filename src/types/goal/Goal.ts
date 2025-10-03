import { Macros } from '../macros/Macros'

export interface Goal {
  _id: string
  isSelected: boolean
  title: string
  updatedAt: number

  dailyCalories: number
  macros: Macros | Partial<Macros>

  startDate: number
  endDate: number

  target: 'lose' | 'maintain' | 'gain'
}
