export type MessageRole = 'trainer' | 'trainee'
export type MessageType = 'text' | 'image' | 'video'

export interface MessageSender {
  _id?: string
  details?: {
    fullname?: string
    imgUrl?: string
  }
}

export interface Message {
  _id: string
  date: string
  exerciseId: string
  workoutId: string
  senderId: string
  role: MessageRole
  type: MessageType
  content: string
  media?: { url: string; mime?: string } | null
  editedAt?: string | null
  deletedAt?: string | null
  sender?: MessageSender
  workout?: {
    name?: string
    forUserId?: string
  }
  exercise?: {
    name?: string
  }
}

export interface UnreadHasMessages {
  trainees: Record<string, boolean>
  workouts: Record<string, boolean>
  exercises: Record<string, Record<string, boolean>>
}

export interface UnreadSummary {
  trainees: Record<string, number>
  workouts: Record<string, number>
  exercises: Record<string, Record<string, number>>
  hasMessages: UnreadHasMessages
}

export const EMPTY_HAS_MESSAGES: UnreadHasMessages = {
  trainees: {},
  workouts: {},
  exercises: {},
}

export const EMPTY_UNREAD_SUMMARY: UnreadSummary = {
  trainees: {},
  workouts: {},
  exercises: {},
  hasMessages: EMPTY_HAS_MESSAGES,
}

export type UnreadSocketPayload = {
  workoutId: string
  exerciseId: string
  forUserId?: string
  senderRole: MessageRole
}
