import { Dialog } from '@/app/components/Dialog'
import { useLanguage } from '@/app/i18n/language-provider'
import { SCORE_BUCKETS } from '@/app/wizard-data'

const scoring = ['simpleAnswers', 'moderateAnswers', 'complexAnswers']
const specialRules = ['minimumRequirements', 'broadTasks', 'veryLargeTasks']
const example = [
  ['scope', 'multipleLayers'],
  ['complexity', 'statefulOrMultiStepLogic'],
  ['uncertainty', 'someInvestigationOrSpikeNeeded'],
  ['dataImpact', 'schemaChangeOnly'],
  ['coordinationDependencies', 'needsReviewFromAnotherDeveloper'],
  ['testing', 'integrationTests'],
]

export function WizardHelpModal({ onClose }: { onClose: () => void }) {
  const { t } = useLanguage()

  return (
    <Dialog title={t('wizardHelp.title')} wide onClose={onClose}>
      <div className="help-content">
        <p>{t('wizardHelp.howItWorksDescription')}</p>

        <section>
          <h3>{t('wizardHelp.scoringSystem')}</h3>
          <p>{t('wizardHelp.scoringSystemDescription')}</p>
          <ul>
            {scoring.map((rule) => (
              <li key={rule}><strong>{t('wizardHelp.' + rule)}</strong> {t('wizardHelp.' + rule + 'Example')}</li>
            ))}
          </ul>
        </section>

        <section>
          <h3>{t('wizardHelp.storyPointMapping')}</h3>
          <table>
            <thead>
              <tr><th scope="col">{t('wizard.totalScore')}</th><th scope="col">{t('wizard.suggestedStoryPoints')}</th></tr>
            </thead>
            <tbody>
              {SCORE_BUCKETS.map(({ min, max, points }) => (
                <tr key={min}>
                  <td className="mono"><bdi>{max === Infinity ? min + '+' : min + '–' + max}</bdi></td>
                  <td>{max === Infinity ? t('wizardHelp.tooLargeNeedsBreakdown') : points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h3>{t('wizardHelp.specialRules')}</h3>
          <dl>
            {specialRules.map((rule) => (
              <div key={rule}><dt>{t('wizardHelp.' + rule)}</dt><dd>{t('wizardHelp.' + rule + 'Description')}</dd></div>
            ))}
          </dl>
        </section>

        <section>
          <h3>{t('wizardHelp.confidenceLevel')}</h3>
          <p>{t('wizardHelp.confidenceLevelDescription')}</p>
          <ul>
            <li>{t('wizardHelp.higherConfidence')} {t('wizardHelp.higherConfidenceDescription')}</li>
            {['Edge', 'ManyAreas', 'Uncertainty'].map((reason) => (
              <li key={reason}>{t('wizardHelp.lowerConfidence')} {t('wizardHelp.lowerConfidence' + reason)}</li>
            ))}
          </ul>
        </section>

        <section className="help-example">
          <h3>{t('wizardHelp.example')}</h3>
          <p>{t('wizardHelp.exampleTask')}</p>
          <dl>
            {example.map(([section, option]) => (
              <div key={section}><dt>{t('wizardData.' + section)}</dt><dd>{t('wizardData.' + option)}</dd></div>
            ))}
          </dl>
          <p>{t('wizard.totalScore')} <bdi>14</bdi> · {t('wizard.suggestedStoryPoints')} <bdi>5</bdi></p>
        </section>
      </div>
    </Dialog>
  )
}
