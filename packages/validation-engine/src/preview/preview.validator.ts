import type { GeneratedFile } from '@oneatlas/shared';

export interface PreviewValidationIssue {
  type: 'invalid_hooks' | 'invalid_revalidate' | 'missing_html_body' | 'server_client_violation' | 'invalid_imports' | 'duplicate_react' | 'forbidden_api' | 'broken_async' | 'missing_exports';
  filePath: string;
  message: string;
  repairable: boolean;
  autoFixed: boolean;
}

export interface PreviewValidationResult {
  valid: boolean;
  issues: PreviewValidationIssue[];
  files: GeneratedFile[];
  safeMode: boolean;
}

/**
 * Validates generated files for preview safety.
 * Focuses on preventing crashes rather than perfect functionality.
 */
export class PreviewValidator {
  /**
   * Forbidden Next.js APIs that can cause crashes
   */
  private static readonly FORBIDDEN_APIS = [
    'unstable_cache',
    'next/cache',
    'serverActions',
    'useActionState',
  ];

  /**
   * Invalid hook patterns that indicate hook violations
   */
  private static readonly INVALID_HOOK_PATTERNS = [
    /useState\s*\(\s*\)\s*\)/, // Empty useState
    /useEffect\s*\(\s*\(\)\s*=>\s*\{?\s*\}?\s*,\s*\[\]\s*\)/, // Empty useEffect
    /useContext\s*\(\s*\)/, // Empty useContext
  ];

  /**
   * Async export patterns that need special handling
   */
  private static readonly ASYNC_EXPORT_PATTERNS = [
    /export\s+(default\s+)?async\s+function/,
    /export\s+(default\s+)?async\s+(const|let|var)\s+\w+/,
  ];

  /**
   * React duplicate usage patterns
   */
  private static readonly REACT_DUPLICATE_PATTERNS = [
    /import\s+.*\s+from\s+['"]react['"]\s*;.*import\s+.*\s+from\s+['"]react['"]/,
    /require\s*\(\s*['"]react['"]\s*\).*require\s*\(\s*['"]react['"]\s*\)/,
  ];

  /**
   * Server/client boundary violations
   */
  private static readonly SERVER_CLIENT_VIOLATIONS = [
    /'use server'\s*;\s*'use client'/,
    /'use client'\s*;\s*'use server'/,
  ];

  /**
   * Validate all generated files for preview safety
   */
  public validate(files: GeneratedFile[]): PreviewValidationResult {
    const issues: PreviewValidationIssue[] = [];
    let safeMode = false;

    for (const file of files) {
      const fileIssues = this.validateFile(file);
      issues.push(...fileIssues);
    }

    // Determine if safe mode is needed
    const criticalIssues = issues.filter(i => !i.repairable || !i.autoFixed);
    safeMode = criticalIssues.length > 0;

    return {
      valid: criticalIssues.length === 0,
      issues,
      files,
      safeMode,
    };
  }

  /**
   * Validate a single file
   */
  private validateFile(file: GeneratedFile): PreviewValidationIssue[] {
    const issues: PreviewValidationIssue[] = [];
    const content = file.content;
    const filePath = file.filePath;

    // Check for invalid hooks
    const hookIssues = this.checkInvalidHooks(content, filePath);
    issues.push(...hookIssues);

    // Check for invalid revalidate exports
    const revalidateIssues = this.checkInvalidRevalidate(content, filePath);
    issues.push(...revalidateIssues);

    // Check for missing html/body in layout files
    const htmlBodyIssues = this.checkMissingHtmlBody(content, filePath);
    issues.push(...htmlBodyIssues);

    // Check for server/client boundary violations
    const boundaryIssues = this.checkServerClientViolations(content, filePath);
    issues.push(...boundaryIssues);

    // Check for invalid imports
    const importIssues = this.checkInvalidImports(content, filePath);
    issues.push(...importIssues);

    // Check for duplicate React usage
    const duplicateReactIssues = this.checkDuplicateReact(content, filePath);
    issues.push(...duplicateReactIssues);

    // Check for forbidden APIs
    const forbiddenApiIssues = this.checkForbiddenApis(content, filePath);
    issues.push(...forbiddenApiIssues);

    // Check for broken async exports
    const asyncIssues = this.checkBrokenAsync(content, filePath);
    issues.push(...asyncIssues);

    // Check for missing required exports
    const exportIssues = this.checkMissingExports(content, filePath);
    issues.push(...exportIssues);

    return issues;
  }

  /**
   * Check for invalid hook usage
   */
  private checkInvalidHooks(content: string, filePath: string): PreviewValidationIssue[] {
    const issues: PreviewValidationIssue[] = [];

    for (const pattern of PreviewValidator.INVALID_HOOK_PATTERNS) {
      if (pattern.test(content)) {
        const issue: PreviewValidationIssue = {
          type: 'invalid_hooks',
          filePath,
          message: `Invalid hook pattern detected`,
          repairable: true,
          autoFixed: this.tryFixInvalidHooks(content),
        };
        issues.push(issue);
        pattern.lastIndex = 0; // Reset regex
      }
    }

    return issues;
  }

  /**
   * Check for invalid revalidate exports
   */
  private checkInvalidRevalidate(content: string, filePath: string): PreviewValidationIssue[] {
    const issues: PreviewValidationIssue[] = [];
    const revalidatePattern = /export\s+const\s+revalidate\s*=/;

    if (revalidatePattern.test(content)) {
      issues.push({
        type: 'invalid_revalidate',
        filePath,
        message: 'Invalid revalidate export (forbidden in preview)',
        repairable: true,
        autoFixed: this.tryFixInvalidRevalidate(content),
      });
    }

    return issues;
  }

  /**
   * Check for missing html/body tags in layout files
   */
  private checkMissingHtmlBody(content: string, filePath: string): PreviewValidationIssue[] {
    const issues: PreviewValidationIssue[] = [];

    if (filePath.includes('layout.tsx') || filePath.includes('layout.jsx')) {
      if (!content.includes('<html') || !content.includes('<body')) {
        issues.push({
          type: 'missing_html_body',
          filePath,
          message: 'Missing <html> or <body> tags in layout',
          repairable: false,
          autoFixed: false,
        });
      }
    }

    return issues;
  }

  /**
   * Check for server/client boundary violations
   */
  private checkServerClientViolations(content: string, filePath: string): PreviewValidationIssue[] {
    const issues: PreviewValidationIssue[] = [];

    for (const pattern of PreviewValidator.SERVER_CLIENT_VIOLATIONS) {
      if (pattern.test(content)) {
        issues.push({
          type: 'server_client_violation',
          filePath,
          message: 'Server/client directive conflict detected',
          repairable: true,
          autoFixed: this.tryFixServerClientViolation(content),
        });
        pattern.lastIndex = 0;
      }
    }

    return issues;
  }

  /**
   * Check for invalid imports
   */
  private checkInvalidImports(content: string, filePath: string): PreviewValidationIssue[] {
    const issues: PreviewValidationIssue[] = [];
    
    // Check for imports from non-existent local paths
    const importPattern = /import\s+.*\s+from\s+['"](\.\.?\/[^'"]+)['"]/g;
    let match;

    while ((match = importPattern.exec(content)) !== null) {
      const importPath = match[1];
      // Basic check for obviously invalid paths
      if (importPath && importPath.includes('..') && importPath.split('..').length > 3) {
        issues.push({
          type: 'invalid_imports',
          filePath,
          message: `Suspicious import path: ${importPath}`,
          repairable: true,
          autoFixed: false,
        });
      }
    }

    return issues;
  }

  /**
   * Check for duplicate React imports
   */
  private checkDuplicateReact(content: string, filePath: string): PreviewValidationIssue[] {
    const issues: PreviewValidationIssue[] = [];

    for (const pattern of PreviewValidator.REACT_DUPLICATE_PATTERNS) {
      if (pattern.test(content)) {
        issues.push({
          type: 'duplicate_react',
          filePath,
          message: 'Duplicate React import detected',
          repairable: true,
          autoFixed: this.tryFixDuplicateReact(content),
        });
        pattern.lastIndex = 0;
      }
    }

    return issues;
  }

  /**
   * Check for forbidden Next.js APIs
   */
  private checkForbiddenApis(content: string, filePath: string): PreviewValidationIssue[] {
    const issues: PreviewValidationIssue[] = [];

    for (const api of PreviewValidator.FORBIDDEN_APIS) {
      const pattern = new RegExp(`\\b${api}\\b`);
      if (pattern.test(content)) {
        issues.push({
          type: 'forbidden_api',
          filePath,
          message: `Forbidden API usage: ${api}`,
          repairable: true,
          autoFixed: this.tryFixForbiddenApi(content, api),
        });
      }
    }

    return issues;
  }

  /**
   * Check for broken async exports
   */
  private checkBrokenAsync(content: string, filePath: string): PreviewValidationIssue[] {
    const issues: PreviewValidationIssue[] = [];

    // Only check page/route files
    if (filePath.includes('page.tsx') || filePath.includes('route.ts')) {
      for (const pattern of PreviewValidator.ASYNC_EXPORT_PATTERNS) {
        if (pattern.test(content)) {
          // Check if the async function has proper error handling
          const hasTryCatch = /try\s*\{/.test(content) && /catch\s*\(/.test(content);
          
          if (!hasTryCatch) {
            issues.push({
              type: 'broken_async',
              filePath,
              message: 'Async export without error handling',
              repairable: true,
              autoFixed: this.tryFixBrokenAsync(content),
            });
          }
          pattern.lastIndex = 0;
        }
      }
    }

    return issues;
  }

  /**
   * Check for missing required exports
   */
  private checkMissingExports(content: string, filePath: string): PreviewValidationIssue[] {
    const issues: PreviewValidationIssue[] = [];

    // Page files should export default component
    if (filePath.includes('page.tsx') && !content.includes('export default')) {
      issues.push({
        type: 'missing_exports',
        filePath,
        message: 'Missing default export in page file',
        repairable: true,
        autoFixed: this.tryFixMissingDefaultExport(content),
      });
    }

    // Route files should export HTTP methods
    if (filePath.includes('route.ts')) {
      const hasMethod = /export\s+(async\s+)?function\s+(GET|POST|PUT|DELETE|PATCH)/.test(content);
      if (!hasMethod) {
        issues.push({
          type: 'missing_exports',
          filePath,
          message: 'Missing HTTP method export in route file',
          repairable: true,
          autoFixed: false,
        });
      }
    }

    return issues;
  }

  /**
   * Attempt to fix invalid hooks
   */
  private tryFixInvalidHooks(content: string): boolean {
    // This would be implemented with specific fixes
    return false;
  }

  /**
   * Attempt to fix invalid revalidate
   */
  private tryFixInvalidRevalidate(content: string): boolean {
    return content.replace(/export\s+const\s+revalidate\s*=[^;]+;?\s*/g, '') !== content;
  }

  /**
   * Attempt to fix server/client violation
   */
  private tryFixServerClientViolation(content: string): boolean {
    return content.replace(/'use server'\s*;\s*'use client'/g, "'use client';") !== content;
  }

  /**
   * Attempt to fix duplicate React
   */
  private tryFixDuplicateReact(content: string): boolean {
    const lines = content.split('\n');
    const reactImports: string[] = [];
    const otherLines: string[] = [];

    for (const line of lines) {
      if (line.includes('from') && line.includes('react')) {
        reactImports.push(line);
      } else {
        otherLines.push(line);
      }
    }

    if (reactImports.length > 1) {
      return true; // Can be fixed by deduplicating
    }

    return false;
  }

  /**
   * Attempt to fix forbidden API
   */
  private tryFixForbiddenApi(content: string, api: string): boolean {
    const pattern = new RegExp(`\\b${api}\\b`, 'g');
    return content.replace(pattern, `/* ${api} removed */`) !== content;
  }

  /**
   * Attempt to fix broken async
   */
  private tryFixBrokenAsync(content: string): boolean {
    // Would wrap async function with try-catch
    return false;
  }

  /**
   * Attempt to fix missing default export
   */
  private tryFixMissingDefaultExport(content: string): boolean {
    return (content + '\nexport default function Page() { return <div>Page</div>; }') !== content;
  }

  /**
   * Auto-repair issues where possible
   */
  public autoRepair(files: GeneratedFile[], issues: PreviewValidationIssue[]): GeneratedFile[] {
    const repairedFiles = [...files];
    const filesMap = new Map(files.map(f => [f.filePath, f]));

    for (const issue of issues) {
      if (!issue.repairable || !issue.autoFixed) continue;

      const file = filesMap.get(issue.filePath);
      if (!file) continue;

      let repairedContent = file.content;

      switch (issue.type) {
        case 'invalid_revalidate':
          repairedContent = repairedContent.replace(/export\s+const\s+revalidate\s*=[^;]+;?\s*/g, '');
          break;
        case 'server_client_violation':
          repairedContent = repairedContent.replace(/'use server'\s*;\s*'use client'/g, "'use client';");
          break;
        case 'forbidden_api':
          for (const api of PreviewValidator.FORBIDDEN_APIS) {
            const pattern = new RegExp(`\\b${api}\\b`, 'g');
            repairedContent = repairedContent.replace(pattern, `/* ${api} removed */`);
          }
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
}

export const previewValidator = new PreviewValidator();