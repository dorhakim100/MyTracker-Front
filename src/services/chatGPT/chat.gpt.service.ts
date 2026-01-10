import { httpService } from '../http.service'

const KEY = 'chatgpt'

export const chatGPTService = {
  getChatGPTResponse,
}

async function getChatGPTResponse(prompt: string) {
  try {
    const response = await httpService.post(KEY, { prompt })

    return response
  } catch (error) {
    throw error
  }
}
