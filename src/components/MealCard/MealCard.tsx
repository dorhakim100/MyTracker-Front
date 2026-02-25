import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { Box, Divider, Typography } from '@mui/material'
import { RootState } from '../../store/store'
import { LoggedList, LogsSource } from '../LoggedList/LoggedList'
import { AddItemButton } from '../AddItemButton/AddItemButton'
import { MealPeriod } from '../../types/mealPeriod/MealPeriod'
import { Log } from '../../types/log/Log'
import { Menu } from '../../types/menu/Menu'

export interface MealCardMeal {
  label: string
  period: string
  rangeLabel: string
  icon: React.ReactNode
}

interface MealCardProps {
  meal: MealCardMeal
  caloriesToSet: number
  showEmptyCardAddButton: boolean
  isAddButton?: boolean
  logsSource?: LogsSource
  logsToShow?: Log[]
  updateMenu?: (newMenu: Menu) => void
  editMenu?: Menu
  noEdit?: boolean
  className?: string
}

export function MealCard({
  meal,
  caloriesToSet,
  showEmptyCardAddButton,
  isAddButton = true,
  logsSource = 'diary',
  logsToShow = [],
  updateMenu,
  editMenu,
  noEdit = false,
  className = '',
}: MealCardProps) {
  const { t } = useTranslation()
  const prefs = useSelector((state: RootState) => state.systemModule.prefs)

  return (
    <Box
      className={`meal-card ${className} ${
        prefs.isDarkMode ? 'dark-mode' : ''
      } ${prefs.favoriteColor || ''}`}
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
      <Divider className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`} />
      <LoggedList
        mealPeriod={meal.period as MealPeriod}
        isAddButton={isAddButton}
        logsSource={logsSource}
        logsToShow={logsToShow}
        updateMenu={updateMenu}
        editMenu={editMenu}
        noEdit={noEdit}
      />
      <div className='meal-footer'>
        <Typography
          variant='body2'
          className='total-calories'
        >
          {`${t('macros.total')}: ${caloriesToSet.toFixed(0)} ${t(
            'macros.kcal'
          )}`}
        </Typography>
        {showEmptyCardAddButton && (
          <AddItemButton mealPeriod={meal.period as MealPeriod} />
        )}
      </div>
    </Box>
  )
}
