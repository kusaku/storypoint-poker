'use client'

import { useTheme } from '../theme-provider'
import { useLanguage } from '../i18n/language-provider'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { theme, setTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()

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
                {/* Ordered by popularity */}
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center ${
                    language === 'en'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title="English"
                >
                  <span className="text-xl">🇬🇧</span>
                </button>
                <button
                  onClick={() => setLanguage('zh-CN')}
                  className={`px-2 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center ${
                    language === 'zh-CN'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title="简体中文"
                >
                  <span className="text-xl">🇨🇳</span>
                </button>
                <button
                  onClick={() => setLanguage('es')}
                  className={`px-2 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center ${
                    language === 'es'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title="Español"
                >
                  <span className="text-xl">🇪🇸</span>
                </button>
                <button
                  onClick={() => setLanguage('hi')}
                  className={`px-2 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center ${
                    language === 'hi'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title="हिन्दी"
                >
                  <span className="text-xl">🇮🇳</span>
                </button>
                <button
                  onClick={() => setLanguage('ar')}
                  className={`px-2 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center ${
                    language === 'ar'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title="العربية"
                >
                  <span className="text-xl">🇸🇦</span>
                </button>
                <button
                  onClick={() => setLanguage('pt')}
                  className={`px-2 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center ${
                    language === 'pt'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title="Português"
                >
                  <span className="text-xl">🇵🇹</span>
                </button>
                <button
                  onClick={() => setLanguage('ru')}
                  className={`px-2 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center ${
                    language === 'ru'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title="Русский"
                >
                  <span className="text-xl">🇷🇺</span>
                </button>
                <button
                  onClick={() => setLanguage('ja')}
                  className={`px-2 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center ${
                    language === 'ja'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title="日本語"
                >
                  <span className="text-xl">🇯🇵</span>
                </button>
                <button
                  onClick={() => setLanguage('de')}
                  className={`px-2 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center ${
                    language === 'de'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title="Deutsch"
                >
                  <span className="text-xl">🇩🇪</span>
                </button>
                <button
                  onClick={() => setLanguage('fr')}
                  className={`px-2 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center ${
                    language === 'fr'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title="Français"
                >
                  <span className="text-xl">🇫🇷</span>
                </button>
                <button
                  onClick={() => setLanguage('ko')}
                  className={`px-2 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center ${
                    language === 'ko'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title="한국어"
                >
                  <span className="text-xl">🇰🇷</span>
                </button>
                <button
                  onClick={() => setLanguage('it')}
                  className={`px-2 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center ${
                    language === 'it'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title="Italiano"
                >
                  <span className="text-xl">🇮🇹</span>
                </button>
                <button
                  onClick={() => setLanguage('tr')}
                  className={`px-2 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center ${
                    language === 'tr'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title="Türkçe"
                >
                  <span className="text-xl">🇹🇷</span>
                </button>
                <button
                  onClick={() => setLanguage('vi')}
                  className={`px-2 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center ${
                    language === 'vi'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title="Tiếng Việt"
                >
                  <span className="text-xl">🇻🇳</span>
                </button>
                <button
                  onClick={() => setLanguage('id')}
                  className={`px-2 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center ${
                    language === 'id'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title="Bahasa Indonesia"
                >
                  <span className="text-xl">🇮🇩</span>
                </button>
                <button
                  onClick={() => setLanguage('uk')}
                  className={`px-2 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center ${
                    language === 'uk'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title="Українська"
                >
                  <span className="text-xl">🇺🇦</span>
                </button>
                <button
                  onClick={() => setLanguage('nl')}
                  className={`px-2 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center ${
                    language === 'nl'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title="Nederlands"
                >
                  <span className="text-xl">🇳🇱</span>
                </button>
                <button
                  onClick={() => setLanguage('pl')}
                  className={`px-2 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center ${
                    language === 'pl'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title="Polski"
                >
                  <span className="text-xl">🇵🇱</span>
                </button>
                <button
                  onClick={() => setLanguage('ur')}
                  className={`px-2 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center ${
                    language === 'ur'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title="اردو"
                >
                  <span className="text-xl">🇵🇰</span>
                </button>
                <button
                  onClick={() => setLanguage('zh-TW')}
                  className={`px-2 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center ${
                    language === 'zh-TW'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title="繁體中文"
                >
                  <span className="text-xl">🇹🇼</span>
                </button>
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
