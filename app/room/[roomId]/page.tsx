'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { io, Socket } from 'socket.io-client'

interface User {
  id: string
  name: string
  vote: number | string | null
  hasVoted: boolean
}

interface RoomState {
  users: User[]
  revealed: boolean
}

const FIBONACCI_CARDS = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, '?']

export default function RoomPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const roomId = params.roomId as string
  const userName = searchParams.get('name') || 'Anonymous'
  const isHost = searchParams.get('host') === 'true'

  const [socket, setSocket] = useState<Socket | null>(null)
  const [roomState, setRoomState] = useState<RoomState>({
    users: [],
    revealed: false
  })
  const [selectedCard, setSelectedCard] = useState<number | string | null>(null)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    console.log('Room page mounted', { roomId, userName, isHost })
    // Hardcoded Railway URL
    const socketUrl = 'https://storypoint-poker-production.up.railway.app'
    console.log('Connecting to Socket.io server:', socketUrl)
    
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling']
    })

    newSocket.on('connect', () => {
      console.log('✅ Connected to Socket.io server, socket ID:', newSocket.id)
      console.log('Joining room:', { roomId, userName })
      setIsConnected(true)
      setConnectionError(null)
      newSocket.emit('join-room', { roomId, userName })
    })

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket.io connection error:', error)
      setIsConnected(false)
      setConnectionError(`Failed to connect to Socket.io server at ${socketUrl}. Make sure the server is running and the URL is correct.`)
    })

    newSocket.on('disconnect', () => {
      console.log('⚠️ Disconnected from Socket.io server')
      setIsConnected(false)
    })

    newSocket.on('room-state', (state: RoomState) => {
      console.log('Room state updated:', state)
      setRoomState(state)
    })

    // Keep these for backwards compatibility, but room-state is primary
    newSocket.on('user-joined', (user: User) => {
      console.log('User joined:', user)
      setRoomState(prev => ({
        ...prev,
        users: [...prev.users.filter(u => u.id !== user.id), user]
      }))
    })

    newSocket.on('user-left', (userId: string) => {
      console.log('User left:', userId)
      setRoomState(prev => ({
        ...prev,
        users: prev.users.filter(u => u.id !== userId)
      }))
    })

    newSocket.on('vote-received', (data: { userId: string; vote: number | string }) => {
      console.log('Vote received:', data)
      setRoomState(prev => ({
        ...prev,
        users: prev.users.map(u =>
          u.id === data.userId ? { ...u, vote: data.vote, hasVoted: true } : u
        )
      }))
    })

    newSocket.on('votes-revealed', () => {
      setRoomState(prev => ({ ...prev, revealed: true }))
    })

    newSocket.on('votes-reset', () => {
      setRoomState(prev => ({
        ...prev,
        revealed: false,
        users: prev.users.map(u => ({ ...u, vote: null, hasVoted: false }))
      }))
      setSelectedCard(null)
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [roomId, userName])

  const handleVote = (card: number | string) => {
    console.log('Vote clicked:', card, { socket: !!socket, revealed: roomState.revealed })
    if (socket && !roomState.revealed) {
      setSelectedCard(card)
      console.log('Emitting vote:', { roomId, vote: card })
      socket.emit('vote', { roomId, vote: card })
    } else {
      console.warn('Cannot vote:', { hasSocket: !!socket, revealed: roomState.revealed })
    }
  }

  const handleReveal = () => {
    console.log('Reveal clicked', { socket: !!socket, isHost })
    if (socket && isHost) {
      console.log('Emitting reveal-votes:', { roomId })
      socket.emit('reveal-votes', { roomId })
    }
  }

  const handleReset = () => {
    console.log('Reset clicked', { socket: !!socket, isHost })
    if (socket && isHost) {
      console.log('Emitting reset-votes:', { roomId })
      socket.emit('reset-votes', { roomId })
    }
  }

  const allVoted = roomState.users.length > 0 && roomState.users.every(u => u.hasVoted)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-indigo-600">Room: {roomId}</h1>
              <p className="text-gray-600">Welcome, {userName}!</p>
              <div className="flex items-center gap-2 mt-1">
                {isConnected ? (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">🟢 Connected</span>
                ) : (
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">🔴 Disconnected</span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Participants: {roomState.users.length}</p>
              {isHost && <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">Host</span>}
            </div>
          </div>
        </div>

        {/* Connection Error Alert */}
        {connectionError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-red-400 text-xl">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Connection Error</h3>
                <p className="mt-1 text-sm text-red-700">{connectionError}</p>
                <p className="mt-2 text-xs text-red-600">
                  <strong>For local testing:</strong> Make sure the Socket.io server is running: <code className="bg-red-100 px-1 rounded">cd server && npm run dev</code>
                  <br />
                  <strong>For production:</strong> Set <code className="bg-red-100 px-1 rounded">NEXT_PUBLIC_SOCKET_URL</code> in Vercel environment variables.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Voting Area */}
          <div className="lg:col-span-2 space-y-4">
            {/* Voting Cards */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Select Your Vote</h2>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {FIBONACCI_CARDS.map((card) => (
                  <button
                    key={card}
                    onClick={() => handleVote(card)}
                    disabled={roomState.revealed}
                    className={`
                      aspect-square rounded-lg font-bold text-lg transition-all
                      ${selectedCard === card
                        ? 'bg-indigo-600 text-white scale-110 shadow-lg'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                      }
                      ${roomState.revealed ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    {card}
                  </button>
                ))}
              </div>
              {selectedCard !== null && !roomState.revealed && (
                <p className="mt-4 text-center text-green-600 font-medium">
                  ✓ You voted: {selectedCard}
                </p>
              )}
            </div>

            {/* Host Controls */}
            {isHost && (
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex gap-3">
                  <button
                    onClick={handleReveal}
                    disabled={!allVoted || roomState.revealed}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                  >
                    {roomState.revealed ? 'Votes Revealed' : 'Reveal Votes'}
                  </button>
                  <button
                    onClick={handleReset}
                    disabled={!roomState.revealed}
                    className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Participants Sidebar */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Participants</h2>
            <div className="space-y-2">
              {roomState.users.map((user) => (
                <div
                  key={user.id}
                  className="flex justify-between items-center p-2 rounded bg-gray-50"
                >
                  <span className="font-medium">{user.name}</span>
                  <span className="text-sm">
                    {roomState.revealed ? (
                      <span className="font-bold text-indigo-600">{user.vote ?? '—'}</span>
                    ) : (
                      <span className={user.hasVoted ? 'text-green-600' : 'text-gray-400'}>
                        {user.hasVoted ? '✓' : '○'}
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
            {roomState.revealed && (
              <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
                <p className="text-sm font-semibold text-indigo-800 mb-2">Results:</p>
                <div className="space-y-1">
                  {roomState.users.map((user) => (
                    <div key={user.id} className="flex justify-between text-sm">
                      <span>{user.name}:</span>
                      <span className="font-bold">{user.vote ?? '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

