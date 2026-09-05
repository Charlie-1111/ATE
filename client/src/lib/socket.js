import { io } from 'socket.io-client'

// Same-origin in production (Fly); localhost in dev
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.PROD ? window.location.origin : 'http://localhost:3001')

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 10000,
})

export function connectSocket(userId) {
  socket.auth = { userId }
  socket.connect()
}

export function disconnectSocket() {
  socket.disconnect()
}
