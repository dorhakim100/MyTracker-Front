import { useTranslation } from 'react-i18next'

import {
  BrowseView,
  ITEM_CATEGORY_ART,
  ITEM_CATEGORY_IDS,
  ITEM_YOURS_ART,
  ItemCategoryId,
} from '../../../assets/config/item-categories'
import { ItemCategoryTile } from '../ItemCategoryTile/ItemCategoryTile'
import { itemSearchCategoriesNs } from '../locals'

interface CategoryHomeProps {
  categoryCounts?: Record<string, number>
  onSelect: (view: BrowseView) => void
}

export function CategoryHome({ categoryCounts, onSelect }: CategoryHomeProps) {
  const { t } = useTranslation(itemSearchCategoriesNs)

  const visibleCategories = ITEM_CATEGORY_IDS.filter((category) => {
    if (!categoryCounts) return true
    return (categoryCounts[category] || 0) > 0
  })

  return (
    <div className='category-home'>
      <section className='category-section'>
        <h3 className='bold-header category-section-title'>{t('yours')}</h3>
        <div className='category-grid category-grid-yours'>
          <ItemCategoryTile
            wide
            label={t('favorites')}
            art={ITEM_YOURS_ART.favorites}
            onClick={() => onSelect('favorites')}
          />
          <ItemCategoryTile
            wide
            label={t('meals')}
            art={ITEM_YOURS_ART.meals}
            onClick={() => onSelect('meals')}
          />
        </div>
      </section>

      <section className='category-section'>
        <h3 className='bold-header category-section-title'>{t('browse')}</h3>
        <div className='category-grid category-grid-browse'>
          {visibleCategories.map((category: ItemCategoryId) => (
            <ItemCategoryTile
              key={category}
              label={t(`categories.${category}`)}
              art={ITEM_CATEGORY_ART[category]}
              onClick={() => onSelect(category)}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
