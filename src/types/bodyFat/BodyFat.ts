export interface BodyFatMeasurements {
  waist?: number
  neck?: number
  chest?: number
  arms?: number
  hips?: number
  thigh?: number
  calf?: number
}

export interface BodyFatEstimateRequest {
  imageUrl: string
  weightKg: number
  userId: string
  measurements?: BodyFatMeasurements
}

export interface BodyFatEstimateSuccess {
  status: 'ok'
  minPercent: number
  maxPercent: number
  note: string
}

export interface BodyFatEstimateUnusablePhoto {
  status: 'unusable_photo'
  message: string
}

export interface BodyFatEstimateError {
  status: 'error'
  message: string
}

export type BodyFatEstimateResponse =
  | BodyFatEstimateSuccess
  | BodyFatEstimateUnusablePhoto
  | BodyFatEstimateError

export type BodyFatResult =
  | { kind: 'success'; minPercent: number; maxPercent: number; note: string }
  | { kind: 'unusable_photo'; message: string }
  | { kind: 'error'; message: string }
