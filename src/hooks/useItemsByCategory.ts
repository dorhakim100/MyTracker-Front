import { InfiniteData, useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import {
  CategoryQueryPage,
  itemService,
} from '../services/item/item.service'
import { ItemCategoryId } from '../assets/config/item-categories'

interface UseItemsByGroupOptions {
  category?: ItemCategoryId | null
  txt?: string
  sortBy?: string
  limit?: number
  enabled?: boolean
}

export const useItemsByCategory = ({
  category,
  txt = '',
  sortBy = 'relevance',
  limit = 20,
  enabled: isEnabled = true,
}: UseItemsByGroupOptions) => {
  const enabled = Boolean(category) && isEnabled
  const queryKey = ['items-by-category', category, txt, sortBy, limit] as const

  const query = useInfiniteQuery<
    CategoryQueryPage,
    Error,
    InfiniteData<CategoryQueryPage, number>,
    typeof queryKey,
    number
  >({
    queryKey,
    enabled,
    initialPageParam: 0,
    staleTime: 1000 * 60 * 5,
    queryFn: async ({ pageParam }) => {
      return itemService.queryByCategory({
        category: category as string,
        txt,
        sortBy,
        skip: pageParam,
        limit,
      })
    },
    getNextPageParam: (lastPage) => lastPage.nextSkip,
  })

  const items = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data]
  )

  return {
    ...query,
    items,
  }
}

export const useCategoryCounts = (enabled = true) => {
  return useQuery({
    queryKey: ['item-category-counts'],
    enabled,
    staleTime: 1000 * 60 * 5,
    queryFn: () => itemService.getCategoryCounts(),
  })
}
