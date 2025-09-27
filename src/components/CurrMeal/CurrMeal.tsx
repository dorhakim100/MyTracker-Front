import { Card, Typography } from '@mui/material'
import { useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'

import { loadItems } from '../../store/actions/item.actions'

import { LoggedList } from '../LoggedList/LoggedList'

import WbTwilightIcon from '@mui/icons-material/WbTwilight'
import LightModeIcon from '@mui/icons-material/LightMode'
import BedtimeIcon from '@mui/icons-material/Bedtime'

interface MealPeriod {
  key: 'breakfast' | 'lunch' | 'dinner'
  label: string
  rangeLabel: string
  icon: React.ReactNode
}

function getCurrentMealPeriod(date: Date = new Date()): MealPeriod {
  const hour = date.getHours()
  if (hour >= 6 && hour < 12) {
    return {
      key: 'breakfast',
      label: 'Breakfast',
      rangeLabel: '06:00 – 12:00',
      icon: <WbTwilightIcon />,
    }
  } else if (hour >= 12 && hour < 18) {
    return {
      key: 'lunch',
      label: 'Lunch',
      rangeLabel: '12:00 – 18:00',
      icon: <LightModeIcon />,
    }
  } else {
    return {
      key: 'dinner',
      label: 'Dinner',
      rangeLabel: '18:00 – 00:00',
      icon: <BedtimeIcon />,
    }
  }
}

export function CurrMeal() {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const user = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.user
  )

  const period = useMemo(() => getCurrentMealPeriod(), [])

  useEffect(() => {
    loadItems()
  }, [user])

  return (
    <Card className={`card curr-meal ${prefs.isDarkMode ? 'dark-mode' : ''}`}>
      <div className='header'>
        <div className='label-container'>
          {period.icon}
          <Typography variant='h6'>Current Meal</Typography>
        </div>
        <Typography variant='body2' className='period'>
          {period.label} · {period.rangeLabel}
        </Typography>
      </div>
      <LoggedList mealPeriod={period.key} />
    </Card>
  )
}
