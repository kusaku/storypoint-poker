'use client'

import { useTheme } from '../theme-provider'
import { useLanguage } from '../i18n/language-provider'
import { getLanguages } from '../i18n/translations'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { theme, setTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()
  const languages = getLanguages()

  if (!isOpen) return null

  return (
    <div 
      className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" 
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full m-4" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            {t('common.settings')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Theme Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
              {t('common.theme')}
            </h3>
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setTheme('light')}
                className={`flex-1 px-4 py-2 rounded text-sm font-medium transition-colors ${
                  theme === 'light'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                title={t('common.lightMode')}
              >
                ☀️ {t('common.light')}
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex-1 px-4 py-2 rounded text-sm font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                title={t('common.darkMode')}
              >
                🌙 {t('common.dark')}
              </button>
              <button
                onClick={() => setTheme('auto')}
                className={`flex-1 px-4 py-2 rounded text-sm font-medium transition-colors ${
                  theme === 'auto'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                title={t('common.autoMode')}
              >
                ⚙️ {t('common.auto')}
              </button>
            </div>
          </div>

          {/* Language Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
              {t('common.language')}
            </h3>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-1 max-h-64 overflow-y-auto">
              <div className="grid grid-cols-5 gap-1">
                {languages.map((langMeta) => (
                  <button
                    key={langMeta.code}
                    onClick={() => setLanguage(langMeta.code as any)}
                    className={`px-2 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center ${
                      language === langMeta.code
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    title={langMeta.nativeName}
                  >
                    <span className="text-xl">{langMeta.flag}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors font-medium"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  )
}
