'use client'

import { useState, useMemo } from 'react'
import {
  TaskType,
  WizardAnswers,
  WizardAnswer,
  TECHNICAL_IMPLEMENTATION_DROPDOWNS,
  CONTENT_COMMUNICATION_DROPDOWNS,
  calculateStoryPoints,
} from './wizard-data'
import { roundToNearestCard } from './fibonacci'
import { WizardHelpModal } from './wizard/components/WizardHelpModal'
import { WizardResultPreview } from './wizard/components/WizardResultPreview'

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

  const dropdowns = taskType === 'technical-implementation' ? TECHNICAL_IMPLEMENTATION_DROPDOWNS : taskType === 'content-communication' ? CONTENT_COMMUNICATION_DROPDOWNS : null
  const sections = dropdowns ? Object.keys(dropdowns) : []

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
    const option = dropdowns[section as keyof typeof dropdowns]?.options[index]
    
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
    return dropdowns[section as keyof typeof dropdowns].options.findIndex(
      opt => opt.label === answers[section].option
    )
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
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Story Point Helper</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowHelpModal(true)}
            className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
          >
ℹ️ How It Works
          </button>
          <button
            onClick={onBack}
            className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
          >
⬅️ Back to Cards
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Task Type
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
              {type === 'technical-implementation' ? 'Technical Implementation' : 'Content & Communication'}
            </button>
          ))}
          </div>
        </div>
      </div>

      {taskType && dropdowns && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {sections.map((section) => {
          const sectionData = dropdowns[section as keyof typeof dropdowns]
          const currentValue = getCurrentValue(section)
          
          return (
            <div key={section} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {sectionData.label}
              </label>
              <select
                value={currentValue >= 0 ? currentValue : ''}
                onChange={(e) => handleAnswerChange(section, e.target.value === '' ? '' : parseInt(e.target.value))}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Select...</option>
                {sectionData.options.map((option, index) => (
                  <option key={index} value={index}>
                    {option.label}
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
              Suggested Story Points
            </h3>
          </div>
          <div className="mt-2 p-2 bg-blue-100 dark:bg-blue-900/30 rounded text-xs text-blue-800 dark:text-blue-300">
            {!taskType 
              ? '⚠️ Select a task type to begin'
              : `⚠️ Answer all ${sections.length} questions to see your estimate (${answeredSections.length} of ${sections.length} answered)`
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
