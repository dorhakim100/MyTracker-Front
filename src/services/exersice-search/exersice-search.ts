import axios from 'axios'
import { Exercise } from '../../types/exercise/Exercise'

export const exerciseSearch = async (query: string) => {
  const url = 'https://www.exercisedb.dev/api/v1/exercises/search'

  try {
    const { data } = await axios.get(url, {
      params: { q: query },
    })

    const exercise = data.data

    if (!exercise) throw new Error('No exercises found')

    const formattedData: Exercise[] = exercise.map((exercise: any) => {
      return {
        name: exercise.name,
        muscleGroups: exercise.bodyParts,
        image: exercise.gifUrl,
        exerciseId: exercise.exerciseId,
      }
    })

    return formattedData
  } catch (err) {
    throw err
  }
}

const WGER_BASE_URL = 'https://wger.de/api/v2'

export const fetchMuscles = async () => {
  const res = await fetch(`${WGER_BASE_URL}/muscle/`)
  if (!res.ok) throw new Error('Failed to fetch muscles')

  const data = await res.json()
  // data.results is an array of muscles
  console.log(data)
  return data
}
