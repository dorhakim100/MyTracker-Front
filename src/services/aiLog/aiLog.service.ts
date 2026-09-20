import { httpService } from '../http.service'
import {
  AiLogEstimate,
  AiLogEstimateRequest,
} from '../../types/aiLog/AiLog'

const KEY = 'ai-log'

export const aiLogService = {
  estimate,
}

async function estimate(
  payload: AiLogEstimateRequest
): Promise<AiLogEstimate> {
  const response = await httpService.post(`${KEY}/estimate`, payload)
  return response as AiLogEstimate
}
