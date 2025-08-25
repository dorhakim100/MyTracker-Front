import { Card, IconButton, Typography } from '@mui/material'
import { useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'

import { CustomList } from '../../CustomMui/CustomList/CustomList'
import { Log } from '../../types/log/Log'
import { loadItems } from '../../store/actions/item.actions'
import DeleteIcon from '@mui/icons-material/Delete'

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

  const user = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.user
  )

  const cachedItems = useSelector(
    (stateSelector: RootState) => stateSelector.itemModule.items
  )

  const period = useMemo(() => getCurrentMealPeriod(), [])

  useEffect(() => {
    loadItems()
  }, [])

  const renderList = () => {
    if (!user || !user.loggedToday.logs)
      return (
        <div className='logged-items'>
          <div className='placeholder'>No items logged yet</div>
        </div>
      )

    const logs = user.loggedToday.logs

    const getKey = (item: Log) => item.itemId + item.time

    const renderPrimaryText = (item: Log) => {
      const cachedItem = cachedItems.find((i) => i.searchId === item.itemId)
      return cachedItem?.name
    }

    const renderSecondaryText = (item: Log) => {
      const cachedItem = cachedItems.find((i) => i.searchId === item.itemId)
      return `${cachedItem?.macros?.calories} kcal`
    }

    const renderRight = (item: Log) => {
      const cachedItem = cachedItems.find((i) => i.searchId === item.itemId)
      // return (
      //   <MacrosDonut
      //     protein={cachedItem?.macros?.protein || 0}
      //     carbs={cachedItem?.macros?.carbs || 0}
      //     fats={cachedItem?.macros?.fat || 0}
      //   />
      // )
      return (
        <IconButton>
          <DeleteIcon />
        </IconButton>
      )
    }

    return (
      <CustomList
        items={logs}
        getKey={getKey}
        renderPrimaryText={renderPrimaryText}
        renderSecondaryText={renderSecondaryText}
        renderRight={renderRight}
      />
    )
  }

  return (
    <Card className={`card curr-meal ${prefs.isDarkMode ? 'dark-mode' : ''}`}>
      <div className='header'>
        <Typography variant='h6'>Current Meal</Typography>
        <Typography variant='body2' className='period'>
          {period.label} · {period.rangeLabel}
        </Typography>
      </div>
      {renderList()}
    </Card>
  )
}
