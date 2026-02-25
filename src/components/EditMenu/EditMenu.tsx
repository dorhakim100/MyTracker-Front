import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { RootState } from '../../store/store'
import { getMeals } from '../../assets/config/meals'
import { MealCard } from '../MealCard/MealCard'
import { Menu } from '../../types/menu/Menu'
import { menuService } from '../../services/menu/menu.service'
import { StatsCarousel } from '../StatsCarousel/StatsCarousel'
import { CaloriesProgress } from '../CaloriesProgress/CaloriesProgress'
import { MacrosProgress } from '../MacrosProgress/MacrosProgress'

import {
  getMealPeriodTimestamp,
  getPercentage,
} from '../../services/util.service'
import { SlideDialog } from '../SlideDialog/SlideDialog'
import { setIsAddModal, setIsLoading } from '../../store/actions/system.actions'

import { ItemSearch } from '../ItemSearch/ItemSearch'
import { MealItem } from '../../types/mealItem/MealItem'
import { Log } from '../../types/log/Log'
import { logService } from '../../services/log/log.service'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'
import DoneIcon from '@mui/icons-material/Done'
import { CircularProgress, Divider } from '@mui/material'
import { showErrorMsg, showSuccessMsg } from '../../services/event-bus.service'
import { messages } from '../../assets/config/messages'
import { CustomInput } from '../../CustomMui/CustomInput/CustomInput'
import { setMenus } from '../../store/actions/user.actions'

interface EditMenuProps {
  closeDialog: () => void
  menuToEdit?: Menu
}

export function EditMenu({ closeDialog, menuToEdit }: EditMenuProps) {
  const { t } = useTranslation()
  const prefs = useSelector((state: RootState) => state.systemModule.prefs)
  const user = useSelector((state: RootState) => state.userModule.user)
  const isLoading = useSelector(
    (state: RootState) => state.systemModule.isLoading
  )
  const isAddModalOpen = useSelector(
    (state: RootState) => state.systemModule.isAddModal
  )
  const selectedMeal = useSelector(
    (state: RootState) => state.itemModule.selectedMeal
  )
  const menus = useSelector((state: RootState) => state.userModule.menus)
  if (!user) return null

  const meals = getMeals(t)

  const [editMenu, setEditMenu] = useState<Menu>(
    menuToEdit || menuService.getEmptyMenu(user._id)
  )

  const menuStats = useMemo(() => {
    return getMenuStats()
  }, [editMenu.menuLogs, user])

  const getMealCalories = (mealPeriod: string) => {
    if (!editMenu?.menuLogs?.length) return 0
    return editMenu.menuLogs
      .filter((log) => log.meal?.toLowerCase() === mealPeriod)
      .reduce((acc, log) => acc + (log.macros?.calories || 0), 0)
  }

  const getIsPeriodEmpty = (mealPeriod: string) => {
    if (!editMenu?.menuLogs?.length) return true
    return getLogsToShow(mealPeriod).length === 0
  }

  function getMenuStats() {
    const currProtein = editMenu.menuLogs.reduce(
      (acc, log) => acc + (log.macros?.protein || 0),
      0
    )
    const currCarbs = editMenu.menuLogs.reduce(
      (acc, log) => acc + (log.macros?.carbs || 0),
      0
    )
    const currFats = editMenu.menuLogs.reduce(
      (acc, log) => acc + (log.macros?.fat || 0),
      0
    )
    const currCalories = editMenu.menuLogs.reduce(
      (acc, log) => acc + (log.macros?.calories || 0),
      0
    )

    const userProtein = user?.currGoal?.macros.protein || 0
    const userCarbs = user?.currGoal?.macros.carbs || 0
    const userFats = user?.currGoal?.macros.fat || 0

    return {
      calories: currCalories,
      macros: {
        protein: {
          gram: userProtein,

          percentage: getPercentage(currProtein, userProtein),
        },
        carbs: {
          gram: userCarbs,

          percentage: getPercentage(currCarbs, userCarbs),
        },
        fats: {
          gram: userFats,

          percentage: getPercentage(currFats, userFats),
        },
      },
    }
  }

  const onAddToMealClick = async (item: MealItem) => {
    const newLog = {
      itemId: item.searchId,
      meal: selectedMeal,
      macros: item.macros,
      time: getMealPeriodTimestamp(selectedMeal?.toLowerCase() || ''),
      servingSize: item.servingSize,
      numberOfServings: item.numberOfServings,
      source: item.source,
      mealId: item.mealId,
      createdBy: user._id,
      isFixedMenuLog: true,
      name: item.name || t('menu.customItem'),
    } as Log

    try {
      const savedLog = await logService.save(newLog)
      const newMenu = {
        ...editMenu,
        menuLogs: [...editMenu.menuLogs, savedLog],
      }
      setEditMenu(newMenu)
      setIsAddModal(false)
    } catch (err) {
      showErrorMsg(t('error.getItem'))
    }
  }

  function getLogsToShow(mealPeriod: string) {
    const filteredLogs = editMenu?.menuLogs?.filter(
      (log) => log.meal?.toLowerCase() === mealPeriod
    )

    return filteredLogs
  }

  function updateMenu(newMenu: Menu) {
    setEditMenu((prev) => ({ ...prev, ...newMenu }))
    setIsAddModal(false)
  }

  async function onSaveMenu() {
    try {
      setIsLoading(true)
      if (editMenu._id === '') {
        delete (editMenu as Partial<Menu>)._id
      }
      const savedMenu = await menuService.save(editMenu)

      const newMenus = menus.map((m) =>
        m._id === savedMenu._id ? savedMenu : m
      )
      if (newMenus.length === 0) {
        newMenus.push(savedMenu)
      }
      setMenus(newMenus)
      showSuccessMsg(messages.success.saveMeal)
      closeDialog()
    } catch (err) {
      showErrorMsg(t('error.saveMenu'))
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) return null

  return (
    <>
      <div className={`edit-menu  ${prefs.isDarkMode ? 'dark-mode' : ''}`}>
        <div
          className={`stats-container ${prefs.isDarkMode ? 'dark-mode' : ''} ${
            prefs.favoriteColor
          }`}
        >
          <StatsCarousel
            items={[
              <CaloriesProgress
                current={menuStats.calories}
                goal={user.currGoal?.dailyCalories}
                isEditButton={false}
              />,
              <MacrosProgress
                protein={menuStats.macros.protein}
                carbs={menuStats.macros.carbs}
                fats={menuStats.macros.fats}
                isEditButton={false}
              />,
            ]}
            showSkeleton={false}
            skeletonComponent={<></>}
            className={`stats-carousel ${prefs.isDarkMode ? 'dark-mode' : ''}`}
            direction='horizontal'
          />
        </div>
        <CustomInput
          value={editMenu.name || ''}
          onChange={(value) => setEditMenu({ ...editMenu, name: value })}
          placeholder={t('menu.name')}
          className={`${prefs.favoriteColor}`}
        />
        <div
          className={`meals-container ${prefs.isDarkMode ? 'dark-mode' : ''}`}
        >
          {meals.map((meal) => (
            <MealCard
              key={meal.label}
              meal={meal}
              caloriesToSet={getMealCalories(meal.period)}
              showEmptyCardAddButton={!getIsPeriodEmpty(meal.period)}
              isAddButton={true}
              logsSource='menu'
              logsToShow={getLogsToShow(meal.period)}
              updateMenu={updateMenu}
              editMenu={editMenu}
            />
          ))}
        </div>
        <Divider className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`} />
        <CustomButton
          text={t('common.save')}
          onClick={onSaveMenu}
          icon={
            isLoading ? (
              <CircularProgress
                size={20}
                color='inherit'
              />
            ) : (
              <DoneIcon />
            )
          }
          fullWidth={true}
          disabled={isLoading}
        />
      </div>
      <SlideDialog
        open={isAddModalOpen}
        onClose={() => setIsAddModal(false)}
        title={t('menu.editMenu')}
        component={<ItemSearch onAddToMealClick={onAddToMealClick} />}
        type='full'
      />
    </>
  )
}
