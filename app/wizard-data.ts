import wizardOptions from '@/shared/wizard-options'

export type TaskType = keyof typeof wizardOptions

export interface WizardAnswer {
  section: string
  option: string
  value: number
  minSp?: number
}

export interface WizardAnswers {
  taskType: TaskType
  answers: Record<string, WizardAnswer>
}

export interface WizardDropdownOption {
  label: string
  value: number
  minSp?: number
}

type WizardDropdowns = Record<string, { label: string; options: WizardDropdownOption[] }>

export const SCORE_BUCKETS = [
  { min: 0, max: 2, points: 1 },
  { min: 3, max: 5, points: 2 },
  { min: 6, max: 9, points: 3 },
  { min: 10, max: 14, points: 5 },
  { min: 15, max: 20, points: 8 },
  { min: 21, max: Infinity, points: 13 },
]

export function getDropdownsByTaskType(taskType: TaskType): WizardDropdowns {
  return wizardOptions[taskType]
}

export function taskTypeLabel(taskType: TaskType): string {
  return taskType === 'technical-implementation' ? 'wizard.technicalImplementation' : 'wizard.contentCommunication'
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

export function calculateStoryPoints({ taskType, answers }: WizardAnswers) {
  const dropdowns = getDropdownsByTaskType(taskType)
  const selections = Object.values(answers)
  const score = selections.reduce((total, { value }) => total + value, 0)
  const minSp = selections.reduce((highest, { minSp }) => Math.max(highest, minSp ?? 0), 0)
  const factors = Object.entries(answers)
    .filter(([, { value }]) => value > 0)
    .map(([section, answer]) => ({ ...answer, section, label: dropdowns[section]?.label ?? 'wizardData.' + section }))
    .sort((a, b) => b.value - a.value)

  const bucket = SCORE_BUCKETS.find(({ max }) => score <= max) ?? SCORE_BUCKETS[SCORE_BUCKETS.length - 1]
  const breadth = factors.length
  const baseEstimate = Math.max(bucket.points, minSp)
  const breadthBump = breadth >= 5 && bucket.points <= 3 && score / breadth <= 1.5 && score !== breadth && baseEstimate < 5
  const suggestedSp = breadthBump ? 5 : baseEstimate

  const boundaryDistance = Math.min(score - bucket.min, bucket.max - score)
  const boundaryFactor = clamp(boundaryDistance / 3, 0, 1)
  const categoryPenalty = clamp((breadth - 2) * 0.08, 0, 0.25)
  const uncertainty = (answers.uncertainty?.value ?? 0)
    + (taskType === 'content-communication' ? answers.sourceMaterial?.value ?? 0 : 0)
  const uncertaintyPenalty = clamp(uncertainty * 0.03, 0, 0.25)
  const confidence = clamp(0.55 + 0.35 * boundaryFactor - categoryPenalty - uncertaintyPenalty, 0.2, 0.95)

  return { score, bucket, minSp, factors, breadth, breadthBump, suggestedSp, confidence, decompose: bucket.points === 13 }
}

export type WizardResult = ReturnType<typeof calculateStoryPoints>
