import { useSelector } from 'react-redux'

import { Card, Typography } from '@mui/material'

import { RootState } from '../../store/store'
import { CustomOptionsMenu } from '../../CustomMui/CustomOptionsMenu/CustomOptionsMenu'
import { SlideDialog } from '../SlideDialog/SlideDialog'
import { EditMenu } from '../EditMenu/EditMenu'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'
import { MoreHoriz } from '@mui/icons-material'
import { Divider } from '@mui/material'
import { CustomAlertDialog } from '../../CustomMui/CustomAlertDialog/CustomAlertDialog'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Menu } from '../../types/menu/Menu'
import { DropdownOption } from '../../types/DropdownOption'
import { SaveCancel } from '../SaveCancel/SaveCancel'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

interface MenuCardProps {
  menu: Menu
  onSelect: (menu: Menu) => void
  onDelete: (menu: Menu) => void
}

export function MenuCard({ menu, onSelect, onDelete }: MenuCardProps) {
  const prefs = useSelector((state: RootState) => state.systemModule.prefs)
  const selectedMenu = useSelector((state: RootState) => state.userModule.menu)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [menuToEdit, setMenuToEdit] = useState<Menu | undefined>(undefined)
  const { t } = useTranslation()
  const stats = useMemo(() => {
    console.log('menu.menuLogs', menu.menuLogs)
    return {
      totalCalories: menu.menuLogs.reduce(
        (acc, log) => acc + log.macros?.calories || 0,
        0
      ),
      itemCount: menu.menuLogs.length,
      itemsNames: menu.menuLogs.map((log) => log.name).join(', '),
    }
  }, [menu.menuLogs])

  const menuOptions = useMemo(
    () => [
      {
        title: t('menu.selectMenu'),
        icon: <CheckCircleOutlineIcon />,
        onClick: onSelectMenu,
      },
      {
        title: t('menu.editMenu'),
        icon: <EditIcon />,
        onClick: onEditMenu,
      },
      {
        title: t('menu.deleteMenu'),
        icon: <DeleteIcon />,
        onClick: () => setIsDeleteOpen(true),
      },
    ],
    [t, setIsEditOpen, setIsDeleteOpen]
  )

  const getSlideComponent = () => {
    return (
      <EditMenu
        closeDialog={() => setIsEditOpen(false)}
        menuToEdit={menuToEdit}
      />
    )
  }

  function onEditMenu() {
    setIsEditOpen(true)
    setMenuToEdit(menu)
  }

  function onSelectMenu() {
    onSelect(menu)
  }

  return (
    <>
      <Card
        className={`menu-card-container ${
          prefs.isDarkMode ? 'dark-mode' : ''
        }  ${prefs.favoriteColor || ''} ${
          selectedMenu?._id === menu._id ? 'selected' : ''
        }`}
        onClick={onEditMenu}
      >
        <div className='menu-card-header'>
          <div className='menu-card-title'>
            <Typography
              variant='h6'
              className='bold-header'
            >
              {menu.name}
            </Typography>
          </div>
          <CustomOptionsMenu
            options={menuOptions}
            triggerElement={
              <CustomButton
                isIcon={true}
                icon={<MoreHoriz />}
                // onClick={(e) => e.stopPropagation()}
              />
            }
          />
        </div>
        <Divider className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`} />
        <div className='menu-card-stats'>
          <Typography variant='body2'>
            {stats.totalCalories.toFixed(0)} {t('macros.kcal')}
          </Typography>
          <Typography variant='body2'>{stats.itemsNames}</Typography>
        </div>
      </Card>
      <CustomAlertDialog
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title={t('menu.deleteMenu')}
        className='delete-menu-dialog'
      >
        <div className='modal-delete-container'>
          <Typography variant='body1'>{t('menu.deleteMenuConfirm')}</Typography>

          <SaveCancel
            onCancel={() => setIsDeleteOpen(false)}
            onSave={() => onDelete(menu)}
            cancelText={t('common.cancel')}
            saveText={t('common.delete')}
            saveButtonClassName='alternative'
          />
        </div>
      </CustomAlertDialog>
      <SlideDialog
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={t('menu.editMenu')}
        component={getSlideComponent()}
        type='full'
      />
    </>
  )
}
