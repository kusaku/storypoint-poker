'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { detectLanguage, isLanguageCode, isRTL, translations, type Language } from '@/app/i18n/translations'
import { readStorage, writeStorage } from '@/app/storage'

interface LanguageContextValue {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function getTranslation(language: Language, keys: string[]): string | undefined {
  let value: unknown = translations[language]
  for (const key of keys) {
    if (!value || typeof value !== 'object' || !Object.hasOwn(value, key)) return undefined
    value = (value as Record<string, unknown>)[key]
  }
  return typeof value === 'string' ? value : undefined
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')

  useEffect(() => {
    const saved = readStorage('language')
    if (saved && isLanguageCode(saved)) {
      setLanguageState(saved)
      return
    }

    const detected = detectLanguage(navigator.language || 'en')
    setLanguageState(detected)
    writeStorage('language', detected)
  }, [])

  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = isRTL(language) ? 'rtl' : 'ltr'
  }, [language])

  function setLanguage(value: Language) {
    setLanguageState(value)
    writeStorage('language', value)
  }

  function t(key: string, params?: Record<string, number | string>) {
    const keys = key.split('.')
    const text = getTranslation(language, keys) ?? getTranslation('en', keys) ?? key
    return params ? text.replace(/\{(\w+)\}/g, (match, parameter) => String(params[parameter] ?? match)) : text
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('LanguageProvider is missing')
  return context
}
