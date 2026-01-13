export type TaskType = 'technical-implementation' | 'content-communication'

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

export interface WizardResult {
  suggestedSp: number
  confidence: number
  score: number
  baseSp: number
  minSpFromGates: number
  reasons: string[]
  flags: string[]
  contributingValues: Array<{ section: string; label: string; value: number; minSp?: number }>
  breadth: number
  breadthBumpApplied: boolean
}

export const TECHNICAL_IMPLEMENTATION_DROPDOWNS = {
  scope: {
    label: 'Scope',
    options: [
      { label: 'Single file or trivial change', value: 0 },
      { label: 'Multiple files in one area', value: 1 },
      { label: 'Multiple layers (API + service + DB)', value: 2, minSp: 3 },
      { label: 'Multiple services or repositories', value: 4, minSp: 5 },
      { label: 'Core or critical-path system', value: 5, minSp: 8 },
    ],
  },
  complexity: {
    label: 'Complexity',
    options: [
      { label: 'No logic change (rename, config)', value: 0 },
      { label: 'Simple new logic, linear flow', value: 1 },
      { label: 'Branching logic or edge cases', value: 2 },
      { label: 'Stateful or multi-step logic', value: 3 },
      { label: 'Concurrency, retries, or failure handling', value: 5, minSp: 5 },
    ],
  },
  uncertainty: {
    label: 'Uncertainty',
    options: [
      { label: 'Fully understood, no unknowns', value: 0 },
      { label: 'Minor lookup or docs check', value: 1 },
      { label: 'Some investigation or spike needed', value: 3, minSp: 3 },
      { label: 'Implementation approach unclear', value: 4, minSp: 3 },
      { label: 'Design likely to change during work', value: 5, minSp: 5 },
    ],
  },
  dataImpact: {
    label: 'Data Impact',
    options: [
      { label: 'No data impact', value: 0 },
      { label: 'Schema change only', value: 2 },
      { label: 'Small migration, easy rollback', value: 3 },
      { label: 'Large migration or backfill', value: 5, minSp: 5 },
      { label: 'Irreversible or high-risk data change', value: 6, minSp: 8 },
    ],
  },
  coordinationDependencies: {
    label: 'Coordination & Dependencies',
    options: [
      { label: 'Solo work', value: 0 },
      { label: 'Needs review from another developer', value: 1 },
      { label: 'Needs alignment within the team', value: 2 },
      { label: 'Cross-team dependency', value: 4, minSp: 3 },
      { label: 'External dependency (vendor/infra)', value: 5, minSp: 5 },
    ],
  },
  testing: {
    label: 'Testing',
    options: [
      { label: 'No tests or trivial validation', value: 0 },
      { label: 'Unit tests only', value: 1 },
      { label: 'Integration tests', value: 3, minSp: 3 },
      { label: 'End-to-end or staging validation', value: 4, minSp: 5 },
      { label: 'Rollout, monitoring, or manual verification', value: 5, minSp: 8 },
    ],
  },
}

export const CONTENT_COMMUNICATION_DROPDOWNS = {
  scope: {
    label: 'Scope',
    options: [
      { label: 'Small edit or note', value: 0 },
      { label: 'One complete document', value: 1 },
      { label: 'Multiple documents', value: 3 },
      { label: 'Documentation set or section', value: 4, minSp: 3 },
      { label: 'Living document that defines behavior', value: 5, minSp: 5 },
    ],
  },
  structureComplexity: {
    label: 'Structure & Complexity',
    options: [
      { label: 'Structure is obvious', value: 0 },
      { label: 'Light structuring needed', value: 1 },
      { label: 'Careful narrative or ordering required', value: 2 },
      { label: 'Conceptual model or abstraction needed', value: 4, minSp: 3 },
      { label: 'New terminology or rules must be defined', value: 5, minSp: 5 },
    ],
  },
  uncertainty: {
    label: 'Uncertainty',
    options: [
      { label: 'Everything is known', value: 0 },
      { label: 'Minor clarification needed', value: 1 },
      { label: 'Requires asking questions or interviews', value: 3 },
      { label: 'Requires exploration or investigation', value: 4, minSp: 3 },
      { label: 'Assumptions likely to change mid-work', value: 5, minSp: 5 },
    ],
  },
  sourceMaterial: {
    label: 'Source Material',
    options: [
      { label: 'Pure rewrite or formatting', value: 0 },
      { label: 'Summarizing a single clear source', value: 1 },
      { label: 'Reconciling multiple sources', value: 3 },
      { label: 'Information is missing or contradictory', value: 4, minSp: 3 },
      { label: 'Source of truth must be created', value: 5, minSp: 5 },
    ],
  },
  reviewConsensus: {
    label: 'Review & Consensus',
    options: [
      { label: 'No review needed', value: 0 },
      { label: 'One reviewer', value: 1 },
      { label: 'Multiple reviewers', value: 2 },
      { label: 'Conflicting opinions expected', value: 4, minSp: 3 },
      { label: 'Consensus or decision-making required', value: 5, minSp: 5 },
    ],
  },
  impact: {
    label: 'Impact',
    options: [
      { label: 'Low-impact internal note', value: 0 },
      { label: 'Team reference material', value: 1 },
      { label: 'Onboarding or guidance', value: 2 },
      { label: 'Process-defining document', value: 4, minSp: 5 },
      { label: 'Policy or contract-level document', value: 6, minSp: 8 },
    ],
  },
}

export function calculateStoryPoints(answers: WizardAnswers): WizardResult {
  const dropdowns = answers.taskType === 'technical-implementation' ? TECHNICAL_IMPLEMENTATION_DROPDOWNS : CONTENT_COMMUNICATION_DROPDOWNS
  const sections = Object.keys(dropdowns)
  
  let score = 0
  let minSp = 0
  let breadth = 0
  
  const contributingSignals: Array<{ section: string; label: string; value: number }> = []
  
  for (const [section, answer] of Object.entries(answers.answers)) {
    score += answer.value
    if (answer.minSp) {
      minSp = Math.max(minSp, answer.minSp)
    }
    if (answer.value > 0) {
      breadth++
      const sectionLabel = dropdowns[section as keyof typeof dropdowns]?.label || section
      contributingSignals.push({
        section,
        label: sectionLabel,
        value: answer.value,
      })
    }
  }
  
  let baseSp: number
  if (score <= 2) baseSp = 1
  else if (score <= 5) baseSp = 2
  else if (score <= 9) baseSp = 3
  else if (score <= 14) baseSp = 5
  else if (score <= 20) baseSp = 8
  else baseSp = 13
  
  let finalSp = Math.max(baseSp, minSp)
  
  const needsDecomposition = baseSp === 13
  
  const averageValuePerCategory = breadth > 0 ? score / breadth : 0
  const breadthBumpApplied = breadth >= 5 && baseSp <= 3 && averageValuePerCategory <= 1.5 && score !== breadth && finalSp < 5
  if (breadthBumpApplied) {
    finalSp = 5
  }
  
  const bucketRanges: Record<number, [number, number]> = {
    1: [0, 2],
    2: [3, 5],
    3: [6, 9],
    5: [10, 14],
    8: [15, 20],
    13: [21, Infinity],
  }
  
  const [bucketMin, bucketMax] = bucketRanges[baseSp] || [0, Infinity]
  const boundaryDistance = Math.min(score - bucketMin, bucketMax - score)
  const boundaryFactor = Math.max(0, Math.min(1, boundaryDistance / 3))
  
  const categoryPenalty = Math.max(0, Math.min(0.25, (breadth - 2) * 0.08))
  
  const uncertaintySections = answers.taskType === 'technical-implementation' 
    ? ['uncertainty'] 
    : ['uncertainty', 'sourceMaterial']
  let uncertaintyWeight = 0
  for (const section of uncertaintySections) {
    if (answers.answers[section]) {
      uncertaintyWeight += answers.answers[section].value
    }
  }
  const uncertaintyPenalty = Math.max(0, Math.min(0.25, uncertaintyWeight * 0.03))
  
  const confidence = Math.max(0.2, Math.min(0.95, 0.55 + 0.35 * boundaryFactor - categoryPenalty - uncertaintyPenalty))
  
  contributingSignals.sort((a, b) => b.value - a.value)
  const reasons = contributingSignals.slice(0, 4).map(s => {
    const answer = answers.answers[s.section]
    return `${s.label}: ${answer.option}`
  })
  
  if (minSp > baseSp) {
        reasons.unshift(`Minimum SP requirement: ${minSp}`)
  }
  
  const flags: string[] = []
  if (needsDecomposition) {
    flags.push('DECOMPOSE_REQUIRED')
    reasons.unshift('Score indicates this task is too large and should be decomposed')
  }
  
  const contributingValues = contributingSignals.map(s => {
    const answer = answers.answers[s.section]
    return {
      section: s.section,
      label: s.label,
      value: answer.value,
      minSp: answer.minSp
    }
  })

  return {
    suggestedSp: finalSp,
    confidence,
    score,
    baseSp,
    minSpFromGates: minSp,
    reasons: reasons.length > 0 ? reasons : ['No significant factors'],
    flags,
    contributingValues,
    breadth,
    breadthBumpApplied,
  }
}
