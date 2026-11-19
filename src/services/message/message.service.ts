import { httpService } from '../http.service'
import {
  EMPTY_UNREAD_SUMMARY,
  Message,
  MessageRole,
  UnreadSummary,
} from '../../types/message/Message'

const KEY = 'message'

function asMessages<T>(value: unknown): T[] {
  return Array.isArray(value) ? value : []
}

function normalizeSummary(summary?: UnreadSummary | null): UnreadSummary {
  if (!summary) return EMPTY_UNREAD_SUMMARY
  const hasMessages = summary.hasMessages
  return {
    trainees: summary.trainees || {},
    workouts: summary.workouts || {},
    exercises: summary.exercises || {},
    sessions: summary.sessions || {},
    hasMessages: {
      trainees: hasMessages?.trainees || {},
      workouts: hasMessages?.workouts || {},
      exercises: hasMessages?.exercises || {},
      sessions: hasMessages?.sessions || {},
    },
  }
}

export const messageService = {
  listByRoom,
  add,
  update,
  remove,
  markRead,
  getUnreadSummary,
}

async function listByRoom(
  workoutId: string,
  exerciseId?: string
): Promise<Message[]> {
  const params = exerciseId ? { workoutId, exerciseId } : { workoutId }
  const messages = await httpService.get(KEY, params)
  return asMessages<Message>(messages)
}

async function add(payload: {
  _id?: string
  workoutId: string
  exerciseId?: string
  role: MessageRole
  content: string
}): Promise<Message> {
  return httpService.post(KEY, payload)
}

async function update(
  messageId: string,
  payload: { role: MessageRole; content: string }
): Promise<Message> {
  return httpService.put(`${KEY}/${messageId}`, payload)
}

async function remove(messageId: string, role: MessageRole): Promise<void> {
  await httpService.delete(`${KEY}/${messageId}?role=${role}`, null)
}

async function markRead(
  workoutId: string,
  exerciseId?: string
): Promise<void> {
  const body = exerciseId ? { workoutId, exerciseId } : { workoutId }
  await httpService.put(`${KEY}/read`, body)
}

async function getUnreadSummary(asRole: MessageRole): Promise<UnreadSummary> {
  try {
    const summary = await httpService.get(`${KEY}/unread`, { asRole })
    return normalizeSummary(summary)
  } catch {
    return EMPTY_UNREAD_SUMMARY
  }
}
