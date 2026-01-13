'use client'

import { ParticipantRow, type User } from './ParticipantRow'
import { VoteDistributionChart } from './VoteDistributionChart'
import { HostControls } from './HostControls'

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
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Participants</h2>
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
