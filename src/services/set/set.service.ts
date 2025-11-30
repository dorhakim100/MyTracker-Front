import { Set } from '../../types/exercise/Exercise'

export const setService = {
  getEmptySet,
}

function getEmptySet(): Set {
  return {
    reps: {
      expected: 8,
      actual: 8,
    },
    weight: {
      expected: 15,
      actual: 15,
    },
  }
}
