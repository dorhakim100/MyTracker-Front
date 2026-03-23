
import { queryClient } from './queryClient'

export const queryKeys = {
  sets: {
    byExercise: (exerciseId: string, userId: string, limit: number) => ['sets', exerciseId, userId, limit],
  },
}

export const invalidateSets = (exerciseId: string, userId: string, limit: number) => {
  queryClient.invalidateQueries({ queryKey: queryKeys.sets.byExercise(exerciseId, userId, limit) })
}