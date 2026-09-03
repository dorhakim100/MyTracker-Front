import { useSelector } from 'react-redux'
import { Card } from '@mui/material'

import CustomSkeleton from '../../../CustomMui/CustomSkeleton/CustomSkeleton'
import { RootState } from '../../../store/store'

// Reuses the ItemCard classes so the placeholder always matches the real card.
export function ItemCardSkeleton() {
  const prefs = useSelector((state: RootState) => state.systemModule.prefs)

  return (
    <div className='item-card-container'>
      <Card
        className={`card item-card item-card-skeleton ${
          prefs.isDarkMode ? 'dark-mode' : ''
        } ${prefs.favoriteColor || ''}`}
      >
        <div className='item-card-image-wrap'>
          <CustomSkeleton
            variant='rectangular'
            width='100%'
            height='100%'
            isDarkMode={prefs.isDarkMode}
          />
        </div>
        <div className='item-card-body'>
          <CustomSkeleton
            variant='text'
            width='85%'
            height={17}
            isDarkMode={prefs.isDarkMode}
          />
          <CustomSkeleton
            variant='text'
            width='45%'
            height={14}
            isDarkMode={prefs.isDarkMode}
          />
        </div>
      </Card>
    </div>
  )
}
