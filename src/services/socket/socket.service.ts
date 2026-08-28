import { io, type Socket } from 'socket.io-client'
import { getLoginToken, getSocketUrl } from '../http.service'
import {
  registerHealthSocketHandlers,
  unregisterHealthSocketHandlers,
} from './health-socket.handler'
import {
  registerUnreadSocketHandlers,
  unregisterUnreadSocketHandlers,
} from './unread-socket.handler'

let socket: Socket | null = null
let connectedUserId: string | null = null

export const socketService = {
  connect,
  disconnect,
}

export function getSocket() {
  return socket
}

export function joinExerciseChat(workoutId: string, exerciseId: string) {
  socket?.emit('exercise-chat:join', { workoutId, exerciseId })
}

export function leaveExerciseChat(workoutId: string, exerciseId: string) {
  socket?.emit('exercise-chat:leave', { workoutId, exerciseId })
}

export async function connect(userId: string) {
  if (!userId) {
    return
  }

  if (socket?.connected && connectedUserId === userId) {
    return
  }

  disconnect()

  const token = await getLoginToken()
  if (!token) {
    return
  }

  const nextSocket = io(getSocketUrl(), {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
  })

  registerHealthSocketHandlers(nextSocket)
  registerUnreadSocketHandlers(nextSocket)

  nextSocket.on('connect_error', (err) => {
    console.error('Socket connection failed:', err.message)
  })

  socket = nextSocket
  connectedUserId = userId
}

export function disconnect() {
  if (socket) {
    unregisterHealthSocketHandlers(socket)
    unregisterUnreadSocketHandlers(socket)
    socket.disconnect()
    socket = null
  }

  connectedUserId = null
}
