import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Divider, Typography } from '@mui/material'
import { RootState } from '../../../store/store'
import { CustomButton } from '../../../CustomMui/CustomButton/CustomButton'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import { SlideDialog } from '../../../components/SlideDialog/SlideDialog'
import { getMeals } from '../../../assets/config/meals'
import { EditMenu } from '../../../components/EditMenu/EditMenu'
import { menuService } from '../../../services/menu/menu.service'
import { setMenu } from '../../../store/actions/user.actions'
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

  const meals = getMeals(t)

  useEffect(() => {
    const loadMenu = async () => {
      if (!user) return
      try {
        const menus = await menuService.query({ userId: user._id })
        const existingMenu = Array.isArray(menus) ? menus[0] : menus
        if (existingMenu) setMenu(existingMenu)
      } catch (err) {
        console.error(err)
      }
    }
    loadMenu()
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
          <div>
            <Typography variant='h6'>{t('menu.viewMenus')}</Typography>
          </div>
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
            <CustomButton
              text={t('menu.viewMenus')}
              onClick={openMenuListDialog}
              icon={<MenuBookIcon />}
            />
          </div>
        </div>
        <Divider className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`} />

        {menu ? (
          <div className='meals-container'>
            {meals.map((meal) => (
              <MealCard
                key={meal.label}
                meal={meal}
                caloriesToSet={0}
                showEmptyCardAddButton={false}
                isAddButton={false}
              />
            ))}
          </div>
        ) : (
          <div className='no-results-container'>
            <span>{t('menu.noMenuFound')}</span>
            <CustomButton
              text={t('common.add')}
              onClick={openEditMenuDialog}
              icon={<Add />}
            />
          </div>
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
