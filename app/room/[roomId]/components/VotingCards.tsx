'use client'

import { useEffect, useRef, useState, type Ref } from 'react'
import { Icon } from '@/app/components/Icon'
import { FIBONACCI_CARDS, displayVote, type CardValue } from '@/app/fibonacci'
import { useLanguage } from '@/app/i18n/language-provider'

interface VotingCardsProps {
  selected: CardValue | null
  disabled: boolean
  onVote: (card: CardValue) => void
  onOpenWizard: () => void
  helperButtonRef: Ref<HTMLButtonElement>
}

export function VotingCards({ selected, disabled, onVote, onOpenWizard, helperButtonRef }: VotingCardsProps) {
  const { t } = useLanguage()
  const previousSelection = useRef(selected)
  const [turning, setTurning] = useState<CardValue | null>(null)

  useEffect(() => {
    if (selected === previousSelection.current) return
    previousSelection.current = selected
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setTurning(reducedMotion ? null : selected)
  }, [selected])

  return (
    <section className="panel vote-panel" aria-labelledby="vote-heading">
      <div className="panel-heading">
        <div>
          <p className="phase"><span className="status-dot" />{t('room.votingOpen')}</p>
          <h2 id="vote-heading">{t('room.chooseCard')}</h2>
        </div>
        <button
          ref={helperButtonRef}
          className="button button-outline wizard-button"
          type="button"
          onClick={onOpenWizard}
          disabled={disabled}
        >
          <Icon name="sparkle" size={19} />
          {t('wizard.storyPointHelper')}
        </button>
      </div>

      <div className="deck table-felt" role="group" aria-labelledby="vote-heading">
        {FIBONACCI_CARDS.map((card) => {
          const label = displayVote(card)
          const pressed = selected === card
          const isTurning = pressed && turning === card
          return (
            <button
              key={card}
              type="button"
              className="playing-card"
              data-vote={card}
              aria-label={card === 0 ? t('room.joker') : label}
              aria-pressed={pressed}
              disabled={disabled}
              onClick={() => onVote(card)}
            >
              <span
                className="card-surface"
                aria-hidden="true"
                data-turning={isTurning || undefined}
                onAnimationEnd={() => setTurning((active) => active === card ? null : active)}
              >
                <span className="card-face">
                  <span className="card-corner">{label}<i /></span>
                  {pressed && <span className="card-confirmation"><Icon name="check" /></span>}
                  <span className="card-rank">{label}</span>
                  <span className="card-corner card-corner-end">{label}<i /></span>
                </span>
                {isTurning && <span className="card-back" />}
              </span>
            </button>
          )
        })}
      </div>

      <p className="vote-feedback" data-selected={selected !== null} role="status">
        <Icon name={selected !== null ? 'check' : 'lock'} size={17} />
        {selected !== null ? t('room.voteSubmitted') : t('room.privateVotes')}
      </p>
    </section>
  )
}
