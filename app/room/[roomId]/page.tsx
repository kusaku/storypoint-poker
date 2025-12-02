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
  comment: string | null
}

interface RoomState {
  users: User[]
  revealed: boolean
}

const FIBONACCI_CARDS = [0, 1, 2, 3, 5, 8]

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
  const [spinningCard, setSpinningCard] = useState<number | string | null>(null)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [copied, setCopied] = useState(false)
  const [comment, setComment] = useState<string>('')

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

    newSocket.on('connect_error', () => {
      setIsConnected(false)
      setConnectionError('Failed to connect to server')
    })

    newSocket.on('disconnect', () => {
      setIsConnected(false)
    })

    newSocket.on('room-state', (state: RoomState) => {
      setRoomState(state)
      const currentUser = state.users.find(u => u.name === userName)
      setSelectedCard(currentUser?.vote ?? null)
      setComment(currentUser?.comment ?? '')
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [roomId, userName, showNameModal])

  const handleVote = (card: number | string) => {
    if (!socket || roomState.revealed) return
    
    const isCancelling = selectedCard === card
    setSelectedCard(isCancelling ? null : card)
    if (!isCancelling) {
      setSpinningCard(card)
      setTimeout(() => setSpinningCard(null), 600)
    }
    socket.emit('vote', { roomId, vote: isCancelling ? null : card })
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
    if (!name) return
    
    setUserName(name)
    setShowNameModal(false)
    router.replace(`/room/${roomId}?name=${encodeURIComponent(name)}${isHost ? '&host=true' : ''}`)
  }

  const handleCopyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/room/${roomId}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API failed, silently ignore
    }
  }

  const handleCommentChange = (value: string) => {
    if (value.length <= 140) {
      setComment(value)
      if (socket) {
        socket.emit('comment', { roomId, comment: value.trim() || null })
      }
    }
  }

  const handleRemoveComment = () => {
    setComment('')
    if (socket) {
      socket.emit('comment', { roomId, comment: null })
    }
  }

  const hasAtLeastOneVote = roomState.users.some(u => u.hasVoted && u.vote !== null)

  const voteDistribution = useMemo(() => {
    if (!roomState.revealed) return []
    
    const voteCounts = new Map<number | string, number>()
    roomState.users.forEach(user => {
      if (user.vote != null) {
        voteCounts.set(user.vote, (voteCounts.get(user.vote) ?? 0) + 1)
      }
    })

    return Array.from(voteCounts.entries())
      .map(([vote, count]) => ({ name: String(vote), value: count }))
      .sort((a, b) => {
        if (a.name === '?') return 1
        if (b.name === '?') return -1
        return Number(a.name) - Number(b.name)
      })
  }, [roomState.revealed, roomState.users])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="fixed top-4 right-4 z-50">
        <ThemeSwitcher />
      </div>
      <div className="max-w-6xl mx-auto">
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

        {!showNameModal && (
          <>
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

        {connectionError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-700 dark:text-red-400">{connectionError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Voting Area */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Select Your Vote</h2>
                <div className="grid grid-cols-3 gap-4">
                  {FIBONACCI_CARDS.map((card) => (
                    <button
                      key={card}
                      onClick={() => handleVote(card)}
                      disabled={roomState.revealed}
                      className={`
                        aspect-square rounded-lg font-bold transition-all
                        flex items-center justify-center p-[5%]
                        ${selectedCard === card
                          ? 'bg-indigo-600 dark:bg-indigo-500 text-white scale-110 shadow-lg'
                          : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'
                        }
                        ${spinningCard === card ? 'card-spin' : ''}
                        ${roomState.revealed ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                      style={{ fontSize: 'clamp(2rem, 10vw, 6rem)', lineHeight: '1' }}
                    >
                      {card}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Add Comment</h2>
                <div className="relative">
                  <textarea
                    value={comment}
                    onChange={(e) => handleCommentChange(e.target.value)}
                    placeholder="Type your comment here..."
                    maxLength={140}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {comment.length}/140
                    </span>
                    {comment.trim() && (
                      <button
                        onClick={handleRemoveComment}
                        className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium flex items-center gap-1"
                        title="Remove comment"
                      >
                        <span>✕</span> Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {isHost && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                    <div className="flex gap-3">
                      <button
                        onClick={handleReveal}
                        disabled={roomState.revealed || !hasAtLeastOneVote}
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

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Participants</h2>
                <div className="space-y-3">
                  {roomState.users.map((user) => (
                    <div key={user.id} className="relative">
                      {user.comment && (
                        <div className="absolute bottom-full right-0 mb-2 max-w-xs">
                          <div className="bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 rounded-lg px-3 py-2 text-sm shadow-lg relative">
                            <p className="break-words">{user.comment}</p>
                            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800 dark:border-t-gray-200"></div>
                          </div>
                        </div>
                      )}
                      <div className="flex justify-between items-center p-2 rounded bg-gray-50 dark:bg-gray-700">
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
                              label={({ name, value }: any) => {
                                const total = voteDistribution.reduce((sum, item) => sum + item.value, 0)
                                const percentage = total > 0 ? Math.round((value / total) * 100) : 0
                                return `${name} (${percentage}%)`
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
                                        {`${data.name}: ${data.value} vote${data.value > 1 ? 's' : ''}`}
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

