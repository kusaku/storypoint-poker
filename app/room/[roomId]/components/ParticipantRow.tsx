'use client'

import { useState } from 'react'
import { WizardAnswers, TECHNICAL_IMPLEMENTATION_DROPDOWNS, CONTENT_COMMUNICATION_DROPDOWNS } from '../../../wizard-data'
import { displayVote } from '../../../fibonacci'

export interface User {
  id: string
  name: string
  isHost: boolean
  vote: number | null
  hasVoted: boolean
  comment: string | null
  wizardAnswers: WizardAnswers | null
}

interface ParticipantRowProps {
  user: User
  revealed: boolean
}

export function ParticipantRow({ user, revealed }: ParticipantRowProps) {
  const [showWizardPopup, setShowWizardPopup] = useState(false)
  
  const hasWizardAnswers = user.wizardAnswers?.taskType != null
  const canShowPopup = revealed && hasWizardAnswers
  const hasAnswers = user.wizardAnswers && Object.keys(user.wizardAnswers.answers).length > 0
  
  const dropdowns = showWizardPopup && user.wizardAnswers?.taskType
    ? (user.wizardAnswers.taskType === 'technical-implementation' ? TECHNICAL_IMPLEMENTATION_DROPDOWNS : CONTENT_COMMUNICATION_DROPDOWNS)
    : null
  
  return (
    <div className="relative flex items-start">
      <div className="p-2 rounded bg-gray-50 dark:bg-gray-700 flex justify-between items-center flex-1 min-w-0">
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {user.name}
          {user.isHost && <span className="ml-2 text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-1.5 py-0.5 rounded font-semibold">H</span>}
        </span>
        <span 
          className={`text-sm flex-shrink-0 ml-2 ${hasWizardAnswers ? 'cursor-help' : ''}`}
          onMouseEnter={() => canShowPopup && setShowWizardPopup(true)}
          onMouseLeave={() => setShowWizardPopup(false)}
        >
          {revealed ? (
            <span className="font-bold text-indigo-600 dark:text-indigo-400">
              {displayVote(user.vote)}
            </span>
          ) : (
            <span className={user.hasVoted ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}>
              {user.hasVoted ? '✓' : '○'}
            </span>
          )}
        </span>
      </div>
      {user.comment && revealed && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-10" style={{ maxWidth: '320px', width: 'max-content' }}>
          <div className="bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 rounded-lg px-3 py-2 text-sm shadow-lg relative">
            <div style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>{user.comment}</div>
            <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-800 dark:border-r-gray-200"></div>
          </div>
        </div>
      )}
      {showWizardPopup && canShowPopup && user.wizardAnswers && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-20" style={{ maxWidth: '400px', width: 'max-content' }}>
          <div className="bg-indigo-50 dark:bg-indigo-900/90 text-indigo-900 dark:text-indigo-100 rounded-lg px-4 py-3 text-sm shadow-lg relative border border-indigo-200 dark:border-indigo-800">
            <div className="font-semibold mb-2 text-indigo-800 dark:text-indigo-200">Estimation Details</div>
            <div className="space-y-1 text-xs">
              <div><span className="font-medium">Task Type:</span> {user.wizardAnswers.taskType === 'technical-implementation' ? 'Technical Implementation' : 'Content & Communication'}</div>
              {hasAnswers && dropdowns ? (
                Object.entries(user.wizardAnswers.answers).map(([section, answer]) => {
                  const sectionLabel = dropdowns[section as keyof typeof dropdowns]?.label || section
                  return (
                    <div key={section} className="border-t border-indigo-200 dark:border-indigo-700 pt-1 mt-1">
                      <div className="font-medium text-indigo-700 dark:text-indigo-300">{sectionLabel}:</div>
                      <div className="text-indigo-600 dark:text-indigo-400">{answer.option}</div>
                    </div>
                  )
                })
              ) : (
                <div className="mt-2 text-indigo-600 dark:text-indigo-400 italic">No selections made yet</div>
              )}
            </div>
            <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-indigo-50 dark:border-r-indigo-900/90"></div>
          </div>
        </div>
      )}
    </div>
  )
}
