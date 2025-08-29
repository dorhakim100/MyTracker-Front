import React, { useMemo } from 'react'
import { LoggedList } from '../../components/LoggedList/LoggedList'
import { Box, Divider, IconButton, Typography } from '@mui/material'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { CircularProgress } from '../../components/CircularProgress/CircularProgress'
import { TimesContainer } from '../../components/TimesContainer/TimesContainer'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

import LinearProgress from '@mui/material/LinearProgress'
import CustomLinearProgress from '../../CustomMui/CustomLinearProgress/CustomLinearProgress'

const proteinColor = 'var(--macro-protein)'
const carbsColor = 'var(--macro-carbs)'
const fatsColor = 'var(--macro-fats)'

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

  const getPercentageValue = (type = 'calories') => {
    if (user) {
      switch (type) {
        case 'calories':
          return (
            (user.loggedToday.calories / user?.currGoal?.dailyCalories) * 100
          )
        case 'protein':
          return (getProteinAmount() / user?.currGoal?.macros.protein) * 100
      }
    }
    return 0
  }

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

  const getProteinAmount = () => {
    return user
      ? Math.round(
          user.loggedToday.logs.reduce(
            (acc, log) => acc + log.macros.protein,
            0
          )
        )
      : 0
  }

  return (
    <div
      className={`diary page-container ${prefs.isDarkMode ? 'dark-mode' : ''}`}
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

      <CustomLinearProgress
        value={50}
        color={proteinColor}
        leftValue={'50'}
        rightValue={'100'}
        header='Protein'
      />
      <CustomLinearProgress
        value={70}
        color={carbsColor}
        leftValue={'50'}
        rightValue={'100'}
        header='Carbs'
      />

      <div className={`meals-container ${prefs.isDarkMode ? 'dark-mode' : ''}`}>
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
