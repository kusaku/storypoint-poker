'use client'

import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { io, Socket } from 'socket.io-client'
import { SettingsButton } from '@/app/components/SettingsButton'
import { useLanguage } from '@/app/i18n/language-provider'
import { Wizard } from '@/app/wizard'
import type { WizardAnswers } from '@/app/wizard-data'
import { roundToNearestCard, displayVote } from '@/app/fibonacci'
import {
  COMMENT_MAX_LENGTH,
  COPY_FEEDBACK_DURATION,
  PAGE_SHELL_CLASS,
  SECONDARY_BUTTON_CLASS,
  PANEL_CARD_CLASS,
  SOCKET_CLIENT_OPTIONS,
} from '@/app/constants'
import type { RoomState } from '@/app/types/room'
import SOCKET_EVENTS from '@/shared/socket-events.json'
import { NameModal } from '@/app/room/[roomId]/components/NameModal'
import { RoomHeader } from '@/app/room/[roomId]/components/RoomHeader'
import { VotingCards } from '@/app/room/[roomId]/components/VotingCards'
import { CommentInput } from '@/app/room/[roomId]/components/CommentInput'
import { ParticipantsPanel } from '@/app/room/[roomId]/components/ParticipantsPanel'
import { Footer } from '@/app/components/Footer'

function getVoteDistribution(state: RoomState) {
  if (!state.revealed) return []

  const voteCounts = new Map<number, number>()
  state.users.forEach((user) => {
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
      value: count,
    }))
}

export default function RoomPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { t } = useLanguage()
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

  const emitRoomEvent = useCallback(
    (event: string, payload: Record<string, unknown> = {}) => {
      if (!socket) return
      socket.emit(event, { roomId, ...payload })
    },
    [socket, roomId]
  )

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
        emitRoomEvent(SOCKET_EVENTS.BECOME_HOST)
      }
      else if (!urlIsHost && isHost) {
        emitRoomEvent(SOCKET_EVENTS.REMOVE_HOST)
      }
    }
  }, [urlIsHost, userName, showNameModal, isHost, emitRoomEvent])

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

    const newSocket = io(window.location.origin, SOCKET_CLIENT_OPTIONS)

    newSocket.on('connect', () => {
      setIsConnected(true)
      newSocket.emit(SOCKET_EVENTS.JOIN_ROOM, { roomId, userName, clientId: userName })
      if (prevUrlIsHostRef.current) {
        newSocket.emit(SOCKET_EVENTS.BECOME_HOST, { roomId })
      }
    })

    newSocket.on('connect_error', () => {
      setIsConnected(false)
    })

    newSocket.on('disconnect', () => {
      setIsConnected(false)
    })

    newSocket.on(SOCKET_EVENTS.ROOM_STATE, (state: RoomState) => {
      setRoomState(state)
      const currentUser = state.users.find(u => u.id === userName)
      setSelectedCard(currentUser?.vote ?? null)
      const serverComment = currentUser?.comment ?? ''
      setComment(serverComment)
      if (currentUser?.wizardAnswers) {
        setWizardAnswers(currentUser.wizardAnswers)
      }
      if (currentUser) {
        const newHostStatus = currentUser.isHost
        setIsHost(newHostStatus)
        updateHostStatusInUrl(newHostStatus)
      }
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [roomId, userName, showNameModal, updateHostStatusInUrl])

  const handleVote = (card: number) => {
    if (roomState.revealed) return
    
    const isCancelling = selectedCard === card
    setSelectedCard(isCancelling ? null : card)
    emitRoomEvent(SOCKET_EVENTS.VOTE, { vote: isCancelling ? null : card })
  }

  const handleReveal = () => {
    if (isHost) {
      emitRoomEvent(SOCKET_EVENTS.REVEAL_VOTES)
    }
  }

  const handleReset = () => {
    if (isHost) {
      emitRoomEvent(SOCKET_EVENTS.RESET_VOTES)
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
    if (!isHost) {
      emitRoomEvent(SOCKET_EVENTS.BECOME_HOST)
      updateHostStatusInUrl(true)
    }
  }, [isHost, emitRoomEvent, updateHostStatusInUrl])

  const handleRemoveHost = useCallback(() => {
    if (isHost) {
      emitRoomEvent(SOCKET_EVENTS.REMOVE_HOST)
      updateHostStatusInUrl(false)
    }
  }, [isHost, emitRoomEvent, updateHostStatusInUrl])

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
      emitRoomEvent(SOCKET_EVENTS.COMMENT, { comment: value.trim() || null })
    }
  }

  const handleRemoveComment = () => {
    setComment('')
    emitRoomEvent(SOCKET_EVENTS.COMMENT, { comment: null })
  }

  const handleWizardCalculate = (suggestedSp: number) => {
    const roundedSp = roundToNearestCard(suggestedSp)
    if (roomState.revealed) return
    setSelectedCard(roundedSp)
    emitRoomEvent(SOCKET_EVENTS.VOTE, { vote: roundedSp })
  }

  const handleWizardBack = () => {
    setShowWizard(false)
  }

  const handleWizardAnswersChange = (answers: WizardAnswers) => {
    setWizardAnswers(answers)
    emitRoomEvent(SOCKET_EVENTS.WIZARD_ANSWERS, { wizardAnswers: answers })
  }

  useEffect(() => {
    if (roomState.revealed) {
      setShowWizard(false)
    }
  }, [roomState.revealed])

  useEffect(() => {
    if (!roomState.revealed && roomState.users.length > 0 && wizardAnswers) {
      const currentUser = roomState.users.find(u => u.id === userName)
      if (currentUser && !currentUser.wizardAnswers) {
        setWizardAnswers(null)
      }
    }
  }, [roomState.revealed, roomState.users, userName, wizardAnswers])

  const hasAtLeastOneVote = useMemo(
    () => roomState.users.some(u => u.hasVoted),
    [roomState.users]
  )

  const voteDistribution = useMemo(() => getVoteDistribution(roomState), [roomState])

  return (
    <div className={PAGE_SHELL_CLASS}>
      <div className="fixed top-4 right-4 z-50">
        <SettingsButton />
      </div>
      <div className="max-w-6xl mx-auto grow shrink-0 w-full">
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
              revealed={roomState.revealed}
              onCopyInviteLink={handleCopyInviteLink}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
              <div className={`lg:col-span-2 ${PANEL_CARD_CLASS}`}>
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
                      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">{t('room.selectYourVote')}</h2>
                      <button
                        onClick={() => setShowWizard(true)}
                        disabled={roomState.revealed}
                        className={`${SECONDARY_BUTTON_CLASS} disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed`}
                      >
                        {t('room.wizard')}
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
      <Footer />
    </div>
  )
}

