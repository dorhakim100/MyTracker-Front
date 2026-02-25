import { useState, useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Divider, Typography } from '@mui/material'
import { RootState } from '../../../store/store'
import { CustomButton } from '../../../CustomMui/CustomButton/CustomButton'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import { SlideDialog } from '../../../components/SlideDialog/SlideDialog'
import { getMeals } from '../../../assets/config/meals'
import { EditMenu } from '../../../components/EditMenu/EditMenu'
import { MenusList } from '../../../components/MenusList/MenusList'
import { loadMenus } from '../../../store/actions/user.actions'
import { MealCard } from '../../../components/MealCard/MealCard'
import { Add } from '@mui/icons-material'

interface MenuListDialogOptions {
  open: boolean
  type: 'menuList' | 'editMenu' | null
}

export function FixedMenu() {
  const { t } = useTranslation()
  const prefs = useSelector((state: RootState) => state.systemModule.prefs)
  const user = useSelector((state: RootState) => state.userModule.user)
  const menu = useSelector((state: RootState) => state.userModule.menu)
  const menus = useSelector((state: RootState) => state.userModule.menus)

  const meals = getMeals(t)

  const logs = useMemo(() => {
    if (!menu?.menuLogs?.length) return []
    return menu.menuLogs
  }, [menu])

  useEffect(() => {
    if (!user?._id) return
    loadMenus(user._id)
  }, [user?._id])

  const [menuListDialogOptions, setMenuListDialogOptions] =
    useState<MenuListDialogOptions>({
      open: false,
      type: null,
    })

  const getDialogContent = () => {
    if (!menuListDialogOptions.type) return <></>
    switch (menuListDialogOptions.type) {
      case 'menuList':
        return (
          <MenusList
            onAddClick={() => {
              closeDialog()
              openEditMenuDialog()
            }}
          />
        )
      case 'editMenu':
        return <EditMenu closeDialog={closeDialog} />
      default:
        return <></>
    }
  }

  const openMenuListDialog = () => {
    setMenuListDialogOptions({
      open: true,
      type: 'menuList',
    })
  }

  const openEditMenuDialog = () => {
    setMenuListDialogOptions({
      open: true,
      type: 'editMenu',
    })
  }

  const closeDialog = () => {
    setMenuListDialogOptions({
      open: false,
      type: null,
    })
  }
  const renderNoMenuSelected = () => {
    if (menus.length === 0)
      return (
        <div className='no-results-container'>
          <span>{t('menu.noMenuFound')}</span>
          <CustomButton
            text={t('common.add')}
            onClick={openEditMenuDialog}
            icon={<Add />}
          />
        </div>
      )

    return <MenusList onAddClick={openEditMenuDialog} />
  }

  const getLogsCalories = (mealPeriod: string) => {
    if (!logs?.length) return 0
    return logs
      .filter((log) => log.meal?.toLowerCase() === mealPeriod.toLowerCase())
      .reduce((acc, log) => acc + (log.macros?.calories || 0), 0)
  }

  const getLogsToShow = (mealPeriod: string) => {
    if (!logs?.length) return []
    return logs.filter(
      (log) => log.meal?.toLowerCase() === mealPeriod.toLowerCase()
    )
  }

  return (
    <>
      <div
        className={`fixed-menu page-container ${
          prefs.isDarkMode ? 'dark-mode' : ''
        }`}
      >
        <div className='fixed-menu-header'>
          <Typography
            variant='h5'
            className='bold-header'
          >
            {t('prefs.fixedMenu')}
          </Typography>
          <div className='fixed-menu-actions'>
            {menu && (
              <CustomButton
                text={t('menu.viewMenus')}
                onClick={openMenuListDialog}
                icon={<MenuBookIcon />}
              />
            )}
          </div>
        </div>
        <Divider className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`} />

        {menu ? (
          <div className='meals-container'>
            {meals.map((meal) => (
              <MealCard
                key={meal.label}
                meal={meal}
                caloriesToSet={getLogsCalories(meal.period)}
                showEmptyCardAddButton={false}
                isAddButton={false}
                logsToShow={getLogsToShow(meal.period)}
                logsSource='menu'
                noEdit={true}
              />
            ))}
          </div>
        ) : (
          renderNoMenuSelected()
        )}
      </div>
      <SlideDialog
        open={menuListDialogOptions.open}
        onClose={closeDialog}
        title={
          menuListDialogOptions.type === 'editMenu'
            ? t('menu.editMenu')
            : t('menu.viewMenus')
        }
        component={getDialogContent()}
        type='full'
      />
    </>
  )
}
