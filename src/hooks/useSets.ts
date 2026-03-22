import { InfiniteData, useInfiniteQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { setService } from '../services/set/set.service'
import { Set } from '../types/exercise/Exercise'

interface UseSetsOptions {
  exerciseId?: string
  userId?: string
  from?: Date
  to?: Date
  limit?: number
  initialItems?: Set[]
  initialSkip?: number
  enabled?: boolean
}

interface SetsPage {
  items: Set[]
  nextSkip?: number
}

export const useSets = ({
  exerciseId,
  userId,

  to,
  limit = 20,
  initialItems = [],
  initialSkip = 0,
  enabled: isEnabled = true,
}: UseSetsOptions) => {
  const enabled = Boolean(exerciseId && userId) && isEnabled
  const queryKey = [
    'sets',
    exerciseId,
    userId,
    to?.toISOString(),
    limit,
  ] as const

  const initialData =
    initialItems.length > 0
      ? ({
          pages: [
            {
              items: initialItems,
              nextSkip: initialItems.length === limit ? initialSkip : undefined,
            },
          ],
          pageParams: [initialSkip],
        } as InfiniteData<SetsPage, number>)
      : undefined

  const query = useInfiniteQuery<
    SetsPage,
    Error,
    InfiniteData<SetsPage, number>,
    typeof queryKey,
    number
  >({
    queryKey,
    enabled,
    initialPageParam: initialSkip,
    initialData,
    queryFn: async ({ pageParam }) => {
      const items = (await setService.query({
        exerciseId,
        userId,
        to,
        limit,
        skip: pageParam,
      })) as Set[]

      const hasMore = items.length === limit
      return {
        items,
        nextSkip: hasMore ? pageParam + limit : undefined,
      }
    },
    getNextPageParam: (lastPage) => {

        return lastPage.nextSkip
    },
  })

  const items = useMemo(
    () => query.data?.pages.flatMap((page: SetsPage) => page.items) ?? [],
    [query.data]
  )

  return {
    ...query,
    items,
  }
}