// This file dynamically exports all translations and their metadata
// To add a new language:
// 1. Create a new JSON file (e.g., 'xx.json') in this directory
// 2. Add _meta object with: code, name, nativeName, flag, rtl, popularity
// 3. Add import statement below and add it to allTranslations object

import enTranslations from './en.json'
import ruTranslations from './ru.json'
import deTranslations from './de.json'
import trTranslations from './tr.json'
import ukTranslations from './uk.json'
import urTranslations from './ur.json'
import esTranslations from './es.json'
import frTranslations from './fr.json'
import ptTranslations from './pt.json'
import zhCNTranslations from './zh-CN.json'
import jaTranslations from './ja.json'
import itTranslations from './it.json'
import plTranslations from './pl.json'
import nlTranslations from './nl.json'
import koTranslations from './ko.json'
import arTranslations from './ar.json'
import hiTranslations from './hi.json'
import idTranslations from './id.json'
import viTranslations from './vi.json'
import zhTWTranslations from './zh-TW.json'

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
  [key: string]: any
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

// Extract metadata from all translations
export const languagesMeta: LanguageMeta[] = Object.values(allTranslations)
  .map(t => t._meta)
  .filter(meta => meta !== undefined)
  .sort((a, b) => a.popularity - b.popularity)

// Get all language codes
export const languageCodes = languagesMeta.map(meta => meta.code) as string[]

// Type for language codes
export type Language = typeof languageCodes[number]

// Get translations without metadata
export const translations: Record<string, Omit<TranslationFile, '_meta'>> = Object.entries(allTranslations).reduce(
  (acc, [code, translation]) => {
    const { _meta, ...rest } = translation
    acc[code] = rest
    return acc
  },
  {} as Record<string, Omit<TranslationFile, '_meta'>>
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
