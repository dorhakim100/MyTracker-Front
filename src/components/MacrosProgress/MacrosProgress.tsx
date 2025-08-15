import React from 'react'

import { Card, Typography } from '@mui/material'

import { CircularProgress } from '../CircularProgress/CircularProgress'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { EditIcon } from '../EditIcon/EditIcon'

const proteinColor = 'var(--macro-protein)'
const carbsColor = 'var(--macro-carbs)'
const fatsColor = 'var(--macro-fats)'

const proteinColorDarkMode = 'var(--macro-protein-dark)'
const carbsColorDarkMode = 'var(--macro-carbs-dark)'
const fatsColorDarkMode = 'var(--macro-fats-dark)'

interface MacrosProgressProps {
  protein: number
  carbs: number
  fats: number
}

export function MacrosProgress({ protein, carbs, fats }: MacrosProgressProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const macros = [
    {
      name: 'Protein',
      value: protein,
      color: prefs.isDarkMode ? proteinColorDarkMode : proteinColor,
    },
    {
      name: 'Carbs',
      value: carbs,
      color: prefs.isDarkMode ? carbsColorDarkMode : carbsColor,
    },
    {
      name: 'Fats',
      value: fats,
      color: prefs.isDarkMode ? fatsColorDarkMode : fatsColor,
    },
  ]

  const edit = () => {
    console.log('edit')
  }

  return (
    <Card
      className={`card macros-progress ${prefs.isDarkMode ? 'dark-mode' : ''}`}
    >
      <Typography variant='h6'>Macros</Typography>
      <EditIcon onClick={edit} />
      <div className='macros-container'>
        {macros.map((macro) => (
          <div className='macro-container' key={`progress-${macro.name}`}>
            <CircularProgress
              value={macro.value}
              text={`${macro.value}`}
              color={macro.color}
            />
            <span>{macro.name}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
