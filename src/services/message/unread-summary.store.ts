import {
  EMPTY_HAS_MESSAGES,
  EMPTY_UNREAD_SUMMARY,
  MessageRole,
  UnreadHasMessages,
  UnreadSocketPayload,
  UnreadSummary,
} from '../../types/message/Message'
import { messageService } from '../message/message.service'
import { isWatchingTrainee } from './chat-role'
import { store } from '../../store/store'
import { setWorkoutsUnreadCount } from '../../store/actions/system.actions'

export type UnreadSummaries = {
  trainer: UnreadSummary
  trainee: UnreadSummary
}

const EMPTY_SUMMARIES: UnreadSummaries = {
  trainer: EMPTY_UNREAD_SUMMARY,
  trainee: EMPTY_UNREAD_SUMMARY,
}

let summaries: UnreadSummaries = EMPTY_SUMMARIES
const listeners = new Set<() => void>()

type ActiveChatRoom = {
  workoutId: string
  exerciseId: string
  traineeId?: string
}

let activeChatRoom: ActiveChatRoom | null = null

function emit() {
  listeners.forEach((listener) => listener())
  syncWorkoutsUnreadToSystem()
}

export function getActiveChatRoom() {
  return activeChatRoom
}

export function setActiveChatRoom(room: ActiveChatRoom | null) {
  activeChatRoom = room
  emit()
}

function withoutActiveRoom(summary: UnreadSummary): UnreadSummary {
  if (!activeChatRoom) return summary
  const { workoutId, exerciseId, traineeId } = activeChatRoom
  const roomCount = summary.exercises[workoutId]?.[exerciseId] || 0
  if (!roomCount) return summary

  const nextTrainees = { ...summary.trainees }
  if (traineeId) {
    nextTrainees[traineeId] = Math.max(
      0,
      (nextTrainees[traineeId] || 0) - roomCount
    )
  }

  return {
    trainees: nextTrainees,
    workouts: {
      ...summary.workouts,
      [workoutId]: Math.max(0, (summary.workouts[workoutId] || 0) - roomCount),
    },
    exercises: {
      ...summary.exercises,
      [workoutId]: {
        ...summary.exercises[workoutId],
        [exerciseId]: 0,
      },
    },
    hasMessages: summary.hasMessages || EMPTY_HAS_MESSAGES,
  }
}

export function getUnreadSummaries() {
  return summaries
}

export function subscribeUnreadSummaries(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export async function refetchUnreadSummaries() {
  const [trainer, trainee] = await Promise.all([
    messageService.getUnreadSummary('trainer'),
    messageService.getUnreadSummary('trainee'),
  ])
  summaries = { trainer, trainee }
  emit()
}

export function resetUnreadSummaries() {
  summaries = EMPTY_SUMMARIES
  emit()
}

function withHasMessage(
  summary: UnreadSummary,
  workoutId: string,
  exerciseId: string,
  forUserId?: string
): UnreadHasMessages {
  const prev = summary.hasMessages || EMPTY_HAS_MESSAGES
  const nextTrainees = { ...prev.trainees }
  if (forUserId) {
    nextTrainees[forUserId] = true
  }
  return {
    trainees: nextTrainees,
    workouts: { ...prev.workouts, [workoutId]: true },
    exercises: {
      ...prev.exercises,
      [workoutId]: {
        ...prev.exercises[workoutId],
        [exerciseId]: true,
      },
    },
  }
}

export function applyIncomingUnread(payload: UnreadSocketPayload) {
  if (
    activeChatRoom &&
    activeChatRoom.workoutId === payload.workoutId &&
    activeChatRoom.exerciseId === payload.exerciseId
  ) {
    const { workoutId, exerciseId, forUserId } = payload
    summaries = {
      trainer: {
        ...summaries.trainer,
        hasMessages: withHasMessage(
          summaries.trainer,
          workoutId,
          exerciseId,
          forUserId
        ),
      },
      trainee: {
        ...summaries.trainee,
        hasMessages: withHasMessage(
          summaries.trainee,
          workoutId,
          exerciseId,
          forUserId
        ),
      },
    }
    emit()
    return
  }

  const asRole: MessageRole =
    payload.senderRole === 'trainer' ? 'trainee' : 'trainer'
  const summary = asRole === 'trainer' ? summaries.trainer : summaries.trainee
  const { workoutId, exerciseId, forUserId } = payload

  const nextUnread: UnreadSummary = {
    trainees: { ...summary.trainees },
    workouts: {
      ...summary.workouts,
      [workoutId]: (summary.workouts[workoutId] || 0) + 1,
    },
    exercises: {
      ...summary.exercises,
      [workoutId]: {
        ...summary.exercises[workoutId],
        [exerciseId]: (summary.exercises[workoutId]?.[exerciseId] || 0) + 1,
      },
    },
    hasMessages: summary.hasMessages || EMPTY_HAS_MESSAGES,
  }

  if (forUserId) {
    nextUnread.trainees[forUserId] = (nextUnread.trainees[forUserId] || 0) + 1
  }

  const nextTrainer =
    asRole === 'trainer' ? nextUnread : summaries.trainer
  const nextTrainee =
    asRole === 'trainee' ? nextUnread : summaries.trainee

  summaries = {
    trainer: {
      ...nextTrainer,
      hasMessages: withHasMessage(nextTrainer, workoutId, exerciseId, forUserId),
    },
    trainee: {
      ...nextTrainee,
      hasMessages: withHasMessage(nextTrainee, workoutId, exerciseId, forUserId),
    },
  }
  emit()
}

export function formatUnreadCount(count: number) {
  if (!count || count < 1) return null
  if (count > 9) return '+9'
  return String(count)
}

export function getUnreadTotal(summary: UnreadSummary) {
  return Object.values(summary.trainees).reduce((sum, count) => sum + count, 0)
}

export function getTraineeUnread(summary: UnreadSummary, traineeId?: string) {
  if (!traineeId) return 0
  return summary.trainees[traineeId] || 0
}

export function getWorkoutUnread(summary: UnreadSummary, workoutId?: string) {
  if (!workoutId) return 0
  return summary.workouts[workoutId] || 0
}

export function getExerciseUnread(
  summary: UnreadSummary,
  workoutId?: string,
  exerciseId?: string
) {
  if (!workoutId || !exerciseId) return 0
  return summary.exercises[workoutId]?.[exerciseId] || 0
}

export function getExerciseHasMessages(
  summary: UnreadSummary,
  workoutId?: string,
  exerciseId?: string
) {
  if (!workoutId || !exerciseId) return false
  return Boolean(summary.hasMessages?.exercises[workoutId]?.[exerciseId])
}

export function getSummaryForRole(
  asRole: MessageRole,
  nextSummaries: UnreadSummaries = summaries
) {
  const summary =
    asRole === 'trainer' ? nextSummaries.trainer : nextSummaries.trainee
  return withoutActiveRoom(summary)
}

export function getWorkoutsTabUnreadCount(
  nextSummaries: UnreadSummaries = summaries
) {
  const state = store.getState()
  const user = state.userModule.user
  const traineeUser = state.userModule.traineeUser
  const userToEdit = state.userModule.userToEdit
  const isDashboard = state.systemModule.isDashboard

  const trainer = getSummaryForRole('trainer', nextSummaries)
  const trainee = getSummaryForRole('trainee', nextSummaries)
  const trainerTotal = getUnreadTotal(trainer)
  const traineeTotal = getUnreadTotal(trainee)
  const watching = isWatchingTrainee(user, traineeUser, userToEdit)

  if (isDashboard && user?.isTrainer) {
    return getTraineeUnread(trainer, traineeUser?._id || user._id)
  }

  if (watching) {
    return trainerTotal
  }

  if (user?.isTrainer) {
    return traineeTotal + trainerTotal
  }

  return traineeTotal
}

function syncWorkoutsUnreadToSystem() {
  setWorkoutsUnreadCount(getWorkoutsTabUnreadCount())
}

store.subscribe(syncWorkoutsUnreadToSystem)
