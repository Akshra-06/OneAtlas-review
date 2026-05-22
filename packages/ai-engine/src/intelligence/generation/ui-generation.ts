/**
 * UI Generation
 * 
 * Generates UI code from prompts.
 * Converts requirements into actual UI components.
 */

import { logger } from '../../shared/utils/logger';
import { promptToUIReasoning } from '../reasoning/prompt-to-ui-reasoning';
import { uiIntentDetection } from '../reasoning/ui-intent-detection';
import { promptAwareDashboardGenerator } from '../dashboard/prompt-aware-dashboard';
import { dashboardComponentsLibrary } from '../dashboard/dashboard-components';
import { dashboardLayoutSelector } from '../dashboard/dashboard-layouts';

export interface UIGenerationResult {
  code: string;
  components: string[];
  dependencies: string[];
  structure: {
    pages: Array<{ name: string; path: string; components: string[] }>;
    layout: string;
  };
  confidence: number;
}

export interface GenerationConfig {
  framework: 'react' | 'vue' | 'angular';
  styling: 'tailwind' | 'css' | 'styled-components';
  enableOptimization: boolean;
}

const DEFAULT_CONFIG: GenerationConfig = {
  framework: 'react',
  styling: 'tailwind',
  enableOptimization: true,
};

/**
 * UI Generation Engine
 * 
 * Generates UI from prompts:
 * - Component generation
 * - Layout generation
 * - Code generation
 * - Dependency management
 */
export class UIGeneration {
  private config: GenerationConfig;
  private generationHistory: Map<string, UIGenerationResult> = new Map();

  constructor(config: Partial<GenerationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate UI from prompt
   */
  generate(prompt: string): UIGenerationResult {
    // Get reasoning
    const reasoning = promptToUIReasoning.reason(prompt);

    // Get intent detection
    const detection = uiIntentDetection.detect(prompt);

    // Generate dashboard
    const dashboard = promptAwareDashboardGenerator.generate(prompt);

    // Get layout recommendation
    const layoutRec = dashboardLayoutSelector.selectLayout(dashboard.components, reasoning.intent.uiType);

    // Generate code
    const code = this.generateCode(prompt, reasoning, detection, dashboard, layoutRec);

    // Generate component list
    const components = this.generateComponentList(dashboard.components);

    // Generate dependencies
    const dependencies = this.generateDependencies();

    // Generate structure
    const structure = this.generateStructure(dashboard, layoutRec);

    const result: UIGenerationResult = {
      code,
      components,
      dependencies,
      structure,
      confidence: (reasoning.confidence + detection.confidence) / 2,
    };

    // Store generation history
    this.generationHistory.set(prompt, result);

    logger.info('UIGeneration', 'GENERATION_COMPLETE', 'UI generation complete', {
      framework: this.config.framework,
      components: components.length,
      confidence: result.confidence,
    });

    return result;
  }

  /**
   * Generate code from requirements
   */
  private generateCode(
    prompt: string,
    reasoning: import('../reasoning/prompt-to-ui-reasoning').ReasoningResult,
    detection: import('../reasoning/ui-intent-detection').IntentDetectionResult,
    dashboard: import('../dashboard/prompt-aware-dashboard').DashboardGenerationResult,
    layoutRec: import('../dashboard/dashboard-layouts').LayoutRecommendation,
  ): string {
    let code = '';

    if (this.config.framework === 'react') {
      code = this.generateReactCode(prompt, reasoning, detection, dashboard, layoutRec);
    } else if (this.config.framework === 'vue') {
      code = this.generateVueCode(prompt, reasoning, detection, dashboard, layoutRec);
    } else if (this.config.framework === 'angular') {
      code = this.generateAngularCode(prompt, reasoning, detection, dashboard, layoutRec);
    }

    return code;
  }

  /**
   * Generate React code
   */
  private generateReactCode(
    prompt: string,
    reasoning: import('../reasoning/prompt-to-ui-reasoning').ReasoningResult,
    detection: import('../reasoning/ui-intent-detection').IntentDetectionResult,
    dashboard: import('../dashboard/prompt-aware-dashboard').DashboardGenerationResult,
    layoutRec: import('../dashboard/dashboard-layouts').LayoutRecommendation,
  ): string {
    const componentName = this.sanitizeComponentName(prompt);
    let code = `import React from 'react';\n`;

    // Add imports based on styling
    if (this.config.styling === 'tailwind') {
      code += `// Tailwind CSS classes will be used\n`;
    }

    // Add component imports
    code += `\nexport default function ${componentName}() {\n`;
    code += `  return (\n`;
    code += `    <div className="${this.config.styling === 'tailwind' ? 'p-6' : ''}">\n`;

    // Generate component JSX based on dashboard components
    for (const component of dashboard.components) {
      code += this.generateReactComponent(component, this.config.styling);
    }

    code += `    </div>\n`;
    code += `  );\n`;
    code += `}\n`;

    return code;
  }

  /**
   * Generate React component JSX
   */
  private generateReactComponent(
    component: import('../dashboard/prompt-aware-dashboard').DashboardComponent,
    styling: string,
  ): string {
    let jsx = '';

    switch (component.type) {
      case 'metric':
        jsx = `      <div className="bg-white rounded-lg shadow p-4">\n`;
        jsx += `        <h3 className="text-lg font-semibold">${component.title}</h3>\n`;
        jsx += `        <p className="text-3xl font-bold mt-2">--</p>\n`;
        jsx += `      </div>\n`;
        break;
      case 'chart':
        jsx = `      <div className="bg-white rounded-lg shadow p-4">\n`;
        jsx += `        <h3 className="text-lg font-semibold">${component.title}</h3>\n`;
        jsx += `        <div className="mt-4 h-64 bg-gray-100 rounded"></div>\n`;
        jsx += `      </div>\n`;
        break;
      case 'table':
        jsx = `      <div className="bg-white rounded-lg shadow p-4">\n`;
        jsx += `        <h3 className="text-lg font-semibold">${component.title}</h3>\n`;
        jsx += `        <table className="w-full mt-4">\n`;
        jsx += `          <thead>\n`;
        jsx += `            <tr>\n`;
        jsx += `              <th className="text-left p-2">Column 1</th>\n`;
        jsx += `              <th className="text-left p-2">Column 2</th>\n`;
        jsx += `            </tr>\n`;
        jsx += `          </thead>\n`;
        jsx += `          <tbody>\n`;
        jsx += `            <tr>\n`;
        jsx += `              <td className="p-2">Data 1</td>\n`;
        jsx += `              <td className="p-2">Data 2</td>\n`;
        jsx += `            </tr>\n`;
        jsx += `          </tbody>\n`;
        jsx += `        </table>\n`;
        jsx += `      </div>\n`;
        break;
      case 'filter':
        jsx = `      <div className="bg-white rounded-lg shadow p-4">\n`;
        jsx += `        <h3 className="text-lg font-semibold">${component.title}</h3>\n`;
        jsx += `        <div className="mt-4 space-y-2">\n`;
        jsx += `          <input type="text" placeholder="Filter..." className="w-full p-2 border rounded" />\n`;
        jsx += `        </div>\n`;
        jsx += `      </div>\n`;
        break;
      default:
        jsx = `      <div className="bg-white rounded-lg shadow p-4">\n`;
        jsx += `        <h3 className="text-lg font-semibold">${component.title}</h3>\n`;
        jsx += `        <p className="mt-2">${component.description}</p>\n`;
        jsx += `      </div>\n`;
    }

    return jsx;
  }

  /**
   * Generate Vue code
   */
  private generateVueCode(
    prompt: string,
    reasoning: import('../reasoning/prompt-to-ui-reasoning').ReasoningResult,
    detection: import('../reasoning/ui-intent-detection').IntentDetectionResult,
    dashboard: import('../dashboard/prompt-aware-dashboard').DashboardGenerationResult,
    layoutRec: import('../dashboard/dashboard-layouts').LayoutRecommendation,
  ): string {
    const componentName = this.sanitizeComponentName(prompt);
    let code = `<template>\n`;
    code += `  <div class="p-6">\n`;

    for (const component of dashboard.components) {
      code += this.generateVueComponent(component);
    }

    code += `  </div>\n`;
    code += `</template>\n\n`;
    code += `<script setup>\n`;
    code += `// Component logic here\n`;
    code += `</script>\n\n`;
    code += `<style scoped>\n`;
    code += `/* Component styles here */\n`;
    code += `</style>\n`;

    return code;
  }

  /**
   * Generate Vue component
   */
  private generateVueComponent(
    component: import('../dashboard/prompt-aware-dashboard').DashboardComponent,
  ): string {
    let template = '';

    switch (component.type) {
      case 'metric':
        template = `    <div class="bg-white rounded-lg shadow p-4">\n`;
        template += `      <h3 class="text-lg font-semibold">${component.title}</h3>\n`;
        template += `      <p class="text-3xl font-bold mt-2">--</p>\n`;
        template += `    </div>\n`;
        break;
      case 'chart':
        template = `    <div class="bg-white rounded-lg shadow p-4">\n`;
        template += `      <h3 class="text-lg font-semibold">${component.title}</h3>\n`;
        template += `      <div class="mt-4 h-64 bg-gray-100 rounded"></div>\n`;
        template += `    </div>\n`;
        break;
      default:
        template = `    <div class="bg-white rounded-lg shadow p-4">\n`;
        template += `      <h3 class="text-lg font-semibold">${component.title}</h3>\n`;
        template += `      <p class="mt-2">${component.description}</p>\n`;
        template += `    </div>\n`;
    }

    return template;
  }

  /**
   * Generate Angular code
   */
  private generateAngularCode(
    prompt: string,
    reasoning: import('../reasoning/prompt-to-ui-reasoning').ReasoningResult,
    detection: import('../reasoning/ui-intent-detection').IntentDetectionResult,
    dashboard: import('../dashboard/prompt-aware-dashboard').DashboardGenerationResult,
    layoutRec: import('../dashboard/dashboard-layouts').LayoutRecommendation,
  ): string {
    const componentName = this.sanitizeComponentName(prompt);
    let code = `import { Component } from '@angular/core';\n\n`;
    code += `@Component({\n`;
    code += `  selector: 'app-${componentName.toLowerCase()}',\n`;
    code += `  template: \`\n`;
    code += `<div class="p-6">\n`;

    for (const component of dashboard.components) {
      code += this.generateAngularComponent(component);
    }

    code += `</div>\n`;
    code += `\`,\n`;
    code += `  styles: [\`\n`;
    code += `/* Component styles */\n`;
    code += `\`]\n`;
    code += `})\n`;
    code += `export class ${componentName}Component {\n`;
    code += `  // Component logic\n`;
    code += `}\n`;

    return code;
  }

  /**
   * Generate Angular component
   */
  private generateAngularComponent(
    component: import('../dashboard/prompt-aware-dashboard').DashboardComponent,
  ): string {
    let template = '';

    switch (component.type) {
      case 'metric':
        template = `<div class="bg-white rounded-lg shadow p-4">\n`;
        template += `  <h3 class="text-lg font-semibold">${component.title}</h3>\n`;
        template += `  <p class="text-3xl font-bold mt-2">--</p>\n`;
        template += `</div>\n`;
        break;
      default:
        template = `<div class="bg-white rounded-lg shadow p-4">\n`;
        template += `  <h3 class="text-lg font-semibold">${component.title}</h3>\n`;
        template += `  <p class="mt-2">${component.description}</p>\n`;
        template += `</div>\n`;
    }

    return template;
  }

  /**
   * Generate component list
   */
  private generateComponentList(
    components: import('../dashboard/prompt-aware-dashboard').DashboardComponent[],
  ): string[] {
    return components.map(c => `${c.type}-${c.id}`);
  }

  /**
   * Generate dependencies
   */
  private generateDependencies(): string[] {
    const dependencies: string[] = [];

    if (this.config.framework === 'react') {
      dependencies.push('react');
      dependencies.push('react-dom');
      if (this.config.styling === 'tailwind') {
        dependencies.push('tailwindcss');
      }
    } else if (this.config.framework === 'vue') {
      dependencies.push('vue');
    } else if (this.config.framework === 'angular') {
      dependencies.push('@angular/core');
      dependencies.push('@angular/common');
    }

    return dependencies;
  }

  /**
   * Generate structure
   */
  private generateStructure(
    dashboard: import('../dashboard/prompt-aware-dashboard').DashboardGenerationResult,
    layoutRec: import('../dashboard/dashboard-layouts').LayoutRecommendation,
  ): {
    pages: Array<{ name: string; path: string; components: string[] }>;
    layout: string;
  } {
    return {
      pages: [
        {
          name: dashboard.dashboard.name,
          path: '/',
          components: dashboard.components.map(c => c.id),
        },
      ],
      layout: layoutRec.layout.type,
    };
  }

  /**
   * Sanitize component name
   */
  private sanitizeComponentName(prompt: string): string {
    const words = prompt.split(' ').slice(0, 3);
    const componentName = words
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
    return componentName.replace(/[^a-zA-Z0-9]/g, '') || 'GeneratedComponent';
  }

  /**
   * Get generation history
   */
  getGenerationHistory(prompt?: string): UIGenerationResult | Map<string, UIGenerationResult> | undefined {
    if (prompt) {
      return this.generationHistory.get(prompt);
    }
    return this.generationHistory;
  }

  /**
   * Clear generation history
   */
  clearHistory(): void {
    this.generationHistory.clear();

    logger.info('UIGeneration', 'HISTORY_CLEARED', 'Generation history cleared');
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalGenerations: number;
    averageConfidence: number;
    frameworkDistribution: Record<string, number>;
  } {
    const history = Array.from(this.generationHistory.values());
    const averageConfidence = history.length > 0
      ? history.reduce((sum, r) => sum + r.confidence, 0) / history.length
      : 0;

    const frameworkDistribution: Record<string, number> = {
      react: 0,
      vue: 0,
      angular: 0,
    };

    const currentFramework = this.config.framework;
    if (currentFramework && frameworkDistribution[currentFramework] !== undefined) {
      frameworkDistribution[currentFramework]++;
    }

    return {
      totalGenerations: history.length,
      averageConfidence,
      frameworkDistribution,
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<GenerationConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('UIGeneration', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): GenerationConfig {
    return { ...this.config };
  }
}

export const uiGeneration = new UIGeneration();
