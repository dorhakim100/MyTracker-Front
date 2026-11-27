import { useState } from 'react'
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

const PAGE_SIZE = 20

interface SearchResultsProps {
  items: Item[]
  isLoading: boolean
  matchedCategory: ItemCategoryId | null
  sortBy: string
  onItemClick: (item: Item) => void
  onFavoriteClick: (item: Item) => void
}

function getSearchItemKey(item: Item) {
  return item.searchId || item._id || ''
}

function mergeUniqueItems(primary: Item[], extra: Item[]) {
  const ids = new Set(primary.map(getSearchItemKey).filter(Boolean))
  const incoming = extra.filter((item) => {
    const key = getSearchItemKey(item)
    return key && !ids.has(key)
  })
  return [...primary, ...incoming]
}

export function SearchResults({
  items,
  isLoading,
  matchedCategory,
  sortBy,
  onItemClick,
  onFavoriteClick,
}: SearchResultsProps) {
  const { t } = useTranslation()
  const user = useSelector((state: RootState) => state.userModule.user)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  // A query that names a category keeps going through that category once the
  // search hits run out.
  const {
    items: categoryItems,
    isLoading: isCategoryLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useItemsByCategory({
    category: matchedCategory,
    sortBy,
  })

  const allItems = mergeUniqueItems(items, categoryItems)
  const visibleItems = allItems.slice(0, visibleCount)
  const hasMore = visibleCount < allItems.length || !!hasNextPage

  const onReachBottom = () => {
    const nextCount = visibleCount + PAGE_SIZE
    setVisibleCount(nextCount)
    if (nextCount >= allItems.length && hasNextPage) fetchNextPage()
  }

  if (isLoading || (!allItems.length && isCategoryLoading)) {
    return (
      <div className='search-results-container'>
        <div className='category-browse-grid'>
          {Array.from({ length: 10 }).map((_, index) => (
            <ItemCardSkeleton key={`search-results-skeleton-${index}`} />
          ))}
        </div>
      </div>
    )
  }

  if (!allItems.length) {
    return (
      <div className='search-results-container'>
        <EmptyState text={t('meals.noResults')} />
      </div>
    )
  }

  return (
    <div className='search-results-container'>
      <div className='category-browse-grid'>
        {visibleItems.map((item) => (
          <ItemCard
            key={getSearchItemKey(item)}
            item={item}
            isFavorite={searchService.isFavorite(item, user) || false}
            onClick={onItemClick}
            onFavoriteClick={onFavoriteClick}
          />
        ))}
      </div>
      <div className='category-browse-sentinel'>
        <BottomReachIndicator
          hasMore={hasMore}
          isLoading={isFetchingNextPage}
          onReachBottom={onReachBottom}
        />
      </div>
    </div>
  )
}
