import type { ChatMessage, ChatUser } from '@mui/x-chat-headless'
import { Message, MessageRole } from '../../types/message/Message'

export function getConversationId(workoutId: string, exerciseId: string) {
  return `${workoutId}:${exerciseId}`
}

export function parseConversationId(conversationId: string) {
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
    conversationId: getConversationId(message.workoutId, message.exerciseId),
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
