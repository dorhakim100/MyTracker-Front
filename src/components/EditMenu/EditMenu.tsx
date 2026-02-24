import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Divider, Typography } from '@mui/material'
import { RootState } from '../../store/store'
import { getMeals } from '../../assets/config/meals'
import { MealCard } from '../MealCard/MealCard'
import { Menu } from '../../types/menu/Menu'
import { menuService } from '../../services/menu/menu.service'

export function EditMenu() {
  const { t } = useTranslation()
  const prefs = useSelector((state: RootState) => state.systemModule.prefs)
  const user = useSelector((state: RootState) => state.userModule.user)
  const menu = useSelector((state: RootState) => state.userModule.menu)

  if (!user) return null

  const meals = getMeals(t)

  const [editMenu, setEditMenu] = useState<Menu>(
    menuService.getEmptyMenu(user._id)
  )

  const getMealCalories = (mealPeriod: string) => {
    if (!editMenu?.menuLogs?.length) return 0
    return editMenu.menuLogs
      .filter((log) => log.meal?.toLowerCase() === mealPeriod)
      .reduce((acc, log) => acc + (log.macros?.calories || 0), 0)
  }

  const getIsPeriodEmpty = (mealPeriod: string) => {
    if (!editMenu?.menuLogs?.length) return true
    return (
      editMenu.menuLogs.filter((log) => log.meal?.toLowerCase() === mealPeriod)
        .length === 0
    )
  }

  if (!user) return null

  return (
    <div
      className={`edit-menu page-container ${
        prefs.isDarkMode ? 'dark-mode' : ''
      }`}
    >
      <div className={`meals-container ${prefs.isDarkMode ? 'dark-mode' : ''}`}>
        {meals.map((meal) => (
          <MealCard
            key={meal.label}
            meal={meal}
            caloriesToSet={getMealCalories(meal.period)}
            showEmptyCardAddButton={!getIsPeriodEmpty(meal.period)}
            isAddButton={!editMenu?.menuLogs?.length}
            logsSource='menu'
          />
        ))}
      </div>
    </div>
  )
}
