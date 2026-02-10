'use client'

import { useLanguage } from '../../i18n/language-provider'

interface WizardHelpModalProps {
  onClose: () => void
}

export function WizardHelpModal({ onClose }: WizardHelpModalProps) {
  const { t } = useLanguage()
  return (
    <div 
      className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" 
      onClick={onClose}
      style={{ margin: 0, padding: 0 }}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 m-4" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{t('wizardHelp.title')}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="text-gray-700 dark:text-gray-300">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">{t('wizardHelp.howItWorks')}</h3>
            <p className="text-sm">
              {t('wizardHelp.howItWorksDescription')}
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">{t('wizardHelp.scoringSystem')}</h3>
            <p className="text-sm mb-2">{t('wizardHelp.scoringSystemDescription')}</p>
            <ul className="list-disc list-inside text-sm space-y-1 ml-2">
              <li><strong>{t('wizardHelp.simpleAnswers')}</strong> {t('wizardHelp.simpleAnswersExample')}</li>
              <li><strong>{t('wizardHelp.moderateAnswers')}</strong> {t('wizardHelp.moderateAnswersExample')}</li>
              <li><strong>{t('wizardHelp.complexAnswers')}</strong> {t('wizardHelp.complexAnswersExample')}</li>
            </ul>
            <p className="text-sm mt-2">
              {t('wizardHelp.allAnswersAdded')}
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">{t('wizardHelp.storyPointMapping')}</h3>
            <p className="text-sm mb-2">{t('wizardHelp.storyPointMappingDescription')}</p>
            <div className="bg-gray-50 dark:bg-gray-900 rounded p-3 text-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-300 dark:border-gray-600">
                    <th className="text-left py-1">{t('wizardHelp.totalScore')}</th>
                    <th className="text-left py-1">{t('wizardHelp.suggestedStoryPoints')}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="py-1">0-2</td><td className="py-1">1</td></tr>
                  <tr><td className="py-1">3-5</td><td className="py-1">2</td></tr>
                  <tr><td className="py-1">6-9</td><td className="py-1">3</td></tr>
                  <tr><td className="py-1">10-14</td><td className="py-1">5</td></tr>
                  <tr><td className="py-1">15-20</td><td className="py-1">8</td></tr>
                  <tr><td className="py-1">21 or more</td><td className="py-1">{t('wizardHelp.tooLargeNeedsBreakdown')}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">{t('wizardHelp.specialRules')}</h3>
            
            <div className="mb-4">
              <p className="text-sm font-medium mb-1">{t('wizardHelp.minimumRequirements')}</p>
              <p className="text-sm">
                {t('wizardHelp.minimumRequirementsDescription')}
              </p>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium mb-1">{t('wizardHelp.broadTasks')}</p>
              <p className="text-sm">
                {t('wizardHelp.broadTasksDescription')}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium mb-1">{t('wizardHelp.veryLargeTasks')}</p>
              <p className="text-sm mb-2">
                {t('wizardHelp.veryLargeTasksDescription')}
              </p>
              <p className="text-sm text-orange-600 dark:text-orange-400">
                <strong>Note:</strong> {t('wizardHelp.veryLargeTasksNote')}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">{t('wizardHelp.confidenceLevel')}</h3>
            <p className="text-sm mb-2">
              {t('wizardHelp.confidenceLevelDescription')}
            </p>
            <ul className="list-disc list-inside text-sm space-y-1 ml-2">
              <li><strong>{t('wizardHelp.higherConfidence')}</strong> {t('wizardHelp.higherConfidenceDescription')}</li>
              <li><strong>{t('wizardHelp.lowerConfidence')}</strong> {t('wizardHelp.lowerConfidenceEdge')}</li>
              <li><strong>{t('wizardHelp.lowerConfidence')}</strong> {t('wizardHelp.lowerConfidenceManyAreas')}</li>
              <li><strong>{t('wizardHelp.lowerConfidence')}</strong> {t('wizardHelp.lowerConfidenceUncertainty')}</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">{t('wizardHelp.example')}</h3>
            <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded p-4 text-sm border border-indigo-200 dark:border-indigo-800">
              <p className="font-semibold mb-2">{t('wizardHelp.exampleTask')}</p>
              <p className="mb-2">{t('wizardHelp.exampleSelectedAnswers')}</p>
              <ul className="space-y-1 mb-3">
                <li>Scope: Multiple layers (API + service + DB)</li>
                <li>Complexity: Stateful or multi-step logic</li>
                <li>Uncertainty: Some investigation needed</li>
                <li>Data Impact: Schema change only</li>
                <li>Dependencies: Needs review</li>
                <li>Testing: Integration tests</li>
              </ul>
              <div className="pt-3 border-t border-indigo-200 dark:border-indigo-700">
                <p className="mb-1"><strong>{t('wizardHelp.exampleResult')}</strong></p>
                <p>{t('wizardHelp.exampleTotalScore', { score: 14 })}</p>
                <p>{t('wizardHelp.exampleSuggestedSp', { sp: 5 })}</p>
                <p>{t('wizardHelp.exampleConfidence', { confidence: 'Medium', sp: 5 })}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  )
}
