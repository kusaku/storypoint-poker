'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLanguage } from '@/app/i18n/language-provider'
import { setHostInUrl } from '@/app/room-url'
import { normalizeName } from '@/shared/room'
import { Wizard } from '@/app/wizard'
import { CommentInput } from './components/CommentInput'
import { JoinRoom } from './components/JoinRoom'
import { ParticipantsPanel } from './components/ParticipantsPanel'
import { RoomHeader } from './components/RoomHeader'
import { RoundResults } from './components/RoundResults'
import { VotingCards } from './components/VotingCards'
import { useRoom } from './useRoom'

export function RoomExperience({ roomId }: { roomId: string }) {
  const search = useSearchParams()
  const name = normalizeName(search.get('name'))
  const asHost = search.get('host') === 'true'

  if (!name) {
    return <JoinRoom roomId={roomId} onJoin={(enteredName) => {
      const url = new URL(window.location.href)
      url.searchParams.set('name', enteredName)
      window.history.replaceState(null, '', url)
    }} />
  }
  return <ActiveRoom key={name} roomId={roomId} name={name} asHost={asHost} />
}

function ActiveRoom({ roomId, name, asHost }: { roomId: string; name: string; asHost: boolean }) {
  const { state, connection, send } = useRoom(roomId, name, asHost)
  const [wizardRound, setWizardRound] = useState<number | null>(null)
  const helperButton = useRef<HTMLButtonElement>(null)
  const helperWasOpen = useRef(false)
  const { t } = useLanguage()
  const ready = connection === 'connected'
  const isHost = state?.users.some((user) => user.id === state.viewerId && user.isHost) ?? false
  const round = state?.round
  const showWizard = round !== undefined && wizardRound === round && !state?.revealed

  useEffect(() => {
    if (helperWasOpen.current && !showWizard) helperButton.current?.focus()
    helperWasOpen.current = showWizard
  }, [showWizard])

  function resetRound() {
    send('RESET_VOTES', undefined)
  }

  return (
    <main className="container room">
      <RoomHeader
        roomId={roomId}
        connection={connection}
        round={round}
        onResetRound={isHost ? resetRound : undefined}
      />
      {state ? (
        <div className="room-layout">
          {state.revealed ? (
            <RoundResults users={state.users} />
          ) : showWizard ? (
            <Wizard
              initialAnswers={state.ballot.wizardAnswers}
              disabled={!ready}
              onAnswersChange={(wizardAnswers) => send('WIZARD_ANSWERS', { wizardAnswers })}
              onBack={() => setWizardRound(null)}
              onVote={(vote) => {
                send('VOTE', { vote })
                setWizardRound(null)
              }}
            />
          ) : (
            <VotingCards
              selected={state.ballot.vote}
              disabled={!ready}
              onVote={(vote) => send('VOTE', { vote, toggle: true })}
              onOpenWizard={() => setWizardRound(state.round)}
              helperButtonRef={helperButton}
            />
          )}
          <ParticipantsPanel
            users={state.users}
            viewerId={state.viewerId}
            isHost={isHost}
            revealed={state.revealed}
            disabled={!ready}
            onReveal={() => send('REVEAL_VOTES', undefined)}
            onReset={resetRound}
            onBecomeHost={() => setHostInUrl(true)}
            onRemoveHost={() => setHostInUrl(false)}
          />
          <CommentInput
            key={'comment:' + state.round}
            comment={state.ballot.comment ?? ''}
            revealed={state.revealed}
            disabled={!ready}
            onChange={(comment, done) => send('COMMENT', { comment: comment || null }, done)}
          />
        </div>
      ) : (
        <p className="panel room-loading">{t(connection === 'disconnected' ? 'common.disconnected' : 'room.connecting')}</p>
      )}
    </main>
  )
}
