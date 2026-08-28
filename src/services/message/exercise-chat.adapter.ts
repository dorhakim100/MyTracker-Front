import type {
  ChatAdapter,
  ChatMessageChunk,
  ChatRealtimeEvent,
} from '@mui/x-chat-headless'
import { Message, MessageRole } from '../../types/message/Message'
import { messageService } from './message.service'
import {
  getChatMessageText,
  getConversationId,
  parseConversationId,
  toChatMessage,
} from './exercise-chat.mapper'
import {
  getSocket,
  joinExerciseChat,
  leaveExerciseChat,
} from '../socket/socket.service'
import { refetchUnreadSummaries } from './unread-summary.store'

function emptyStream(): ReadableStream<ChatMessageChunk> {
  return new ReadableStream({
    start(controller) {
      controller.close()
    },
  })
}

export function createExerciseChatAdapter(options: {
  workoutId: string
  exerciseId: string
  role: MessageRole
}): ChatAdapter {
  const conversationId = getConversationId(options.workoutId, options.exerciseId)

  return {
    async listMessages({ conversationId: requestedId }) {
      const { workoutId, exerciseId } = parseConversationId(
        requestedId || conversationId
      )
      const messages = await messageService.listByRoom(workoutId, exerciseId)
      return {
        messages: messages.map((message) =>
          toChatMessage(message, options.role)
        ),
      }
    },

    async sendMessage({ message, conversationId: requestedId }) {
      const { workoutId, exerciseId } = parseConversationId(
        requestedId || conversationId
      )
      const content = getChatMessageText(message)
      await messageService.add({
        _id: message.id,
        workoutId,
        exerciseId,
        role: options.role,
        content,
      })
      return emptyStream()
    },

    async markRead({ conversationId: requestedId }) {
      const { workoutId, exerciseId } = parseConversationId(
        requestedId || conversationId
      )
      await messageService.markRead(workoutId, exerciseId)
    },

    subscribe({ onEvent }) {
      const socket = getSocket()
      joinExerciseChat(options.workoutId, options.exerciseId)

      const onAdded = (payload: Message) => {
        if (
          payload.workoutId !== options.workoutId ||
          payload.exerciseId !== options.exerciseId
        ) {
          return
        }
        onEvent({
          type: 'message-added',
          message: toChatMessage(payload, options.role),
        } satisfies ChatRealtimeEvent)
        if (payload.role === options.role) return
        void messageService
          .markRead(options.workoutId, options.exerciseId)
          .then(() => refetchUnreadSummaries())
      }

      const onUpdated = (payload: Message) => {
        if (
          payload.workoutId !== options.workoutId ||
          payload.exerciseId !== options.exerciseId
        ) {
          return
        }
        onEvent({
          type: 'message-updated',
          message: toChatMessage(payload, options.role),
        } satisfies ChatRealtimeEvent)
      }

      const onRemoved = (payload: {
        messageId?: string
        workoutId?: string
        exerciseId?: string
      }) => {
        if (
          payload.workoutId !== options.workoutId ||
          payload.exerciseId !== options.exerciseId ||
          !payload.messageId
        ) {
          return
        }
        onEvent({
          type: 'message-removed',
          messageId: payload.messageId,
          conversationId,
        } satisfies ChatRealtimeEvent)
      }

      socket?.on('exercise-chat:message-added', onAdded)
      socket?.on('exercise-chat:message-updated', onUpdated)
      socket?.on('exercise-chat:message-removed', onRemoved)

      return () => {
        socket?.off('exercise-chat:message-added', onAdded)
        socket?.off('exercise-chat:message-updated', onUpdated)
        socket?.off('exercise-chat:message-removed', onRemoved)
        leaveExerciseChat(options.workoutId, options.exerciseId)
      }
    },
  }
}
