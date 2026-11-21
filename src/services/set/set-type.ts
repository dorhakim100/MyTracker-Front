import { Set } from '../../types/exercise/Exercise'
import { isSetType, SetType } from '../../types/exercise/SetType'
import { ExpectedActual } from '../../types/expectedActual/ExpectedActual'
import { DEFAULT_RESTING_TIME } from '../../assets/config/times'

const MARK: Record<Exclude<SetType, 'normal'>, string> = {
  warmUp: 'W',
  failure: 'F',
  drop: 'D',
  myoReps: 'M',
}

export function setTypeOf(
  set?: { type?: Set['type'] },
  side: 'expected' | 'actual' = 'actual'
): SetType {
  const type = set?.type
  if (isSetType(type)) return type
  if (type && typeof type === 'object') {
    const picked = type[side]
    if (isSetType(picked)) return picked
  }
  return 'normal'
}

export function withStoredType<T extends { type?: Set['type'] }>(
  set: T
): T & { type: ExpectedActual<SetType> } {
  return {
    ...set,
    type: {
      expected: setTypeOf(set, 'expected'),
      actual: setTypeOf(set, 'actual'),
    },
  }
}

export function isCountingType(type: SetType) {
  return type === 'normal' || type === 'failure'
}

export function countsAsDone(type: SetType) {
  return type !== 'warmUp'
}

export function countsInVolume(type: SetType) {
  return type !== 'warmUp'
}

export function setMark(sets: { type?: Set['type'] }[], index: number) {
  const type = setTypeOf(sets[index])
  if (type !== 'normal') return MARK[type]

  let number = 0
  for (let i = 0; i <= index; i++) {
    if (isCountingType(setTypeOf(sets[i]))) number += 1
  }
  return String(number)
}

export function exerciseIsDone(
  sets: { type?: Set['type']; isDone?: boolean }[]
) {
  const counting = sets.filter((set) => countsAsDone(setTypeOf(set)))
  if (!counting.length) return true
  return counting.every((set) => set.isDone)
}

export function progressPercent(
  sets: { type?: Set['type']; isDone?: boolean }[]
) {
  const counting = sets.filter((set) => countsAsDone(setTypeOf(set)))
  if (!counting.length) return 100
  const done = counting.filter((set) => set.isDone).length
  return (done / counting.length) * 100
}

export function applyFailureEffort(set: Set, isPlanning: boolean): Set {
  const rpe = isPlanning
    ? { expected: 9.9, actual: 9.9 }
    : { expected: set.rpe?.expected ?? 9.9, actual: 9.9 }
  const rir = isPlanning
    ? { expected: 0, actual: 0 }
    : { expected: set.rir?.expected ?? 0, actual: 0 }
  const type: ExpectedActual<SetType> = isPlanning
    ? { expected: 'failure', actual: 'failure' }
    : { expected: setTypeOf(set, 'expected'), actual: 'failure' }

  return { ...set, type, rpe, rir }
}

export function restOf(set: { restingTime?: number }, fallback?: number) {
  return set.restingTime ?? fallback ?? DEFAULT_RESTING_TIME
}
