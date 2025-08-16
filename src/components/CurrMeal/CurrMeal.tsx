import { Card, Typography } from '@mui/material'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'

interface MealPeriod {
  key: 'morning' | 'lunch' | 'evening'
  label: string
  rangeLabel: string
}

function getCurrentMealPeriod(date: Date = new Date()): MealPeriod {
  const hour = date.getHours()
  if (hour >= 6 && hour < 12) {
    return { key: 'morning', label: 'Morning', rangeLabel: '06:00–12:00' }
  } else if (hour >= 12 && hour < 18) {
    return { key: 'lunch', label: 'Lunch', rangeLabel: '12:00–18:00' }
  } else {
    return { key: 'evening', label: 'Evening', rangeLabel: '18:00–00:00' }
  }
}

export function CurrMeal() {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const period = useMemo(() => getCurrentMealPeriod(), [])

  return (
    <Card className={`card curr-meal ${prefs.isDarkMode ? 'dark-mode' : ''}`}>
      <div className='header'>
        <Typography variant='h6'>Current Meal</Typography>
        <Typography variant='body2' className='period'>
          {period.label} · {period.rangeLabel}
        </Typography>
      </div>

      <div className='logged-items'>
        <div className='placeholder'>No items logged yet</div>
      </div>
    </Card>
  )
}
