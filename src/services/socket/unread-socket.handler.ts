import type { Socket } from 'socket.io-client'
import { messageService } from '../message/message.service'
import { UnreadSocketPayload } from '../../types/message/Message'
import {
  applyIncomingUnread,
  getActiveChatRoom,
  refetchUnreadSummaries,
  resetUnreadSummaries,
} from '../message/unread-summary.store'

const UNREAD_EVENT = 'exercise-chat:unread'

function isUnreadPayload(payload: unknown): payload is UnreadSocketPayload {
  if (!payload || typeof payload !== 'object') return false
  const next = payload as UnreadSocketPayload
  return Boolean(
    next.workoutId &&
      (next.senderRole === 'trainer' || next.senderRole === 'trainee')
  )
}

function isActiveRoom(
  payload?: UnreadSocketPayload
) {
  const room = getActiveChatRoom()
  if (!payload || !room || room.workoutId !== payload.workoutId) return false
  if (!payload.exerciseId) return !room.exerciseId
  return room.exerciseId === payload.exerciseId
}

async function onUnreadEvent(payload?: UnreadSocketPayload) {
  if (isActiveRoom(payload) && payload) {
    try {
      await messageService.markRead(payload.workoutId, payload.exerciseId)
      await refetchUnreadSummaries()
    } catch {
      await refetchUnreadSummaries()
    }
    return
  }

  if (isUnreadPayload(payload)) {
    applyIncomingUnread(payload)
  }

  await refetchUnreadSummaries()
}

export function registerUnreadSocketHandlers(socket: Socket) {
  socket.on(UNREAD_EVENT, onUnreadEvent)
  void refetchUnreadSummaries()
}

export function unregisterUnreadSocketHandlers(socket: Socket) {
  socket.off(UNREAD_EVENT, onUnreadEvent)
  resetUnreadSummaries()
}
