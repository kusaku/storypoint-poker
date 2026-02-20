'use client'

import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react'
import { translations, languageCodes, getLanguageMeta, isRTL as checkRTL, findLanguageVariant, type Language } from '@/app/i18n/translations'

export type { Language }
export { checkRTL as isRTL, getLanguageMeta }

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, params?: Record<string, string | number>) => string
  isRTL: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Build language map once (cached)
const languageMapCache: Record<string, Language> = (() => {
  const map: Record<string, Language> = {}
  for (const code of languageCodes) {
    const baseCode = code.split('-')[0].toLowerCase()
    if (!map[baseCode]) {
      map[baseCode] = code as Language
    }
  }
  return map
})()

function getBrowserLanguage(): Language {
  if (typeof window === 'undefined') return 'en'
  
  const browserLang = navigator.language || navigator.languages?.[0] || 'en'
  const langCode = browserLang.split('-')[0].toLowerCase()
  
  // Check for language variants (e.g., zh-TW, zh-CN, pt-BR, etc.)
  const variant = findLanguageVariant(browserLang)
  if (variant) {
    return variant
  }
  
  // Fallback to base language code
  return languageMapCache[langCode] || 'en'
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedLanguage = localStorage.getItem('language') as Language | null
    if (savedLanguage && languageCodes.includes(savedLanguage)) {
      setLanguageState(savedLanguage)
    } else {
      const browserLang = getBrowserLanguage()
      setLanguageState(browserLang)
      localStorage.setItem('language', browserLang)
    }
  }, [])

  // Compute RTL once per language change
  const isRTL = useMemo(() => checkRTL(language), [language])

  // Update document direction when language changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr')
      document.documentElement.setAttribute('lang', language)
    }
  }, [language, isRTL])

  const setLanguage = useCallback((newLanguage: Language) => {
    setLanguageState(newLanguage)
    localStorage.setItem('language', newLanguage)
  }, [])

  // Memoize translation function
  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.')
    let value: unknown = translations[language]
    
    // Try to get value from current language
    for (const k of keys) {
      if (value && typeof value === 'object' && !Array.isArray(value) && k in value) {
        value = (value as Record<string, unknown>)[k]
      } else {
        // Fallback to English
        value = translations.en
        for (const k2 of keys) {
          if (value && typeof value === 'object' && !Array.isArray(value) && k2 in value) {
            value = (value as Record<string, unknown>)[k2]
          } else {
            return key
          }
        }
        break
      }
    }

    if (typeof value !== 'string') {
      return key
    }

    // Replace parameters
    if (params) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() || match
      })
    }

    return value
  }, [language])

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    return {
      language: 'en' as Language,
      setLanguage: () => {},
      t: (key: string) => key,
      isRTL: false,
    }
  }
  return context
}
