import { InfiniteData, useInfiniteQuery } from '@tanstack/react-query'
import { setService } from '../services/set/set.service'
import { Set } from '../types/exercise/Exercise'
import { LineChartRangeKey } from '../components/LineChart/LineChartControls'

interface UseSetsOptions {
  exerciseId?: string
  userId?: string
  from?: Date
  to?: Date
  range: LineChartRangeKey
  limit?: number
}

interface SetsPage {
  items: Set[]
  nextSkip?: number
}

export const useSets = ({
  exerciseId,
  userId,
  from,
  to,
  range = '1M',
  limit = 20,
}: UseSetsOptions) => {
  const enabled = Boolean(exerciseId && userId)
  const queryKey = [
    'sets',
    exerciseId,
    userId,
    from?.toISOString(),
    to?.toISOString(),
    range,
    limit,
  ] as const

  const query = useInfiniteQuery<
    SetsPage,
    Error,
    InfiniteData<SetsPage, number>,
    typeof queryKey,
    number
  >({
    queryKey,
    enabled,
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const items = (await setService.query({
        exerciseId,
        userId,
        from,
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
    getNextPageParam: (lastPage) => lastPage.nextSkip,
  })

  console.log('query.data', query.data)

  const items = query.data?.pages.flatMap((page: SetsPage) => page.items) ?? []

  return {
    ...query,
    items,
  }
}