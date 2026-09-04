import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import { ItemCard } from '../../ItemCard/ItemCard'
import { ItemCardSkeleton } from '../../ItemCard/ItemCardSkeleton/ItemCardSkeleton'
import { EmptyState } from '../EmptyState/EmptyState'
import { BottomReachIndicator } from '../../BottomReachIndicator/BottomReachIndicator'
import { Item } from '../../../types/item/Item'
import { ItemCategoryId } from '../../../assets/config/item-categories'
import { useItemsByCategory } from '../../../hooks/useItemsByCategory'
import { searchService } from '../../../services/search/search-service'
import { RootState } from '../../../store/store'
import { itemSearchCategoriesNs } from '../locals'

interface CategoryBrowseProps {
  category: ItemCategoryId
  sortBy: string
  txt: string
  onItemClick: (item: Item) => void
  onFavoriteClick: (item: Item) => void
}

export function CategoryBrowse({
  category,
  sortBy,
  txt,
  onItemClick,
  onFavoriteClick,
}: CategoryBrowseProps) {
  const { t } = useTranslation(itemSearchCategoriesNs)
  const user = useSelector((state: RootState) => state.userModule.user)
  const {
    items,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isError,
  } = useItemsByCategory({
    category,
    txt,
    sortBy,
  })

  return (
    <div className='category-browse'>
      <h3 className='bold-header category-section-title'>
        {t(`categories.${category}`)}
      </h3>

      {isError ? (
        <EmptyState text={t('noCategoryResults')} />
      ) : isLoading && !items.length ? (
        <div className='category-browse-grid'>
          {Array.from({ length: 10 }).map((_, index) => (
            <ItemCardSkeleton key={`category-browse-skeleton-${index}`} />
          ))}
        </div>
      ) : !items.length ? (
        <EmptyState text={t('noCategoryResults')} />
      ) : (
        <>
          <div className='category-browse-grid'>
            {items.map((item) => (
              <ItemCard
                key={item.searchId || item._id}
                item={item}
                isFavorite={searchService.isFavorite(item, user) || false}
                onClick={onItemClick}
                onFavoriteClick={onFavoriteClick}
              />
            ))}
          </div>
          <div className='category-browse-sentinel'>
            <BottomReachIndicator
              hasMore={!!hasNextPage}
              isLoading={isFetchingNextPage}
              onReachBottom={() => {
                fetchNextPage()
              }}
            />
          </div>
        </>
      )}
    </div>
  )
}
