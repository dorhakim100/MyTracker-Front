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
import { MenusList } from '../../../components/MenusList/MenusList'
import { menuService } from '../../../services/menu/menu.service'
import { setMenus, setMenu } from '../../../store/actions/user.actions'
import { MealCard } from '../../../components/MealCard/MealCard'
import { Add } from '@mui/icons-material'
import { Menu } from '../../../types/menu/Menu'

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

  useEffect(() => {
    const loadMenus = async () => {
      if (!user) return
      try {
        const menus = await menuService.query({ userId: user._id })

        setMenus(menus)
        const selected = menus.find((menu: Menu) => menu.isSelected)
        if (selected) {
          setMenu(selected)
        }
      } catch (err) {
        console.error(err)
      }
    }
    loadMenus()
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
                caloriesToSet={0}
                showEmptyCardAddButton={false}
                isAddButton={false}
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
