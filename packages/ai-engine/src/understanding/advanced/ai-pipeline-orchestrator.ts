/**
 * AI Pipeline Orchestrator
 * 
 * Integrates all AI pipeline hardening systems into a robust production-grade reasoning system:
 * - Prompt analyzer and enhancer
 * - Entity intelligence hardening
 * - Workflow reasoning expansion
 * - Generation memory and consistency
 * - Edge case recovery
 * - Anti-generic pattern detection
 * - Operational realism enhancement
 * - Pipeline observability tracking
 */

import { promptAnalyzer } from './prompt-analyzer';
import { promptEnhancer } from './prompt-enhancer';
import { entityIntelligence } from './entity-intelligence';
import { workflowIntelligence } from './workflow-intelligence';
import { generationMemory } from './generation-memory';
import { edgeCaseRecovery } from './edge-case-recovery';
import { antiGeneric } from './anti-generic';
import { operationalRealism } from './operational-realism';
import { pipelineObservability } from './pipeline-observability';

import type { AppUnderstanding } from '@oneatlas/shared';

export interface PipelineResult {
  success: boolean;
  enhancedPrompt: string;
  understanding: AppUnderstanding;
  validationResults: {
    promptAnalysis: any;
    entityValidation: any;
    workflowAnalysis: any;
    consistencyCheck: any;
    edgeCaseDetection: any;
    genericPatternDetection: any;
  };
  enhancements: {
    realism: any;
    suggestions: string[];
  };
  traceId: string;
  explanation: string;
  confidence: number;
  warnings: string[];
}

export class AIPipelineOrchestrator {
  /**
   * Run the complete AI pipeline with all hardening systems
   */
  async runPipeline(prompt: string, initialUnderstanding: AppUnderstanding): Promise<PipelineResult> {
    // Start pipeline observability trace
    const traceId = pipelineObservability.startTrace(prompt);
    
    const warnings: string[] = [];
    const suggestions: string[] = [];
    let confidence = 1.0;

    try {
      // STAGE 1: Prompt Analysis and Enhancement
      pipelineObservability.logStage('prompt_analysis', { prompt }, {}, 0.9);
      const promptAnalysis = promptAnalyzer.analyze(prompt);
      pipelineObservability.logDecision('style', 'Analyze prompt', ['Skip analysis'], 'Analyze prompt complexity and characteristics', promptAnalysis.confidence, 'medium');
      
      const enhancedPromptResult = promptEnhancer.enhance(prompt);
      const enhancedPrompt = enhancedPromptResult.enhanced;
      pipelineObservability.logExplanation('prompt', 'Enhanced prompt for better understanding', ['Added missing context', 'Resolved ambiguity'], promptAnalysis.confidence);

      // STAGE 2: Entity Intelligence Hardening
      pipelineObservability.logStage('entity_hardening', { entities: initialUnderstanding.entities }, {}, 0.85);
      const entityValidation = entityIntelligence.validate(initialUnderstanding.entities);
      const entityRepairSuggestions = entityIntelligence.generateRepairSuggestions(entityValidation);
      
      if (!entityValidation.isValid) {
        const repairedEntities = entityIntelligence.autoRepair(initialUnderstanding.entities);
        initialUnderstanding.entities = repairedEntities;
        warnings.push(`Entity validation issues detected: ${entityValidation.duplicates.length} duplicates, ${entityValidation.circularRelations.length} circular relations`);
        suggestions.push(...entityRepairSuggestions.map(s => s.suggestion));
        confidence -= 0.1;
      }

      pipelineObservability.logDecision('entity', 'Validate and harden entities', entityRepairSuggestions.map(s => s.suggestion), 'Ensure entity schema quality', entityValidation.score, 'high');

      // STAGE 3: Workflow Reasoning Expansion
      pipelineObservability.logStage('workflow_reasoning', { workflows: initialUnderstanding.workflows, entities: initialUnderstanding.entities }, {}, 0.85);
      const workflowAnalysis = workflowIntelligence.analyze(initialUnderstanding.workflows, initialUnderstanding.entities);
      const workflowEnhancements = workflowIntelligence.generateEnhancements(workflowAnalysis);
      
      if (workflowEnhancements.length > 0) {
        const enhancedWorkflows = workflowIntelligence.enhanceWorkflows(initialUnderstanding.workflows, workflowAnalysis);
        initialUnderstanding.workflows = enhancedWorkflows;
        suggestions.push(...workflowEnhancements.map(e => e.suggestion));
      }

      pipelineObservability.logDecision('workflow', 'Analyze and enhance workflows', workflowEnhancements.map(e => e.suggestion), 'Improve workflow intelligence', workflowAnalysis.confidence, 'high');

      // STAGE 4: Context Persistence and Consistency
      pipelineObservability.logStage('consistency_check', { understanding: initialUnderstanding }, {}, 0.9);
      generationMemory.startSession(prompt);
      generationMemory.updateUnderstanding(initialUnderstanding);
      
      const consistencyCheck = generationMemory.checkConsistency(initialUnderstanding);
      if (!consistencyCheck.isConsistent) {
        warnings.push(`Consistency drift detected: ${consistencyCheck.driftAreas.join(', ')}`);
        suggestions.push(...consistencyCheck.suggestions);
        confidence -= 0.05;
      }

      pipelineObservability.logDecision('style', 'Check generation consistency', consistencyCheck.suggestions, 'Maintain consistency across generations', consistencyCheck.confidence, 'medium');

      // STAGE 5: Edge Case Detection and Recovery
      pipelineObservability.logStage('edge_case_detection', { understanding: initialUnderstanding }, {}, 0.85);
      const edgeCaseDetection = edgeCaseRecovery.detectEdgeCases(initialUnderstanding);
      
      if (edgeCaseDetection.length > 0) {
        const recoveryResult = edgeCaseRecovery.recover(initialUnderstanding, edgeCaseDetection);
        initialUnderstanding = recoveryResult.recoveredUnderstanding;
        warnings.push(...recoveryResult.warnings);
        suggestions.push(`Recovery action: ${recoveryResult.recoveryAction}`);
        confidence = recoveryResult.confidence;
      }

      pipelineObservability.logDecision('recovery', 'Detect and recover from edge cases', edgeCaseDetection.map(e => e.description), 'Handle edge cases gracefully', confidence, 'high');

      // STAGE 6: Anti-Generic Pattern Detection
      pipelineObservability.logStage('anti_generic_check', { understanding: initialUnderstanding }, {}, 0.85);
      const genericPatternDetection = antiGeneric.detectGenericPatterns(initialUnderstanding);
      
      if (genericPatternDetection.isGeneric) {
        warnings.push(`Generic patterns detected: ${genericPatternDetection.detectedPatterns.map(p => p.patternType).join(', ')}`);
        suggestions.push(...genericPatternDetection.suggestions);
        confidence -= 0.1;
      }

      pipelineObservability.logDecision('style', 'Detect generic patterns', genericPatternDetection.suggestions, 'Prevent repetitive generic patterns', genericPatternDetection.confidence, 'medium');

      // STAGE 7: Operational Realism Enhancement
      pipelineObservability.logStage('operational_realism', { understanding: initialUnderstanding }, {}, 0.9);
      const realism = operationalRealism.enhance(initialUnderstanding);
      
      // Apply realism enhancements to understanding
      // (In a real implementation, this would modify the understanding structure)
      suggestions.push(`Generated ${realism.realisticKPIs.length} realistic KPIs`);
      suggestions.push(`Generated ${realism.roleBasedDashboards.length} role-based dashboards`);
      suggestions.push(`Inferred ${realism.businessPriorities.length} business priorities`);

      pipelineObservability.logDecision('style', 'Add operational realism', ['Skip realism'], 'Generate realistic business context', 0.9, 'high');

      // STAGE 8: Final Validation
      pipelineObservability.logStage('final_validation', { understanding: initialUnderstanding }, {}, 0.95);
      
      const finalValidation = this.performFinalValidation(initialUnderstanding);
      if (!finalValidation.isValid) {
        warnings.push(...finalValidation.issues);
        confidence -= 0.05;
      }

      // End trace and generate explanation
      const trace = pipelineObservability.endTrace();
      const explanation = pipelineObservability.generateExplanation(trace || { 
        traceId: '', 
        timestamp: 0, 
        prompt, 
        stages: [], 
        decisions: [], 
        explanations: [], 
        metrics: { totalDuration: 0, stageDurations: new Map(), decisionCount: 0, confidenceScore: confidence, recoveryCount: 0, warningCount: warnings.length } 
      });

      return {
        success: true,
        enhancedPrompt,
        understanding: initialUnderstanding,
        validationResults: {
          promptAnalysis,
          entityValidation,
          workflowAnalysis,
          consistencyCheck,
          edgeCaseDetection,
          genericPatternDetection,
        },
        enhancements: {
          realism,
          suggestions,
        },
        traceId,
        explanation,
        confidence: Math.max(0, confidence),
        warnings,
      };

    } catch (error) {
      pipelineObservability.logDecision('recovery', 'Error recovery', ['Fail'], 'Handle pipeline error gracefully', 0.5, 'high');
      
      return {
        success: false,
        enhancedPrompt: prompt,
        understanding: initialUnderstanding,
        validationResults: {
          promptAnalysis: null,
          entityValidation: null,
          workflowAnalysis: null,
          consistencyCheck: null,
          edgeCaseDetection: null,
          genericPatternDetection: null,
        },
        enhancements: {
          realism: null,
          suggestions: ['Pipeline encountered an error - using fallback'],
        },
        traceId,
        explanation: 'Pipeline failed - using fallback understanding',
        confidence: 0.5,
        warnings: [`Pipeline error: ${error}`],
      };
    }
  }

  /**
   * Perform final validation on understanding
   */
  private performFinalValidation(understanding: AppUnderstanding): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];

    // Check for required fields
    if (!understanding.appName || understanding.appName.length === 0) {
      issues.push('App name is missing');
    }

    if (understanding.entities.length === 0) {
      issues.push('No entities defined');
    }

    if (understanding.pages.length === 0) {
      issues.push('No pages defined');
    }

    // Check for data consistency
    const entityNames = new Set(understanding.entities.map(e => e.name));
    for (const page of understanding.pages) {
      for (const requiredEntity of page.requiredEntities) {
        if (!entityNames.has(requiredEntity)) {
          issues.push(`Page "${page.name}" requires missing entity "${requiredEntity}"`);
        }
      }
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  }

  /**
   * Get pipeline statistics
   */
  getStatistics() {
    return pipelineObservability.getStatistics();
  }

  /**
   * Get trace by ID
   */
  getTrace(traceId: string) {
    return pipelineObservability.getTrace(traceId);
  }

  /**
   * Clear all pipeline data
   */
  clearAll() {
    pipelineObservability.clearTraces();
    generationMemory.clearMemory();
    antiGeneric.clearHistory();
  }
}

export const aiPipelineOrchestrator = new AIPipelineOrchestrator();
