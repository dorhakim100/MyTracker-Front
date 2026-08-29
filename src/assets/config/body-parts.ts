import { Workout } from '../../types/workout/Workout'

export const BODY_PARTS = {
  chest: {
    color: {
      light: 'var(--picker-color-red)',
      dark: 'var(--picker-color-red-light)',
    },
    muscles: [
      'chest',
      'pecs',
      'pec',
      'pectorals',
      'pectoral',
      'pectoralis',
      'pectoralis major',
      'upper chest',
      'lower chest',
      'serratus',
      'serratus anterior',
    ],
  },
  lats: {
    color: {
      light: 'var(--picker-color-blue)',
      dark: 'var(--picker-color-blue-light)',
    },
    muscles: [
      'lats',
      'lat',
      'latissimus',
      'latissimus dorsi',
      'back',
    ],
  },
  upperBack: {
    color: {
      light: 'var(--picker-color-deep-purple)',
      dark: 'var(--picker-color-deep-purple-light)',
    },
    muscles: [
      'upper back',
      'traps',
      'trapezius',
      'rhomboids',
      'rhomboid',
      'levator scapulae',
      'mid back',
      'middle back',
    ],
  },
  lowerBack: {
    color: {
      light: '#455a64',
      dark: '#90a4ae',
    },
    muscles: [
      'lower back',
      'erector spinae',
      'erectors',
      'erector',
      'spine',
      'lumbar',
    ],
  },
  shoulders: {
    color: {
      light: 'var(--picker-color-orange)',
      dark: 'var(--picker-color-orange-light)',
    },
    muscles: [
      'shoulders',
      'shoulder',
      'delts',
      'delt',
      'deltoids',
      'deltoid',
      'anterior delts',
      'anterior delt',
      'anterior deltoid',
      'front delts',
      'front delt',
      'front deltoid',
      'lateral delts',
      'lateral delt',
      'lateral deltoid',
      'side delts',
      'side delt',
      'middle delts',
      'middle delt',
      'medial delts',
      'medial delt',
      'neck',
    ],
  },
  rearDelts: {
    color: {
      light: '#e64a19',
      dark: '#ffab91',
    },
    muscles: [
      'rear delts',
      'rear delt',
      'rear deltoid',
      'rear deltoids',
      'posterior delts',
      'posterior delt',
      'posterior deltoid',
      'posterior deltoids',
    ],
  },
  biceps: {
    color: {
      light: 'var(--picker-color-purple)',
      dark: 'var(--picker-color-purple-light)',
    },
    muscles: [
      'biceps',
      'bicep',
      'brachialis',
    ],
  },
  triceps: {
    color: {
      light: '#00838f',
      dark: '#4dd0e1',
    },
    muscles: [
      'triceps',
      'tricep',
    ],
  },
  forearms: {
    color: {
      light: 'var(--picker-color-pink)',
      dark: 'var(--picker-color-pink-light)',
    },
    muscles: [
      'forearms',
      'forearm',
      'lower arms',
      'brachioradialis',
    ],
  },
  legs: {
    color: {
      light: 'var(--picker-color-green-dark)',
      dark: 'var(--picker-color-green)',
    },
    muscles: [
      'legs',
      'upper legs',
      'lower legs',
      'glutes',
      'glute',
      'gluteus',
      'gluteus maximus',
      'gluteus medius',
      'gluteus minimus',
      'butt',
      'quads',
      'quad',
      'quadriceps',
      'hamstrings',
      'hamstring',
      'calves',
      'calf',
      'gastrocnemius',
      'soleus',
      'adductors',
      'abductors',
      'hip adductors',
      'inner thighs',
      'thighs',
      'thigh',
    ],
  },
  abs: {
    color: {
      light: 'var(--picker-color-yellow-darker)',
      dark: 'var(--picker-color-yellow)',
    },
    muscles: [
      'abs',
      'abdominals',
      'abdominal',
      'core',
      'waist',
      'hip flexors',
      'hip flexor',
      'obliques',
      'oblique',
      'lower abs',
      'rectus abdominis',
      'transverse abdominis',
    ],
  },
} as const

export type BodyPartId = keyof typeof BODY_PARTS

export const MUSCLE_TO_BODY_PART: Record<string, BodyPartId> = {}

for (const id of Object.keys(BODY_PARTS) as BodyPartId[]) {
  for (const muscle of BODY_PARTS[id].muscles) {
    MUSCLE_TO_BODY_PART[muscle] = id
  }
}

const MUSCLE_ALIASES_BY_LENGTH = Object.keys(MUSCLE_TO_BODY_PART).sort(
  (a, b) => b.length - a.length
)

export function getBodyPartId(muscle: string): BodyPartId | undefined {
  const key = muscle.toLowerCase().trim().replace(/-/g, ' ')
  if (!key) return undefined

  const exact = MUSCLE_TO_BODY_PART[key]
  if (exact) return exact

  for (const alias of MUSCLE_ALIASES_BY_LENGTH) {
    if (alias.length < 5) continue
    if (key.includes(alias)) return MUSCLE_TO_BODY_PART[alias]
  }
}

export function getBodyPartsFromMuscles(muscles?: string[]): BodyPartId[] {
  if (!muscles?.length) return []

  const seen = new Set<BodyPartId>()
  const bodyParts: BodyPartId[] = []

  for (const muscle of muscles) {
    const id = getBodyPartId(muscle)
    if (!id || seen.has(id)) continue
    seen.add(id)
    bodyParts.push(id)
  }

  return bodyParts
}

function normalizeMuscleName(muscle: string) {
  return muscle.toLowerCase().trim().replace(/-/g, ' ')
}

function hasTraps(muscles: string[]) {
  return muscles.some((muscle) => {
    const key = normalizeMuscleName(muscle)
    return key === 'traps' || key === 'trap' || key.includes('trapezius')
  })
}

function hasRhomboids(muscles: string[]) {
  return muscles.some((muscle) => {
    const key = normalizeMuscleName(muscle)
    return key.includes('rhomboid') || key.includes('romboid')
  })
}

function isShoulderMain(mainMuscles?: string[]) {
  return (mainMuscles ?? []).some(
    (muscle) => getBodyPartId(muscle) === 'shoulders'
  )
}

// ExerciseDB often tags reverse-fly work as delts + traps/rhomboids, with no rear-delt value
function shouldPatchRearDelts(exercise: {
  mainMuscles?: string[]
  secondaryMuscles?: string[]
}) {
  const secondary = exercise.secondaryMuscles ?? []
  return (
    isShoulderMain(exercise.mainMuscles) &&
    hasTraps(secondary) &&
    hasRhomboids(secondary)
  )
}

export function getExerciseBodyParts(exercise: {
  mainMuscles?: string[]
  secondaryMuscles?: string[]
}): BodyPartId[] {
  const bodyParts = getBodyPartsFromMuscles(exercise.mainMuscles)
  if (!shouldPatchRearDelts(exercise)) return bodyParts

  const withoutShoulders = bodyParts.filter((id) => id !== 'shoulders')
  if (withoutShoulders.includes('rearDelts')) return withoutShoulders
  return [...withoutShoulders, 'rearDelts']
}

export function getWorkoutBodyParts(
  workout: Workout | null | undefined
): BodyPartId[] {
  if (!workout?.exercises?.length) return []

  const seen = new Set<BodyPartId>()
  const bodyParts: BodyPartId[] = []

  for (const exercise of workout.exercises) {
    for (const id of getExerciseBodyParts(exercise)) {
      if (seen.has(id)) continue
      seen.add(id)
      bodyParts.push(id)
    }
  }

  return bodyParts
}
