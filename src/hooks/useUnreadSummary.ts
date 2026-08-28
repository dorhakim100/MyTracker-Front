import { useCallback, useSyncExternalStore } from 'react'
import { MessageRole } from '../types/message/Message'
import {
  getExerciseHasMessages,
  getExerciseUnread,
  getSummaryForRole,
  getTraineeUnread,
  getUnreadSummaries,
  getUnreadTotal,
  getWorkoutUnread,
  refetchUnreadSummaries,
  subscribeUnreadSummaries,
} from '../services/message/unread-summary.store'

export function useUnreadSummary(asRole: MessageRole) {
  const summaries = useSyncExternalStore(
    subscribeUnreadSummaries,
    getUnreadSummaries,
    getUnreadSummaries
  )
  const summary = getSummaryForRole(asRole, summaries)

  const refetch = useCallback(() => {
    void refetchUnreadSummaries()
  }, [])

  return {
    summary,
    refetch,
    total: getUnreadTotal(summary),
    getTraineeCount: (traineeId?: string) => getTraineeUnread(summary, traineeId),
    getWorkoutCount: (workoutId?: string) => getWorkoutUnread(summary, workoutId),
    getExerciseCount: (workoutId?: string, exerciseId?: string) =>
      getExerciseUnread(summary, workoutId, exerciseId),
    hasExerciseMessages: (workoutId?: string, exerciseId?: string) =>
      getExerciseHasMessages(summary, workoutId, exerciseId),
  }
}
