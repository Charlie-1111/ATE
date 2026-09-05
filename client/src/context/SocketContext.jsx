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

  function join(userId) {
    connectSocket(userId)
  }

  function leave() {
    disconnectSocket()
    setConnected(false)
  }

  return (
    <SocketContext.Provider value={{ socket, connected, join, leave }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  const context = useContext(SocketContext)
  if (!context) throw new Error('useSocket must be used within SocketProvider')
  return context
}
