import { useMemo, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { LoggedList } from '../../../components/LoggedList/LoggedList'
import { Box, Divider, Typography } from '@mui/material'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store/store'

import { getMacrosAmountFromDay } from '../../../services/macros/macros.service'

import { CustomAccordion } from '../../../CustomMui/CustomAccordion/CustomAccordion'
import { LinearMacrosProgress } from '../../../components/LinearMacrosProgress/LinearMacrosProgress'
import { DayController } from '../../../components/DayController/DayController'
import { dayService } from '../../../services/day/day.service'
import { showErrorMsg } from '../../../services/event-bus.service'
import { messages } from '../../../assets/config/messages'
import { SlideAnimation } from '../../../components/SlideAnimation/SlideAnimation'
import { setSelectedDiaryDay } from '../../../store/actions/user.actions'
import { MealPeriod } from '../../../types/mealPeriod/MealPeriod'
import { AddItemButton } from '../../../components/AddItemButton/AddItemButton'
import DonutLargeIcon from '@mui/icons-material/DonutLarge'
import WbTwilightIcon from '@mui/icons-material/WbTwilight'
import LightModeIcon from '@mui/icons-material/LightMode'
import BedtimeIcon from '@mui/icons-material/Bedtime'
import IcecreamIcon from '@mui/icons-material/Icecream'

import { getDateFromISO } from '../../../services/util.service'
import { DAY_IN_MS } from '../../../assets/config/times'

export function Diary() {
  const { t } = useTranslation()
  const prefs = useSelector((state: RootState) => state.systemModule.prefs)
  const user = useSelector((state: RootState) => state.userModule.user)
  const selectedDayDiary = useSelector(
    (state: RootState) => state.userModule.selectedDay
  )
  const timer = useSelector((state: RootState) => state.workoutModule.timer)

  const [selectedDay, setSelectedDay] = useState(new Date())

  const [diaryFilter, setDiaryFilter] = useState({
    userId: user?._id,
    date: selectedDay.toISOString(),
  })

  const location = useLocation()

  const [direction, setDirection] = useState(1)
  const isToday = useMemo(() => {
    const isToday =
      selectedDayDiary?.date === getDateFromISO(new Date().toISOString())

    return isToday
  }, [selectedDayDiary?.date])

  const meals = [
    {
      label: t('meals.breakfast'),
      period: 'breakfast',
      rangeLabel: '06:00 – 12:00',
      icon: <WbTwilightIcon />,
    },
    {
      label: t('meals.lunch'),
      period: 'lunch',
      rangeLabel: '12:00 – 18:00',
      icon: <LightModeIcon />,
    },
    {
      label: t('meals.dinner'),
      period: 'dinner',
      rangeLabel: '18:00 – 00:00',
      icon: <BedtimeIcon />,
    },
    {
      label: t('meals.snacks'),
      period: 'snacks',
      rangeLabel: t('meals.duringTheDay'),
      icon: <IcecreamIcon />,
    },
  ]

  const totalBreakfastCalories = useMemo(() => {
    return getTotalCalories('breakfast')
  }, [selectedDayDiary])
  const totalLunchCalories = useMemo(() => {
    return getTotalCalories('lunch')
  }, [selectedDayDiary])
  const totalDinnerCalories = useMemo(() => {
    return getTotalCalories('dinner')
  }, [selectedDayDiary])
  const totalSnacksCalories = useMemo(() => {
    return getTotalCalories('snacks')
  }, [selectedDayDiary])

  useEffect(() => {
    const handleGetDiary = async () => {
      try {
        const diary = await dayService.query(diaryFilter)

        setSelectedDiaryDay(diary)
      } catch (error) {
        console.log(error)
        showErrorMsg(messages.error.getDiary)
      }
    }
    if (!user || !selectedDayDiary) return

    handleGetDiary()
  }, [selectedDay, user])

  useEffect(() => {
    const loggedToday = user?.loggedToday
    setSelectedDiaryDay(loggedToday || null)
  }, [location.pathname])

  function getTotalCalories(meal: string) {
    return selectedDayDiary?.logs?.length
      ? selectedDayDiary.logs
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
      case 'snacks':
        caloriesToSet = totalSnacksCalories
        break
      default:
        caloriesToSet = 0
        break
    }
    return caloriesToSet
  }

  const onDayChange = (diff: number) => {
    const newDate = new Date(selectedDay.getTime() + diff * DAY_IN_MS)
    setDirection(diff)
    setSelectedDay(newDate)
    setDiaryFilter({
      userId: user?._id,
      date: newDate?.toISOString(),
    })
  }

  const onDateChange = (date: string) => {
    setSelectedDay(new Date(date))
    setDiaryFilter({
      userId: user?._id,
      date: date,
    })
  }

  if (user && selectedDayDiary)
    return (
      <div
        className={`diary page-container ${
          prefs.isDarkMode ? 'dark-mode' : ''
        } ${timer ? 'has-timer' : ''}`}
      >
        <DayController
          selectedDay={selectedDay}
          selectedDayDate={selectedDayDiary.date}
          isToday={isToday}
          onDayChange={onDayChange}
          onDateChange={onDateChange}
        />
        <div className='macros-accordion-container'>
          <CustomAccordion
            title={t('macros.macros')}
            cmp={
              <LinearMacrosProgress
                caloriesProgress={selectedDayDiary?.calories || 0}
                proteinProgress={
                  getMacrosAmountFromDay(selectedDayDiary, 'protein') as number
                }
                carbsProgress={
                  getMacrosAmountFromDay(selectedDayDiary, 'carbs') as number
                }
                fatsProgress={
                  getMacrosAmountFromDay(selectedDayDiary, 'fat') as number
                }
              />
            }
            icon={<DonutLargeIcon />}
          />
        </div>

        <SlideAnimation
          motionKey={selectedDayDiary?._id || ''}
          direction={direction}
          duration={0.25}
        >
          <div
            className={`meals-container ${prefs.isDarkMode ? 'dark-mode' : ''}`}
          >
            {meals.map((meal) => {
              const currMeal = meal.period
              const caloriesToSet = getMealCalories(currMeal)
              const hasItems = selectedDayDiary?.logs?.filter(
                (log) => log.meal.toLocaleLowerCase() === currMeal
              )
              return (
                <Box
                  className={`diary-meal-container ${
                    prefs.isDarkMode ? 'dark-mode' : ''
                  } ${prefs.favoriteColor || ''}`}
                  key={meal.label}
                >
                  <div className='header'>
                    <div className='label-container'>
                      {meal.icon}
                      <Typography
                        variant='h6'
                        className='bold-header'
                      >
                        {meal.label}
                      </Typography>
                    </div>
                    <Typography
                      variant='body2'
                      className='period'
                    >
                      {meal.rangeLabel}
                    </Typography>
                  </div>
                  <Divider
                    className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`}
                  />
                  <LoggedList mealPeriod={meal.period as MealPeriod} />
                  <div className='meal-footer'>
                    <Typography
                      variant='body2'
                      className='total-calories'
                    >
                      {`${t('macros.total')}: ${caloriesToSet.toFixed(0)} ${t('macros.kcal')}`}
                    </Typography>
                    {hasItems?.length !== 0 && (
                      <AddItemButton mealPeriod={meal.period as MealPeriod} />
                    )}
                  </div>
                </Box>
              )
            })}
          </div>
        </SlideAnimation>
      </div>
    )
}
