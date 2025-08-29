import React, { useMemo } from 'react'
import { LoggedList } from '../../components/LoggedList/LoggedList'
import { Box, Divider, IconButton, Typography } from '@mui/material'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'

import { TimesContainer } from '../../components/TimesContainer/TimesContainer'
import { getPercentageValue } from '../../services/macros/macros.service'

import { CustomAccordion } from '../../CustomMui/CustomAccordion/CustomAccordion'
import { LinearMacrosProgress } from '../../components/LinearMacrosProgress/LinearMacrosProgress'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

export function Diary() {
  const prefs = useSelector((state: RootState) => state.systemModule.prefs)
  const user = useSelector((state: RootState) => state.userModule.user)

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

  const totalBreakfastCalories = useMemo(() => {
    return getTotalCalories('breakfast')
  }, [user])
  const totalLunchCalories = useMemo(() => {
    return getTotalCalories('lunch')
  }, [user])
  const totalDinnerCalories = useMemo(() => {
    return getTotalCalories('dinner')
  }, [user])

  function getTotalCalories(meal: string) {
    return user
      ? user?.loggedToday.logs
          .filter((log) => log.meal.toLocaleLowerCase() === meal)
          .reduce((acc, log) => acc + log.macros.calories, 0)
      : 0
  }

  const getMealCalories = (meal: string) => {
    let caloriesToSet
    switch (meal) {
      case 'breakfast':
        caloriesToSet = totalBreakfastCalories
        break
      case 'lunch':
        caloriesToSet = totalLunchCalories
        break
      case 'dinner':
        caloriesToSet = totalDinnerCalories
        break
      default:
        caloriesToSet = 0
        break
    }
    return caloriesToSet
  }

  if (user)
    return (
      <div
        className={`diary page-container ${
          prefs.isDarkMode ? 'dark-mode' : ''
        }`}
      >
        <div className='header'>
          <IconButton>
            <ArrowBackIcon />
          </IconButton>
          <TimesContainer />
          <IconButton>
            <ArrowForwardIcon />
          </IconButton>
        </div>
        <CustomAccordion
          title='Macros'
          cmp={
            <LinearMacrosProgress
              caloriesProgress={user?.loggedToday.calories}
              proteinProgress={getPercentageValue('protein', user)}
              carbsProgress={getPercentageValue('carbs', user)}
              fatsProgress={getPercentageValue('fat', user)}
            />
          }
        />

        <div
          className={`meals-container ${prefs.isDarkMode ? 'dark-mode' : ''}`}
        >
          {meals.map((meal) => {
            const currMeal = meal.period
            const caloriesToSet = getMealCalories(currMeal)
            return (
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
                <Typography variant='body2' className='total-calories'>
                  {`Total: ${caloriesToSet} kcal`}
                </Typography>
              </Box>
            )
          })}
        </div>
      </div>
    )
}
