import { httpService } from '../http.service'
import {
  EMPTY_UNREAD_SUMMARY,
  Message,
  MessageRole,
  UnreadSummary,
} from '../../types/message/Message'

const KEY = 'message'

function normalizeSummary(summary?: UnreadSummary | null): UnreadSummary {
  if (!summary) return EMPTY_UNREAD_SUMMARY
  return {
    trainees: summary.trainees || {},
    workouts: summary.workouts || {},
    exercises: summary.exercises || {},
    hasMessages: summary.hasMessages || EMPTY_UNREAD_SUMMARY.hasMessages,
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
  exerciseId: string
): Promise<Message[]> {
  return httpService.get(KEY, { workoutId, exerciseId })
}

async function add(payload: {
  _id?: string
  workoutId: string
  exerciseId: string
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
  exerciseId: string
): Promise<void> {
  await httpService.put(`${KEY}/read`, { workoutId, exerciseId })
}

async function getUnreadSummary(asRole: MessageRole): Promise<UnreadSummary> {
  try {
    const summary = await httpService.get(`${KEY}/unread`, { asRole })
    return normalizeSummary(summary)
  } catch {
    return EMPTY_UNREAD_SUMMARY
  }
}
