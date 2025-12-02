'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { io, Socket } from 'socket.io-client'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { ThemeSwitcher } from '../../theme-switcher'

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

const FIBONACCI_CARDS = [0, 1, 2, 3, 5, 8]

export default function RoomPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const roomId = params.roomId as string
  const urlUserName = searchParams.get('name')
  const isHost = searchParams.get('host') === 'true'

  const [userName, setUserName] = useState<string>(urlUserName || '')
  const [showNameModal, setShowNameModal] = useState(!urlUserName || urlUserName.trim() === '')
  const [nameInput, setNameInput] = useState(urlUserName || '')
  const [socket, setSocket] = useState<Socket | null>(null)
  const [roomState, setRoomState] = useState<RoomState>({
    users: [],
    revealed: false
  })
  const [selectedCard, setSelectedCard] = useState<number | string | null>(null)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!userName?.trim() || showNameModal) return

    const newSocket = io(window.location.origin, {
      transports: ['polling', 'websocket'], // Try polling first, then websocket
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000
    })

    newSocket.on('connect', () => {
      setIsConnected(true)
      setConnectionError(null)
      newSocket.emit('join-room', { roomId, userName })
    })

    newSocket.on('connect_error', (error) => {
      console.error('Socket.io connection error:', error)
      setIsConnected(false)
      setConnectionError(`Failed to connect to Socket.io server. Make sure the server is running.`)
    })

    newSocket.on('disconnect', () => {
      setIsConnected(false)
    })

    newSocket.on('room-state', (state: RoomState) => {
      setRoomState(state)
      
      // Restore user's previous vote if they had one (for page refresh)
      const currentUser = state.users.find(u => u.name === userName)
      if (currentUser?.hasVoted && currentUser.vote !== null) {
        setSelectedCard(currentUser.vote)
      }
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
  }, [roomId, userName, showNameModal])

  const handleVote = (card: number | string) => {
    if (socket && !roomState.revealed) {
      setSelectedCard(card)
      socket.emit('vote', { roomId, vote: card })
    }
  }

  const handleReveal = () => {
    if (socket && isHost) {
      socket.emit('reveal-votes', { roomId })
    }
  }

  const handleReset = () => {
    if (socket && isHost) {
      socket.emit('reset-votes', { roomId })
    }
  }

  const handleEnterName = () => {
    const name = nameInput.trim()
    if (name && name.length > 0) {
      setUserName(name)
      setShowNameModal(false)
      // Update URL with the name
      const newUrl = `/room/${roomId}?name=${encodeURIComponent(name)}${isHost ? '&host=true' : ''}`
      router.replace(newUrl)
    }
  }

  const handleCopyInviteLink = async () => {
    const inviteUrl = `${window.location.origin}/room/${roomId}`
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const allVoted = roomState.users.length > 0 && roomState.users.every(u => u.hasVoted)

  // Calculate vote distribution for pie chart
  const voteDistribution = useMemo(() => {
    if (!roomState.revealed || roomState.users.length === 0) return []
    
    const voteCounts = new Map<number | string, number>()
    for (const user of roomState.users) {
      if (user.vote != null) {
        voteCounts.set(user.vote, (voteCounts.get(user.vote) ?? 0) + 1)
      }
    }

    const total = roomState.users.length
    return Array.from(voteCounts.entries())
      .map(([vote, count]) => ({
        name: String(vote),
        value: count,
        percentage: Math.round((count / total) * 100).toString()
      }))
      .sort((a, b) => {
        if (a.name === '?') return 1
        if (b.name === '?') return -1
        return Number(a.name) - Number(b.name)
      })
  }, [roomState.revealed, roomState.users])

  // Colors for pie chart segments
  const COLORS = [
    '#4F46E5', // indigo-600
    '#10B981', // green-500
    '#F59E0B', // amber-500
    '#EF4444', // red-500
    '#8B5CF6', // violet-500
    '#06B6D4', // cyan-500
    '#EC4899', // pink-500
    '#84CC16', // lime-500
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="fixed top-4 right-4 z-50">
        <ThemeSwitcher />
      </div>
      <div className="max-w-6xl mx-auto">
        {/* Name Entry Modal - Required before entering room */}
        {showNameModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">Enter Your Name</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Please enter your name to join the room</p>
              <div className="space-y-4">
                <div>
                  <label htmlFor="nameInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Name:
                  </label>
                  <input
                    id="nameInput"
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && nameInput.trim().length > 0) {
                        handleEnterName()
                      }
                    }}
                    placeholder="Enter your name"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                    autoFocus
                    required
                  />
                  {nameInput.trim().length === 0 && (
                    <p className="mt-1 text-xs text-red-500 dark:text-red-400">Name is required</p>
                  )}
                </div>
                <button
                  onClick={handleEnterName}
                  disabled={nameInput.trim().length === 0}
                  className="w-full bg-indigo-600 dark:bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors font-medium disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                  Join Room
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Don't show room content until name is entered */}
        {!showNameModal && (
          <>
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">Room: {roomId}</h1>
                  <p className="text-gray-600 dark:text-gray-300">Welcome, {userName}!</p>
              <div className="flex items-center gap-2 mt-1">
                {isConnected ? (
                  <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">🟢 Connected</span>
                ) : (
                  <span className="text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded">🔴 Disconnected</span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">Participants: {roomState.users.length}</p>
              {isHost && (
                <div className="mt-2">
                  <span className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-2 py-1 rounded">Host</span>
                  <button
                    onClick={handleCopyInviteLink}
                    className="ml-2 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded hover:bg-green-200 dark:hover:bg-green-800 transition-colors flex items-center gap-1"
                  >
                    {copied ? (
                      <>
                        <span>✓</span> Copied!
                      </>
                    ) : (
                      <>
                        <span>🔗</span> Copy Invite Link
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Connection Error Alert */}
        {connectionError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-red-400 dark:text-red-500 text-xl">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Connection Error</h3>
                <p className="mt-1 text-sm text-red-700 dark:text-red-400">{connectionError}</p>
                <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                  <strong>For local testing:</strong> Make sure the server is running: <code className="bg-red-100 dark:bg-red-900/30 px-1 rounded">npm run dev</code>
                  <br />
                  <strong>For production:</strong> The Socket.io server runs on the same port as the Next.js app. No additional configuration needed.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Voting Area */}
          <div className="lg:col-span-2 space-y-4">
            {/* Voting Cards */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Select Your Vote</h2>
              <div className="grid grid-cols-3 gap-4">
                {FIBONACCI_CARDS.map((card) => (
                  <button
                    key={card}
                    onClick={() => handleVote(card)}
                    disabled={roomState.revealed}
                    className={`
                      aspect-square rounded-lg font-bold text-2xl transition-all
                      ${selectedCard === card
                        ? 'bg-indigo-600 dark:bg-indigo-500 text-white scale-110 shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'
                      }
                      ${roomState.revealed ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    {card}
                  </button>
                ))}
              </div>
              {selectedCard !== null && !roomState.revealed && (
                <p className="mt-4 text-center text-green-600 dark:text-green-400 font-medium">
                  ✓ You voted: {selectedCard}
                </p>
              )}
            </div>

                {/* Host Controls */}
                {isHost && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                    <div className="flex gap-3">
                      <button
                        onClick={handleReveal}
                        disabled={!allVoted || roomState.revealed}
                        className="flex-1 bg-green-600 dark:bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed font-medium"
                      >
                        {roomState.revealed ? 'Votes Revealed' : 'Reveal Votes'}
                      </button>
                      <button
                        onClick={handleReset}
                        disabled={!roomState.revealed}
                        className="flex-1 bg-orange-600 dark:bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-700 dark:hover:bg-orange-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed font-medium"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                )}
          </div>

              {/* Participants Sidebar */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Participants</h2>
                <div className="space-y-2">
                  {roomState.users.map((user) => (
                    <div
                      key={user.id}
                      className="flex justify-between items-center p-2 rounded bg-gray-50 dark:bg-gray-700"
                    >
                      <span className="font-medium text-gray-900 dark:text-gray-100">{user.name}</span>
                      <span className="text-sm">
                        {roomState.revealed ? (
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">{user.vote ?? '—'}</span>
                        ) : (
                          <span className={user.hasVoted ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}>
                            {user.hasVoted ? '✓' : '○'}
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
                {roomState.revealed && voteDistribution.length > 0 && (
                  <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                    <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-300 mb-2">Vote Distribution:</p>
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie
                              data={voteDistribution}
                              cx="50%"
                              cy="50%"
                              labelLine={true}
                              label={(entry: any) => {
                                const total = voteDistribution.reduce((sum, item) => sum + item.value, 0)
                                const percentage = total > 0 ? ((entry.value / total) * 100).toFixed(0) : '0'
                                return `${entry.name} (${percentage}%)`
                              }}
                              outerRadius={60}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {voteDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0]
                                  return (
                                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 shadow-lg">
                                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {`${data.name}: ${data.value} vote${data.value > 1 ? 's' : ''} (${data.payload.percentage}%)`}
                                      </p>
                                    </div>
                                  )
                                }
                                return null
                              }}
                            />
                            <Legend 
                              wrapperStyle={{ 
                                fontSize: '12px',
                                color: 'inherit'
                              }}
                              formatter={(value) => value}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                  </div>
                )}
              </div>
        </div>
          </>
        )}
      </div>
    </div>
  )
}

