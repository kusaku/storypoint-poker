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
    label: 'wizardData.scope',
    options: [
      { label: 'wizardData.singleFileOrTrivialChange', value: 0 },
      { label: 'wizardData.multipleFilesInOneArea', value: 1 },
      { label: 'wizardData.multipleLayers', value: 2, minSp: 3 },
      { label: 'wizardData.multipleServicesOrRepositories', value: 4, minSp: 5 },
      { label: 'wizardData.coreOrCriticalPathSystem', value: 5, minSp: 8 },
    ],
  },
  complexity: {
    label: 'wizardData.complexity',
    options: [
      { label: 'wizardData.noLogicChange', value: 0 },
      { label: 'wizardData.simpleNewLogic', value: 1 },
      { label: 'wizardData.branchingLogicOrEdgeCases', value: 2 },
      { label: 'wizardData.statefulOrMultiStepLogic', value: 3 },
      { label: 'wizardData.concurrencyRetriesOrFailureHandling', value: 5, minSp: 5 },
    ],
  },
  uncertainty: {
    label: 'wizardData.uncertainty',
    options: [
      { label: 'wizardData.fullyUnderstood', value: 0 },
      { label: 'wizardData.minorLookupOrDocsCheck', value: 1 },
      { label: 'wizardData.someInvestigationOrSpikeNeeded', value: 3, minSp: 3 },
      { label: 'wizardData.implementationApproachUnclear', value: 4, minSp: 3 },
      { label: 'wizardData.designLikelyToChangeDuringWork', value: 5, minSp: 5 },
    ],
  },
  dataImpact: {
    label: 'wizardData.dataImpact',
    options: [
      { label: 'wizardData.noDataImpact', value: 0 },
      { label: 'wizardData.schemaChangeOnly', value: 2 },
      { label: 'wizardData.smallMigrationEasyRollback', value: 3 },
      { label: 'wizardData.largeMigrationOrBackfill', value: 5, minSp: 5 },
      { label: 'wizardData.irreversibleOrHighRiskDataChange', value: 6, minSp: 8 },
    ],
  },
  coordinationDependencies: {
    label: 'wizardData.coordinationDependencies',
    options: [
      { label: 'wizardData.soloWork', value: 0 },
      { label: 'wizardData.needsReviewFromAnotherDeveloper', value: 1 },
      { label: 'wizardData.needsAlignmentWithinTeam', value: 2 },
      { label: 'wizardData.crossTeamDependency', value: 4, minSp: 3 },
      { label: 'wizardData.externalDependency', value: 5, minSp: 5 },
    ],
  },
  testing: {
    label: 'wizardData.testing',
    options: [
      { label: 'wizardData.noTestsOrTrivialValidation', value: 0 },
      { label: 'wizardData.unitTestsOnly', value: 1 },
      { label: 'wizardData.integrationTests', value: 3, minSp: 3 },
      { label: 'wizardData.endToEndOrStagingValidation', value: 4, minSp: 5 },
      { label: 'wizardData.rolloutMonitoringOrManualVerification', value: 5, minSp: 8 },
    ],
  },
}

export const CONTENT_COMMUNICATION_DROPDOWNS = {
  scope: {
    label: 'wizardData.scope',
    options: [
      { label: 'wizardData.smallEditOrNote', value: 0 },
      { label: 'wizardData.oneCompleteDocument', value: 1 },
      { label: 'wizardData.multipleDocuments', value: 3 },
      { label: 'wizardData.documentationSetOrSection', value: 4, minSp: 3 },
      { label: 'wizardData.livingDocumentThatDefinesBehavior', value: 5, minSp: 5 },
    ],
  },
  structureComplexity: {
    label: 'wizardData.structureComplexity',
    options: [
      { label: 'wizardData.structureIsObvious', value: 0 },
      { label: 'wizardData.lightStructuringNeeded', value: 1 },
      { label: 'wizardData.carefulNarrativeOrOrderingRequired', value: 2 },
      { label: 'wizardData.conceptualModelOrAbstractionNeeded', value: 4, minSp: 3 },
      { label: 'wizardData.newTerminologyOrRulesMustBeDefined', value: 5, minSp: 5 },
    ],
  },
  uncertainty: {
    label: 'wizardData.uncertainty',
    options: [
      { label: 'wizardData.everythingIsKnown', value: 0 },
      { label: 'wizardData.minorClarificationNeeded', value: 1 },
      { label: 'wizardData.requiresAskingQuestionsOrInterviews', value: 3 },
      { label: 'wizardData.requiresExplorationOrInvestigation', value: 4, minSp: 3 },
      { label: 'wizardData.assumptionsLikelyToChangeMidWork', value: 5, minSp: 5 },
    ],
  },
  sourceMaterial: {
    label: 'wizardData.sourceMaterial',
    options: [
      { label: 'wizardData.pureRewriteOrFormatting', value: 0 },
      { label: 'wizardData.summarizingSingleClearSource', value: 1 },
      { label: 'wizardData.reconcilingMultipleSources', value: 3 },
      { label: 'wizardData.informationIsMissingOrContradictory', value: 4, minSp: 3 },
      { label: 'wizardData.sourceOfTruthMustBeCreated', value: 5, minSp: 5 },
    ],
  },
  reviewConsensus: {
    label: 'wizardData.reviewConsensus',
    options: [
      { label: 'wizardData.noReviewNeeded', value: 0 },
      { label: 'wizardData.oneReviewer', value: 1 },
      { label: 'wizardData.multipleReviewers', value: 2 },
      { label: 'wizardData.conflictingOpinionsExpected', value: 4, minSp: 3 },
      { label: 'wizardData.consensusOrDecisionMakingRequired', value: 5, minSp: 5 },
    ],
  },
  impact: {
    label: 'wizardData.impact',
    options: [
      { label: 'wizardData.lowImpactInternalNote', value: 0 },
      { label: 'wizardData.teamReferenceMaterial', value: 1 },
      { label: 'wizardData.onboardingOrGuidance', value: 2 },
      { label: 'wizardData.processDefiningDocument', value: 4, minSp: 5 },
      { label: 'wizardData.policyOrContractLevelDocument', value: 6, minSp: 8 },
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
      const sectionData = dropdowns[section as keyof typeof dropdowns]
      const sectionLabel = sectionData?.label || `wizardData.${section}`
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
    return `${s.label}:${answer.option}`
  })
  
  if (minSp > baseSp) {
    reasons.unshift(`minSp:${minSp}`)
  }
  
  const flags: string[] = []
  if (needsDecomposition) {
    flags.push('DECOMPOSE_REQUIRED')
    reasons.unshift('decompose')
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
