'use client'

import { useState } from 'react'
import { Icon } from '@/app/components/Icon'
import { SettingsModal } from '@/app/components/SettingsModal'
import { useLanguage } from '@/app/i18n/language-provider'

export function SettingsButton() {
  const [open, setOpen] = useState(false)
  const { t } = useLanguage()

  return (
    <>
      <button type="button" className="button button-quiet settings-button" onClick={() => setOpen(true)} aria-haspopup="dialog">
        <Icon name="settings" size={19} />
        <span>{t('common.settings')}</span>
      </button>
      {open && <SettingsModal onClose={() => setOpen(false)} />}
    </>
  )
}
