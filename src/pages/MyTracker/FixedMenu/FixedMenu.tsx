import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Divider, Typography } from '@mui/material'
import { RootState } from '../../../store/store'
import { CustomButton } from '../../../CustomMui/CustomButton/CustomButton'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import { SlideDialog } from '../../../components/SlideDialog/SlideDialog'
import { LoggedList } from '../../../components/LoggedList/LoggedList'

interface MenuListDialogOptions {
  open: boolean
  type: 'menuList' | null
}

export function FixedMenu() {
  const { t } = useTranslation()
  const prefs = useSelector((state: RootState) => state.systemModule.prefs)

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
        break

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

  const closeMenuListDialog = () => {
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
          <CustomButton
            text={t('menu.viewMenus')}
            onClick={openMenuListDialog}
            icon={<MenuBookIcon />}
          />
        </div>
        <Divider className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`} />
        <LoggedList mealPeriod='breakfast' />
      </div>
      <SlideDialog
        open={menuListDialogOptions.open}
        onClose={closeMenuListDialog}
        title={t('menu.viewMenus')}
        component={getDialogContent()}
        type='full'
      />
    </>
  )
}
