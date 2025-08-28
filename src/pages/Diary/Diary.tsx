import React from 'react'
import { LoggedList } from '../../components/LoggedList/LoggedList'
import { Box, Divider, Typography } from '@mui/material'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'

export function Diary() {
  const prefs = useSelector((state: RootState) => state.systemModule.prefs)

  const meals = [
    {
      label: 'Breakfast',
      period: 'breakfast',
      rangeLabel: '06:00–12:00',
    },
    {
      label: 'Lunch',
      period: 'lunch',
      rangeLabel: '12:00–18:00',
    },
    {
      label: 'Dinner',
      period: 'dinner',
      rangeLabel: '18:00–00:00',
    },
  ]

  return (
    <div
      className={`diary page-container ${prefs.isDarkMode ? 'dark-mode' : ''}`}
    >
      <div className='header'>
        <Typography variant='h6'>Diary</Typography>
      </div>
      <div className={`meals-container ${prefs.isDarkMode ? 'dark-mode' : ''}`}>
        {meals.map((meal) => (
          <Box
            className={`diary-meal-container ${
              prefs.isDarkMode ? 'dark-mode' : ''
            }`}
            key={meal.label}
          >
            <div className='header'>
              <Typography variant='h6'>{meal.label}</Typography>
              <Typography variant='body2' className='period'>
                {meal.rangeLabel}
              </Typography>
            </div>
            <Divider
              className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`}
            />
            <LoggedList
              mealPeriod={meal.period as 'breakfast' | 'lunch' | 'dinner'}
            />
          </Box>
        ))}
      </div>
    </div>
  )
}
