import { ActivityLevel, Gender } from '../../services/bmr/bmr.service'

export interface BmrFormState {
  ageYears: string
  gender: Gender
  heightCm: string
  weightKg: string
  activity: ActivityLevel
}
