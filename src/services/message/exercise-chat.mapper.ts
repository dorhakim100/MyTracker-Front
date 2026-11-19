import type { ChatMessage, ChatUser } from '@mui/x-chat-headless'
import { Message, MessageRole } from '../../types/message/Message'

const SESSION_PREFIX = 'session:'

export function getConversationId(workoutId: string, exerciseId: string) {
  return `${workoutId}:${exerciseId}`
}

export function getSessionConversationId(workoutId: string) {
  return `${SESSION_PREFIX}${workoutId}`
}

export function parseConversationId(conversationId: string) {
  if (conversationId.startsWith(SESSION_PREFIX)) {
    return {
      workoutId: conversationId.slice(SESSION_PREFIX.length),
      exerciseId: undefined,
    }
  }

  const separatorIndex = conversationId.indexOf(':')
  return {
    workoutId: conversationId.slice(0, separatorIndex),
    exerciseId: conversationId.slice(separatorIndex + 1),
  }
}

export function getChatMessageText(message: ChatMessage) {
  return message.parts
    .map((part) => (part.type === 'text' ? part.text : ''))
    .join('')
    .trim()
}

export function toChatUser(
  role: MessageRole,
  screenRole: MessageRole,
  displayName?: string,
  avatarUrl?: string
): ChatUser {
  return {
    id: role,
    displayName,
    avatarUrl,
    role: role === screenRole ? 'user' : 'assistant',
  }
}

export function toChatMessage(
  message: Message,
  screenRole: MessageRole
): ChatMessage {
  return {
    id: String(message._id),
    conversationId: message.exerciseId
      ? getConversationId(message.workoutId, message.exerciseId)
      : getSessionConversationId(message.workoutId),
    role: message.role === screenRole ? 'user' : 'assistant',
    parts: [{ type: 'text', text: message.content }],
    createdAt: new Date(message.date).toISOString(),
    editedAt: message.editedAt
      ? new Date(message.editedAt).toISOString()
      : undefined,
    status: 'sent',
    author: toChatUser(
      message.role,
      screenRole,
      message.sender?.details?.fullname,
      message.sender?.details?.imgUrl
    ),
  }
}
