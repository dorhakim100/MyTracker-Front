export type EquipmentGroupId =
  | 'barbell'
  | 'dumbbell'
  | 'machine'
  | 'smith'
  | 'cable'
  | 'bodyweight'
  | 'bands'
  | 'kettlebell'

export interface EquipmentGroup {
  id: EquipmentGroupId
  match: string[]
  color: { light: string; dark: string }
}

export const EQUIPMENT_GROUPS: EquipmentGroup[] = [
  {
    id: 'barbell',
    match: ['barbell', 'ez barbell', 'olympic barbell', 'trap bar'],
    color: {
      light: 'var(--picker-color-red)',
      dark: 'var(--picker-color-red-light)',
    },
  },
  {
    id: 'dumbbell',
    match: ['dumbbell'],
    color: {
      light: 'var(--picker-color-blue)',
      dark: 'var(--picker-color-blue-light)',
    },
  },
  {
    id: 'smith',
    match: ['smith machine', 'smith'],
    color: {
      light: 'var(--picker-color-deep-purple)',
      dark: 'var(--picker-color-deep-purple-light)',
    },
  },
  {
    id: 'machine',
    match: [
      'machine',
      'leverage machine',
      'sled machine',
      'smith machine',
      'smith',
      'stepmill machine',
      'elliptical machine',
      'skierg machine',
      'upper body ergometer',
      'stationary bike',
    ],
    color: {
      light: 'var(--picker-color-orange)',
      dark: 'var(--picker-color-orange-light)',
    },
  },
  {
    id: 'cable',
    match: ['cable'],
    color: {
      light: 'var(--picker-color-green)',
      dark: 'var(--picker-color-green-light)',
    },
  },
  {
    id: 'bodyweight',
    match: ['body weight', 'bodyweight', 'weighted', 'assisted'],
    color: {
      light: 'var(--picker-color-yellow)',
      dark: 'var(--picker-color-yellow-light)',
    },
  },
  {
    id: 'bands',
    match: ['band', 'bands', 'resistance band'],
    color: {
      light: 'var(--picker-color-pink)',
      dark: 'var(--picker-color-pink-light)',
    },
  },
  {
    id: 'kettlebell',
    match: ['kettlebell'],
    color: {
      light: 'var(--picker-color-purple)',
      dark: 'var(--picker-color-purple-light)',
    },
  },
]

export const equipmentsValues = [
  'All',
  'Barbell',
  'Dumbbell',
  'Machine',
  'Smith',
  'Cable',
  'Bodyweight',
  'Bands',
  'Kettlebell',
]

export function equipmentGroupForStored(value: string) {
  const name = value.toLowerCase()
  const specific = EQUIPMENT_GROUPS.find(
    (group) => group.id !== 'machine' && group.match.includes(name)
  )
  if (specific) return specific
  return EQUIPMENT_GROUPS.find((group) => group.match.includes(name))
}

export function equipmentGroupIds(values: string[] = []) {
  const ids: EquipmentGroupId[] = []
  values.forEach((value) => {
    const group = equipmentGroupForStored(value)
    if (group && !ids.includes(group.id)) ids.push(group.id)
  })
  return ids
}

export function equipmentMatchValues(filterValue: string) {
  if (!filterValue || filterValue === 'All') return []
  const id = filterValue.toLowerCase() as EquipmentGroupId
  const group = EQUIPMENT_GROUPS.find((item) => item.id === id)
  return group?.match || [filterValue.toLowerCase()]
}
