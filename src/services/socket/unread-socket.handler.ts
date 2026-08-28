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
      next.exerciseId &&
      (next.senderRole === 'trainer' || next.senderRole === 'trainee')
  )
}

async function onUnreadEvent(payload?: UnreadSocketPayload) {
  const room = getActiveChatRoom()
  const isActiveRoom =
    Boolean(payload) &&
    room?.workoutId === payload?.workoutId &&
    room?.exerciseId === payload?.exerciseId

  if (isActiveRoom && payload) {
    await messageService.markRead(payload.workoutId, payload.exerciseId)
    await refetchUnreadSummaries()
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
