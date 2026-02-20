'use client'

import { useLanguage } from '@/app/i18n/language-provider'
import {
  SMALL_SECONDARY_BUTTON_CLASS,
  SUCCESS_ACTION_BUTTON_CLASS,
  WARNING_ACTION_BUTTON_CLASS,
} from '@/app/constants'

interface HostControlsProps {
  isHost: boolean
  revealed: boolean
  hasAtLeastOneVote: boolean
  onReveal: () => void
  onReset: () => void
  onBecomeHost: () => void
  onRemoveHost: () => void
}

export function HostControls({ 
  isHost, 
  revealed, 
  hasAtLeastOneVote, 
  onReveal, 
  onReset, 
  onBecomeHost, 
  onRemoveHost 
}: HostControlsProps) {
  const { t } = useLanguage()
  return (
    <div className="space-y-3">
      {isHost && (
        <div className="flex gap-3">
          <button
            onClick={onReveal}
            disabled={revealed || !hasAtLeastOneVote}
            className={SUCCESS_ACTION_BUTTON_CLASS}
          >
            {revealed ? t('room.votesRevealed') : t('room.revealVotes')}
          </button>
          <button
            onClick={onReset}
            disabled={!revealed}
            className={WARNING_ACTION_BUTTON_CLASS}
          >
            {t('room.reset')}
          </button>
        </div>
      )}
      {!isHost ? (
        <button
          onClick={onBecomeHost}
          className="w-full px-3 py-2 text-sm bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors font-medium"
        >
          {t('room.becomeHost')}
        </button>
      ) : (
        <button
          onClick={onRemoveHost}
          className={SMALL_SECONDARY_BUTTON_CLASS}
        >
          {t('room.removeHostStatus')}
        </button>
      )}
    </div>
  )
}
