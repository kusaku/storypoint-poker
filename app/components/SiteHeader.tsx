'use client'

import Image from 'next/image'
import Link from 'next/link'
import { SettingsButton } from '@/app/components/SettingsButton'
import { useLanguage } from '@/app/i18n/language-provider'

export function SiteHeader() {
  const { t } = useLanguage()

  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <Link href="/" className="brand">
          <Image src="/icon.svg" className="brand-icon" alt="" width={39} height={39} loading="eager" />
          <span>{t('home.title')}</span>
        </Link>
        <SettingsButton />
      </div>
    </header>
  )
}
