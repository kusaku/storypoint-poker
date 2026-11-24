'use client'

import { useEffect, useId, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { Icon } from '@/app/components/Icon'
import { displayVote, FIBONACCI_CARDS, type CardValue } from '@/app/fibonacci'
import { useLanguage } from '@/app/i18n/language-provider'
import type { Participant } from '@/app/types/room'

const SWEEP_MS = 680

interface TooltipPoint {
  x: number
  y: number
}

type TooltipAnchor = Element | TooltipPoint

interface TooltipTarget {
  card: CardValue
  anchor: TooltipAnchor
}

function positionVoteTooltip(tooltip: HTMLDivElement, anchor: TooltipAnchor) {
  const { left, right, top, bottom } = 'getBoundingClientRect' in anchor
    ? anchor.getBoundingClientRect()
    : { left: anchor.x, right: anchor.x, top: anchor.y, bottom: anchor.y }
  const { width, height } = tooltip.getBoundingClientRect()
  const { clientWidth, clientHeight } = document.documentElement
  const gap = 12
  const margin = 8
  const rightLimit = clientWidth - width - margin
  const bottomLimit = clientHeight - height - margin
  const x = right + gap <= rightLimit ? right + gap : left - width - gap
  const y = bottom + gap <= bottomLimit ? bottom + gap : top - height - gap

  tooltip.style.left = `${Math.max(margin, Math.min(x, rightLimit))}px`
  tooltip.style.top = `${Math.max(margin, Math.min(y, bottomLimit))}px`
}

export function RoundResults({ users }: { users: Participant[] }) {
  const { t, language } = useLanguage()
  const [hovered, setHovered] = useState<CardValue | null>(null)
  const [focused, setFocused] = useState<TooltipTarget | null>(null)
  const [pinned, setPinned] = useState<TooltipTarget | null>(null)
  const pointer = useRef<TooltipPoint | null>(null)
  const figure = useRef<HTMLElement>(null)
  const tooltip = useRef<HTMLDivElement>(null)
  const tooltipId = useId()
  const votes = users.flatMap(({ vote }) => vote === null ? [] : [vote])
  const estimates = votes.filter((vote) => vote !== 0).sort((a, b) => a - b)
  const middle = Math.floor(estimates.length / 2)
  const median = estimates.length ? (estimates[middle] + estimates[Math.floor((estimates.length - 1) / 2)]) / 2 : null
  const format = new Intl.NumberFormat(language)
  const percent = new Intl.NumberFormat(language, { style: 'percent', maximumFractionDigits: 1 })
  const distribution = FIBONACCI_CARDS.map((card) => ({
    card,
    count: votes.filter((vote) => vote === card).length,
  })).filter(({ count }) => count > 0)

  let counted = 0
  const segments = distribution.map(({ card, count }) => {
    const start = counted / votes.length
    const share = count / votes.length
    counted += count
    const gap = distribution.length > 1 ? Math.min(0.9, share * 25) : 0
    return { card, count, start, share, gap, length: share * 100 - gap }
  })
  const target = focused ?? pinned
  const active = segments.find(({ card }) => card === (hovered ?? target?.card))
  const showingTooltip = Boolean(active)

  useLayoutEffect(() => {
    const anchor = hovered === null ? target?.anchor : pointer.current
    if (anchor && tooltip.current) positionVoteTooltip(tooltip.current, anchor)
  }, [hovered, target, active?.count, active?.share, language])

  useEffect(() => {
    if (!showingTooltip) return

    function dismiss() {
      setHovered(null)
      setFocused(null)
      setPinned(null)
    }

    function dismissOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') dismiss()
    }

    function dismissOutside(event: PointerEvent) {
      if (!(event.target instanceof Node) || !figure.current?.contains(event.target)) dismiss()
    }

    window.addEventListener('keydown', dismissOnEscape)
    window.addEventListener('pointerdown', dismissOutside)
    window.addEventListener('scroll', dismiss, { passive: true })
    window.addEventListener('resize', dismiss)
    return () => {
      window.removeEventListener('keydown', dismissOnEscape)
      window.removeEventListener('pointerdown', dismissOutside)
      window.removeEventListener('scroll', dismiss)
      window.removeEventListener('resize', dismiss)
    }
  }, [showingTooltip])

  function cardLabel(card: CardValue) {
    return card === 0 ? t('room.joker') : displayVote(card)
  }

  function highlightOnPointer(event: ReactPointerEvent<Element>, card: CardValue) {
    if (event.pointerType === 'touch') return
    const point = { x: event.clientX, y: event.clientY }
    pointer.current = point
    if (hovered === card && tooltip.current) {
      positionVoteTooltip(tooltip.current, point)
    } else {
      setHovered(card)
    }
  }

  function togglePinned(card: CardValue, anchor: TooltipAnchor) {
    setPinned((previous) => previous?.card === card ? null : { card, anchor })
  }

  return (
    <section className="panel results-panel" aria-labelledby="results-heading">
      <div className="panel-heading">
        <div>
          <p className="phase revealed-phase"><Icon name="eye" size={16} />{t('room.votesRevealedStatus')}</p>
          <h2 id="results-heading">{t('room.results')}</h2>
        </div>
      </div>

      <figure ref={figure} className="distribution" aria-labelledby="distribution-heading">
        <figcaption id="distribution-heading">{t('room.voteDistribution')}</figcaption>

        <div className="distribution-body">
          <div className="vote-donut" data-highlighted={showingTooltip}>
            <svg viewBox="0 0 240 240" aria-hidden="true" className="vote-ring">
              <circle className="vote-track" cx="120" cy="120" r="92" />
              <g transform="rotate(-90 120 120)">
                {segments.map(({ card, start, share, gap, length }) => (
                  <circle
                    key={card}
                    className="vote-segment"
                    cx="120"
                    cy="120"
                    r="92"
                    pathLength="100"
                    data-vote={card}
                    data-active={active?.card === card}
                    strokeDasharray={length + ' ' + (100 - length)}
                    strokeDashoffset={-(start * 100 + gap / 2)}
                    style={{
                      animationDelay: Math.round(start * SWEEP_MS) + 'ms',
                      animationDuration: Math.max(90, Math.round(share * SWEEP_MS)) + 'ms',
                    }}
                    onPointerEnter={(event) => highlightOnPointer(event, card)}
                    onPointerMove={(event) => highlightOnPointer(event, card)}
                    onPointerLeave={() => setHovered(null)}
                    onClick={(event) => togglePinned(card, { x: event.clientX, y: event.clientY })}
                  />
                ))}
              </g>
            </svg>
            <dl className="vote-donut-center">
              <dt>{t('room.median')}</dt>
              <dd><bdi>{median === null ? '—' : format.format(median)}</bdi></dd>
            </dl>
          </div>

          {segments.length > 0 && (
            <table className="vote-legend">
              <thead>
                <tr>
                  <th scope="col">{t('room.card')}</th>
                  <th scope="col">{t('room.votesCast')}</th>
                  <th scope="col">{t('room.voteShare')}</th>
                </tr>
              </thead>
              <tbody>
                {segments.map(({ card, count, share }) => (
                  <tr
                    key={card}
                    data-vote={card}
                    data-active={active?.card === card}
                    onPointerEnter={(event) => highlightOnPointer(event, card)}
                    onPointerMove={(event) => highlightOnPointer(event, card)}
                    onPointerLeave={() => setHovered(null)}
                  >
                    <th scope="row">
                      <button
                        className="vote-legend-card"
                        type="button"
                        aria-pressed={pinned?.card === card}
                        aria-describedby={active?.card === card ? tooltipId : undefined}
                        onClick={(event) => togglePinned(card, event.currentTarget)}
                        onFocus={(event) => {
                          if (event.currentTarget.matches(':focus-visible')) {
                            setFocused({ card, anchor: event.currentTarget })
                          }
                        }}
                        onBlur={() => setFocused(null)}
                      >
                        <span className="vote-swatch" aria-hidden="true" />
                        <bdi>{cardLabel(card)}</bdi>
                      </button>
                    </th>
                    <td className="distribution-count"><bdi>{format.format(count)}</bdi></td>
                    <td className="distribution-share"><bdi>{percent.format(share)}</bdi></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {active && (
          <div key={active.card} ref={tooltip} className="vote-tooltip" id={tooltipId} role="tooltip" data-vote={active.card}>
            <strong>
              <span className="vote-swatch" aria-hidden="true" />
              <bdi>{active.card === 0 ? cardLabel(active.card) : t('room.card') + ' ' + cardLabel(active.card)}</bdi>
            </strong>
            <span>{t('room.votesCast')} <bdi>{format.format(active.count)}</bdi> · <bdi>{percent.format(active.share)}</bdi></span>
          </div>
        )}
      </figure>
    </section>
  )
}
