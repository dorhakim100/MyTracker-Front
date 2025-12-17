import axios from 'axios'
import { Exercise } from '../../types/exercise/Exercise'
import { MuscleGroup } from '../../types/muscleGroup/MuscleGroup'

export const exerciseSearch = async (searchValue: string) => {
  const url = 'https://www.exercisedb.dev/api/v1/exercises/search'

  try {
    const { data } = await axios.get(url, {
      params: { q: searchValue, limit: 100 },
    })

    let exercises = data.data

    if (!exercises) throw new Error('No exercises found')
    console.log('exercises', exercises[0])
    const formattedData: Exercise[] = exercises.map((exercise: any) => {
      return {
        name: exercise.name,
        muscleGroups: [
          ...exercise.bodyParts,
          ...exercise.secondaryMuscles,
          ...exercise.targetMuscles,
        ],
        image: exercise.gifUrl,
        exerciseId: exercise.exerciseId,
        equipments: exercise.equipments,
      }
    })

    console.log('formattedData', formattedData)
    return formattedData
  } catch (err) {
    throw err
  }
}

export const getExerciseById = async (exerciseId: string) => {
  try {
    const url = `https://www.exercisedb.dev/api/v1/exercises/${exerciseId}`
    const { data: exerciseData } = await axios.get(url)
    const { data } = exerciseData
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
  return data
}

/**
 * Maps UI muscle group names to API muscles format
 * Returns array of related muscle names for better matching
 * Based on exercisedb.dev API muscles values
 */
export function mapMuscleGroupToMuscles(muscleGroup: string): string[] {
  const mapping: Record<string, string[]> = {
    All: [],
    Chest: ['chest', 'pectorals', 'upper chest'],
    Lats: ['lats', 'latissimus dorsi'],
    Quads: ['quads', 'quadriceps', 'upper legs'],
    Shoulders: ['shoulders', 'deltoids', 'delts', 'rear deltoids'],
    Glutes: ['glutes'],
    Calves: ['calves', 'soleus'],
    Hamstrings: ['hamstrings'],
    Abs: ['abs', 'abdominals', 'lower abs', 'core', 'obliques'],
    Triceps: ['triceps'],
    Biceps: ['biceps', 'brachialis'],
    Forearms: ['forearms', 'wrist extensors', 'wrist flexors', 'wrists'],
    'Hip Adductors': ['adductors', 'inner thighs'],
    'Lower Back': ['lower back'],
    'Upper Back': [
      'upper back',
      'trapezius',
      'traps',
      'rhomboids',
      'levator scapulae',
    ],
  }
  return mapping[muscleGroup] || [muscleGroup.toLowerCase()]
}

/**
 * Maps UI equipment names to API equipment format
 * Returns array of equipment types for the selected equipment
 * Based on exercisedb.dev API equipment values
 */
export function mapEquipmentToApiFormat(equipment: string): string[] {
  const mapping: Record<string, string[]> = {
    All: [],
    Barbell: ['barbell', 'ez barbell', 'olympic barbell', 'trap bar'],
    Dumbbell: ['dumbbell'],
    Machine: [
      'machine',
      'leverage machine',
      'smith machine',
      'stepmill machine',
      'elliptical machine',
      'skierg machine',
      'sled machine',
      'upper body ergometer',
      'stationary bike',
    ],
    Cable: ['cable'],
    Bodyweight: ['body weight', 'weighted', 'assisted'],
    Bands: ['band', 'resistance band'],
    Kettlebell: ['kettlebell'],
  }
  return mapping[equipment] || [equipment.toLowerCase()]
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
