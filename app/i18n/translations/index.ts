import enTranslations from '@/app/i18n/translations/en.json'
import ruTranslations from '@/app/i18n/translations/ru.json'
import deTranslations from '@/app/i18n/translations/de.json'
import trTranslations from '@/app/i18n/translations/tr.json'
import ukTranslations from '@/app/i18n/translations/uk.json'
import urTranslations from '@/app/i18n/translations/ur.json'
import esTranslations from '@/app/i18n/translations/es.json'
import frTranslations from '@/app/i18n/translations/fr.json'
import ptTranslations from '@/app/i18n/translations/pt.json'
import zhCNTranslations from '@/app/i18n/translations/zh-CN.json'
import jaTranslations from '@/app/i18n/translations/ja.json'
import itTranslations from '@/app/i18n/translations/it.json'
import plTranslations from '@/app/i18n/translations/pl.json'
import nlTranslations from '@/app/i18n/translations/nl.json'
import koTranslations from '@/app/i18n/translations/ko.json'
import arTranslations from '@/app/i18n/translations/ar.json'
import hiTranslations from '@/app/i18n/translations/hi.json'
import idTranslations from '@/app/i18n/translations/id.json'
import viTranslations from '@/app/i18n/translations/vi.json'
import zhTWTranslations from '@/app/i18n/translations/zh-TW.json'

export const translations = {
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

export type Language = keyof typeof translations

const languages = Object.values(translations)
  .map(({ _meta }) => _meta)
  .sort((a, b) => a.popularity - b.popularity)

export function getLanguages() {
  return languages
}

export function isLanguageCode(code: string): code is Language {
  return Object.hasOwn(translations, code)
}

export function isRTL(language: Language): boolean {
  return translations[language]._meta.rtl
}

export function detectLanguage(browserLanguage: string): Language {
  const parts = browserLanguage.toLowerCase().split('-')
  const base = parts[0]
  if (base === 'zh') {
    return parts.some((part) => ['hant', 'tw', 'hk', 'mo'].includes(part)) ? 'zh-TW' : 'zh-CN'
  }
  return isLanguageCode(base) ? base : 'en'
}
