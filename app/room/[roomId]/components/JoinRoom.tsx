'use client'

import { useState, type FormEvent } from 'react'
import { Icon } from '@/app/components/Icon'
import { useLanguage } from '@/app/i18n/language-provider'
import { NAME_MAX_LENGTH, normalizeName } from '@/shared/room'

export function JoinRoom({ roomId, onJoin }: { roomId: string; onJoin: (name: string) => void }) {
  const [name, setName] = useState('')
  const [invalid, setInvalid] = useState(false)
  const { t } = useLanguage()

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const validName = normalizeName(name)
    setInvalid(!validName)
    if (validName) onJoin(validName)
  }

  return (
    <main className="container join-screen">
      <div className="panel join-panel">
        <p className="room-code">{t('common.room')} <bdi className="mono">{roomId}</bdi></p>
        <h1>{t('home.joinRoom')}</h1>
        <form className="access-form" noValidate onSubmit={submit}>
          <label className="field" htmlFor="invite-name">
            {t('home.yourName')}
            <input
              id="invite-name"
              className="input"
              value={name}
              autoComplete="nickname"
              maxLength={NAME_MAX_LENGTH}
              placeholder={t('home.enterYourName')}
              aria-invalid={invalid}
              aria-describedby={invalid ? 'invite-name-error' : undefined}
              onChange={(event) => { setName(event.target.value); setInvalid(false) }}
              required
            />
          </label>
          {invalid && <p className="form-error" id="invite-name-error" role="alert">{t('home.pleaseEnterName')}</p>}
          <button className="button button-primary access-submit" type="submit">
            {t('home.joinRoomButton')}
            <span className="directional-icon"><Icon name="arrow" size={19} /></span>
          </button>
        </form>
      </div>
    </main>
  )
}
