import type { WizardAnswers } from '@/app/wizard-data'

export interface User {
  id: string
  name: string
  isHost: boolean
  vote: number | null
  hasVoted: boolean
  comment: string | null
  wizardAnswers: WizardAnswers | null
}

export interface RoomState {
  users: User[]
  revealed: boolean
}
