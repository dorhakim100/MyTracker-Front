import { InfiniteData, useInfiniteQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { weightService } from '../services/weight/weight.service'
import { Weight } from '../types/weight/Weight'

const PAGE_SIZE = 30

interface WeightDaysPage {
  items: Weight[]
  nextSkip?: number
}

export interface WeightDayRow {
  date: string
  weight: Weight
}

function utcDayKey(createdAt: number) {
  return new Date(createdAt).toISOString().slice(0, 10)
}

export function useWeightDays(userId?: string) {
  const enabled = Boolean(userId)
  const queryKey = ['weight-days', userId] as const

  const query = useInfiniteQuery<
    WeightDaysPage,
    Error,
    InfiniteData<WeightDaysPage, number>,
    typeof queryKey,
    number
  >({
    queryKey,
    enabled,
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const items = (await weightService.query({
        userId,
        skip: pageParam,
        limit: PAGE_SIZE,
      })) as Weight[]

      const hasMore = items.length === PAGE_SIZE
      return {
        items,
        nextSkip: hasMore ? pageParam + PAGE_SIZE : undefined,
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextSkip,
  })

  const days = useMemo(() => {
    const items = query.data?.pages.flatMap((page) => page.items) ?? []
    const byDay = new Map<string, Weight>()

    items.forEach((weight) => {
      const key = utcDayKey(weight.createdAt)
      if (!byDay.has(key)) byDay.set(key, weight)
    })

    return [...byDay.entries()].map(([date, weight]) => ({ date, weight }))
  }, [query.data])

  return {
    ...query,
    days,
  }
}
