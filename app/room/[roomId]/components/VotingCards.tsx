'use client'

import { useState } from 'react'
import { FIBONACCI_CARDS, displayVote } from '../../../fibonacci'

interface VotingCardsProps {
  selectedCard: number | null
  revealed: boolean
  onVote: (card: number) => void
}

export function VotingCards({ selectedCard, revealed, onVote }: VotingCardsProps) {
  const [spinningCard, setSpinningCard] = useState<number | null>(null)

  const handleClick = (card: number) => {
    if (selectedCard !== card) {
      setSpinningCard(card)
    }
    onVote(card)
  }

  return (
    <div className="grid grid-cols-3 gap-4 mb-4">
      {FIBONACCI_CARDS.map((card) => (
        <button
          key={card}
          onClick={() => handleClick(card)}
          disabled={revealed}
          onAnimationEnd={() => setSpinningCard(null)}
          className={`
            aspect-square rounded-lg font-bold transition-all
            flex items-center justify-center p-[5%]
            ${selectedCard === card
              ? 'bg-indigo-600 dark:bg-indigo-500 text-white scale-110 shadow-lg'
              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'
            }
            ${spinningCard === card ? 'card-spin' : ''}
            ${revealed ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          style={{ fontSize: 'clamp(2rem, 10vw, 6rem)', lineHeight: '1' }}
        >
          {displayVote(card)}
        </button>
      ))}
    </div>
  )
}
