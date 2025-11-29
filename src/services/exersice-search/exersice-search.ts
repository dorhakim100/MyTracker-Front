import axios from 'axios'
import { Exercise } from '../../types/exercise/Exercise'
import { MuscleGroup } from '../../types/muscleGroup/MuscleGroup'

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

export const getExerciseById = async (exerciseId: string) => {
  try {
    console.log('exerciseId:', exerciseId)

    const url = `https://www.exercisedb.dev/api/v1/exercises/${exerciseId}`
    const { data: exerciseData } = await axios.get(url)
    const { data } = exerciseData
    console.log('data:', data)
    const {
      instructions,
      name,
      gifUrl: image,
      bodyParts: muscleGroups,
      equipments,
    } = data
    return { name, image, muscleGroups, equipments, instructions }
  } catch (err) {
    throw err
  }
}
export const getExerciseSummary = async (exerciseId: string) => {
  try {
    const url = `https://www.exercisedb.dev/api/v1/exercises/${exerciseId}`
    const { data: exerciseData } = await axios.get(url)
    const { data } = exerciseData
    const { instructions } = data
    return instructions
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

/**
 * Maps common muscle group aliases to their official names
 */
const MUSCLE_GROUP_ALIASES: Record<string, string[]> = {
  chest: ['pecs', 'pectorals', 'pec', 'chest muscles', 'upper'],
  shoulders: [
    'delts',
    'deltoids',
    'shoulder',
    'front delt',
    'front deltoid',
    'anterior delt',
    'anterior deltoid',
    'rear delt',
    'rear deltoid',
    'posterior delt',
    'posterior deltoid',
    'side delt',
    'side deltoid',
    'lateral delt',
    'lateral deltoid',
    'upper',
  ],
  triceps: ['tris', 'tricep', 'triceps brachii', 'tricep muscle', 'upper'],
  back: [
    'lats',
    'latissimus',
    'latissimus dorsi',
    'traps',
    'trapezius',
    'rhomboids',
    'rear delts',
    'rear deltoids',
    'posterior delts',
    'posterior deltoids',
    'upper back',
    'lower back',
    'lumbar',
    'thoracic',
    'romboids',
  ],
  biceps: ['bis', 'bicep', 'biceps brachii', 'bicep muscle', 'upper'],
  quads: [
    'quadriceps',
    'quad',
    'quads',
    'thighs',
    'thigh',
    'front thighs',
    'quadricep',
    'legs',
    'lower',
  ],
  glutes: [
    'glute',
    'gluteus',
    'gluteus maximus',
    'gluteus medius',
    'gluteus minimus',
    'butt',
    'buttocks',
    'glutes muscles',
    'legs',
    'hips',
    'lower',
  ],
  calves: [
    'calf',
    'calves',
    'gastrocnemius',
    'soleus',
    'lower leg',
    'lower legs',
    'legs',
    'lower',
  ],
  hamstrings: [
    'hams',
    'hamstring',
    'ham',
    'back thighs',
    'posterior thigh',
    'legs',
    'lower',
  ],
  abs: [
    'abdominals',
    'abdominal',
    'core',
    'six pack',
    'rectus abdominis',
    'obliques',
    'oblique',
    'serratus',
    'serratus anterior',
  ],
}

export function matchesMuscleGroup(
  muscleGroup: MuscleGroup,
  searchQuery: string
): boolean {
  if (!searchQuery.trim()) return true

  const query = searchQuery.trim()
  const groupName = muscleGroup.name.toLowerCase()

  // Try to use as regex first, fall back to simple string matching if invalid
  let regex: RegExp | null = null
  let useRegex = false
  try {
    regex = new RegExp(query, 'i')
    useRegex = true
  } catch (err) {
    // Invalid regex, will fall back to string matching
    useRegex = false
  }

  // Test against muscle group name
  if (useRegex && regex) {
    if (regex.test(groupName)) {
      return true
    }
  } else {
    // Simple string matching for muscle group name
    const queryLower = query.toLowerCase()
    if (groupName.includes(queryLower) || queryLower.includes(groupName)) {
      return true
    }
  }

  // Check if query matches any aliases for this muscle group
  const aliases = MUSCLE_GROUP_ALIASES[muscleGroup.name] || []
  return aliases.some((alias) => {
    const aliasLower = alias.toLowerCase()
    if (useRegex && regex) {
      return regex.test(aliasLower)
    } else {
      const queryLower = query.toLowerCase()
      return aliasLower.includes(queryLower) || queryLower.includes(aliasLower)
    }
  })
}
