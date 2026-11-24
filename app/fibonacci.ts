import { FIBONACCI_CARDS } from '@/shared/room'

export { FIBONACCI_CARDS }
export type CardValue = typeof FIBONACCI_CARDS[number]

export function roundToNearestCard(suggestedSp: number): CardValue {
  return FIBONACCI_CARDS.reduce((closest, card) =>
    Math.abs(card - suggestedSp) < Math.abs(closest - suggestedSp) ? card : closest,
  )
}

export function displayVote(vote: CardValue | null): string {
  if (vote === null) return '—'
  return vote === 0 ? 'J' : String(vote)
}
