import { getArrayOfNumbers } from '../../services/util.service'

export const exersiceDetailsSelects = [
  {
    name: 'sets',
    label: 'Sets',
    type: 'number',
    values: getArrayOfNumbers(1, 15),
    isAfterValue: false,
  },
  {
    name: 'reps',
    label: 'Reps',
    type: 'number',
    values: getArrayOfNumbers(1, 25),
    isAfterValue: false,
  },
  {
    name: 'weight',
    label: 'Weight',
    type: 'number',
    values: getArrayOfNumbers(1, 320),
    isAfterValue: true,
  },
  {
    name: 'rpe',
    label: 'RPE',
    type: 'number',
    values: getArrayOfNumbers(1, 10),
    isAfterValue: true,
  },
  {
    name: 'rir',
    label: 'RIR',
    type: 'number',
    values: getArrayOfNumbers(1, 10),
    isAfterValue: false,
  },
]
