'use client'

import { useState } from 'react'
import { Icon } from '@/app/components/Icon'
import { SelectControl } from '@/app/components/SelectControl'
import type { CardValue } from '@/app/fibonacci'
import { useLanguage } from '@/app/i18n/language-provider'
import { calculateStoryPoints, getDropdownsByTaskType, taskTypeLabel, type TaskType, type WizardAnswers } from '@/app/wizard-data'
import { WizardHelpModal } from './components/WizardHelpModal'
import { WizardResultPreview } from './components/WizardResultPreview'

const taskTypes = ['technical-implementation', 'content-communication'] as const

interface WizardProps {
  initialAnswers: WizardAnswers | null
  onAnswersChange: (answers: WizardAnswers) => void
  onBack: () => void
  onVote: (vote: CardValue) => void
  disabled: boolean
}

export function Wizard({ initialAnswers, onAnswersChange, onBack, onVote, disabled }: WizardProps) {
  const [draft, setDraft] = useState(initialAnswers)
  const [showHelp, setShowHelp] = useState(false)
  const { t } = useLanguage()
  const sections = draft ? Object.entries(getDropdownsByTaskType(draft.taskType)) : []
  const answered = sections.filter(([section]) => draft?.answers[section]).length
  const result = draft && answered === sections.length ? calculateStoryPoints(draft) : null

  function update(next: WizardAnswers) {
    setDraft(next)
    onAnswersChange(next)
  }

  function selectTaskType(taskType: TaskType) {
    if (draft?.taskType !== taskType) update({ taskType, answers: {} })
  }

  return (
    <section className="panel wizard-panel" aria-labelledby="wizard-heading">
      <div className="wizard-navigation">
        <button className="button button-outline" type="button" onClick={onBack} autoFocus>
          <span className="directional-icon"><Icon name="back" size={17} /></span>
          {t('common.back')}
        </button>
        <button className="button button-outline" type="button" aria-haspopup="dialog" onClick={() => setShowHelp(true)}>
          <Icon name="help" size={17} />
          {t('wizardHelp.howItWorks')}
        </button>
      </div>
      <h2 id="wizard-heading">{t('wizard.storyPointHelper')}</h2>
      <fieldset className="field wizard-types" disabled={disabled}>
        <legend>{t('wizard.taskType')}</legend>
        <div className="segmented">
          {taskTypes.map((type) => (
            <button key={type} type="button" aria-pressed={draft?.taskType === type} onClick={() => selectTaskType(type)}>
              {t(taskTypeLabel(type))}
            </button>
          ))}
        </div>
      </fieldset>
      {draft && (
        <div className="wizard-questions">
          {sections.map(([section, { label, options }]) => {
            const selected = draft.answers[section]?.option ?? ''
            return (
              <label className="field" key={section}>
                {t(label)}
                <SelectControl
                  disabled={disabled}
                  value={selected}
                  displayValue={t(selected || 'common.select')}
                  onChange={(event) => {
                    const option = options.find(({ label }) => label === event.target.value)
                    const answers = { ...draft.answers }
                    if (option) {
                      const { label, ...scores } = option
                      answers[section] = { section, option: label, ...scores }
                    } else {
                      delete answers[section]
                    }
                    update({ ...draft, answers })
                  }}
                >
                  <option value="">{t('common.select')}</option>
                  {options.map(({ label }) => <option key={label} value={label}>{t(label)}</option>)}
                </SelectControl>
              </label>
            )
          })}
        </div>
      )}
      {result ? (
        <WizardResultPreview result={result} disabled={disabled} onVote={onVote} />
      ) : (
        <div className="wizard-pending" role="status">
          <Icon name="sparkle" size={19} />
          {t(draft ? 'wizard.answerAllQuestions' : 'wizard.selectTaskTypeToBegin', {
            answered,
            total: sections.length,
          })}
        </div>
      )}
      {showHelp && <WizardHelpModal onClose={() => setShowHelp(false)} />}
    </section>
  )
}
