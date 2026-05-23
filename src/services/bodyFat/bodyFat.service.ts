import type {
  BodyFatEstimateRequest,
  BodyFatEstimateResponse,
  BodyFatResult,
} from '../../types/bodyFat/BodyFat'
import { httpService } from '../http.service'

// const USE_MOCK = import.meta.env.VITE_BODY_FAT_USE_MOCK !== 'false'
const USE_MOCK = false

export const bodyFatService = {
  estimate,
}

async function estimate(
  payload: BodyFatEstimateRequest
): Promise<BodyFatResult> {
  try {
    const response = USE_MOCK
    ? await mockEstimate(payload)
    : await realEstimate(payload)

  return normalizeResponse(response)
  } catch (err) {
    return {
      kind: 'error',
      message: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}

async function realEstimate(
  payload: BodyFatEstimateRequest
): Promise<BodyFatEstimateResponse> {
  try {
    const response = await httpService.post('body-fat/estimate', payload)
    return response
    
  } catch (err) {
    throw err
    
  }
}

async function mockEstimate(
  payload: BodyFatEstimateRequest
): Promise<BodyFatEstimateResponse> {
  await delay(1200)

  const scenario =
    import.meta.env.VITE_BODY_FAT_MOCK_SCENARIO || 'success'

  if (scenario === 'unusable_photo') {
    return {
      status: 'unusable_photo',
      message:
        'We could not estimate body fat from this photo. Try a clearer full-body or torso photo in good lighting.',
    }
  }

  if (scenario === 'error') {
    return {
      status: 'error',
      message: 'Something went wrong. Please try again later.',
    }
  }

  const base = 14 + (payload.weightKg % 10) * 0.5
  return {
    status: 'ok',
    minPercent: Math.round((base - 2) * 10) / 10,
    maxPercent: Math.round((base + 2) * 10) / 10,
    note:
      'Mock estimate based on your weight. Connect the backend in Phase 2 for real AI analysis.',
  }
}

function normalizeResponse(
  response: BodyFatEstimateResponse
): BodyFatResult {
  switch (response.status) {
    case 'ok':
      return {
        kind: 'success',
        minPercent: response.minPercent,
        maxPercent: response.maxPercent,
        note: response.note,
      }
    case 'unusable_photo':
      return { kind: 'unusable_photo', message: response.message }
    case 'error':
      return { kind: 'error', message: response.message }
    default:
      return {
        kind: 'error',
        message: 'Unexpected response from body fat service.',
      }
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
