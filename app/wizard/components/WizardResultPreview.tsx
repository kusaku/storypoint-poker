import { Icon } from '@/app/components/Icon'
import { roundToNearestCard, displayVote, type CardValue } from '@/app/fibonacci'
import { useLanguage } from '@/app/i18n/language-provider'
import type { WizardResult } from '@/app/wizard-data'

export function WizardResultPreview({ result, disabled, onVote }: {
  result: WizardResult
  disabled: boolean
  onVote: (vote: CardValue) => void
}) {
  const { t, language } = useLanguage()
  const vote = roundToNearestCard(result.suggestedSp)
  const points = displayVote(vote)
  const confidence = new Intl.NumberFormat(language, { style: 'percent' }).format(result.confidence)

  return (
    <div className="wizard-estimate">
      <div className="estimate-overview">
        <div>
          <h3>{t(result.decompose ? 'wizard.decompositionRequired' : 'wizard.suggestedStoryPoints')}</h3>
          {result.decompose ? (
            <p>{t('wizard.likelyNotSingleStory')}</p>
          ) : (
            <p>{t('wizard.confidence')} <bdi>{confidence}</bdi></p>
          )}
        </div>
        {!result.decompose && <span className="estimate-card">{points}</span>}
      </div>
      <details className="estimate-details">
        <summary>
          {t('wizard.howCalculated')}
          <Icon name="chevron" size={16} />
        </summary>
        <dl>
          <div><dt>{t('wizard.totalScore')}</dt><dd>{result.score}</dd></div>
          {!result.decompose && <div><dt>{t('wizard.baseEstimate')}</dt><dd>{result.bucket.points}</dd></div>}
          {result.minSp > 0 && <div><dt>{t('wizard.minimumEstimate')}</dt><dd>{result.minSp}</dd></div>}
          {result.breadthBump && <div><dt>{t('wizard.scopeAdjustment')}</dt><dd>{t('wizard.scopeAdjustmentDescription', { count: result.breadth })}</dd></div>}
        </dl>
        {result.factors.length > 0 && (
          <ul>
            {result.factors.map(({ section, label, option, value }) => (
              <li key={section}>
                <span>{t(label)} · {t(option)}</span><bdi>+{value}</bdi>
              </li>
            ))}
          </ul>
        )}
      </details>
      {!result.decompose && (
        <button className="button button-primary" type="button" disabled={disabled} onClick={() => onVote(vote)}>
          <Icon name="check" size={18} />
          {t('wizard.votePoints', { points })}
        </button>
      )}
    </div>
  )
}
