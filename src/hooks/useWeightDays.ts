import { InfiniteData, useInfiniteQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { weightService } from '../services/weight/weight.service'
import { Weight } from '../types/weight/Weight'

const PAGE_SIZE = 30

interface WeightDaysPage {
  items: Weight[]
  rows?: WeightDayRow[]
  nextSkip?: number
}

export interface WeightDayRow {
  date: string
  weight?: Weight
}

export type WeightDaysMode = 'logged' | 'all'

function utcDayKey(createdAt: number) {
  return new Date(createdAt).toISOString().slice(0, 10)
}

export function weightDaysQueryKey(userId?: string) {
  return ['weight-days', userId] as const
}

const DAY_MS = 24 * 60 * 60 * 1000

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function shiftDay(date: string, days: number) {
  const next = new Date(`${date}T00:00:00.000Z`).getTime() + days * DAY_MS
  return new Date(next).toISOString().slice(0, 10)
}

function dayBound(date: string, end: boolean) {
  return new Date(
    `${date}T${end ? '23:59:59.999' : '00:00:00.000'}Z`
  ).toISOString()
}

async function loadAllDaysPage(userId: string, page: number) {
  const newest = shiftDay(todayKey(), -page * PAGE_SIZE)
  const oldest = shiftDay(newest, -(PAGE_SIZE - 1))
  const items = (await weightService.query({
    userId,
    fromDate: dayBound(oldest, false),
    toDate: dayBound(newest, true),
  })) as Weight[]
  const older = (await weightService.query({
    userId,
    toDate: new Date(
      new Date(`${oldest}T00:00:00.000Z`).getTime() - 1
    ).toISOString(),
    limit: 1,
  })) as Weight[]
  const hasOlder = older.length > 0

  const byDay = new Map<string, Weight>()
  items.forEach((weight) => {
    const key = utcDayKey(weight.createdAt)
    if (!byDay.has(key)) byDay.set(key, weight)
  })

  let start = oldest
  if (!hasOlder) {
    const logged = [...byDay.keys()].sort()
    if (!logged.length) {
      return {
        rows: page === 0 ? [{ date: todayKey() }] : [],
        nextPage: undefined,
      }
    }
    start = logged[0]
  }

  const rows: WeightDayRow[] = []
  let date = newest
  while (date >= start) {
    const weight = byDay.get(date)
    rows.push(weight ? { date, weight } : { date })
    if (date === start) break
    date = shiftDay(date, -1)
  }

  return { rows, nextPage: hasOlder ? page + 1 : undefined }
}

export function useWeightDays(
  userId?: string,
  mode: WeightDaysMode = 'logged'
) {
  const enabled = Boolean(userId)
  const queryKey = [...weightDaysQueryKey(userId), mode] as const

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
      if (mode === 'all') {
        const page = await loadAllDaysPage(userId || '', pageParam)
        return {
          items: [] as Weight[],
          rows: page.rows,
          nextSkip: page.nextPage,
        }
      }

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
    if (mode === 'all') {
      return query.data?.pages.flatMap((page) => page.rows ?? []) ?? []
    }

    const items = query.data?.pages.flatMap((page) => page.items) ?? []
    const byDay = new Map<string, Weight>()

    items.forEach((weight) => {
      const key = utcDayKey(weight.createdAt)
      if (!byDay.has(key)) byDay.set(key, weight)
    })

    return [...byDay.entries()].map(([date, weight]) => ({ date, weight }))
  }, [mode, query.data])

  return {
    ...query,
    days,
  }
}
