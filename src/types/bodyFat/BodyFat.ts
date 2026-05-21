export interface BodyFatEstimateRequest {
  imageUrl: string
  weightKg: number
}

export interface BodyFatEstimateSuccess {
  status: 'ok'
  bodyFatMin: number
  bodyFatMax: number
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
  | { kind: 'success'; bodyFatMin: number; bodyFatMax: number; note: string }
  | { kind: 'unusable_photo'; message: string }
  | { kind: 'error'; message: string }
