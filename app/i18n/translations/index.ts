// This file dynamically exports all translations and their metadata
// To add a new language:
// 1. Create a new JSON file (e.g., 'xx.json') in this directory
// 2. Add _meta object with: code, name, nativeName, flag, rtl, popularity
// 3. Add import statement below and add it to allTranslations object

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

export interface LanguageMeta {
  code: string
  name: string
  nativeName: string
  flag: string
  rtl: boolean
  popularity: number
}

export interface TranslationFile {
  _meta: LanguageMeta
  [key: string]: unknown
}

// All translations with their metadata
const allTranslations: Record<string, TranslationFile> = {
  en: enTranslations as TranslationFile,
  ru: ruTranslations as TranslationFile,
  de: deTranslations as TranslationFile,
  tr: trTranslations as TranslationFile,
  uk: ukTranslations as TranslationFile,
  ur: urTranslations as TranslationFile,
  es: esTranslations as TranslationFile,
  fr: frTranslations as TranslationFile,
  pt: ptTranslations as TranslationFile,
  'zh-CN': zhCNTranslations as TranslationFile,
  ja: jaTranslations as TranslationFile,
  it: itTranslations as TranslationFile,
  pl: plTranslations as TranslationFile,
  nl: nlTranslations as TranslationFile,
  ko: koTranslations as TranslationFile,
  ar: arTranslations as TranslationFile,
  hi: hiTranslations as TranslationFile,
  id: idTranslations as TranslationFile,
  vi: viTranslations as TranslationFile,
  'zh-TW': zhTWTranslations as TranslationFile,
}

// Type for language codes
export type Language = keyof typeof allTranslations

// Extract metadata from all translations
export const languagesMeta: LanguageMeta[] = Object.values(allTranslations)
  .map(t => t._meta)
  .filter((meta): meta is LanguageMeta => meta !== undefined)
  .sort((a, b) => a.popularity - b.popularity)

// Get all language codes
export const languageCodes = Object.keys(allTranslations) as Language[]

export function isLanguageCode(code: string): code is Language {
  return languageCodes.includes(code as Language)
}

// Get translations without metadata
export const translations: Record<Language, Omit<TranslationFile, '_meta'>> = Object.entries(allTranslations).reduce(
  (acc, [code, translation]) => {
    const { _meta, ...rest } = translation
    acc[code as Language] = rest
    return acc
  },
  {} as Record<Language, Omit<TranslationFile, '_meta'>>
)

// Create Map for O(1) metadata lookup
const metaMap = new Map<string, LanguageMeta>()
languagesMeta.forEach(meta => metaMap.set(meta.code, meta))

// Get metadata for a language (O(1) lookup)
export function getLanguageMeta(code: string): LanguageMeta | undefined {
  return metaMap.get(code)
}

// Create Map for O(1) RTL lookup
const rtlMap = new Map<string, boolean>()
languagesMeta.forEach(meta => rtlMap.set(meta.code, meta.rtl))

// Check if language is RTL (O(1) lookup)
export function isRTL(code: string): boolean {
  return rtlMap.get(code) ?? false
}

// Get all available languages sorted by popularity
export function getLanguages(): LanguageMeta[] {
  return languagesMeta
}

// Find best matching language variant for a browser language code
// e.g., 'zh-TW' or 'zh-HK' -> 'zh-TW', 'zh-CN' -> 'zh-CN', 'zh' -> first available zh variant
export function findLanguageVariant(browserLang: string): Language | undefined {
  const fullLang = browserLang.toLowerCase()
  const baseCode = fullLang.split('-')[0]
  
  // Find all language variants for this base code (e.g., all 'zh-*' languages)
  const variants = languageCodes.filter(code => code.toLowerCase().startsWith(baseCode + '-'))
  
  if (variants.length === 0) {
    return undefined
  }
  
  // If we have exact match (e.g., 'zh-TW' matches 'zh-TW')
  const exactMatch = variants.find(code => fullLang === code.toLowerCase())
  if (exactMatch) {
    return exactMatch as Language
  }
  
  // Try to match by region (e.g., 'zh-HK' -> 'zh-TW', 'zh-CN' -> 'zh-CN')
  for (const variant of variants) {
    const variantParts = variant.toLowerCase().split('-')
    if (variantParts.length > 1 && fullLang.includes(variantParts[1])) {
      return variant as Language
    }
  }
  
  // Return first variant as default
  return variants[0] as Language
}
