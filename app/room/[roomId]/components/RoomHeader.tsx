'use client'

import Link from 'next/link'
import Image from 'next/image'

interface RoomHeaderProps {
  roomId: string
  userName: string
  isConnected: boolean
  copied: boolean
  onCopyInviteLink: () => void
}

export function RoomHeader({ roomId, userName, isConnected, copied, onCopyInviteLink }: RoomHeaderProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/logo.webp"
            alt="Story Point Poker"
            width={90}
            height={90}
            className="hover:opacity-80 transition-opacity"
            priority
          />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">Room: {roomId}</h1>
          <p className="text-gray-600 dark:text-gray-300">Welcome, {userName}!</p>
          <div className="flex items-center gap-2 mt-1">
            {isConnected ? (
              <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">🟢 Connected</span>
            ) : (
              <span className="text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded">🔴 Disconnected</span>
            )}
            <button
              onClick={onCopyInviteLink}
              className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded hover:bg-green-200 dark:hover:bg-green-800 transition-colors flex items-center gap-1"
            >
              {copied ? (
                <>
                  <span>✓</span> Copied!
                </>
              ) : (
                <>
                  <span>🔗</span> Invitation Link
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
