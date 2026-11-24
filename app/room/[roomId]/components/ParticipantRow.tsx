import { Icon } from '@/app/components/Icon'
import { displayVote } from '@/app/fibonacci'
import { useLanguage } from '@/app/i18n/language-provider'
import type { Participant } from '@/app/types/room'
import { getDropdownsByTaskType, taskTypeLabel } from '@/app/wizard-data'

export function ParticipantRow({ user, current, revealed }: { user: Participant; current: boolean; revealed: boolean }) {
  const { t } = useLanguage()
  const initials = user.name.split(/\s+/).slice(0, 2).map((word) => Array.from(word)[0]).join('').toLocaleUpperCase()
  const color = parseInt(user.id.slice(0, 2), 16) % 4
  const wizard = revealed ? user.wizardAnswers : null
  const comment = revealed ? user.comment?.trim() : null

  return (
    <li className="participant">
      <div className="participant-row">
        <span className="avatar" data-color={color} aria-hidden="true">{initials}</span>
        <div className="participant-info">
          <bdi className="participant-name">{user.name}</bdi>
          {(current || user.isHost) && (
            <div className="participant-roles">
              {current && <span>{t('room.you')}</span>}
              {user.isHost && <span className="host-role">{t('room.hostRole')}</span>}
            </div>
          )}
        </div>
        {revealed ? (
          <span className="mini-card mono" data-vote={user.vote ?? undefined} aria-label={user.vote === 0 ? t('room.joker') : undefined}>{displayVote(user.vote)}</span>
        ) : (
          <span className="participant-status" data-voted={user.hasVoted}>
            {user.hasVoted && <Icon name="check" size={15} />}
            {t(user.hasVoted ? 'room.votedStatus' : user.connected ? 'room.waiting' : 'common.disconnected')}
          </span>
        )}
      </div>
      {comment && <p className="participant-comment" dir="auto">{comment}</p>}
      {wizard && (
        <details className="participant-details">
          <summary>{t('wizard.estimationDetails')} <Icon name="chevron" size={15} /></summary>
          <p>{t(taskTypeLabel(wizard.taskType))}</p>
          <dl>
            {Object.entries(getDropdownsByTaskType(wizard.taskType)).map(([section, { label }]) => {
              const answer = wizard.answers[section]
              return answer && <div key={section}><dt>{t(label)}</dt><dd>{t(answer.option)}</dd></div>
            })}
          </dl>
        </details>
      )}
    </li>
  )
}
