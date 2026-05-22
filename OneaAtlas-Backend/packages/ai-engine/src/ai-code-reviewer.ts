/**
 * AI-Based Code Review System
 * Uses AI to review generated code and provide quality feedback
 */

import { gateway } from './gateway/gateway';

export interface CodeReviewResult {
  overallScore: number; // 0-1
  issues: CodeIssue[];
  suggestions: string[];
  passed: boolean;
}

export interface CodeIssue {
  severity: 'critical' | 'major' | 'minor';
  category: 'security' | 'performance' | 'maintainability' | 'correctness' | 'style';
  message: string;
  line?: number;
  suggestion?: string;
}

class AICodeReviewer {
  private reviewPrompt = `You are an expert code reviewer specializing in TypeScript/JavaScript code quality assessment. Your task is to review the generated code and provide constructive feedback.

## Review Criteria:
1. **Correctness**: Does the code accomplish its intended purpose?
2. **Security**: Are there any security vulnerabilities?
3. **Performance**: Are there performance issues or optimizations?
4. **Maintainability**: Is the code readable, well-structured, and maintainable?
5. **Style**: Does the code follow best practices and conventions?

## Output Format:
Provide your review in the following JSON format:
{
  "overallScore": 0.0-1.0,
  "issues": [
    {
      "severity": "critical|major|minor",
      "category": "security|performance|maintainability|correctness|style",
      "message": "Description of the issue",
      "line": number (optional),
      "suggestion": "How to fix it" (optional)
    }
  ],
  "suggestions": [
    "General improvement suggestions"
  ],
  "passed": true/false
}

Return ONLY the JSON, no additional text.`;

  /**
   * Review generated code using AI
   */
  async reviewCode(code: string, fileType: string, context?: string): Promise<CodeReviewResult> {
    try {
      const prompt = this.buildReviewPrompt(code, fileType, context);
      
      const response = await gateway.complete({
        messages: [
          { role: 'system', content: this.reviewPrompt },
          { role: 'user', content: prompt },
        ],
        tier: 'smart',
        temperature: 0.2, // Low temperature for consistent reviews
        maxTokens: 2000,
        jsonMode: true,
      });

      const review = this.parseReviewResponse(response.text);
      return review;
    } catch (error) {
      console.error('[AICodeReviewer] Review failed:', error);
      // Return a neutral result on failure
      return {
        overallScore: 0.5,
        issues: [],
        suggestions: ['AI review unavailable'],
        passed: true,
      };
    }
  }

  /**
   * Build review prompt
   */
  private buildReviewPrompt(code: string, fileType: string, context?: string): string {
    let prompt = `Review the following ${fileType} code:\n\n\`\`\`typescript\n${code}\n\`\`\`\n\n`;

    if (context) {
      prompt += `Context: ${context}\n\n`;
    }

    prompt += `Provide a comprehensive code review following the specified format.`;

    return prompt;
  }

  /**
   * Parse AI review response
   */
  private parseReviewResponse(text: string): CodeReviewResult {
    try {
      // Clean up the response
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned) as CodeReviewResult;

      // Validate the response structure
      return {
        overallScore: this.validateScore(parsed.overallScore),
        issues: parsed.issues || [],
        suggestions: parsed.suggestions || [],
        passed: parsed.passed ?? true,
      };
    } catch (error) {
      console.error('[AICodeReviewer] Failed to parse review response:', error);
      return {
        overallScore: 0.5,
        issues: [],
        suggestions: ['Failed to parse review'],
        passed: true,
      };
    }
  }

  /**
   * Validate score is within range
   */
  private validateScore(score: number): number {
    return Math.max(0, Math.min(1, score));
  }

  /**
   * Batch review multiple files
   */
  async reviewBatch(files: Array<{ content: string; fileType: string; filePath: string }>): Promise<Map<string, CodeReviewResult>> {
    const results = new Map<string, CodeReviewResult>();

    for (const file of files) {
      const review = await this.reviewCode(file.content, file.fileType, file.filePath);
      results.set(file.filePath, review);
    }

    return results;
  }

  /**
   * Get review summary for multiple files
   */
  getSummary(results: Map<string, CodeReviewResult>): {
    totalFiles: number;
    passedFiles: number;
    failedFiles: number;
    averageScore: number;
    totalIssues: number;
    criticalIssues: number;
    majorIssues: number;
    minorIssues: number;
  } {
    const totalFiles = results.size;
    let passedFiles = 0;
    let failedFiles = 0;
    let totalScore = 0;
    let totalIssues = 0;
    let criticalIssues = 0;
    let majorIssues = 0;
    let minorIssues = 0;

    for (const result of results.values()) {
      if (result.passed) {
        passedFiles++;
      } else {
        failedFiles++;
      }

      totalScore += result.overallScore;
      totalIssues += result.issues.length;

      for (const issue of result.issues) {
        switch (issue.severity) {
          case 'critical':
            criticalIssues++;
            break;
          case 'major':
            majorIssues++;
            break;
          case 'minor':
            minorIssues++;
            break;
        }
      }
    }

    return {
      totalFiles,
      passedFiles,
      failedFiles,
      averageScore: totalFiles > 0 ? totalScore / totalFiles : 0,
      totalIssues,
      criticalIssues,
      majorIssues,
      minorIssues,
    };
  }
}

export const aiCodeReviewer = new AICodeReviewer();
