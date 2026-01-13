export const FIBONACCI_CARDS = [0, 1, 2, 3, 5, 8] as const

export function roundToNearestCard(suggestedSp: number): number {
  return FIBONACCI_CARDS.reduce((prev, curr) => 
    Math.abs(curr - suggestedSp) < Math.abs(prev - suggestedSp) ? curr : prev
  )
}

export function displayVote(vote: number | null): string {
  if (vote === null) return '—'
  if (vote === 0) return 'J'
  return String(vote)
}
