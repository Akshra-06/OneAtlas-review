import { ChainRunner, ChainStep } from './chain.runner';
import { ModelRouter } from '../../gateway/router/model.router';
import { ValidationOrchestrator, AppUnderstandingSchema, AppUnderstanding, AppUnderstandingExtractionSchema, normalizeUnderstanding, aiOutputCalibration } from '@oneatlas/validation-engine';
import { AIRequest } from '../../gateway/types/gateway.types';
import { UNDERSTANDING_SYSTEM_PROMPT } from '../system/understanding.system';
import { operationalRealism } from '../../understanding/advanced/operational-realism';
import { antiGeneric } from '../../understanding/advanced/anti-generic';


/**
 * Builds and executes the orchestrated multi-step chain for App Understanding.
 */
export class UnderstandingChain {
  private runner: ChainRunner;
  private router: ModelRouter;

  constructor(router: ModelRouter) {
    this.router = router;
    this.runner = new ChainRunner(router);
  }

  /**
   * Executes the full pipeline: Route -> Generate -> Validate -> Enhance -> Return
   */
  async run(userPrompt: string): Promise<AppUnderstanding> {

    const steps: ChainStep<any>[] = [
      {
        name: 'architecture_extraction',
        taskType: 'ARCHITECTURE_DESIGN',
        execute: async (router, ctx) => {
          // 1. Dynamic Routing: Get the best provider/model for Architecture Design
          const { provider, config } = router.getProviderForTask('ARCHITECTURE_DESIGN');

          // 2. Wrap router in our iron-clad Validation Reliability Pipeline
          const orchestrator = new ValidationOrchestrator(router, 'ARCHITECTURE_DESIGN');

          const request: AIRequest<AppUnderstanding, any> = {
            prompt: ctx.userPrompt,
            systemPrompt: UNDERSTANDING_SYSTEM_PROMPT,
            modelTier: config.preferredTier, // e.g., 'CAPABLE' (GPT-4o)
            schema: AppUnderstandingSchema,
            extractionSchema: AppUnderstandingExtractionSchema,
            normalizer: normalizeUnderstanding,
            schemaName: 'AppUnderstanding',
            maxTokens: 3000
          };

          // 3. Execute with retries, recovery, and strict validation
          const result = await orchestrator.executeWithValidation(request);
          if (!result.success) {
            throw new Error(`Orchestration failed: ${result.error.message}`);
          }

          return result.data;
        }
      },
      {
        name: 'operational_realism_enhancement',
        taskType: 'ENHANCEMENT',
        execute: async (router, ctx) => {
          // Enhance the understanding with operational realism
          const understanding = ctx.architecture_extraction as AppUnderstanding;
          const enhanced = operationalRealism.enhance(understanding as any);

          // Merge enhancements back into understanding
          return {
            ...understanding,
            operationalContext: enhanced.operationalContext,
            realisticKPIs: enhanced.realisticKPIs,
            roleBasedDashboards: enhanced.roleBasedDashboards,
            businessPriorities: enhanced.businessPriorities,
            realisticDataPatterns: enhanced.realisticDataPatterns,
          };
        }
      },
      {
        name: 'anti_generic_detection',
        taskType: 'VALIDATION',
        execute: async (router, ctx) => {
          // Detect and prevent generic patterns
          const understanding = ctx.operational_realism_enhancement as AppUnderstanding;
          const detection = antiGeneric.detectGenericPatterns(understanding as any);

          // If generic patterns are detected, log warnings but don't block
          if (detection.isGeneric) {
            console.warn('Generic patterns detected:', detection.detectedPatterns);
            console.warn('Suggestions:', detection.suggestions);
            console.warn('Diversity score:', detection.diversityScore);
          }

          // Return understanding with detection metadata
          return {
            ...understanding,
            genericPatternDetection: detection,
          };
        }
      },
      {
        name: 'output_calibration',
        taskType: 'CALIBRATION',
        execute: async (router, ctx) => {
          // Calibrate AI output quality across multiple dimensions
          const understanding = ctx.anti_generic_detection as AppUnderstanding;
          const calibration = aiOutputCalibration.calibrate(understanding);

          console.log('=== AI Output Calibration Results ===');
          console.log(`Overall Score: ${calibration.overallScore}/100`);
          console.log(`Output Quality: ${calibration.dimensions.outputQuality.score}/100`);
          console.log(`Domain Differentiation: ${calibration.dimensions.domainDifferentiation.score}/100`);
          console.log(`Workflow Realism: ${calibration.dimensions.workflowRealism.score}/100`);
          console.log(`Layout Diversity: ${calibration.dimensions.layoutDiversity.score}/100`);
          console.log(`Operational Realism: ${calibration.dimensions.operationalRealism.score}/100`);
          console.log(`Anti-Generic: ${calibration.dimensions.antiGeneric.score}/100`);

          if (calibration.recommendations.length > 0) {
            console.log('Recommendations:');
            calibration.recommendations.forEach(rec => console.log(`  - ${rec}`));
          }

          if (calibration.benchmarkComparison) {
            console.log('Benchmark Comparison:');
            console.log(`  vs Previous: ${calibration.benchmarkComparison.vsPrevious}%`);
            console.log(`  vs Baseline: ${calibration.benchmarkComparison.vsBaseline}%`);
            console.log(`  vs Industry: ${calibration.benchmarkComparison.vsIndustry}%`);
          }

          // Return understanding with calibration metrics
          return {
            ...understanding,
            calibrationMetrics: calibration,
          };
        }
      }
      // Future Architecture: We can easily append steps here for 'intent_extraction', 'normalization', etc.
    ];

    // Execute the orchestrated steps
    const finalContext = await this.runner.executeChain<{
      architecture_extraction: AppUnderstanding;
      operational_realism_enhancement: AppUnderstanding;
      anti_generic_detection: AppUnderstanding;
      output_calibration: AppUnderstanding;
    }>(steps, { userPrompt });

    // Return strongly-typed outcome with enhancements
    return finalContext.output_calibration;
  }
}
