import * as fs from 'node:fs';
import * as path from 'node:path';
import { ModelRouter } from '@oneatlas/ai';
import { Diagnostic } from './error.classifier';

export interface RepairHistoryItem {
  iteration: number;
  repairStep: string;
  diagnostics: Diagnostic[];
}

export class RepairEngine {
  private aiRouter: ModelRouter;

  constructor() {
    this.aiRouter = new ModelRouter();
  }

  /**
   * Applies the repair pipeline for the given diagnostics.
   * Runs deterministic repairs first. If unresolved, routes to the cognitive LLM tier.
   * Returns a description of what was repaired, or null if no repairs were made.
   */
  public async repair(
    workspacePath: string,
    diagnostics: Diagnostic[],
    iteration: number
  ): Promise<{ step: string; filesChanged: string[] } | null> {
    console.log(`[RepairEngine] Starting repair iteration ${iteration} for ${diagnostics.length} diagnostics...`);

    const filesChanged: string[] = [];
    let appliedStep = '';

    // ── STAGE 1: DETERMINISTIC REPAIRS ─────────────────────────────────────────
    let deterministicRepaired = false;

    for (const diag of diagnostics) {
      if (!diag.file) continue;
      const absoluteFilePath = path.join(workspacePath, diag.file);
      if (!fs.existsSync(absoluteFilePath)) continue;

      const content = fs.readFileSync(absoluteFilePath, 'utf8');
      let newContent = content;

      if (diag.suggestedRepair === 'REPAIR_IMPORT_PATH') {
        // Detect relative or alias imports in content
        // Pattern: import ... from './something' or '@/components/something'
        const importRegex = /import\s+[\s\S]*?\s+from\s+['"]([^'"]+)['"]/g;
        let match;
        let modified = false;

        while ((match = importRegex.exec(content)) !== null) {
          const importPath = match[1]!;
          if (importPath.startsWith('.')) {
            const corrected = this.fixRelativeImportCasing(workspacePath, diag.file!, importPath);
            if (corrected && corrected !== importPath) {
              newContent = newContent.replace(importPath, corrected);
              modified = true;
            }
          }
        }

        if (modified) {
          fs.writeFileSync(absoluteFilePath, newContent);
          filesChanged.push(diag.file);
          deterministicRepaired = true;
          appliedStep = 'DETERMINISTIC_IMPORT_CASING';
          this.recordSnapshot(workspacePath, diag.file, content, newContent, diag, 'DETERMINISTIC_IMPORT_CASING', iteration);
        }
      }

      // Fix empty Zod objects
      if (content.includes('z.object({})')) {
        newContent = newContent.replace(/z\.object\(\{\}\)/g, 'z.record(z.string(), z.unknown())');
        fs.writeFileSync(absoluteFilePath, newContent);
        filesChanged.push(diag.file);
        deterministicRepaired = true;
        appliedStep = 'DETERMINISTIC_ZOD_OBJECT';
        this.recordSnapshot(workspacePath, diag.file, content, newContent, diag, 'DETERMINISTIC_ZOD_OBJECT', iteration);
      }

      // Fix dashboard replacement route
      if (content.includes("window.location.pathname.replace('/(dashboard)', '/api')")) {
        newContent = newContent.replace(
          /window\.location\.pathname\.replace\('\/\(dashboard\)', '\/api'\)/g,
          "window.location.pathname.replace(/^\/[^/]+/, '/api')"
        );
        fs.writeFileSync(absoluteFilePath, newContent);
        filesChanged.push(diag.file);
        deterministicRepaired = true;
        appliedStep = 'DETERMINISTIC_DASHBOARD_PATH';
        this.recordSnapshot(workspacePath, diag.file, content, newContent, diag, 'DETERMINISTIC_DASHBOARD_PATH', iteration);
      }

      // Fix mock tenant string
      if (content.includes('tenant_mock')) {
        newContent = newContent.replace(/tenant_mock/g, 'default');
        fs.writeFileSync(absoluteFilePath, newContent);
        filesChanged.push(diag.file);
        deterministicRepaired = true;
        appliedStep = 'DETERMINISTIC_TENANT_MOCK';
        this.recordSnapshot(workspacePath, diag.file, content, newContent, diag, 'DETERMINISTIC_TENANT_MOCK', iteration);
      }

      // Fix duplicate Prisma models
      if (diag.suggestedRepair === 'REMOVE_DUPLICATE_PRISMA_MODEL' && diag.file === 'prisma/schema.prisma') {
        const dedupe = this.removeDuplicatePrismaModels(content);
        if (dedupe.changed) {
          fs.writeFileSync(absoluteFilePath, dedupe.content);
          filesChanged.push(diag.file);
          deterministicRepaired = true;
          appliedStep = 'DETERMINISTIC_DEDUPLICATE_PRISMA';
          this.recordSnapshot(workspacePath, diag.file, content, dedupe.content, diag, 'DETERMINISTIC_DEDUPLICATE_PRISMA', iteration);
        }
      }
    }

    if (deterministicRepaired) {
      console.log(`[RepairEngine] Deterministic repairs applied successfully. Retrying build.`);
      return { step: appliedStep, filesChanged };
    }

    // ── STAGE 2: COGNITIVE/LLM REPAIRS ─────────────────────────────────────────
    console.log(`[RepairEngine] No deterministic repairs matches found. Elevating to Cognitive LLM tier...`);

    // Let's pick the first fatal diagnostic to fix
    const primaryDiag = diagnostics.find(d => d.severity === 'fatal');
    if (!primaryDiag || !primaryDiag.file) {
      return null;
    }

    const absoluteFilePath = path.join(workspacePath, primaryDiag.file);
    if (!fs.existsSync(absoluteFilePath)) {
      return null;
    }

    const originalContent = fs.readFileSync(absoluteFilePath, 'utf8');

    try {
      const repairedContent = await this.queryLLMRepair(originalContent, primaryDiag);
      if (repairedContent && repairedContent.trim() !== originalContent.trim()) {
        fs.writeFileSync(absoluteFilePath, repairedContent);
        filesChanged.push(primaryDiag.file);
        this.recordSnapshot(
          workspacePath,
          primaryDiag.file,
          originalContent,
          repairedContent,
          primaryDiag,
          'COGNITIVE_LLM_REPAIR',
          iteration
        );
        return { step: 'COGNITIVE_LLM_REPAIR', filesChanged };
      }
    } catch (err) {
      console.error(`[RepairEngine] LLM repair failed:`, err);
    }

    return null;
  }

  /**
   * Safe case-insensitive path resolver for local relative components.
   */
  private fixRelativeImportCasing(workspacePath: string, file: string, importPath: string): string | null {
    try {
      const fileDir = path.dirname(path.join(workspacePath, file));
      const absoluteImportBase = path.resolve(fileDir, importPath);

      const targetDir = path.dirname(absoluteImportBase);
      if (!fs.existsSync(targetDir)) return null;

      const targetBasenameLower = path.basename(absoluteImportBase).toLowerCase();
      const files = fs.readdirSync(targetDir);

      for (const f of files) {
        const fNameWithoutExt = path.basename(f, path.extname(f));
        if (fNameWithoutExt.toLowerCase() === targetBasenameLower) {
          const relativeCorrected = path.join(path.dirname(importPath), fNameWithoutExt);
          return relativeCorrected.replace(/\\/g, '/');
        }
      }
    } catch {
      // Ignore directory read issues
    }
    return null;
  }

  /**
   * Safely dedupes model blocks in prisma/schema.prisma.
   */
  private removeDuplicatePrismaModels(schemaContent: string): { content: string; changed: boolean } {
    const modelRegex = /model\s+(\w+)\s*\{([^}]+)\}/g;
    const modelBlocks: { name: string; fullBlock: string }[] = [];
    let match;

    while ((match = modelRegex.exec(schemaContent)) !== null) {
      modelBlocks.push({ name: match[1]!, fullBlock: match[0] });
    }

    const seen = new Set<string>();
    let newContent = schemaContent;
    let changed = false;

    for (const block of modelBlocks) {
      if (seen.has(block.name)) {
        newContent = newContent.replace(block.fullBlock, '');
        changed = true;
      } else {
        seen.add(block.name);
      }
    }

    return { content: newContent, changed };
  }

  /**
   * Queries the `@oneatlas/ai` gateway to fix TypeScript or syntax errors in code.
   */
  private async queryLLMRepair(fileContent: string, diagnostic: Diagnostic): Promise<string> {
    const { provider, name: providerName } = this.aiRouter.getProviderForTask('RECOVERY');
    console.log(`[RepairEngine] Invoking LLM provider: ${providerName} for repair...`);

    const systemPrompt = `You are a Senior TypeScript and Next.js compiler repair agent.
Your task is to fix a compilation/syntax error in a Next.js/React file.
You will be given:
1. The code of the file containing the error.
2. The specific compiler error diagnostic.

Analyze the error and the file carefully. Correct the code to resolve the error.
Ensure you:
- Preserve all imports and exports unless they are the source of the error.
- Keep the overall structure and logic unchanged.
- Fix all syntax errors, JSX tag mismatches, and TypeScript type mismatches.
- Output ONLY the raw corrected code of the file. Do not wrap in markdown code blocks, do not explain your changes, do not output anything other than the exact corrected file content.`;

    const userPrompt = `
FILE: ${diagnostic.file}
DIAGNOSTIC MESSAGE:
Line ${diagnostic.line ?? 'unknown'}, Column ${diagnostic.column ?? 'unknown'}: ${diagnostic.message}

ORIGINAL FILE CONTENT:
\`\`\`tsx
${fileContent}
\`\`\`
`;

    // Timeout protection: force resolution inside 30 seconds
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('LLM Repair generation timed out.')), 30000)
    );

    const generatePromise = provider.generate({
      prompt: userPrompt,
      systemPrompt,
      modelTier: 'FAST', // Use token-efficient FAST tier models (e.g. Gemini Flash)
      temperature: 0.1,
      maxTokens: 4096 // Cap tokens budget to avoid runaway responses
    });

    const response = await Promise.race([generatePromise, timeoutPromise]);
    this.aiRouter.recordSuccess(providerName);

    // Clean any accidental markdown code fence wrapper output
    let result = response.content;
    if (result.startsWith('```')) {
      result = result.replace(/^```[a-zA-Z]*\n/, '').replace(/\n```$/, '');
    }

    return result;
  }

  /**
   * Records a snapshot of the repair event inside the workspace.
   */
  private recordSnapshot(
    workspacePath: string,
    filePath: string,
    original: string,
    repaired: string,
    diagnostic: Diagnostic,
    step: string,
    iteration: number
  ): void {
    try {
      const repairsDir = path.join(workspacePath, '.oneatlas-repairs');
      if (!fs.existsSync(repairsDir)) {
        fs.mkdirSync(repairsDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `repair_${timestamp}_iter${iteration}.json`;
      const snapshotPath = path.join(repairsDir, filename);

      const snapshot = {
        timestamp: new Date().toISOString(),
        filePath,
        originalContent: original,
        repairedContent: repaired,
        diagnostic: {
          category: diagnostic.category,
          severity: diagnostic.severity,
          message: diagnostic.message,
          line: diagnostic.line,
          column: diagnostic.column
        },
        repairStep: step,
        retryIteration: iteration
      };

      fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2));
      console.log(`[RepairEngine] Repair snapshot written to: ${path.basename(snapshotPath)}`);
    } catch (err) {
      console.error(`[RepairEngine] Failed to write repair snapshot:`, err);
    }
  }
}
export default RepairEngine;
