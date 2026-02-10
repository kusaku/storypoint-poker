export function getTranslatedWizardData() {
  return {
    translateLabel: (label: string, t: (key: string, params?: Record<string, string | number>) => string): string => {
      // Map English labels to translation keys
      const labelMap: Record<string, string> = {
        // Section labels
        'Scope': 'wizardData.scope',
        'Complexity': 'wizardData.complexity',
        'Uncertainty': 'wizardData.uncertainty',
        'Data Impact': 'wizardData.dataImpact',
        'Coordination & Dependencies': 'wizardData.coordinationDependencies',
        'Testing': 'wizardData.testing',
        'Structure & Complexity': 'wizardData.structureComplexity',
        'Source Material': 'wizardData.sourceMaterial',
        'Review & Consensus': 'wizardData.reviewConsensus',
        'Impact': 'wizardData.impact',
        
        // Task types
        'Technical Implementation': 'wizard.technicalImplementation',
        'Content & Communication': 'wizard.contentCommunication',
        
        // Option labels - Technical Implementation
        'Single file or trivial change': 'wizardData.singleFileOrTrivialChange',
        'Multiple files in one area': 'wizardData.multipleFilesInOneArea',
        'Multiple layers (API + service + DB)': 'wizardData.multipleLayers',
        'Multiple services or repositories': 'wizardData.multipleServicesOrRepositories',
        'Core or critical-path system': 'wizardData.coreOrCriticalPathSystem',
        'No logic change (rename, config)': 'wizardData.noLogicChange',
        'Simple new logic, linear flow': 'wizardData.simpleNewLogic',
        'Branching logic or edge cases': 'wizardData.branchingLogicOrEdgeCases',
        'Stateful or multi-step logic': 'wizardData.statefulOrMultiStepLogic',
        'Concurrency, retries, or failure handling': 'wizardData.concurrencyRetriesOrFailureHandling',
        'Fully understood, no unknowns': 'wizardData.fullyUnderstood',
        'Minor lookup or docs check': 'wizardData.minorLookupOrDocsCheck',
        'Some investigation or spike needed': 'wizardData.someInvestigationOrSpikeNeeded',
        'Implementation approach unclear': 'wizardData.implementationApproachUnclear',
        'Design likely to change during work': 'wizardData.designLikelyToChangeDuringWork',
        'No data impact': 'wizardData.noDataImpact',
        'Schema change only': 'wizardData.schemaChangeOnly',
        'Small migration, easy rollback': 'wizardData.smallMigrationEasyRollback',
        'Large migration or backfill': 'wizardData.largeMigrationOrBackfill',
        'Irreversible or high-risk data change': 'wizardData.irreversibleOrHighRiskDataChange',
        'Solo work': 'wizardData.soloWork',
        'Needs review from another developer': 'wizardData.needsReviewFromAnotherDeveloper',
        'Needs alignment within the team': 'wizardData.needsAlignmentWithinTeam',
        'Cross-team dependency': 'wizardData.crossTeamDependency',
        'External dependency (vendor/infra)': 'wizardData.externalDependency',
        'No tests or trivial validation': 'wizardData.noTestsOrTrivialValidation',
        'Unit tests only': 'wizardData.unitTestsOnly',
        'Integration tests': 'wizardData.integrationTests',
        'End-to-end or staging validation': 'wizardData.endToEndOrStagingValidation',
        'Rollout, monitoring, or manual verification': 'wizardData.rolloutMonitoringOrManualVerification',
        
        // Option labels - Content & Communication
        'Small edit or note': 'wizardData.smallEditOrNote',
        'One complete document': 'wizardData.oneCompleteDocument',
        'Multiple documents': 'wizardData.multipleDocuments',
        'Documentation set or section': 'wizardData.documentationSetOrSection',
        'Living document that defines behavior': 'wizardData.livingDocumentThatDefinesBehavior',
        'Structure is obvious': 'wizardData.structureIsObvious',
        'Light structuring needed': 'wizardData.lightStructuringNeeded',
        'Careful narrative or ordering required': 'wizardData.carefulNarrativeOrOrderingRequired',
        'Conceptual model or abstraction needed': 'wizardData.conceptualModelOrAbstractionNeeded',
        'New terminology or rules must be defined': 'wizardData.newTerminologyOrRulesMustBeDefined',
        'Everything is known': 'wizardData.everythingIsKnown',
        'Minor clarification needed': 'wizardData.minorClarificationNeeded',
        'Requires asking questions or interviews': 'wizardData.requiresAskingQuestionsOrInterviews',
        'Requires exploration or investigation': 'wizardData.requiresExplorationOrInvestigation',
        'Assumptions likely to change mid-work': 'wizardData.assumptionsLikelyToChangeMidWork',
        'Pure rewrite or formatting': 'wizardData.pureRewriteOrFormatting',
        'Summarizing a single clear source': 'wizardData.summarizingSingleClearSource',
        'Reconciling multiple sources': 'wizardData.reconcilingMultipleSources',
        'Information is missing or contradictory': 'wizardData.informationIsMissingOrContradictory',
        'Source of truth must be created': 'wizardData.sourceOfTruthMustBeCreated',
        'No review needed': 'wizardData.noReviewNeeded',
        'One reviewer': 'wizardData.oneReviewer',
        'Multiple reviewers': 'wizardData.multipleReviewers',
        'Conflicting opinions expected': 'wizardData.conflictingOpinionsExpected',
        'Consensus or decision-making required': 'wizardData.consensusOrDecisionMakingRequired',
        'Low-impact internal note': 'wizardData.lowImpactInternalNote',
        'Team reference material': 'wizardData.teamReferenceMaterial',
        'Onboarding or guidance': 'wizardData.onboardingOrGuidance',
        'Process-defining document': 'wizardData.processDefiningDocument',
        'Policy or contract-level document': 'wizardData.policyOrContractLevelDocument',
      }
      
      const translationKey = labelMap[label]
      if (translationKey) {
        return t(translationKey)
      }
      return label // Fallback to original label if not found
    }
  }
}
