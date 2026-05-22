/**
 * Accessibility Validator
 * 
 * Validates WCAG compliance in generated code.
 * Checks for accessibility issues to ensure generated apps are usable by all users.
 */

import type { GeneratedFile } from '@oneatlas/shared';
import { logger } from '@oneatlas/shared';

export interface AccessibilityValidationIssue {
  id: string;
  type: 'alt_text' | 'aria_label' | 'color_contrast' | 'keyboard_nav' | 'form_label' | 'heading_hierarchy' | 'focus_management' | 'semantic_html';
  wcagLevel: 'A' | 'AA' | 'AAA';
  severity: 'critical' | 'error' | 'warning';
  filePath: string;
  message: string;
  suggestion?: string;
  repairable: boolean;
}

export interface AccessibilityValidationResult {
  valid: boolean;
  issues: AccessibilityValidationIssue[];
  summary: {
    total: number;
    critical: number;
    error: number;
    warning: number;
    wcagA: number;
    wcagAA: number;
    wcagAAA: number;
  };
}

/**
 * Accessibility Validator
 * 
 * Validates:
 * - Alt text on images (WCAG 2.1 A)
 * - ARIA labels (WCAG 2.1 A)
 * - Color contrast (WCAG 2.1 AA)
 * - Keyboard navigation (WCAG 2.1 A)
 * - Form labels (WCAG 2.1 A)
 * - Heading hierarchy (WCAG 2.1 A)
 * - Focus management (WCAG 2.1 A)
 * - Semantic HTML (WCAG 2.1 A)
 */
export class AccessibilityValidator {
  /**
   * Validate generated files for accessibility issues
   */
  validate(files: GeneratedFile[]): AccessibilityValidationResult {
    const issues: AccessibilityValidationIssue[] = [];

    for (const file of files) {
      const fileIssues = this.validateFile(file);
      issues.push(...fileIssues);
    }

    const summary = this.calculateSummary(issues);
    const valid = summary.critical === 0 && summary.error === 0;

    logger.info('AccessibilityValidator', 'VALIDATION_COMPLETE', 'Accessibility validation complete', {
      valid,
      summary,
    });

    return { valid, issues, summary };
  }

  /**
   * Validate a single file
   */
  private validateFile(file: GeneratedFile): AccessibilityValidationIssue[] {
    const issues: AccessibilityValidationIssue[] = [];
    const content = file.content;
    const filePath = file.filePath;

    // Only validate TSX/JSX files
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.jsx')) {
      return issues;
    }

    // Check for alt text issues
    issues.push(...this.checkAltText(content, filePath));

    // Check for ARIA label issues
    issues.push(...this.checkAriaLabels(content, filePath));

    // Check for color contrast issues
    issues.push(...this.checkColorContrast(content, filePath));

    // Check for keyboard navigation issues
    issues.push(...this.checkKeyboardNavigation(content, filePath));

    // Check for form label issues
    issues.push(...this.checkFormLabels(content, filePath));

    // Check for heading hierarchy issues
    issues.push(...this.checkHeadingHierarchy(content, filePath));

    // Check for focus management issues
    issues.push(...this.checkFocusManagement(content, filePath));

    // Check for semantic HTML issues
    issues.push(...this.checkSemanticHtml(content, filePath));

    return issues;
  }

  /**
   * Check for alt text on images
   */
  private checkAltText(content: string, filePath: string): AccessibilityValidationIssue[] {
    const issues: AccessibilityValidationIssue[] = [];

    // Check for images without alt text
    const imgPattern = /<img(?![^>]*alt=)[^>]*>/gi;
    const matches = content.match(imgPattern);

    if (matches) {
      for (const match of matches) {
        issues.push({
          id: crypto.randomUUID(),
          type: 'alt_text',
          wcagLevel: 'A',
          severity: 'error',
          filePath,
          message: 'Image without alt text detected',
          suggestion: 'Add descriptive alt text to the image',
          repairable: true,
        });
      }
    }

    // Check for empty alt text on decorative images
    const emptyAltPattern = /<img[^>]*alt=""[^>]*>/gi;
    const emptyAltMatches = content.match(emptyAltPattern);

    if (emptyAltMatches) {
      for (const match of emptyAltMatches) {
        if (!match.includes('role="presentation"') && !match.includes('aria-hidden="true"')) {
          issues.push({
            id: crypto.randomUUID(),
            type: 'alt_text',
            wcagLevel: 'A',
            severity: 'warning',
            filePath,
            message: 'Image with empty alt text but not marked as decorative',
            suggestion: 'Add role="presentation" or aria-hidden="true" for decorative images',
            repairable: true,
          });
        }
      }
    }

    return issues;
  }

  /**
   * Check for ARIA labels
   */
  private checkAriaLabels(content: string, filePath: string): AccessibilityValidationIssue[] {
    const issues: AccessibilityValidationIssue[] = [];

    // Check for buttons without labels
    const buttonPattern = /<button(?![^>]*(aria-label|aria-labelledby|children))[^>]*>\s*<\/button>/gi;
    const matches = content.match(buttonPattern);

    if (matches) {
      for (const match of matches) {
        issues.push({
          id: crypto.randomUUID(),
          type: 'aria_label',
          wcagLevel: 'A',
          severity: 'error',
          filePath,
          message: 'Button without accessible label detected',
          suggestion: 'Add aria-label, aria-labelledby, or text content to the button',
          repairable: true,
        });
      }
    }

    // Check for icon buttons without labels
    const iconButtonPattern = /<button[^>]*>[\s\S]*?<(?:svg|LucideIcon)[^>]*>[\s\S]*?<\/button>/gi;
    const iconMatches = content.match(iconButtonPattern);

    if (iconMatches) {
      for (const match of iconMatches) {
        if (!match.includes('aria-label') && !match.includes('aria-labelledby') && !match.includes('title=')) {
          issues.push({
            id: crypto.randomUUID(),
            type: 'aria_label',
            wcagLevel: 'A',
            severity: 'error',
            filePath,
            message: 'Icon button without accessible label detected',
            suggestion: 'Add aria-label or title to the icon button',
            repairable: true,
          });
        }
      }
    }

    return issues;
  }

  /**
   * Check for color contrast issues
   */
  private checkColorContrast(content: string, filePath: string): AccessibilityValidationIssue[] {
    const issues: AccessibilityValidationIssue[] = [];

    // Check for hardcoded colors with low contrast (simplified check)
    const lowContrastPatterns = [
      /color:\s*#[e-f][0-9a-f]{5}/gi, // Very light colors
      /color:\s*#[0-9a-f]{2}[0-9a-f]{2}[0-9a-f]{2}/gi, // Dark colors on dark backgrounds (simplified)
    ];

    for (const pattern of lowContrastPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        issues.push({
          id: crypto.randomUUID(),
          type: 'color_contrast',
          wcagLevel: 'AA',
          severity: 'warning',
          filePath,
          message: 'Potential low color contrast detected',
          suggestion: 'Verify color contrast meets WCAG AA standards (4.5:1 for normal text)',
          repairable: false,
        });
        break; // Only report once per file
      }
    }

    return issues;
  }

  /**
   * Check for keyboard navigation issues
   */
  private checkKeyboardNavigation(content: string, filePath: string): AccessibilityValidationIssue[] {
    const issues: AccessibilityValidationIssue[] = [];

    // Check for elements with onClick but no keyboard support
    const onClickPattern = /<div[^>]*onClick=[^>]*>(?![\s\S]*tabIndex)[\s\S]*?<\/div>/gi;
    const matches = content.match(onClickPattern);

    if (matches) {
      for (const match of matches) {
        issues.push({
          id: crypto.randomUUID(),
          type: 'keyboard_nav',
          wcagLevel: 'A',
          severity: 'error',
          filePath,
          message: 'Clickable div without keyboard support detected',
          suggestion: 'Add tabIndex and onKeyDown handlers, or use button element instead',
          repairable: true,
        });
      }
    }

    // Check for custom interactive elements without role
    const interactivePattern = /<(div|span)[^>]*(onClick|onKeyDown)[^>]*>(?![\s\S]*role=)[\s\S]*?<\/\1>/gi;
    const interactiveMatches = content.match(interactivePattern);

    if (interactiveMatches) {
      for (const match of interactiveMatches) {
        issues.push({
          id: crypto.randomUUID(),
          type: 'keyboard_nav',
          wcagLevel: 'A',
          severity: 'warning',
          filePath,
          message: 'Custom interactive element without ARIA role',
          suggestion: 'Add appropriate ARIA role (button, link, etc.)',
          repairable: true,
        });
      }
    }

    return issues;
  }

  /**
   * Check for form label issues
   */
  private checkFormLabels(content: string, filePath: string): AccessibilityValidationIssue[] {
    const issues: AccessibilityValidationIssue[] = [];

    // Check for inputs without labels
    const inputPattern = /<input(?![^>]*(id=|aria-label|aria-labelledby|placeholder))[^>]*>/gi;
    const matches = content.match(inputPattern);

    if (matches) {
      for (const match of matches) {
        // Skip if it's a hidden input
        if (match.includes('type="hidden"')) continue;

        issues.push({
          id: crypto.randomUUID(),
          type: 'form_label',
          wcagLevel: 'A',
          severity: 'error',
          filePath,
          message: 'Input without label detected',
          suggestion: 'Add id to input and associate with label, or add aria-label',
          repairable: true,
        });
      }
    }

    // Check for placeholders used as labels
    const placeholderLabelPattern = /<input[^>]*placeholder=[^>]*>(?![\s\S]*<label)/gi;
    const placeholderMatches = content.match(placeholderLabelPattern);

    if (placeholderMatches) {
      for (const match of placeholderMatches) {
        issues.push({
          id: crypto.randomUUID(),
          type: 'form_label',
          wcagLevel: 'A',
          severity: 'warning',
          filePath,
          message: 'Placeholder used as label detected',
          suggestion: 'Use proper label element instead of placeholder',
          repairable: true,
        });
      }
    }

    return issues;
  }

  /**
   * Check for heading hierarchy issues
   */
  private checkHeadingHierarchy(content: string, filePath: string): AccessibilityValidationIssue[] {
    const issues: AccessibilityValidationIssue[] = [];

    // Extract all heading levels
    const headingPattern = /<h([1-6])[^>]*>/gi;
    const headingLevels: number[] = [];
    let match;

    while ((match = headingPattern.exec(content)) !== null) {
      if (match[1] !== undefined) {
        headingLevels.push(parseInt(match[1], 10));
      }
    }

    // Check for skipped heading levels
    for (let i = 1; i < headingLevels.length; i++) {
      const current = headingLevels[i];
      const previous = headingLevels[i - 1];

      if (current !== undefined && previous !== undefined) {
        // Allow going down (h2 to h3) but not skipping (h2 to h4)
        if (current > previous + 1) {
          issues.push({
            id: crypto.randomUUID(),
            type: 'heading_hierarchy',
            wcagLevel: 'A',
            severity: 'warning',
            filePath,
            message: `Skipped heading level detected (h${previous} to h${current})`,
            suggestion: 'Use sequential heading levels (h1, h2, h3, etc.)',
            repairable: true,
          });
        }
      }
    }

    // Check for multiple h1 tags
    const h1Count = headingLevels.filter(level => level === 1).length;
    if (h1Count > 1) {
      issues.push({
        id: crypto.randomUUID(),
        type: 'heading_hierarchy',
        wcagLevel: 'A',
        severity: 'error',
        filePath,
        message: `Multiple h1 tags detected (${h1Count})`,
        suggestion: 'Use only one h1 tag per page',
        repairable: true,
      });
    }

    return issues;
  }

  /**
   * Check for focus management issues
   */
  private checkFocusManagement(content: string, filePath: string): AccessibilityValidationIssue[] {
    const issues: AccessibilityValidationIssue[] = [];

    // Check for modals without focus management
    const modalPattern = /<dialog[^>]*>|role="dialog"/gi;
    const hasModal = modalPattern.test(content);

    if (hasModal) {
      if (!content.includes('autoFocus') && !content.includes('focus()')) {
        issues.push({
          id: crypto.randomUUID(),
          type: 'focus_management',
          wcagLevel: 'A',
          severity: 'warning',
          filePath,
          message: 'Modal/dialog without focus management detected',
          suggestion: 'Implement focus trapping and initial focus for modals',
          repairable: true,
        });
      }
    }

    return issues;
  }

  /**
   * Check for semantic HTML issues
   */
  private checkSemanticHtml(content: string, filePath: string): AccessibilityValidationIssue[] {
    const issues: AccessibilityValidationIssue[] = [];

    // Check for divs used as buttons
    const divButtonPattern = /<div[^>]*(onClick|role="button")[^>]*>/gi;
    const matches = content.match(divButtonPattern);

    if (matches) {
      for (const match of matches) {
        if (!match.includes('role="button"')) {
          issues.push({
            id: crypto.randomUUID(),
            type: 'semantic_html',
            wcagLevel: 'A',
            severity: 'warning',
            filePath,
            message: 'Div used as interactive element without proper semantics',
            suggestion: 'Use button element or add role="button"',
            repairable: true,
          });
        }
      }
    }

    // Check for missing lang attribute on html
    if (filePath.includes('layout') && !content.includes('lang=')) {
      issues.push({
        id: crypto.randomUUID(),
        type: 'semantic_html',
        wcagLevel: 'A',
        severity: 'error',
        filePath,
        message: 'Missing lang attribute on html element',
        suggestion: 'Add lang attribute to html element (e.g., lang="en")',
        repairable: true,
      });
    }

    return issues;
  }

  /**
   * Calculate validation summary
   */
  private calculateSummary(issues: AccessibilityValidationIssue[]) {
    return {
      total: issues.length,
      critical: issues.filter(i => i.severity === 'critical').length,
      error: issues.filter(i => i.severity === 'error').length,
      warning: issues.filter(i => i.severity === 'warning').length,
      wcagA: issues.filter(i => i.wcagLevel === 'A').length,
      wcagAA: issues.filter(i => i.wcagLevel === 'AA').length,
      wcagAAA: issues.filter(i => i.wcagLevel === 'AAA').length,
    };
  }

  /**
   * Auto-repair accessibility issues where possible
   */
  autoRepair(files: GeneratedFile[], issues: AccessibilityValidationIssue[]): GeneratedFile[] {
    const repairedFiles = [...files];
    const filesMap = new Map(files.map(f => [f.filePath, f]));

    for (const issue of issues) {
      if (!issue.repairable) continue;

      const file = filesMap.get(issue.filePath);
      if (!file) continue;

      let repairedContent = file.content;

      switch (issue.type) {
        case 'semantic_html':
          repairedContent = this.repairSemanticHtml(repairedContent, issue);
          break;
        case 'alt_text':
          repairedContent = this.repairAltText(repairedContent, issue);
          break;
        default:
          // Other repairs would be more complex
          break;
      }

      if (repairedContent !== file.content) {
        const index = repairedFiles.findIndex(f => f.filePath === file.filePath);
        if (index !== -1) {
          repairedFiles[index] = { ...file, content: repairedContent };
        }
      }
    }

    return repairedFiles;
  }

  /**
   * Repair semantic HTML issues
   */
  private repairSemanticHtml(content: string, issue: AccessibilityValidationIssue): string {
    if (issue.message.includes('Missing lang attribute')) {
      return content.replace(/<html>/, '<html lang="en">');
    }
    return content;
  }

  /**
   * Repair alt text issues
   */
  private repairAltText(content: string, issue: AccessibilityValidationIssue): string {
    if (issue.message.includes('empty alt text')) {
      return content.replace(/alt=""/g, 'alt="" role="presentation"');
    }
    return content;
  }
}

export const accessibilityValidator = new AccessibilityValidator();
