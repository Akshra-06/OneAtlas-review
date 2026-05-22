/**
 * Intelligence Evaluator
 * 
 * Comprehensive evaluation of semantic intelligence layer.
 * Tests classification, reasoning, and generation quality.
 */

import { logger } from '../../shared/utils/logger';
import { domainClassifier } from '../classification/domain-classifier';
import { domainKnowledgeBase } from '../knowledge/domain-knowledge-base';
import { workflowInference } from '../workflow/workflow-inference';
import { promptToUIReasoning } from '../reasoning/prompt-to-ui-reasoning';
import { uiIntentDetection } from '../reasoning/ui-intent-detection';
import { promptAwareDashboardGenerator } from '../dashboard/prompt-aware-dashboard';
import { dashboardLayoutSelector } from '../dashboard/dashboard-layouts';

export interface TestCase {
  id: string;
  prompt: string;
  expectedDomain: string;
  expectedUIType?: string;
  complexity: 'simple' | 'moderate' | 'complex';
  industry: string;
}

export interface TestResult {
  testCase: TestCase;
  domainClassification: {
    predicted: string;
    expected: string;
    correct: boolean;
    confidence: number;
  };
  workflowInference: {
    workflowName: string;
    stepsCount: number;
    confidence: number;
  };
  uiReasoning: {
    uiType: string;
    complexity: string;
    requirementsCount: number;
    confidence: number;
  };
  dashboardGeneration: {
    componentsCount: number;
    layoutType: string;
    confidence: number;
  };
  issues: string[];
  score: number;
}

export interface EvaluationReport {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  overallScore: number;
  domainAccuracy: number;
  workflowQuality: number;
  reasoningQuality: number;
  dashboardRelevance: number;
  layoutAdaptability: number;
  hallucinationRate: number;
  genericRepetitionRate: number;
  failurePatterns: string[];
  topWeaknesses: string[];
  recommendations: string[];
  detailedResults: TestResult[];
}

/**
 * Intelligence Evaluator
 * 
 * Evaluates intelligence layer quality:
 * - Domain classification accuracy
 * - Workflow inference quality
 * - Prompt-to-UI reasoning
 * - Dashboard relevance
 * - Layout adaptability
 * - Hallucination detection
 * - Generic repetition analysis
 */
export class IntelligenceEvaluator {
  private testCases: TestCase[] = [];
  private results: TestResult[] = [];

  constructor() {
    this.initializeTestCases();
  }

  /**
   * Initialize test cases across industries
   */
  private initializeTestCases(): void {
    // E-commerce test cases
    this.testCases.push(
      { id: 'ec-1', prompt: 'Create an online store dashboard to track sales and inventory', expectedDomain: 'ecommerce', complexity: 'moderate', industry: 'ecommerce' },
      { id: 'ec-2', prompt: 'Build a product catalog with filtering and search', expectedDomain: 'ecommerce', complexity: 'moderate', industry: 'ecommerce' },
      { id: 'ec-3', prompt: 'Shopping cart checkout process with payment integration', expectedDomain: 'ecommerce', complexity: 'complex', industry: 'ecommerce' },
      { id: 'ec-4', prompt: 'Customer order history and tracking page', expectedDomain: 'ecommerce', complexity: 'simple', industry: 'ecommerce' },
      { id: 'ec-5', prompt: 'Product reviews and ratings management', expectedDomain: 'ecommerce', complexity: 'moderate', industry: 'ecommerce' },
    );

    // Healthcare test cases
    this.testCases.push(
      { id: 'hc-1', prompt: 'Patient management system with appointment scheduling', expectedDomain: 'healthcare', complexity: 'complex', industry: 'healthcare' },
      { id: 'hc-2', prompt: 'Medical records viewer with patient history', expectedDomain: 'healthcare', complexity: 'moderate', industry: 'healthcare' },
      { id: 'hc-3', prompt: 'Doctor availability and booking calendar', expectedDomain: 'healthcare', complexity: 'moderate', industry: 'healthcare' },
      { id: 'hc-4', prompt: 'Prescription management and drug interactions', expectedDomain: 'healthcare', complexity: 'complex', industry: 'healthcare' },
      { id: 'hc-5', prompt: 'Patient vital signs monitoring dashboard', expectedDomain: 'healthcare', complexity: 'moderate', industry: 'healthcare' },
    );

    // Finance test cases
    this.testCases.push(
      { id: 'fi-1', prompt: 'Banking dashboard with account balances and transactions', expectedDomain: 'finance', complexity: 'moderate', industry: 'finance' },
      { id: 'fi-2', prompt: 'Investment portfolio tracker with performance charts', expectedDomain: 'finance', complexity: 'complex', industry: 'finance' },
      { id: 'fi-3', prompt: 'Budget management and expense tracking', expectedDomain: 'finance', complexity: 'moderate', industry: 'finance' },
      { id: 'fi-4', prompt: 'Loan application and approval workflow', expectedDomain: 'finance', complexity: 'complex', industry: 'finance' },
      { id: 'fi-5', prompt: 'Financial reports and tax documents viewer', expectedDomain: 'finance', complexity: 'moderate', industry: 'finance' },
    );

    // Project management test cases
    this.testCases.push(
      { id: 'pm-1', prompt: 'Project management dashboard with task tracking', expectedDomain: 'project_management', complexity: 'moderate', industry: 'project_management' },
      { id: 'pm-2', prompt: 'Kanban board for sprint planning', expectedDomain: 'project_management', complexity: 'simple', industry: 'project_management' },
      { id: 'pm-3', prompt: 'Gantt chart for project timeline visualization', expectedDomain: 'project_management', complexity: 'moderate', industry: 'project_management' },
      { id: 'pm-4', prompt: 'Team workload and resource allocation', expectedDomain: 'project_management', complexity: 'complex', industry: 'project_management' },
      { id: 'pm-5', prompt: 'Task assignment and progress tracking', expectedDomain: 'project_management', complexity: 'simple', industry: 'project_management' },
    );

    // CRM test cases
    this.testCases.push(
      { id: 'crm-1', prompt: 'Customer relationship management with sales pipeline', expectedDomain: 'crm', complexity: 'complex', industry: 'crm' },
      { id: 'crm-2', prompt: 'Lead management and scoring system', expectedDomain: 'crm', complexity: 'moderate', industry: 'crm' },
      { id: 'crm-3', prompt: 'Customer communication history and timeline', expectedDomain: 'crm', complexity: 'moderate', industry: 'crm' },
      { id: 'crm-4', prompt: 'Deal tracking and opportunity management', expectedDomain: 'crm', complexity: 'moderate', industry: 'crm' },
      { id: 'crm-5', prompt: 'Campaign management and analytics', expectedDomain: 'crm', complexity: 'complex', industry: 'crm' },
    );

    // Analytics test cases
    this.testCases.push(
      { id: 'an-1', prompt: 'Business analytics dashboard with KPI metrics', expectedDomain: 'analytics', complexity: 'moderate', industry: 'analytics' },
      { id: 'an-2', prompt: 'Data visualization with interactive charts', expectedDomain: 'analytics', complexity: 'moderate', industry: 'analytics' },
      { id: 'an-3', prompt: 'Real-time data monitoring and alerts', expectedDomain: 'analytics', complexity: 'complex', industry: 'analytics' },
      { id: 'an-4', prompt: 'Report generation and export functionality', expectedDomain: 'analytics', complexity: 'simple', industry: 'analytics' },
      { id: 'an-5', prompt: 'Trend analysis and forecasting dashboard', expectedDomain: 'analytics', complexity: 'complex', industry: 'analytics' },
    );

    // HR test cases
    this.testCases.push(
      { id: 'hr-1', prompt: 'Employee management system with onboarding', expectedDomain: 'hr', complexity: 'complex', industry: 'hr' },
      { id: 'hr-2', prompt: 'Recruitment pipeline and candidate tracking', expectedDomain: 'hr', complexity: 'moderate', industry: 'hr' },
      { id: 'hr-3', prompt: 'Payroll management and salary administration', expectedDomain: 'hr', complexity: 'complex', industry: 'hr' },
      { id: 'hr-4', prompt: 'Leave management and attendance tracking', expectedDomain: 'hr', complexity: 'moderate', industry: 'hr' },
      { id: 'hr-5', prompt: 'Performance review and training records', expectedDomain: 'hr', complexity: 'moderate', industry: 'hr' },
    );

    // CMS test cases
    this.testCases.push(
      { id: 'cms-1', prompt: 'Content management system with blog editor', expectedDomain: 'cms', complexity: 'moderate', industry: 'cms' },
      { id: 'cms-2', prompt: 'Media library with image upload and management', expectedDomain: 'cms', complexity: 'simple', industry: 'cms' },
      { id: 'cms-3', prompt: 'Content calendar and publishing scheduler', expectedDomain: 'cms', complexity: 'moderate', industry: 'cms' },
      { id: 'cms-4', prompt: 'Page builder with drag and drop components', expectedDomain: 'cms', complexity: 'complex', industry: 'cms' },
      { id: 'cms-5', prompt: 'Comment moderation and content approval', expectedDomain: 'cms', complexity: 'moderate', industry: 'cms' },
    );

    // Inventory test cases
    this.testCases.push(
      { id: 'inv-1', prompt: 'Inventory management with stock tracking', expectedDomain: 'inventory', complexity: 'moderate', industry: 'inventory' },
      { id: 'inv-2', prompt: 'Warehouse management and location tracking', expectedDomain: 'inventory', complexity: 'complex', industry: 'inventory' },
      { id: 'inv-3', prompt: 'Shipment tracking and fulfillment', expectedDomain: 'inventory', complexity: 'moderate', industry: 'inventory' },
      { id: 'inv-4', prompt: 'Supplier management and purchase orders', expectedDomain: 'inventory', complexity: 'moderate', industry: 'inventory' },
      { id: 'inv-5', prompt: 'Low stock alerts and reorder management', expectedDomain: 'inventory', complexity: 'simple', industry: 'inventory' },
    );

    // Education test cases
    this.testCases.push(
      { id: 'edu-1', prompt: 'Learning management system with course catalog', expectedDomain: 'education', complexity: 'moderate', industry: 'education' },
      { id: 'edu-2', prompt: 'Student progress tracking and grades', expectedDomain: 'education', complexity: 'moderate', industry: 'education' },
      { id: 'edu-3', prompt: 'Assignment submission and grading workflow', expectedDomain: 'education', complexity: 'complex', industry: 'education' },
      { id: 'edu-4', prompt: 'Class schedule and attendance management', expectedDomain: 'education', complexity: 'moderate', industry: 'education' },
      { id: 'edu-5', prompt: 'Teacher dashboard with student analytics', expectedDomain: 'education', complexity: 'moderate', industry: 'education' },
    );

    // Ambiguous/edge cases
    this.testCases.push(
      { id: 'edge-1', prompt: 'Create a dashboard for managing items', expectedDomain: 'generic', complexity: 'simple', industry: 'generic' },
      { id: 'edge-2', prompt: 'Build a system to track data', expectedDomain: 'generic', complexity: 'simple', industry: 'generic' },
      { id: 'edge-3', prompt: 'Show me a list of things', expectedDomain: 'generic', complexity: 'simple', industry: 'generic' },
      { id: 'edge-4', prompt: 'I need a form to input information', expectedDomain: 'generic', complexity: 'simple', industry: 'generic' },
      { id: 'edge-5', prompt: 'Display some charts and metrics', expectedDomain: 'analytics', complexity: 'moderate', industry: 'generic' },
    );

    logger.info('IntelligenceEvaluator', 'TEST_CASES_INITIALIZED', 'Test cases initialized', {
      total: this.testCases.length,
    });
  }

  /**
   * Run all tests
   */
  runTests(): EvaluationReport {
    this.results = [];

    for (const testCase of this.testCases) {
      const result = this.runTest(testCase);
      this.results.push(result);
    }

    return this.generateReport();
  }

  /**
   * Run single test
   */
  private runTest(testCase: TestCase): TestResult {
    const issues: string[] = [];
    let score = 100;

    // Test domain classification
    const classification = domainClassifier.classify(testCase.prompt);
    const domainCorrect = classification.domain === testCase.expectedDomain;
    if (!domainCorrect) {
      issues.push(`Domain misclassified: expected ${testCase.expectedDomain}, got ${classification.domain}`);
      score -= 20;
    }

    // Test workflow inference
    const workflow = workflowInference.infer(testCase.prompt, classification.domain);
    const workflowQuality = this.evaluateWorkflowQuality(workflow, testCase);
    if (workflowQuality < 0.7) {
      issues.push(`Weak workflow inference: ${workflowQuality.toFixed(2)} quality score`);
      score -= 15;
    }

    // Test UI reasoning
    const reasoning = promptToUIReasoning.reason(testCase.prompt);
    const reasoningQuality = this.evaluateReasoningQuality(reasoning, testCase);
    if (reasoningQuality < 0.7) {
      issues.push(`Shallow UI reasoning: ${reasoningQuality.toFixed(2)} quality score`);
      score -= 15;
    }

    // Test dashboard generation
    const dashboard = promptAwareDashboardGenerator.generate(testCase.prompt);
    const dashboardRelevance = this.evaluateDashboardRelevance(dashboard, testCase);
    if (dashboardRelevance < 0.7) {
      issues.push(`Mismatched dashboard: ${dashboardRelevance.toFixed(2)} relevance score`);
      score -= 15;
    }

    // Test layout selection
    const layoutRec = dashboardLayoutSelector.selectLayout(dashboard.components, classification.domain);
    const layoutAdaptability = this.evaluateLayoutAdaptability(layoutRec, testCase);
    if (layoutAdaptability < 0.7) {
      issues.push(`Poor layout adaptability: ${layoutAdaptability.toFixed(2)} adaptability score`);
      score -= 10;
    }

    // Check for hallucinations
    const hallucinationScore = this.detectHallucinations(classification, workflow, reasoning, dashboard);
    if (hallucinationScore > 0.3) {
      issues.push(`Potential hallucinations detected: ${hallucinationScore.toFixed(2)} score`);
      score -= 15;
    }

    // Check for generic repetition
    const repetitionScore = this.detectGenericRepetition(dashboard, layoutRec);
    if (repetitionScore > 0.5) {
      issues.push(`Generic template repetition: ${repetitionScore.toFixed(2)} score`);
      score -= 10;
    }

    const result: TestResult = {
      testCase,
      domainClassification: {
        predicted: classification.domain,
        expected: testCase.expectedDomain,
        correct: domainCorrect,
        confidence: classification.confidence,
      },
      workflowInference: {
        workflowName: workflow.workflow.name,
        stepsCount: workflow.workflow.steps.length,
        confidence: workflow.confidence,
      },
      uiReasoning: {
        uiType: reasoning.intent.uiType,
        complexity: reasoning.intent.complexity,
        requirementsCount: reasoning.requirements.length,
        confidence: reasoning.confidence,
      },
      dashboardGeneration: {
        componentsCount: dashboard.components.length,
        layoutType: dashboard.dashboard.layout,
        confidence: dashboard.confidence,
      },
      issues,
      score: Math.max(0, score),
    };

    logger.info('IntelligenceEvaluator', 'TEST_COMPLETE', 'Test case completed', {
      testId: testCase.id,
      score: result.score,
      issues: issues.length,
    });

    return result;
  }

  /**
   * Evaluate workflow quality
   */
  private evaluateWorkflowQuality(
    workflow: import('../workflow/workflow-inference').InferenceResult,
    testCase: TestCase,
  ): number {
    let quality = 1.0;

    // Check if workflow has reasonable number of steps
    if (workflow.workflow.steps.length < 2) {
      quality -= 0.3;
    } else if (workflow.workflow.steps.length > 10) {
      quality -= 0.2;
    }

    // Check confidence
    if (workflow.confidence < 0.6) {
      quality -= 0.3;
    }

    // Check if workflow matches complexity
    if (testCase.complexity === 'simple' && workflow.workflow.steps.length > 5) {
      quality -= 0.2;
    } else if (testCase.complexity === 'complex' && workflow.workflow.steps.length < 3) {
      quality -= 0.2;
    }

    return Math.max(0, quality);
  }

  /**
   * Evaluate reasoning quality
   */
  private evaluateReasoningQuality(
    reasoning: import('../reasoning/prompt-to-ui-reasoning').ReasoningResult,
    testCase: TestCase,
  ): number {
    let quality = 1.0;

    // Check if requirements are generated
    if (reasoning.requirements.length === 0) {
      quality -= 0.4;
    }

    // Check confidence
    if (reasoning.confidence < 0.6) {
      quality -= 0.3;
    }

    // Check if UI type matches expected
    if (testCase.expectedUIType && reasoning.intent.uiType !== testCase.expectedUIType) {
      quality -= 0.2;
    }

    // Check if complexity matches
    if (reasoning.intent.complexity !== testCase.complexity) {
      quality -= 0.1;
    }

    return Math.max(0, quality);
  }

  /**
   * Evaluate dashboard relevance
   */
  private evaluateDashboardRelevance(
    dashboard: import('../dashboard/prompt-aware-dashboard').DashboardGenerationResult,
    testCase: TestCase,
  ): number {
    let relevance = 1.0;

    // Check if components are generated
    if (dashboard.components.length === 0) {
      relevance -= 0.5;
    }

    // Check if components are domain-specific
    const knowledge = domainKnowledgeBase.getKnowledge(dashboard.domain);
    if (knowledge) {
      const domainSpecificComponents = dashboard.components.filter(c =>
        knowledge.commonEntities.some(e => c.data.includes(e))
      );
      if (domainSpecificComponents.length === 0 && dashboard.components.length > 0) {
        relevance -= 0.3;
      }
    }

    // Check confidence
    if (dashboard.confidence < 0.6) {
      relevance -= 0.2;
    }

    return Math.max(0, relevance);
  }

  /**
   * Evaluate layout adaptability
   */
  private evaluateLayoutAdaptability(
    layoutRec: import('../dashboard/dashboard-layouts').LayoutRecommendation,
    testCase: TestCase,
  ): number {
    let adaptability = 1.0;

    // Check confidence
    if (layoutRec.confidence < 0.6) {
      adaptability -= 0.3;
    }

    // Check if layout matches complexity
    if (testCase.complexity === 'simple' && layoutRec.layout.type === 'tabs') {
      adaptability -= 0.2;
    } else if (testCase.complexity === 'complex' && layoutRec.layout.type === 'stacked') {
      adaptability -= 0.2;
    }

    return Math.max(0, adaptability);
  }

  /**
   * Detect hallucinations
   */
  private detectHallucinations(
    classification: import('../classification/domain-classifier').ClassificationResult,
    workflow: import('../workflow/workflow-inference').InferenceResult,
    reasoning: import('../reasoning/prompt-to-ui-reasoning').ReasoningResult,
    dashboard: import('../dashboard/prompt-aware-dashboard').DashboardGenerationResult,
  ): number {
    let hallucinationScore = 0;

    // Check if domain is generic when it shouldn't be
    if (classification.domain === 'generic' && classification.confidence < 0.5) {
      hallucinationScore += 0.3;
    }

    // Check if workflow has unrealistic steps
    if (workflow.workflow.steps.length > 15) {
      hallucinationScore += 0.2;
    }

    // Check if reasoning has too many requirements
    if (reasoning.requirements.length > 20) {
      hallucinationScore += 0.2;
    }

    // Check if dashboard has too many components
    if (dashboard.components.length > 12) {
      hallucinationScore += 0.2;
    }

    return Math.min(1, hallucinationScore);
  }

  /**
   * Detect generic repetition
   */
  private detectGenericRepetition(
    dashboard: import('../dashboard/prompt-aware-dashboard').DashboardGenerationResult,
    layoutRec: import('../dashboard/dashboard-layouts').LayoutRecommendation,
  ): number {
    let repetitionScore = 0;

    // Check if all components are the same type
    const componentTypes = dashboard.components.map(c => c.type);
    const uniqueTypes = new Set(componentTypes);
    if (uniqueTypes.size === 1 && componentTypes.length > 1) {
      repetitionScore += 0.4;
    }

    // Check if layout is always grid
    if (layoutRec.layout.type === 'grid' && layoutRec.confidence < 0.7) {
      repetitionScore += 0.3;
    }

    // Check if component names are generic
    const genericNames = ['Metric', 'Chart', 'Table', 'List'];
    const genericCount = dashboard.components.filter(c =>
      genericNames.some(gn => c.title.includes(gn))
    ).length;
    if (genericCount === dashboard.components.length && dashboard.components.length > 0) {
      repetitionScore += 0.3;
    }

    return Math.min(1, repetitionScore);
  }

  /**
   * Generate evaluation report
   */
  private generateReport(): EvaluationReport {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.score >= 70).length;
    const failedTests = totalTests - passedTests;
    const overallScore = this.results.reduce((sum, r) => sum + r.score, 0) / totalTests;

    // Calculate individual metrics
    const domainAccuracy = this.results.filter(r => r.domainClassification.correct).length / totalTests;
    const workflowQuality = this.results.reduce((sum, r) => sum + this.evaluateWorkflowQualityFromResult(r), 0) / totalTests;
    const reasoningQuality = this.results.reduce((sum, r) => sum + this.evaluateReasoningQualityFromResult(r), 0) / totalTests;
    const dashboardRelevance = this.results.reduce((sum, r) => sum + this.evaluateDashboardRelevanceFromResult(r), 0) / totalTests;
    const layoutAdaptability = this.results.reduce((sum, r) => sum + this.evaluateLayoutAdaptabilityFromResult(r), 0) / totalTests;

    // Calculate hallucination rate
    const hallucinationRate = this.results.filter(r => r.issues.some(i => i.includes('hallucination'))).length / totalTests;

    // Calculate generic repetition rate
    const genericRepetitionRate = this.results.filter(r => r.issues.some(i => i.includes('generic'))).length / totalTests;

    // Identify failure patterns
    const failurePatterns = this.identifyFailurePatterns();

    // Identify top weaknesses
    const topWeaknesses = this.identifyTopWeaknesses(domainAccuracy, workflowQuality, reasoningQuality, dashboardRelevance, layoutAdaptability);

    // Generate recommendations
    const recommendations = this.generateRecommendations(failurePatterns, topWeaknesses);

    const report: EvaluationReport = {
      totalTests,
      passedTests,
      failedTests,
      overallScore,
      domainAccuracy,
      workflowQuality,
      reasoningQuality,
      dashboardRelevance,
      layoutAdaptability,
      hallucinationRate,
      genericRepetitionRate,
      failurePatterns,
      topWeaknesses,
      recommendations,
      detailedResults: this.results,
    };

    logger.info('IntelligenceEvaluator', 'REPORT_GENERATED', 'Evaluation report generated', {
      totalTests,
      passedTests,
      overallScore: overallScore.toFixed(2),
    });

    return report;
  }

  /**
   * Evaluate workflow quality from result
   */
  private evaluateWorkflowQualityFromResult(result: TestResult): number {
    let quality = 1.0;
    if (result.workflowInference.confidence < 0.6) quality -= 0.3;
    if (result.workflowInference.stepsCount < 2) quality -= 0.2;
    return Math.max(0, quality);
  }

  /**
   * Evaluate reasoning quality from result
   */
  private evaluateReasoningQualityFromResult(result: TestResult): number {
    let quality = 1.0;
    if (result.uiReasoning.confidence < 0.6) quality -= 0.3;
    if (result.uiReasoning.requirementsCount === 0) quality -= 0.4;
    return Math.max(0, quality);
  }

  /**
   * Evaluate dashboard relevance from result
   */
  private evaluateDashboardRelevanceFromResult(result: TestResult): number {
    let quality = 1.0;
    if (result.dashboardGeneration.confidence < 0.6) quality -= 0.3;
    if (result.dashboardGeneration.componentsCount === 0) quality -= 0.5;
    return Math.max(0, quality);
  }

  /**
   * Evaluate layout adaptability from result
   */
  private evaluateLayoutAdaptabilityFromResult(result: TestResult): number {
    let quality = 1.0;
    if (result.issues.some(i => i.includes('layout'))) quality -= 0.3;
    return Math.max(0, quality);
  }

  /**
   * Identify failure patterns
   */
  private identifyFailurePatterns(): string[] {
    const patterns: string[] = [];
    const issueCounts = new Map<string, number>();

    for (const result of this.results) {
      for (const issue of result.issues) {
        const pattern = issue.split(':')[0] || issue;
        issueCounts.set(pattern, (issueCounts.get(pattern) || 0) + 1);
      }
    }

    for (const [pattern, count] of issueCounts.entries()) {
      if (count > this.results.length * 0.2) {
        patterns.push(`${pattern} (${count} occurrences)`);
      }
    }

    return patterns;
  }

  /**
   * Identify top weaknesses
   */
  private identifyTopWeaknesses(
    domainAccuracy: number,
    workflowQuality: number,
    reasoningQuality: number,
    dashboardRelevance: number,
    layoutAdaptability: number,
  ): string[] {
    const weaknesses: string[] = [];

    if (domainAccuracy < 0.8) {
      weaknesses.push(`Domain classification accuracy (${(domainAccuracy * 100).toFixed(0)}%)`);
    }
    if (workflowQuality < 0.8) {
      weaknesses.push(`Workflow inference quality (${(workflowQuality * 100).toFixed(0)}%)`);
    }
    if (reasoningQuality < 0.8) {
      weaknesses.push(`UI reasoning quality (${(reasoningQuality * 100).toFixed(0)}%)`);
    }
    if (dashboardRelevance < 0.8) {
      weaknesses.push(`Dashboard relevance (${(dashboardRelevance * 100).toFixed(0)}%)`);
    }
    if (layoutAdaptability < 0.8) {
      weaknesses.push(`Layout adaptability (${(layoutAdaptability * 100).toFixed(0)}%)`);
    }

    return weaknesses;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(failurePatterns: string[], topWeaknesses: string[]): string[] {
    const recommendations: string[] = [];

    if (topWeaknesses.some(w => w.includes('Domain classification'))) {
      recommendations.push('Expand domain keyword patterns and entity recognition');
      recommendations.push('Add more domain-specific training examples');
    }

    if (topWeaknesses.some(w => w.includes('Workflow inference'))) {
      recommendations.push('Enhance workflow step detection algorithms');
      recommendations.push('Add more workflow pattern templates');
    }

    if (topWeaknesses.some(w => w.includes('UI reasoning'))) {
      recommendations.push('Improve intent extraction from natural language');
      recommendations.push('Add more UI type detection patterns');
    }

    if (topWeaknesses.some(w => w.includes('Dashboard relevance'))) {
      recommendations.push('Enhance domain-specific component generation');
      recommendations.push('Improve component-to-domain mapping');
    }

    if (topWeaknesses.some(w => w.includes('Layout adaptability'))) {
      recommendations.push('Add more layout selection heuristics');
      recommendations.push('Improve complexity-to-layout mapping');
    }

    if (failurePatterns.some(p => p.includes('hallucination'))) {
      recommendations.push('Add confidence thresholds to prevent hallucinations');
      recommendations.push('Implement result validation before output');
    }

    if (failurePatterns.some(p => p.includes('generic'))) {
      recommendations.push('Add more variety to component templates');
      recommendations.push('Implement dynamic component naming');
    }

    return recommendations;
  }

  /**
   * Get test results
   */
  getResults(): TestResult[] {
    return this.results;
  }

  /**
   * Get test cases
   */
  getTestCases(): TestCase[] {
    return this.testCases;
  }
}

export const intelligenceEvaluator = new IntelligenceEvaluator();
