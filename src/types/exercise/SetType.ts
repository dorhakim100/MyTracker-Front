export const SET_TYPES = [
  'normal',
  'warmUp',
  'failure',
  'drop',
  'myoReps',
] as const

export type SetType = (typeof SET_TYPES)[number]

export function isSetType(value: unknown): value is SetType {
  return SET_TYPES.some((type) => type === value)
}
