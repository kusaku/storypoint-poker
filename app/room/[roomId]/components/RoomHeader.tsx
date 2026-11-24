'use client'

import { useEffect, useRef, useState } from 'react'
import { Dialog } from '@/app/components/Dialog'
import { Icon } from '@/app/components/Icon'
import { useLanguage } from '@/app/i18n/language-provider'
import { roomPath } from '@/app/room-url'
import type { Connection } from '../useRoom'

interface RoomHeaderProps {
  roomId: string
  connection: Connection
  round?: number
  onResetRound?: () => void
}

export function RoomHeader({ roomId, connection, round, onResetRound }: RoomHeaderProps) {
  const { t } = useLanguage()
  const [copied, setCopied] = useState(false)
  const [manualLink, setManualLink] = useState('')
  const [roundToReset, setRoundToReset] = useState<number | null>(null)
  const timeout = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => () => clearTimeout(timeout.current), [])

  async function copyInvite() {
    const url = new URL(roomPath(roomId), window.location.origin).href
    try {
      await navigator.clipboard.writeText(url)
      clearTimeout(timeout.current)
      setCopied(true)
      timeout.current = setTimeout(() => setCopied(false), 2200)
    } catch {
      setManualLink(url)
    }
  }

  const connectionLabel = connection === 'connecting' ? t('room.connecting') : t('common.' + connection)
  const roundLabel = round === undefined ? '' : t('room.roundLabel', { round })
  const inviteLabel = t(copied ? 'common.copied' : 'room.copyInvite')
  return (
    <div className="room-header">
      <div className="room-heading">
        <div className="room-code">
          <span>{t('common.room')}</span>
          <span className="room-code-link">
            <bdi className="mono">{roomId}</bdi>
            <button
              className="icon-button invite-button"
              type="button"
              title={inviteLabel}
              data-copied={copied}
              onClick={copyInvite}
            >
              <Icon name={copied ? 'check' : 'link'} size={16} />
              <span className="sr-only" aria-live="polite">{inviteLabel}</span>
            </button>
          </span>
        </div>
        <h1>{t('room.planningRoom')}</h1>
      </div>
      <div className="room-actions">
        {round !== undefined && (
          onResetRound ? (
            <button
              className="round-label round-trigger"
              type="button"
              title={t('room.resetRound')}
              aria-label={roundLabel + ' · ' + t('room.resetRound')}
              aria-haspopup="dialog"
              disabled={connection !== 'connected'}
              onClick={() => setRoundToReset(round)}
            >
              {roundLabel} <Icon name="reset" size={15} />
            </button>
          ) : <span className="round-label">{roundLabel}</span>
        )}
        <span className="connection" data-state={connection} role="status">
          <span className="status-dot" />{connectionLabel}
        </span>
      </div>
      {onResetRound && roundToReset !== null && roundToReset === round && (
        <Dialog title={t('room.resetRound')} onClose={() => setRoundToReset(null)}>
          <p className="round-reset-copy">{t('room.resetRoundDescription')}</p>
          <div className="round-reset-actions">
            <button className="button button-outline" type="button" onClick={() => setRoundToReset(null)}>
              {t('common.cancel')}
            </button>
            <button
              className="button button-primary"
              type="button"
              disabled={connection !== 'connected'}
              onClick={() => {
                onResetRound()
                setRoundToReset(null)
              }}
            >
              <Icon name="reset" size={16} />
              {t('room.resetRound')}
            </button>
          </div>
        </Dialog>
      )}
      {manualLink && (
        <Dialog title={t('room.invitationLink')} onClose={() => setManualLink('')}>
          <input
            className="input mono"
            aria-label={t('room.invitationLink')}
            dir="ltr"
            readOnly
            autoFocus
            onFocus={(event) => event.currentTarget.select()}
            value={manualLink}
          />
        </Dialog>
      )}
    </div>
  )
}
