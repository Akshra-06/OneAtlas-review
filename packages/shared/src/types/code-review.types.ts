// Shared code review types

export interface CodeReviewResult {
  score: number;
  overallScore?: number;
  issues: string[];
  suggestions: string[];
  isValid: boolean;
}
