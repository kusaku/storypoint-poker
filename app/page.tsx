'use client'

import { useState, type FormEvent } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Icon } from '@/app/components/Icon'
import { useLanguage } from '@/app/i18n/language-provider'
import { createRoomId, parseRoomId, playerRoomPath } from '@/app/room-url'
import { NAME_MAX_LENGTH, normalizeName } from '@/shared/room'

type Mode = 'create' | 'join'

export default function Home() {
  const [mode, setMode] = useState<Mode>('create')
  const [name, setName] = useState('')
  const [roomInput, setRoomInput] = useState('')
  const [nameError, setNameError] = useState(false)
  const [roomError, setRoomError] = useState<'missing' | 'invalid' | null>(null)
  const router = useRouter()
  const { t } = useLanguage()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalizedName = normalizeName(name)
    const roomId = mode === 'create' ? createRoomId() : parseRoomId(roomInput)

    setNameError(!normalizedName)
    setRoomError(roomId ? null : roomInput.trim() ? 'invalid' : 'missing')
    if (!normalizedName || !roomId) return

    router.push(playerRoomPath(roomId, normalizedName, mode === 'create'))
  }

  return (
    <main className="container lobby">
      <div className="lobby-art table-felt">
        <Image src="/casino-deck.webp" alt="" fill sizes="(max-width: 520px) 100vw, (max-width: 760px) 490px, 55vw" priority />
      </div>
      <div className="lobby-content">
        <h1>{t('home.headline')}</h1>
        <p className="lobby-subtitle">{t('home.subtitle')}</p>

        <div className="segmented lobby-switch">
          {(['create', 'join'] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={mode === value}
              onClick={() => { setMode(value); setRoomError(null) }}
            >
              {t(value === 'create' ? 'home.createRoom' : 'home.joinRoom')}
            </button>
          ))}
        </div>

        <form className="access-form" onSubmit={handleSubmit} noValidate>
          <label className="field" htmlFor="display-name">
            {t('home.yourName')}
            <input
              id="display-name"
              className="input"
              autoComplete="nickname"
              value={name}
              onChange={(event) => { setName(event.target.value); setNameError(false) }}
              maxLength={NAME_MAX_LENGTH}
              placeholder={t('home.enterYourName')}
              aria-invalid={nameError}
              aria-describedby={nameError ? 'display-name-error' : undefined}
              required
            />
          </label>
          {nameError && <p className="form-error" id="display-name-error" role="alert">{t('home.pleaseEnterName')}</p>}
          {mode === 'join' && (
            <div className="field">
              <label htmlFor="room-link">{t('home.roomCodeOrLink')}</label>
              <input
                id="room-link"
                className="input"
                dir="ltr"
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                value={roomInput}
                onChange={(event) => { setRoomInput(event.target.value); setRoomError(null) }}
                placeholder={t('home.roomCodeOrLinkPlaceholder')}
                aria-invalid={roomError !== null}
                aria-describedby={roomError ? 'room-link-error' : undefined}
                required
              />
              {roomError && (
                <span className="form-error" id="room-link-error" role="alert">
                  {t(roomError === 'missing' ? 'home.missingRoomCodeOrLink' : 'home.invalidRoom')}
                </span>
              )}
            </div>
          )}
          <button className="button button-primary access-submit" type="submit">
            {t(mode === 'create' ? 'home.createRoomButton' : 'home.joinRoomButton')}
            <span className="directional-icon"><Icon name="arrow" size={19} /></span>
          </button>
        </form>
      </div>
    </main>
  )
}
