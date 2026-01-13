'use client'

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
  return (
    <div className="space-y-3">
      {isHost && (
        <div className="flex gap-3">
          <button
            onClick={onReveal}
            disabled={revealed || !hasAtLeastOneVote}
            className="flex-1 bg-green-600 dark:bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed font-medium"
          >
            {revealed ? 'Votes Revealed' : 'Reveal Votes'}
          </button>
          <button
            onClick={onReset}
            disabled={!revealed}
            className="flex-1 bg-orange-600 dark:bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-700 dark:hover:bg-orange-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed font-medium"
          >
            Reset
          </button>
        </div>
      )}
      {!isHost ? (
        <button
          onClick={onBecomeHost}
          className="w-full px-3 py-2 text-sm bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors font-medium"
        >
          Become Host
        </button>
      ) : (
        <button
          onClick={onRemoveHost}
          className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
        >
          Remove Host Status
        </button>
      )}
    </div>
  )
}
