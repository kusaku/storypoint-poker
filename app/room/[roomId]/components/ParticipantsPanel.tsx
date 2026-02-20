'use client'

import { ParticipantRow } from '@/app/room/[roomId]/components/ParticipantRow'
import { VoteDistributionChart } from '@/app/room/[roomId]/components/VoteDistributionChart'
import { HostControls } from '@/app/room/[roomId]/components/HostControls'
import { useLanguage } from '@/app/i18n/language-provider'
import type { User } from '@/app/types/room'
import { PANEL_CARD_CLASS } from '@/app/constants'

interface ParticipantsPanelProps {
  users: User[]
  revealed: boolean
  voteDistribution: Array<{ name: string; value: number }>
  isHost: boolean
  hasAtLeastOneVote: boolean
  onReveal: () => void
  onReset: () => void
  onBecomeHost: () => void
  onRemoveHost: () => void
}

export function ParticipantsPanel({
  users,
  revealed,
  voteDistribution,
  isHost,
  hasAtLeastOneVote,
  onReveal,
  onReset,
  onBecomeHost,
  onRemoveHost
}: ParticipantsPanelProps) {
  const { t } = useLanguage()
  return (
    <div className={`${PANEL_CARD_CLASS} flex flex-col h-full`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">{t('room.participants')}</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">{users.length}</span>
      </div>
      <div className="space-y-3 flex-1">
        {users.map((user) => (
          <ParticipantRow key={user.id} user={user} revealed={revealed} />
        ))}
      </div>
      {revealed && voteDistribution.length > 0 && (
        <VoteDistributionChart voteDistribution={voteDistribution} />
      )}
      <div className="mt-auto pt-4">
        <HostControls
          isHost={isHost}
          revealed={revealed}
          hasAtLeastOneVote={hasAtLeastOneVote}
          onReveal={onReveal}
          onReset={onReset}
          onBecomeHost={onBecomeHost}
          onRemoveHost={onRemoveHost}
        />
      </div>
    </div>
  )
}
