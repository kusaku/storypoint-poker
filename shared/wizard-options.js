const TECHNICAL_IMPLEMENTATION_DROPDOWNS = {
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

const CONTENT_COMMUNICATION_DROPDOWNS = {
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

module.exports = {
  'technical-implementation': TECHNICAL_IMPLEMENTATION_DROPDOWNS,
  'content-communication': CONTENT_COMMUNICATION_DROPDOWNS,
}
