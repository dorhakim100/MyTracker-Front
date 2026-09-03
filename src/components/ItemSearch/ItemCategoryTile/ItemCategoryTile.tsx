import { useSelector } from 'react-redux'
import { Card } from '@mui/material'

import { RootState } from '../../../store/store'
import { ItemCategoryArt } from '../../../assets/config/item-categories'

interface ItemCategoryTileProps {
  label: string
  art: ItemCategoryArt
  wide?: boolean
  onClick: () => void
}

export function ItemCategoryTile({
  label,
  art,
  wide = false,
  onClick,
}: ItemCategoryTileProps) {
  const prefs = useSelector((state: RootState) => state.systemModule.prefs)

  return (
    <Card
      className={`card item-category-tile ${wide ? 'wide' : ''} ${
        prefs.isDarkMode ? 'dark-mode' : ''
      } ${prefs.favoriteColor || ''}`}
      onClick={onClick}
    >
      <img
        src={art.still}
        alt=''
        className='item-category-tile-art'
        draggable={false}
      />
      <span
        className={`item-category-tile-label ${prefs.favoriteColor || ''} ${
          prefs.isDarkMode ? 'dark-mode' : ''
        }`}
      >
        {label}
      </span>
    </Card>
  )
}
