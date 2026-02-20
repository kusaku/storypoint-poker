'use client'

import { useState, useMemo } from 'react'
import {
  TaskType,
  WizardAnswers,
  WizardAnswer,
  WizardDropdownOption,
  WizardDropdowns,
  calculateStoryPoints,
  getDropdownsByTaskType,
  getWizardSectionData,
} from '@/app/wizard-data'
import { roundToNearestCard } from '@/app/fibonacci'
import { WizardHelpModal } from '@/app/wizard/components/WizardHelpModal'
import { WizardResultPreview } from '@/app/wizard/components/WizardResultPreview'
import { useLanguage } from '@/app/i18n/language-provider'
import { SECONDARY_BUTTON_CLASS } from '@/app/constants'

interface WizardProps {
  onCalculate: (suggestedSp: number) => void
  onBack: () => void
  initialAnswers?: WizardAnswers
  onAnswersChange?: (answers: WizardAnswers) => void
}

export function Wizard({ onCalculate, onBack, initialAnswers, onAnswersChange }: WizardProps) {
  const [taskType, setTaskType] = useState<TaskType | null>(initialAnswers?.taskType || null)
  const [answers, setAnswers] = useState<Record<string, WizardAnswer>>(
    initialAnswers?.answers || {}
  )
  const [showHelpModal, setShowHelpModal] = useState(false)
  const { t } = useLanguage()

  const dropdowns = taskType ? getDropdownsByTaskType(taskType) : null
  const sections = dropdowns ? Object.keys(dropdowns) : []

  const getOptionByIndex = (
    section: string,
    index: number,
    sourceDropdowns: WizardDropdowns
  ): WizardDropdownOption | undefined => {
    return getWizardSectionData(sourceDropdowns, section)?.options[index]
  }

  const handleAnswerChange = (section: string, optionIndex: number | string) => {
    if (!taskType || !dropdowns) return

    if (optionIndex === '' || (typeof optionIndex === 'number' && optionIndex < 0)) {
      const newAnswers = { ...answers }
      delete newAnswers[section]
      setAnswers(newAnswers)
      onAnswersChange?.({ taskType, answers: newAnswers })
      return
    }

    const index = typeof optionIndex === 'string' ? parseInt(optionIndex) : optionIndex
    const option = getOptionByIndex(section, index, dropdowns)

    if (!option) return

    const newAnswer: WizardAnswer = {
      section,
      option: option.label,
      value: option.value,
      minSp: option.minSp,
    }

    const newAnswers = {
      ...answers,
      [section]: newAnswer,
    }

    setAnswers(newAnswers)
    onAnswersChange?.({ taskType, answers: newAnswers })
  }

  const handleCalculate = () => {
    if (!taskType) return
    const result = calculateStoryPoints({ taskType, answers })
    if (result.flags.includes('DECOMPOSE_REQUIRED')) {
      return
    }
    onCalculate(roundToNearestCard(result.suggestedSp))
    onBack()
  }

  const getCurrentValue = (section: string): number => {
    if (!dropdowns || !answers[section]?.option) return -1
    const options = getWizardSectionData(dropdowns, section)?.options ?? []
    return options.findIndex((opt) => opt.label === answers[section].option)
  }

  const answeredSections = useMemo(
    () => sections.filter(section => answers[section] !== undefined),
    [sections, answers]
  )
  const canCalculate = taskType !== null && answeredSections.length === sections.length
  const result = useMemo(() => {
    if (!canCalculate || !taskType) return null
    return calculateStoryPoints({ taskType, answers })
  }, [canCalculate, taskType, answers])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">{t('wizard.storyPointHelper')}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowHelpModal(true)}
            className={SECONDARY_BUTTON_CLASS}
          >
            {t('wizard.howItWorks')}
          </button>
          <button
            onClick={onBack}
            className={SECONDARY_BUTTON_CLASS}
          >
            {t('wizard.backToCards')}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('wizard.taskType')}
        </label>
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm border border-gray-200 dark:border-gray-700">
            {(['technical-implementation', 'content-communication'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setTaskType(type)
                  setAnswers({})
                  onAnswersChange?.({ taskType: type, answers: {} })
                }}
                className={`px-4 py-2 rounded text-sm font-medium transition-all ${
                  taskType === type
                    ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {type === 'technical-implementation' ? t('wizard.technicalImplementation') : t('wizard.contentCommunication')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {taskType && dropdowns && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sections.map((section) => {
            const sectionData = getWizardSectionData(dropdowns, section)
            const currentValue = getCurrentValue(section)
            if (!sectionData) return null

            return (
              <div key={section} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t(sectionData.label)}
                </label>
                <select
                  value={currentValue >= 0 ? currentValue : ''}
                  onChange={(e) => handleAnswerChange(section, e.target.value === '' ? '' : parseInt(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">{t('common.select')}</option>
                  {sectionData.options.map((option, index) => (
                    <option key={index} value={index}>
                      {t(option.label)}
                    </option>
                  ))}
                </select>
              </div>
            )
          })}
        </div>
      )}

      {!canCalculate || !result ? (
        <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-indigo-800 dark:text-indigo-300">
              {t('wizard.suggestedStoryPoints')}
            </h3>
          </div>
          <div className="mt-2 p-2 bg-blue-100 dark:bg-blue-900/30 rounded text-xs text-blue-800 dark:text-blue-300">
            {!taskType
              ? t('wizard.selectTaskTypeToBegin')
              : t('wizard.answerAllQuestions', { total: sections.length, answered: answeredSections.length })
            }
          </div>
        </div>
      ) : (
        <WizardResultPreview
          result={result}
          canCalculate={canCalculate}
          onCalculate={handleCalculate}
        />
      )}

      {showHelpModal && (
        <WizardHelpModal onClose={() => setShowHelpModal(false)} />
      )}
    </div>
  )
}
