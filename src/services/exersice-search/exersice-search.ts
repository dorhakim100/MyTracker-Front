import axios from 'axios'
import { Exercise } from '../../types/exercise/Exercise'
import { MuscleGroup } from '../../types/muscleGroup/MuscleGroup'
import { POPULAR_EXERCISES } from '../../assets/config/popular-exercises'
import { Workout } from '../../types/workout/Workout'
export const exerciseSearch = async (searchValue: string) => {
  const url = 'https://www.exercisedb.dev/api/v1/exercises/search'

  try {
    const { data } = await axios.get(url, {
      params: { q: searchValue, limit: 100 },
    })

    let exercises = data.data

    console.log('exercises', exercises)

    if (!exercises) throw new Error('No exercises found')
    const formattedData: Exercise[] = exercises.map((exercise: any) => {
      return {
        name: exercise.name,
        muscleGroups: [
          ...exercise.bodyParts,
          ...exercise.secondaryMuscles,
          ...exercise.targetMuscles,
        ],
        mainMuscles: exercise.targetMuscles,
        secondaryMuscles: exercise.secondaryMuscles,
        image: exercise.gifUrl,
        exerciseId: exercise.exerciseId,
        equipments: exercise.equipments,
      }
    })

    return formattedData
  } catch (err) {
    throw err
  }
}

/**
 * Array of popular exercise names to fetch
 */
export const POPULAR_EXERCISE_NAMES = [
  'bench press barbell',
  'bench press dumbbell',
  'bent over row barbell',
  'biceps curl dumbell',
  'incline bench press dumbell',
  'chest press machine',
  'chest fly machine',
  'chest press lever',
  'chest fly lever',
  'rear delt fly machine',
  'rear delt fly lever',

  'cable fly crossovers',
  'deadlift barbell',
  'face pull',
  'hammer curl dumbell',
  'squat',
  'leg extension',
  'shoulder press',
  'lateral raises',
  'hip thrust',
  'calf raise',
  'cable crunch',
  'pull over',
  'reverse fly',
  'cable row',
  'rows',
  'lat pulldown cable',
  'leg extension machine',
  'lateral raises dumbell',
  'leg press machine',
  'lying leg curl machine',
  'seated leg curl machine',
  'seated cable row',
  'seated leg curl machine',
  'shoulder press dumbell',
  'squat barbell',
  'triceps pushdown cable',
  'triceps rope pushdown',
]

export const getExercisesByIds = async (
  exerciseIds: string[]
): Promise<Exercise[]> => {
  try {
    const fetchPromises = exerciseIds.map(async (exerciseId) => {
      try {
        const url = `https://www.exercisedb.dev/api/v1/exercises/${exerciseId}`
        const { data: exerciseData } = await axios.get(url)
        const { data } = exerciseData

        const exerciseEquipments = data.equipments || data.equipment || []
        return {
          name: data.name,
          muscleGroups: [
            ...(data.bodyParts || []),
            ...(data.secondaryMuscles || []),
            ...(data.targetMuscles || []),
          ],
          mainMuscles: data.targetMuscles || [],
          secondaryMuscles: data.secondaryMuscles || [],
          image: data.gifUrl || data.gif || data.image,
          exerciseId: data.exerciseId || exerciseId,
          equipment: Array.isArray(exerciseEquipments)
            ? exerciseEquipments
            : [exerciseEquipments],
          equipments: Array.isArray(exerciseEquipments)
            ? exerciseEquipments
            : [exerciseEquipments],
        }
      } catch (err) {
        console.warn(`Failed to fetch exercise with ID: ${exerciseId}`, err)
        return null
      }
    })

    const exercises = await Promise.all(fetchPromises)
    return exercises.filter((ex) => ex !== null) as Exercise[]
  } catch (err) {
    console.error('Error bulk fetching exercises:', err)
    throw err
  }
}

export const getMostPopularExercises = (): Exercise[] => {
  return POPULAR_EXERCISES.map((exercise: any) => {
    return {
      name: exercise.name,
      muscleGroups: [
        ...exercise.bodyParts,
        ...exercise.secondaryMuscles,
        ...exercise.targetMuscles,
      ],
      image: exercise.gifUrl,
      exerciseId: exercise.exerciseId,
      equipment: exercise.equipments,
      equipments: exercise.equipments,
      mainMuscles: exercise.targetMuscles,
      secondaryMuscles: exercise.secondaryMuscles,
      instructions: exercise.instructions,
    }
  })
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
    Chest: ['chest', 'pectorals'],
    Lats: ['lats', 'back', 'upper back', 'rear delts'],
    Quads: ['quads', 'quadriceps', 'upper legs'],
    Shoulders: ['shoulders', 'delts', 'rear delts', 'anterior delts'],
    Glutes: [
      'glutes',
      'gluteus maximus',
      'gluteus medius',
      'gluteus minimus',
      'butt',
    ],
    Calves: ['calves', 'soleus', 'gastrocnemius'],
    Hamstrings: ['hamstrings'],
    Abs: ['abs', 'abdominals', 'lower abs', 'core', 'obliques'],
    Triceps: ['triceps'],
    Biceps: ['biceps', 'brachialis'],
    Forearms: ['forearms'],
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
 * Reversed map: Maps muscle names to their muscle groups
 * Key: muscle name (e.g., "pectorals", "chest")
 * Value: muscle group name (e.g., "Chest")
 */
export const MUSCLE_TO_MUSCLE_GROUP: Record<string, string> = {
  chest: 'Chest',
  pectorals: 'Chest',
  lats: 'Lats',
  back: 'Lats',
  'upper back': 'Lats',
  'rear delts': 'Lats', // Also in Shoulders, but Lats is first
  quads: 'Quads',
  quadriceps: 'Quads',
  'upper legs': 'Quads',
  shoulders: 'Shoulders',
  delts: 'Shoulders',
  'anterior delts': 'Shoulders',
  glutes: 'Glutes',
  'gluteus maximus': 'Glutes',
  'gluteus medius': 'Glutes',
  'gluteus minimus': 'Glutes',
  butt: 'Glutes',
  calves: 'Calves',
  soleus: 'Calves',
  gastrocnemius: 'Calves',
  hamstrings: 'Hamstrings',
  abs: 'Abs',
  abdominals: 'Abs',
  'lower abs': 'Abs',
  core: 'Abs',
  obliques: 'Abs',
  triceps: 'Triceps',
  biceps: 'Biceps',
  brachialis: 'Biceps',
  forearms: 'Forearms',
  adductors: 'Hip Adductors',
  'inner thighs': 'Hip Adductors',
  'lower back': 'Lower Back',
  trapezius: 'Upper Back',
  traps: 'Upper Back',
  rhomboids: 'Upper Back',
  'levator scapulae': 'Upper Back',
}

/**
 * Maps muscle names to their corresponding muscle groups (reverse of mapMuscleGroupToMuscles)
 * Returns the muscle group name for a given muscle name
 */
export function mapMuscleToMuscleGroup(muscle: string): string | undefined {
  return MUSCLE_TO_MUSCLE_GROUP[muscle.toLowerCase()]
}

export function getWorkoutMuscles(workout: Workout) {
  const muscles = workout.exercises
    .map((exercise) => exercise.mainMuscles)
    .flat()
    .filter((muscle): muscle is string => muscle !== undefined)
  const uniqueMuscles = [...new Set(muscles)]
  return uniqueMuscles.map((muscle) => mapMuscleToMuscleGroup(muscle))
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
