import React, { useState } from 'react'

import { Box, Card, Typography } from '@mui/material'

import { CircularProgress } from '../CircularProgress/CircularProgress'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { EditIcon } from '../EditIcon/EditIcon'
import { SlideDialog } from '../SlideDialog/SlideDialog'

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

  const [openModal, setOpenModal] = useState(false)

  const macros = [
    {
      name: 'Carbs',
      value: carbs,
      color: prefs.isDarkMode ? carbsColorDarkMode : carbsColor,
    },
    {
      name: 'Protein',
      value: protein,
      color: prefs.isDarkMode ? proteinColorDarkMode : proteinColor,
    },
    {
      name: 'Fats',
      value: fats,
      color: prefs.isDarkMode ? fatsColorDarkMode : fatsColor,
    },
  ]

  const edit = () => {
    console.log('edit')
    setOpenModal(true)
  }

  const onClose = () => {
    setOpenModal(false)
  }

  return (
    <>
      <Card
        className={`card macros-progress ${
          prefs.isDarkMode ? 'dark-mode' : ''
        }`}
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
      <SlideDialog
        open={openModal}
        onClose={onClose}
        component={<EditComponent />}
        title='Edit Macros'
      />
    </>
  )
}

import Picker from 'react-mobile-picker'
import {
  capitalizeFirstLetter,
  getArrayOfNumbers,
} from '../../services/util.service'

function EditComponent() {
  interface PickerValue {
    carbs: number
    protein: number
    fats: number
    [key: string]: number
  }

  const macros = {
    carbs: getArrayOfNumbers(0, 100),
    protein: getArrayOfNumbers(0, 100),
    fats: getArrayOfNumbers(0, 100),
  }

  const [pickerValue, setPickerValue] = useState<PickerValue>({
    carbs: 0,
    protein: 0,
    fats: 0,
  })

  const macroKeys = Object.keys(macros) as (keyof typeof macros)[]

  return (
    <Box className='edit-macros-container'>
      <div className='picker-container'>
        <Picker
          value={pickerValue}
          onChange={(next) => setPickerValue(next as unknown as PickerValue)}
          height={150}
        >
          {macroKeys.map((name) => {
            const macroName = name as string
            return (
              <Picker.Column key={`${macroName}-picker`} name={macroName}>
                {macros[name].map((option: number) => (
                  <Picker.Item key={option} value={option}>
                    {option}
                  </Picker.Item>
                ))}
              </Picker.Column>
            )
          })}
        </Picker>
      </div>

      <div className='macros-title-container'>
        {macroKeys.map((name) => {
          const macroName = name as string
          return (
            <div className='macro-container' key={`name-${macroName}`}>
              <div className={`banner ${macroName}`}>
                <span className='title'>
                  {capitalizeFirstLetter(macroName)}
                </span>
              </div>
              <Typography variant='h6' className='value'>
                {pickerValue[macroName]}g
              </Typography>
            </div>
          )
        })}
      </div>
    </Box>
  )
}
