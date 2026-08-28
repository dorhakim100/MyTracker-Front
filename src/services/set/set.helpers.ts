import { Set } from '../../types/exercise/Exercise'

export type ExerciseViewBy = 'weight' | 'reps' | 'volume'
export type SetPickMetric = 'weight' | 'reps'

export function getPickMetric(viewBy: ExerciseViewBy): SetPickMetric {
  return viewBy === 'reps' ? 'reps' : 'weight'
}

export function pickBestSet(
  sets: Set[],
  main: SetPickMetric
): Set | undefined {
  if (!sets.length) return undefined

  const secondary: SetPickMetric = main === 'weight' ? 'reps' : 'weight'

  return sets.reduce((best, set) => {
    const mainVal = set[main].actual ?? 0
    const bestMain = best[main].actual ?? 0
    if (mainVal !== bestMain) return mainVal > bestMain ? set : best

    const secVal = set[secondary].actual ?? 0
    const bestSec = best[secondary].actual ?? 0
    return secVal > bestSec ? set : best
  })
}

export function getSessionVolume(sets: Set[]): number {
  return sets.reduce((sum, set) => {
    return sum + (set.weight.actual ?? 0) * (set.reps.actual ?? 0)
  }, 0)
}
