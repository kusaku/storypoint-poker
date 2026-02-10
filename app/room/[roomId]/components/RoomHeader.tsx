'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '../../../i18n/language-provider'

interface RoomHeaderProps {
  roomId: string
  userName: string
  isConnected: boolean
  copied: boolean
  onCopyInviteLink: () => void
}

export function RoomHeader({ roomId, userName, isConnected, copied, onCopyInviteLink }: RoomHeaderProps) {
  const { t } = useLanguage()
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/logo.webp"
            alt={t('home.title')}
            width={90}
            height={90}
            className="hover:opacity-80 transition-opacity"
            priority
          />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{t('room.room')}: {roomId}</h1>
          <p className="text-gray-600 dark:text-gray-300">{t('room.welcome', { name: userName })}</p>
          <div className="flex items-center gap-2 mt-1">
            {isConnected ? (
              <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">🟢 {t('common.connected')}</span>
            ) : (
              <span className="text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded">🔴 {t('common.disconnected')}</span>
            )}
            <button
              onClick={onCopyInviteLink}
              className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded hover:bg-green-200 dark:hover:bg-green-800 transition-colors flex items-center gap-1"
            >
              {copied ? (
                <>
                  <span>✓</span> {t('common.copied')}
                </>
              ) : (
                <>
                  <span>🔗</span> {t('room.invitationLink')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
