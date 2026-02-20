'use client'

import type { WizardResult } from '@/app/wizard-data'
import { roundToNearestCard, displayVote } from '@/app/fibonacci'
import { useLanguage } from '@/app/i18n/language-provider'

interface WizardResultPreviewProps {
  result: WizardResult
  canCalculate: boolean
  onCalculate: () => void
}

export function WizardResultPreview({ result, canCalculate, onCalculate }: WizardResultPreviewProps) {
  const { t } = useLanguage()
  const isDecompose = result.flags.includes('DECOMPOSE_REQUIRED')
  const roundedSp = isDecompose ? result.suggestedSp : roundToNearestCard(result.suggestedSp)
  const needsRounding = !isDecompose && roundedSp !== result.suggestedSp

  return (
    <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-indigo-800 dark:text-indigo-300">
          {t('wizard.suggestedStoryPoints')}: <span className="text-lg">{displayVote(roundedSp)}</span>
          {needsRounding && (
            <span className="text-xs text-indigo-600 dark:text-indigo-400 ml-2">
              ({t('wizard.roundedFrom', { value: result.suggestedSp })})
            </span>
          )}
        </h3>
        <div className="flex items-center gap-3 text-xs text-indigo-600 dark:text-indigo-400">
          <span>{t('wizard.confidence')}: {Math.round(result.confidence * 100)}%</span>
        </div>
      </div>
      {isDecompose && (
        <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded text-sm text-yellow-800 dark:text-yellow-300">
          {t('wizard.likelyNotSingleStory')}
        </div>
      )}
      <div className="mt-3 pt-3 border-t border-indigo-200 dark:border-indigo-700">
        <p className="text-xs font-medium text-indigo-700 dark:text-indigo-400 mb-2">{t('wizard.howCalculated')}</p>
        <div className="text-xs text-indigo-600 dark:text-indigo-400 space-y-1.5">
          <div>
            <span className="font-medium">{t('wizard.step1')}:</span> {t('wizard.selectedValues')}:
            <div className="ml-3 mt-0.5 space-y-0.5">
              {result.contributingValues.length > 0 ? (
                result.contributingValues.map((item, idx) => (
                  <div key={idx} className="text-xs">
                    • {t(item.label)}: <span className="font-medium">+{item.value}</span>
                    {item.minSp && <span className="text-indigo-500 dark:text-indigo-300"> (min SP: {item.minSp})</span>}
                  </div>
                ))
              ) : (
                <div className="text-xs italic">{t('wizard.noSelectionsMade')}</div>
              )}
            </div>
          </div>
          
          <div>
            <span className="font-medium">{t('wizard.step2')}:</span> {t('wizard.totalScore')} = {result.contributingValues.length > 1
              ? <><span className="font-medium">{result.contributingValues.map(v => v.value).join(' + ')}</span> = <span className="font-medium">{result.score}</span></>
              : <span className="font-medium">{result.score}</span>}
          </div>
          
          {!isDecompose && (
            <div>
              <span className="font-medium">{t('wizard.step3')}:</span> {t('wizard.baseSpFromScoreBucket')}:
              <div className="ml-3 mt-0.5 text-xs">
                {t('wizard.score')} {result.score} → {t('wizard.bucket')} {result.score <= 2 ? '[0-2]' : result.score <= 5 ? '[3-5]' : result.score <= 9 ? '[6-9]' : result.score <= 14 ? '[10-14]' : result.score <= 20 ? '[15-20]' : '[21+]'} → {t('wizard.baseSp')} = <span className="font-medium">{result.baseSp}</span>
              </div>
            </div>
          )}
          
          {result.minSpFromGates > 0 && (
            <div>
              <span className="font-medium">{t('wizard.step4')}:</span> {t('wizard.minSpGate')} = <span className="font-medium">{result.minSpFromGates}</span>
              <div className="ml-3 mt-0.5 text-xs">
                ({t('wizard.from', { labels: result.contributingValues.filter(v => v.minSp === result.minSpFromGates).map(v => t(v.label)).join(', ') })})
              </div>
            </div>
          )}
          
          {result.breadthBumpApplied && (
            <div>
              <span className="font-medium">{t('wizard.step5')}:</span> {t('wizard.breadthBumpApplied')}
              <div className="ml-3 mt-0.5 text-xs">
                ({t('wizard.categoriesWithValues', { count: result.breadth })})
              </div>
            </div>
          )}
          
          <div className="pt-1 font-medium border-t border-indigo-200 dark:border-indigo-700 mt-1">
            → {t('wizard.finalSp')} = {result.minSpFromGates > 0 
              ? t('wizard.maxFormula', { baseSp: t('wizard.baseSp'), baseSpValue: result.baseSp, other: t('wizard.minSpGate'), otherValue: result.minSpFromGates })
              : result.breadthBumpApplied
              ? t('wizard.maxFormula', { baseSp: t('wizard.baseSp'), baseSpValue: result.baseSp, other: t('wizard.breadthBump'), otherValue: 5 })
              : `${t('wizard.baseSp')}: ${result.baseSp}`} = <span className="text-indigo-700 dark:text-indigo-300">{result.suggestedSp}</span>
          </div>
        </div>
      </div>
      {result.reasons.length > 0 && (
        <div className="mt-2">
          <p className="text-xs font-medium text-indigo-700 dark:text-indigo-400 mb-1">{t('wizard.topFactors')}:</p>
          <ul className="text-xs text-indigo-600 dark:text-indigo-400 list-disc list-inside space-y-1">
            {result.reasons.slice(0, 3).map((reason, idx) => {
              // Parse reason format: "key1:key2" or "key:value" or just "key"
              const parts = reason.split(':')
              if (parts.length === 2) {
                if (parts[0] === 'minSp') {
                  return <li key={idx}>{t('wizard.minSpRequirement', { value: parts[1] })}</li>
                } else if (parts[0] === 'decompose') {
                  return <li key={idx}>{t('wizard.scoreIndicatesTooLarge')}</li>
                } else {
                  return <li key={idx}>{t(parts[0])}: {t(parts[1])}</li>
                }
              }
              // Handle single key reasons
              if (reason === 'decompose') {
                return <li key={idx}>{t('wizard.decompose')}</li>
              }
              return <li key={idx}>{t(reason)}</li>
            })}
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
              ? t('wizard.decompositionRequired')
              : t('wizard.selectPoints', { points: displayVote(roundToNearestCard(result.suggestedSp)) })}
          </button>
        </div>
      )}
    </div>
  )
}
