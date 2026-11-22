import { InfiniteData, useInfiniteQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import {
  AlternateExercisesPage,
  getAlternateExercises,
} from '../services/exersice-search/exersice-search'
import { Exercise } from '../types/exercise/Exercise'

interface UseAlternateExercisesOptions {
  exercise?: Exercise | null
  limit?: number
  equipment?: string
  search?: string
  enabled?: boolean
}

export function useAlternateExercises({
  exercise,
  limit = 10,
  equipment = 'All',
  search = '',
  enabled: isEnabled = true,
}: UseAlternateExercisesOptions) {
  const enabled = Boolean(exercise?.exerciseId) && isEnabled
  const queryKey = [
    'alternate-exercises',
    exercise?.exerciseId,
    limit,
    equipment || 'All',
    search.trim(),
  ] as const

  const query = useInfiniteQuery<
    AlternateExercisesPage,
    Error,
    InfiniteData<AlternateExercisesPage, number>,
    typeof queryKey,
    number
  >({
    queryKey,
    enabled,
    initialPageParam: 0,
    placeholderData: (previousData, previousQuery) => {
      if (previousQuery?.queryKey[1] !== exercise?.exerciseId) return undefined
      return previousData
    },
    queryFn: ({ pageParam }) => {
      if (!exercise) throw new Error('Exercise is required')
      return getAlternateExercises(exercise, {
        skip: pageParam,
        limit,
        equipment,
        search,
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
