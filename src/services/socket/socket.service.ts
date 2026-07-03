import { io, type Socket } from 'socket.io-client'
import { getLoginToken, getSocketUrl } from '../http.service'
import {
  registerHealthSocketHandlers,
  unregisterHealthSocketHandlers,
} from './health-socket.handler'

let socket: Socket | null = null
let connectedUserId: string | null = null

export const socketService = {
  connect,
  disconnect,
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

  nextSocket.on('connect_error', (err) => {
    console.error('Socket connection failed:', err.message)
  })

  socket = nextSocket
  connectedUserId = userId
}

export function disconnect() {
  if (socket) {
    unregisterHealthSocketHandlers(socket)
    socket.disconnect()
    socket = null
  }

  connectedUserId = null
}
