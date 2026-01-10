import { Exercise } from '../../types/exercise/Exercise'
import { ExerciseInstructions } from '../../types/exercise/ExerciseInstructions'
import { httpService } from '../http.service'

const KEY = 'chatgpt'

export const chatGPTService = {
  getChatGPTResponse,
  changeExercise,
}

async function getChatGPTResponse(prompt: string) {
  try {
    const response = await httpService.post(KEY, { prompt })

    return response
  } catch (error) {
    throw error
  }
}

async function changeExercise(
  oldExercise: ExerciseInstructions,
  newExercise: Exercise,
  instructionsId: string
) {
  try {
    const response = await httpService.post(`${KEY}/change-exercise`, {
      oldExercise,
      newExercise,
      instructionsId,
    })
    return response
  } catch (error) {
    throw error
  }
}
