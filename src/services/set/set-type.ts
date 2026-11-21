import { Set } from '../../types/exercise/Exercise'
import { isSetType, SetType } from '../../types/exercise/SetType'
import { DEFAULT_RESTING_TIME } from '../../assets/config/times'

const MARK: Record<Exclude<SetType, 'normal'>, string> = {
  warmUp: 'W',
  failure: 'F',
  drop: 'D',
  myoReps: 'M',
}

export function setTypeOf(set?: { type?: string }): SetType {
  if (set && isSetType(set.type)) return set.type
  return 'normal'
}

export function withStoredType<T extends { type?: string }>(set: T): T & {
  type: SetType
} {
  return { ...set, type: setTypeOf(set) }
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

export function setMark(sets: { type?: string }[], index: number) {
  const type = setTypeOf(sets[index])
  if (type !== 'normal') return MARK[type]

  let number = 0
  for (let i = 0; i <= index; i++) {
    if (isCountingType(setTypeOf(sets[i]))) number += 1
  }
  return String(number)
}

export function exerciseIsDone(sets: { type?: string; isDone?: boolean }[]) {
  const counting = sets.filter((set) => countsAsDone(setTypeOf(set)))
  if (!counting.length) return true
  return counting.every((set) => set.isDone)
}

export function progressPercent(sets: { type?: string; isDone?: boolean }[]) {
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

  return { ...set, type: 'failure', rpe, rir }
}

export function restOf(set: { restingTime?: number }, fallback?: number) {
  return set.restingTime ?? fallback ?? DEFAULT_RESTING_TIME
}
