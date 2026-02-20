'use client'

import { useState, useEffect } from 'react'
import { SettingsModal } from '@/app/components/SettingsModal'
import { useLanguage } from '@/app/i18n/language-provider'

export function SettingsButton() {
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-1 shadow-md border border-gray-200 dark:border-gray-700 w-[50px] h-[40px]">
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg p-2 shadow-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-[50px] h-[40px]"
        title={t('common.settings')}
      >
        <span className="text-xl">⚙️</span>
      </button>
      <SettingsModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
