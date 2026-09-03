import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { Card } from '@mui/material'

import { Item } from '../../types/item/Item'
import { itemNameService } from '../../services/item/item-name.service'
import { FavoriteButton } from '../FavoriteButton/FavoriteButton'
import { CachedImage } from '../CachedImage/CachedImage'
import { searchUrls } from '../../assets/config/search.urls'
import { RootState } from '../../store/store'
import { itemCardNs } from './locals'
import { MarqueeText } from '../MarqueeText/MarqueeText'

interface ItemCardProps {
  item: Item
  onClick: (item: Item) => void
  onFavoriteClick?: (item: Item) => void
  isFavorite?: boolean
}

function ItemCardComponent({
  item,
  onClick,
  onFavoriteClick,
  isFavorite = false,
}: ItemCardProps) {
  const { t, i18n } = useTranslation(itemCardNs)
  const prefs = useSelector((state: RootState) => state.systemModule.prefs)
  const name = itemNameService.getItemDisplayName(item.name, i18n.language)
  const calories = Math.round(item.macros?.calories || 0)

  return (
    <div className='item-card-container'>
      <Card
        className={`card item-card ${prefs.isDarkMode ? 'dark-mode' : ''} ${
          prefs.favoriteColor || ''
        }`}
        onClick={() => onClick(item)}
      >
        <div className='item-card-image-wrap'>
          <CachedImage
            url={item.image || searchUrls.DEFAULT_IMAGE}
            fallback={searchUrls.DEFAULT_IMAGE}
            alt={name}
            className='item-card-image'
            referrerPolicy='no-referrer'
          />
        </div>
        <div className='item-card-body'>
          <MarqueeText className='item-card-name'>{name}</MarqueeText>
          <span className='item-card-kcal'>
            {calories} {t('kcal')}
          </span>
        </div>
      </Card>
      {onFavoriteClick && item.type !== 'meal' && (
        <div
          className='item-card-favorite'
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            onFavoriteClick(item)
          }}
        >
          <FavoriteButton isFavorite={isFavorite} />
        </div>
      )}
    </div>
  )
}

export const ItemCard = ItemCardComponent
