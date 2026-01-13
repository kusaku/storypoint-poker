'use client'

import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { io, Socket } from 'socket.io-client'
import { ThemeSwitcher } from '../../theme-switcher'
import { Wizard } from '../../wizard'
import { WizardAnswers } from '../../wizard-data'
import { roundToNearestCard, displayVote } from '../../fibonacci'
import { COMMENT_MAX_LENGTH, COPY_FEEDBACK_DURATION } from '../../constants'
import { type User } from './components/ParticipantRow'
import { NameModal } from './components/NameModal'
import { RoomHeader } from './components/RoomHeader'
import { VotingCards } from './components/VotingCards'
import { CommentInput } from './components/CommentInput'
import { ParticipantsPanel } from './components/ParticipantsPanel'

interface RoomState {
  users: User[]
  revealed: boolean
}

export default function RoomPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const roomId = params.roomId as string
  const urlUserName = searchParams.get('name')
  const urlIsHost = searchParams.get('host') === 'true'

  const [userName, setUserName] = useState<string>(urlUserName || '')
  const [showNameModal, setShowNameModal] = useState(!urlUserName || urlUserName.trim() === '')
  const [nameInput, setNameInput] = useState(urlUserName || '')
  const [socket, setSocket] = useState<Socket | null>(null)
  const [roomState, setRoomState] = useState<RoomState>({
    users: [],
    revealed: false
  })
  const [selectedCard, setSelectedCard] = useState<number | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [copied, setCopied] = useState(false)
  const [comment, setComment] = useState<string>('')
  const [showWizard, setShowWizard] = useState(false)
  const [wizardAnswers, setWizardAnswers] = useState<WizardAnswers | null>(null)
  const [isHost, setIsHost] = useState<boolean>(urlIsHost)
  const prevUrlIsHostRef = useRef<boolean>(urlIsHost)
  const isUpdatingUrlRef = useRef<boolean>(false)

  useEffect(() => {
    if (!socket || !userName?.trim() || showNameModal) return
    
    if (isUpdatingUrlRef.current) {
      isUpdatingUrlRef.current = false
      prevUrlIsHostRef.current = urlIsHost
      return
    }

    if (prevUrlIsHostRef.current !== urlIsHost) {
      prevUrlIsHostRef.current = urlIsHost
      
      if (urlIsHost && !isHost) {
        socket.emit('become-host', { roomId })
      }
      else if (!urlIsHost && isHost) {
        socket.emit('remove-host', { roomId })
      }
    }
  }, [urlIsHost, socket, userName, showNameModal, roomId, isHost])

  const updateHostStatusInUrl = useCallback((hostStatus: boolean) => {
    const currentUrl = new URL(window.location.href)
    const currentHostParam = currentUrl.searchParams.get('host') === 'true'
    
    if (currentHostParam !== hostStatus) {
      isUpdatingUrlRef.current = true
      prevUrlIsHostRef.current = hostStatus
      if (hostStatus) {
        currentUrl.searchParams.set('host', 'true')
      } else {
        currentUrl.searchParams.delete('host')
      }
      router.replace(currentUrl.pathname + currentUrl.search, { scroll: false })
    }
  }, [router])

  useEffect(() => {
    if (!userName?.trim() || showNameModal) return

    const newSocket = io(window.location.origin, {
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000
    })

    newSocket.on('connect', () => {
      setIsConnected(true)
      newSocket.emit('join-room', { roomId, userName })
      if (urlIsHost) {
        newSocket.emit('become-host', { roomId })
      }
    })

    newSocket.on('connect_error', () => {
      setIsConnected(false)
    })

    newSocket.on('disconnect', () => {
      setIsConnected(false)
    })

    newSocket.on('room-state', (state: RoomState) => {
      setRoomState(state)
      const currentUser = state.users.find(u => u.name === userName)
      setSelectedCard(currentUser?.vote ?? null)
      const serverComment = currentUser?.comment ?? ''
      setComment(serverComment)
      if (currentUser?.wizardAnswers) {
        setWizardAnswers(currentUser.wizardAnswers)
      }
      if (currentUser) {
        const newHostStatus = currentUser.isHost
        if (isHost !== newHostStatus) {
          setIsHost(newHostStatus)
          updateHostStatusInUrl(newHostStatus)
        }
      }
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [roomId, userName, showNameModal, urlIsHost, updateHostStatusInUrl])

  const handleVote = (card: number) => {
    if (!socket || roomState.revealed) return
    
    const isCancelling = selectedCard === card
    setSelectedCard(isCancelling ? null : card)
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
    router.replace(`/room/${roomId}?name=${encodeURIComponent(name)}`)
  }

  const handleBecomeHost = useCallback(() => {
    if (socket && !isHost) {
      socket.emit('become-host', { roomId })
      updateHostStatusInUrl(true)
    }
  }, [socket, isHost, roomId, updateHostStatusInUrl])

  const handleRemoveHost = useCallback(() => {
    if (socket && isHost) {
      socket.emit('remove-host', { roomId })
      updateHostStatusInUrl(false)
    }
  }, [socket, isHost, roomId, updateHostStatusInUrl])

  const handleCopyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/room/${roomId}`)
      setCopied(true)
      setTimeout(() => setCopied(false), COPY_FEEDBACK_DURATION)
    } catch {
    }
  }

  const handleCommentChange = (value: string) => {
    if (value.length <= COMMENT_MAX_LENGTH) {
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

  const handleWizardCalculate = (suggestedSp: number) => {
    const roundedSp = roundToNearestCard(suggestedSp)
    if (!socket || roomState.revealed) return
    setSelectedCard(roundedSp)
    socket.emit('vote', { roomId, vote: roundedSp })
  }

  const handleWizardBack = () => {
    setShowWizard(false)
  }

  const handleWizardAnswersChange = (answers: WizardAnswers) => {
    setWizardAnswers(answers)
    if (socket) {
      socket.emit('wizard-answers', { roomId, wizardAnswers: answers })
    }
  }

  useEffect(() => {
    if (roomState.revealed) {
      setShowWizard(false)
    }
  }, [roomState.revealed])

  useEffect(() => {
    if (!roomState.revealed && roomState.users.length > 0 && wizardAnswers) {
      const currentUser = roomState.users.find(u => u.name === userName)
      if (currentUser && !currentUser.wizardAnswers) {
        setWizardAnswers(null)
      }
    }
  }, [roomState.revealed, roomState.users, userName, wizardAnswers])

  const hasAtLeastOneVote = useMemo(
    () => roomState.users.some(u => u.hasVoted),
    [roomState.users]
  )

  const voteDistribution = useMemo(() => {
    if (!roomState.revealed) return []
    
    const voteCounts = new Map<number, number>()
    roomState.users.forEach(user => {
      if (user.vote != null) {
        voteCounts.set(user.vote, (voteCounts.get(user.vote) ?? 0) + 1)
      }
    })

    return Array.from(voteCounts.entries())
      .sort(([a], [b]) => {
        if (a === 0) return -1
        if (b === 0) return 1
        return a - b
      })
      .map(([vote, count]) => ({ 
        name: displayVote(vote), 
        value: count 
      }))
  }, [roomState.revealed, roomState.users])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="fixed top-4 right-4 z-50">
        <ThemeSwitcher />
      </div>
      <div className="max-w-6xl mx-auto">
        {showNameModal && (
          <NameModal
            nameInput={nameInput}
            setNameInput={setNameInput}
            onEnterName={handleEnterName}
          />
        )}

        {!showNameModal && (
          <>
            <RoomHeader
              roomId={roomId}
              userName={userName}
              isConnected={isConnected}
              copied={copied}
              onCopyInviteLink={handleCopyInviteLink}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                {showWizard ? (
                  <Wizard
                    onCalculate={handleWizardCalculate}
                    onBack={handleWizardBack}
                    initialAnswers={wizardAnswers || undefined}
                    onAnswersChange={handleWizardAnswersChange}
                  />
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Select Your Vote</h2>
                      <button
                        onClick={() => setShowWizard(true)}
                        disabled={roomState.revealed}
                        className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-medium"
                      >
                        🧙 Wizard
                      </button>
                    </div>
                    <VotingCards
                      selectedCard={selectedCard}
                      revealed={roomState.revealed}
                      onVote={handleVote}
                    />
                    <CommentInput
                      comment={comment}
                      onCommentChange={handleCommentChange}
                      onRemoveComment={handleRemoveComment}
                    />
                  </>
                )}
              </div>

              <ParticipantsPanel
                users={roomState.users}
                revealed={roomState.revealed}
                voteDistribution={voteDistribution}
                isHost={isHost}
                hasAtLeastOneVote={hasAtLeastOneVote}
                onReveal={handleReveal}
                onReset={handleReset}
                onBecomeHost={handleBecomeHost}
                onRemoveHost={handleRemoveHost}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

