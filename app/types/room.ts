import type { WizardAnswers } from '@/app/wizard-data'
import type { CardValue } from '@/app/fibonacci'

export interface Ballot {
  vote: CardValue | null
  comment: string | null
  wizardAnswers: WizardAnswers | null
}

export interface Participant extends Ballot {
  id: string
  name: string
  isHost: boolean
  connected: boolean
  hasVoted: boolean
}

export interface RoomState {
  users: Participant[]
  viewerId: string
  ballot: Ballot
  revealed: boolean
  round: number
}
