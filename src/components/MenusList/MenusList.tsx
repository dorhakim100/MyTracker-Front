import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { Menu } from '../../types/menu/Menu'
import { MenuCard } from '../MenuCard/MenuCard'
import { menuService } from '../../services/menu/menu.service'
import { setMenus, setMenu } from '../../store/actions/user.actions'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'
import { Add } from '@mui/icons-material'

interface MenusListProps {
  onAddClick?: () => void
}

export function MenusList({ onAddClick }: MenusListProps) {
  const { t } = useTranslation()
  const prefs = useSelector((state: RootState) => state.systemModule.prefs)
  const user = useSelector((state: RootState) => state.userModule.user)
  const selectedMenu = useSelector((state: RootState) => state.userModule.menu)

  const menus = useSelector((state: RootState) => state.userModule.menus)

  const onSelect = (menu: Menu) => {
    setMenu(menu)
  }

  const onDelete = async (deletedMenu: Menu) => {
    const newMenus = menus.filter((m) => m._id !== deletedMenu._id)
    setMenus(newMenus)
    if (selectedMenu?._id === deletedMenu._id) {
      setMenu(null)
    }
    try {
      await menuService.remove(deletedMenu._id)
    } catch (err) {
      console.error(err)
    }
  }

  if (!user) return null

  return (
    <div
      className={`menus-list-container ${prefs.isDarkMode ? 'dark-mode' : ''}`}
    >
      <div className='menus-list'>
        {menus.map((menu) => (
          <MenuCard
            key={menu._id}
            menu={menu}
            onSelect={onSelect}
            onDelete={onDelete}
          />
        ))}
      </div>
      {menus.length === 0 && (
        <div className='menus-list-empty'>
          <span>{t('menu.noMenuFound')}</span>
        </div>
      )}
      <CustomButton
        text={t('common.add')}
        onClick={onAddClick}
        icon={<Add />}
        fullWidth={true}
      />
    </div>
  )
}
