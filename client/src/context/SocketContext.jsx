import { createContext, useContext, useEffect, useState } from 'react'
import { socket, connectSocket, disconnectSocket } from '../lib/socket.js'

const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    function onConnect() { setConnected(true) }
    function onDisconnect() { setConnected(false) }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      disconnectSocket()
    }
  }, [])

  function waitUntilConnected(timeoutMs = 8000) {
    if (socket.connected) return Promise.resolve(true)
    return new Promise((resolve) => {
      const t = setTimeout(() => {
        socket.off('connect', onConnect)
        resolve(false)
      }, timeoutMs)
      function onConnect() {
        clearTimeout(t)
        resolve(true)
      }
      socket.once('connect', onConnect)
    })
  }

  function join(userId) {
    connectSocket(userId)
    return waitUntilConnected(8000)
  }

  function leave() {
    disconnectSocket()
    setConnected(false)
  }

  return (
    <SocketContext.Provider value={{ socket, connected, join, leave, waitUntilConnected }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  const context = useContext(SocketContext)
  if (!context) throw new Error('useSocket must be used within SocketProvider')
  return context
}
