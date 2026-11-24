import { Icon } from '@/app/components/Icon'
import { useLanguage } from '@/app/i18n/language-provider'
import type { Participant } from '@/app/types/room'
import { ParticipantRow } from './ParticipantRow'

interface ParticipantsPanelProps {
  users: Participant[]
  viewerId: string
  isHost: boolean
  revealed: boolean
  disabled: boolean
  onReveal: () => void
  onReset: () => void
  onBecomeHost: () => void
  onRemoveHost: () => void
}

export function ParticipantsPanel({
  users, viewerId, isHost, revealed, disabled, onReveal, onReset, onBecomeHost, onRemoveHost,
}: ParticipantsPanelProps) {
  const { t } = useLanguage()
  const votes = users.filter((user) => user.hasVoted).length
  const progress = t('room.progress', { voted: votes, total: users.length })

  return (
    <aside className="panel people-panel" aria-labelledby="people-heading">
      <div className="people-heading">
        <Icon name="users" size={21} />
        <h2 id="people-heading">{t('room.participants')}</h2>
        <span className="people-count mono" aria-hidden="true">{users.length}</span>
      </div>
      <div className="round-progress">
        <p aria-live="polite">{progress}</p>
        <progress aria-label={progress} max={Math.max(1, users.length)} value={votes} />
      </div>
      <ul className="participant-list">
        {users.map((user) => <ParticipantRow key={user.id} user={user} current={user.id === viewerId} revealed={revealed} />)}
      </ul>
      <div className="host-controls">
        {isHost && (
          <button
            className="button button-primary"
            type="button"
            onClick={revealed ? onReset : onReveal}
            disabled={disabled || (!revealed && !votes)}
          >
            <Icon name={revealed ? 'reset' : 'eye'} size={19} />
            {revealed ? t('room.nextRound') : t('room.revealVotes')}
          </button>
        )}
        <button
          className={isHost ? 'button button-quiet' : 'button button-outline'}
          type="button"
          onClick={isHost ? onRemoveHost : onBecomeHost}
          disabled={disabled}
        >
          {isHost ? t('room.removeHostStatus') : t('room.becomeHost')}
        </button>
      </div>
    </aside>
  )
}
