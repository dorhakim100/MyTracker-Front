import { Macros } from '../macros/Macros'

export interface Goal {
  _id: string
  userId?: string
  isSelected: boolean
  title?: string
  updatedAt: number

  dailyCalories: number
  macros:
    | Macros
    | (Partial<Macros> & { protein: number; carbs: number; fat: number })

  startDate: number
  endDate: number | undefined

  target: 'lose' | 'maintain' | 'gain'
  targetWeight: number
}
