'use client'

import { useEffect, useId, useRef, type ReactNode } from 'react'
import { Icon } from '@/app/components/Icon'
import { useLanguage } from '@/app/i18n/language-provider'

interface DialogProps {
  title: string
  onClose: () => void
  children: ReactNode
  wide?: boolean
}

export function Dialog({ title, onClose, children, wide = false }: DialogProps) {
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const { t } = useLanguage()

  useEffect(() => {
    const element = dialog.current
    if (!element) return
    const trigger = document.activeElement
    element.showModal()
    return () => {
      element.close()
      if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus({ preventScroll: true })
    }
  }, [])

  return (
    <dialog
      className={wide ? 'dialog dialog-wide' : 'dialog'}
      ref={dialog}
      aria-labelledby={titleId}
      onCancel={(event) => { event.preventDefault(); onClose() }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose() }}
    >
      <div className="dialog-body">
        <div className="dialog-header">
          <h2 id={titleId}>{title}</h2>
          <button type="button" className="icon-button" onClick={onClose} aria-label={t('common.close')}>
            <Icon name="close" />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  )
}
