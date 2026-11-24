'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { Icon } from '@/app/components/Icon'
import { useLanguage } from '@/app/i18n/language-provider'
import { COMMENT_MAX_LENGTH } from '@/shared/room'

const emojis = [
  '👍', '👎', '✅', '👏', '🙌', '🎉', '💯', '💪', '🔥', '🚀', '❤️', '🙏',
  '🤔', '❓', '💡', '👀', '⚠️', '🚧', '🛑', '🐛', '🧩', '⏳', '☕', '🃏',
  '😊', '😄', '😃', '😁', '😍', '🥰', '😘', '😎', '😂', '🤣', '😅', '😬',
  '🤯', '😮', '😢', '😭', '😴', '🤷', '🙋', '💬', '✨', '🎯', '💩', '🤡',
]

interface CommentInputProps {
  comment: string
  revealed: boolean
  disabled: boolean
  onChange: (value: string, done: (delivered: boolean) => void) => void
}

export function CommentInput({ comment, revealed, disabled, onChange }: CommentInputProps) {
  const { t } = useLanguage()
  const [draft, setDraft] = useState<string | null>(null)
  const [showEmojis, setShowEmojis] = useState(false)
  const [failed, setFailed] = useState(false)
  const revision = useRef(0)
  const input = useRef<HTMLTextAreaElement>(null)
  const composer = useRef<HTMLDivElement>(null)
  const emojiToggle = useRef<HTMLButtonElement>(null)
  const emojiPopup = useRef<HTMLDivElement>(null)
  const value = draft ?? comment

  useLayoutEffect(() => {
    const editor = composer.current
    const popup = emojiPopup.current
    if (!showEmojis || !editor || !popup) return

    const viewport = window.visualViewport
    const placePopup = () => {
      const { top, bottom } = editor.getBoundingClientRect()
      const viewportTop = viewport?.offsetTop ?? 0
      const viewportBottom = viewportTop + (viewport?.height ?? document.documentElement.clientHeight)
      // Leave 8px at each end of the available space.
      const above = Math.max(0, top - viewportTop - 16)
      const below = Math.max(0, viewportBottom - bottom - 16)
      const popupHeight = popup.scrollHeight + popup.offsetHeight - popup.clientHeight
      const openAbove = below < popupHeight && above > below
      popup.dataset.side = openAbove ? 'above' : 'below'
      popup.style.maxBlockSize = `${openAbove ? above : below}px`
    }

    function dismissOutside(event: PointerEvent) {
      const { target } = event
      if (target instanceof Node && !popup?.contains(target) && !emojiToggle.current?.contains(target)) {
        setShowEmojis(false)
      }
    }

    function dismissOnEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      setShowEmojis(false)
      emojiToggle.current?.focus({ preventScroll: true })
    }

    placePopup()
    const observer = new ResizeObserver(placePopup)
    observer.observe(editor)
    window.addEventListener('resize', placePopup)
    window.addEventListener('scroll', placePopup, { passive: true })
    viewport?.addEventListener('resize', placePopup)
    viewport?.addEventListener('scroll', placePopup)
    window.addEventListener('pointerdown', dismissOutside)
    window.addEventListener('keydown', dismissOnEscape)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', placePopup)
      window.removeEventListener('scroll', placePopup)
      viewport?.removeEventListener('resize', placePopup)
      viewport?.removeEventListener('scroll', placePopup)
      window.removeEventListener('pointerdown', dismissOutside)
      window.removeEventListener('keydown', dismissOnEscape)
    }
  }, [showEmojis])

  function change(next: string) {
    const current = ++revision.current
    setDraft(next)
    setFailed(false)
    onChange(next, (delivered) => {
      if (current !== revision.current) return
      if (delivered) setDraft(null)
      setFailed(!delivered)
    })
  }

  return (
    <section className="panel comment-panel" aria-labelledby="round-comment-label">
      <div className="comment-heading">
        <h2 id="round-comment-label">
          <label htmlFor="round-comment"><Icon name="message" size={19} />{t('comment.roundComment')}</label>
        </h2>
        {!revealed && (
          <span className="comment-private" id="round-comment-visibility">
            <Icon name="lock" size={15} />{t('comment.privateNote')}
          </span>
        )}
      </div>
      <div className="comment-composer" ref={composer}>
        <div className="comment-editor">
          <textarea
            ref={input}
            id="round-comment"
            aria-describedby={revealed ? undefined : 'round-comment-visibility'}
            value={value}
            onChange={(event) => change(event.target.value)}
            placeholder={t('comment.placeholder')}
            maxLength={COMMENT_MAX_LENGTH}
            disabled={disabled}
            rows={2}
          />
          <div className="comment-tools">
            <button
              ref={emojiToggle}
              type="button"
              className="icon-button emoji-toggle"
              aria-label={t('comment.emojiPicker')}
              aria-expanded={showEmojis}
              aria-controls={showEmojis ? 'emoji-options' : undefined}
              disabled={disabled}
              onClick={() => setShowEmojis(!showEmojis)}
            >
              <Icon name="smile" size={19} />
            </button>
            {value && (
              <button
                type="button"
                className="text-button"
                disabled={disabled}
                onClick={() => {
                  change('')
                  input.current?.focus()
                }}
              >
                {t('common.remove')}
              </button>
            )}
            <span className="character-count mono">{value.length}/{COMMENT_MAX_LENGTH}</span>
          </div>
        </div>
        {showEmojis && (
          <div id="emoji-options" className="emoji-options" ref={emojiPopup} role="group" aria-label={t('comment.emojiPicker')}>
            {emojis.map((emoji) => (
              <button
                type="button"
                key={emoji}
                aria-label={t('comment.insert', { emoji })}
                disabled={disabled || value.length + emoji.length > COMMENT_MAX_LENGTH}
                onClick={() => {
                  change(value + emoji)
                  setShowEmojis(false)
                  input.current?.focus()
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
      {failed && (
        <button className="text-button" type="button" disabled={disabled} onClick={() => change(value)}>
          {t('comment.retry')}
        </button>
      )}
    </section>
  )
}
