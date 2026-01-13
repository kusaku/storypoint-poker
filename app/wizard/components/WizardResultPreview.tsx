'use client'

import { WizardResult } from '../../wizard-data'
import { roundToNearestCard, displayVote } from '../../fibonacci'

interface WizardResultPreviewProps {
  result: WizardResult
  canCalculate: boolean
  onCalculate: () => void
}

export function WizardResultPreview({ result, canCalculate, onCalculate }: WizardResultPreviewProps) {
  const isDecompose = result.flags.includes('DECOMPOSE_REQUIRED')
  const roundedSp = isDecompose ? result.suggestedSp : roundToNearestCard(result.suggestedSp)
  const needsRounding = !isDecompose && roundedSp !== result.suggestedSp

  return (
    <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-indigo-800 dark:text-indigo-300">
          Suggested Story Points: <span className="text-lg">{displayVote(roundedSp)}</span>
          {needsRounding && (
            <span className="text-xs text-indigo-600 dark:text-indigo-400 ml-2">
              (rounded from {result.suggestedSp})
            </span>
          )}
        </h3>
        <div className="flex items-center gap-3 text-xs text-indigo-600 dark:text-indigo-400">
          <span>Confidence: {Math.round(result.confidence * 100)}%</span>
        </div>
      </div>
      {isDecompose && (
        <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded text-sm text-yellow-800 dark:text-yellow-300">
          ⚠️ This is likely not a single story. Consider decomposition.
        </div>
      )}
      <div className="mt-3 pt-3 border-t border-indigo-200 dark:border-indigo-700">
        <p className="text-xs font-medium text-indigo-700 dark:text-indigo-400 mb-2">How this was calculated:</p>
        <div className="text-xs text-indigo-600 dark:text-indigo-400 space-y-1.5">
          <div>
            <span className="font-medium">Step 1:</span> Selected values:
            <div className="ml-3 mt-0.5 space-y-0.5">
              {result.contributingValues.length > 0 ? (
                result.contributingValues.map((item, idx) => (
                  <div key={idx} className="text-xs">
                    • {item.label}: <span className="font-medium">+{item.value}</span>
                    {item.minSp && <span className="text-indigo-500 dark:text-indigo-300"> (min SP: {item.minSp})</span>}
                  </div>
                ))
              ) : (
                <div className="text-xs italic">No selections made</div>
              )}
            </div>
          </div>
          
          <div>
            <span className="font-medium">Step 2:</span> Total score = {result.contributingValues.length > 1
              ? <><span className="font-medium">{result.contributingValues.map(v => v.value).join(' + ')}</span> = <span className="font-medium">{result.score}</span></>
              : <span className="font-medium">{result.score}</span>}
          </div>
          
          {!isDecompose && (
            <div>
              <span className="font-medium">Step 3:</span> Base SP from score bucket:
              <div className="ml-3 mt-0.5 text-xs">
                Score {result.score} → Bucket {result.score <= 2 ? '[0-2]' : result.score <= 5 ? '[3-5]' : result.score <= 9 ? '[6-9]' : result.score <= 14 ? '[10-14]' : result.score <= 20 ? '[15-20]' : '[21+]'} → Base SP = <span className="font-medium">{result.baseSp}</span>
              </div>
            </div>
          )}
          
          {result.minSpFromGates > 0 && (
            <div>
              <span className="font-medium">Step 4:</span> Min SP gate = <span className="font-medium">{result.minSpFromGates}</span>
              <div className="ml-3 mt-0.5 text-xs">
                (from: {result.contributingValues.filter(v => v.minSp === result.minSpFromGates).map(v => v.label).join(', ')})
              </div>
            </div>
          )}
          
          {result.breadthBumpApplied && (
            <div>
              <span className="font-medium">Step 5:</span> Breadth bump applied
              <div className="ml-3 mt-0.5 text-xs">
                ({result.breadth} categories with values ≥ 1, so minimum SP = 5)
              </div>
            </div>
          )}
          
          <div className="pt-1 font-medium border-t border-indigo-200 dark:border-indigo-700 mt-1">
            → Final SP = {result.minSpFromGates > 0 
              ? `max(Base SP: ${result.baseSp}, Min SP gate: ${result.minSpFromGates})`
              : result.breadthBumpApplied
              ? `max(Base SP: ${result.baseSp}, Breadth bump: 5)`
              : `Base SP: ${result.baseSp}`} = <span className="text-indigo-700 dark:text-indigo-300">{result.suggestedSp}</span>
          </div>
        </div>
      </div>
      {result.reasons.length > 0 && (
        <div className="mt-2">
          <p className="text-xs font-medium text-indigo-700 dark:text-indigo-400 mb-1">Top factors:</p>
          <ul className="text-xs text-indigo-600 dark:text-indigo-400 list-disc list-inside space-y-1">
            {result.reasons.slice(0, 3).map((reason, idx) => (
              <li key={idx}>{reason}</li>
            ))}
          </ul>
        </div>
      )}
      
      {canCalculate && (
        <div className="mt-4 pt-4 border-t border-indigo-200 dark:border-indigo-700">
          <button
            onClick={onCalculate}
            disabled={isDecompose}
            className="w-full bg-indigo-600 dark:bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {isDecompose
              ? 'Decomposition Required'
              : `Select ${displayVote(roundToNearestCard(result.suggestedSp))} Points`}
          </button>
        </div>
      )}
    </div>
  )
}
