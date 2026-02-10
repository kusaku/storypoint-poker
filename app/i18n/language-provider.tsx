'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import enTranslations from './translations/en.json'
import ruTranslations from './translations/ru.json'
import deTranslations from './translations/de.json'
import trTranslations from './translations/tr.json'
import ukTranslations from './translations/uk.json'
import urTranslations from './translations/ur.json'
import esTranslations from './translations/es.json'
import frTranslations from './translations/fr.json'
import ptTranslations from './translations/pt.json'
import zhCNTranslations from './translations/zh-CN.json'
import jaTranslations from './translations/ja.json'
import itTranslations from './translations/it.json'
import plTranslations from './translations/pl.json'
import nlTranslations from './translations/nl.json'
import koTranslations from './translations/ko.json'
import arTranslations from './translations/ar.json'
import hiTranslations from './translations/hi.json'
import idTranslations from './translations/id.json'
import viTranslations from './translations/vi.json'
import zhTWTranslations from './translations/zh-TW.json'

export type Language = 'en' | 'ru' | 'de' | 'tr' | 'uk' | 'ur' | 'es' | 'fr' | 'pt' | 'zh-CN' | 'ja' | 'it' | 'pl' | 'nl' | 'ko' | 'ar' | 'hi' | 'id' | 'vi' | 'zh-TW'

// RTL languages
const RTL_LANGUAGES: Language[] = ['ar', 'ur']

export function isRTL(language: Language): boolean {
  return RTL_LANGUAGES.includes(language)
}

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, params?: Record<string, string | number>) => string
  isRTL: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations: Record<Language, typeof enTranslations> = {
  en: enTranslations,
  ru: ruTranslations,
  de: deTranslations,
  tr: trTranslations,
  uk: ukTranslations,
  ur: urTranslations,
  es: esTranslations,
  fr: frTranslations,
  pt: ptTranslations,
  'zh-CN': zhCNTranslations,
  ja: jaTranslations,
  it: itTranslations,
  pl: plTranslations,
  nl: nlTranslations,
  ko: koTranslations,
  ar: arTranslations,
  hi: hiTranslations,
  id: idTranslations,
  vi: viTranslations,
  'zh-TW': zhTWTranslations,
}

function getBrowserLanguage(): Language {
  if (typeof window === 'undefined') return 'en'
  
  const browserLang = navigator.language || (navigator as any).userLanguage || 'en'
  const langCode = browserLang.split('-')[0].toLowerCase()
  const fullLang = browserLang.toLowerCase()
  
  const languageMap: Record<string, Language> = {
    'ru': 'ru',
    'de': 'de',
    'tr': 'tr',
    'uk': 'uk',
    'ur': 'ur',
    'es': 'es',
    'fr': 'fr',
    'pt': 'pt',
    'zh': fullLang.includes('tw') || fullLang.includes('hk') ? 'zh-TW' : 'zh-CN',
    'ja': 'ja',
    'it': 'it',
    'pl': 'pl',
    'nl': 'nl',
    'ko': 'ko',
    'ar': 'ar',
    'hi': 'hi',
    'id': 'id',
    'vi': 'vi',
  }
  
  return languageMap[langCode] || 'en'
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedLanguage = localStorage.getItem('language') as Language | null
    const validLanguages: Language[] = ['en', 'ru', 'de', 'tr', 'uk', 'ur', 'es', 'fr', 'pt', 'zh-CN', 'ja', 'it', 'pl', 'nl', 'ko', 'ar', 'hi', 'id', 'vi', 'zh-TW']
    if (savedLanguage && validLanguages.includes(savedLanguage)) {
      setLanguageState(savedLanguage)
    } else {
      const browserLang = getBrowserLanguage()
      setLanguageState(browserLang)
      localStorage.setItem('language', browserLang)
    }
  }, [])

  // Update document direction when language changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const rtl = isRTL(language)
      document.documentElement.setAttribute('dir', rtl ? 'rtl' : 'ltr')
      document.documentElement.setAttribute('lang', language)
    }
  }, [language])

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage)
    localStorage.setItem('language', newLanguage)
  }

  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.')
    let value: any = translations[language]
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        // Fallback to English if key not found
        value = translations.en
        for (const k2 of keys) {
          if (value && typeof value === 'object' && k2 in value) {
            value = value[k2]
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
  }

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL: isRTL(language) }}>
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
