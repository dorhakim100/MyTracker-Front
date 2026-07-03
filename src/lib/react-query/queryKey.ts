
import { queryClient } from './queryClient'

export const queryKeys = {
  sets: {
    byExercise: (exerciseId: string, userId: string, limit: number) => ['sets', exerciseId, userId, limit],
  },
  image: {
    byUrl: (url: string) => ['image', url] as const,
  },
}

export const invalidateSets = (exerciseId: string, userId: string, limit: number) => {
  queryClient.invalidateQueries({ queryKey: queryKeys.sets.byExercise(exerciseId, userId, limit) })
}