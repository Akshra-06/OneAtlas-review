export type ErrorCategory =
  | 'import'
  | 'dependency'
  | 'prisma'
  | 'jsx'
  | 'typescript'
  | 'tailwind'
  | 'router'
  | 'env'
  | 'unknown';

export interface Diagnostic {
  category: ErrorCategory;
  severity: 'fatal' | 'warning';
  file?: string;
  line?: number;
  column?: number;
  message: string;
  suggestedRepair?: string;
}

export class ErrorClassifier {
  /**
   * Parses compilation output logs and extracts structured diagnostics.
   */
  public classify(logs: string): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const lines = logs.split(/\r?\n/);

    for (const lineContent of lines) {
      // 1. TypeScript syntax / type error matcher:
      // Pattern: src/app/page.tsx(10,5): error TS2322: Type 'string' is not assignable...
      const tsMatch = lineContent.match(/^([^(]+)\((\d+),(\d+)\):\s+error\s+TS(\d+):\s+(.+)$/);
      if (tsMatch) {
        const filePath  = tsMatch[1]!;
        const lineStr   = tsMatch[2]!;
        const colStr    = tsMatch[3]!;
        const errorCode = tsMatch[4]!;
        const rawMsg    = tsMatch[5]!;
        const msg = `TS${errorCode}: ${rawMsg}`;
        const file = filePath.trim();

        // Sub-classification for specific TS errors
        let category: ErrorCategory = 'typescript';
        let suggestedRepair = 'FIX_TYPESCRIPT_TYPE';

        if (errorCode === '2307') {
          category = 'import';
          suggestedRepair = msg.includes('./') || msg.includes('@/') ? 'REPAIR_IMPORT_PATH' : 'INSTALL_DEPENDENCY';
        } else if (lineContent.includes('JSX element') || lineContent.includes('closing tag')) {
          category = 'jsx';
          suggestedRepair = 'CLOSE_JSX_TAG';
        }

        diagnostics.push({
          category,
          severity: 'fatal',
          file,
          line: parseInt(lineStr, 10),
          column: parseInt(colStr, 10),
          message: msg,
          suggestedRepair
        });
        continue;
      }

      // 2. Webpack / Next.js Module Not Found:
      // Pattern: Module not found: Can't resolve '@/components/button' in 'C:\...\page.tsx'
      const webpackMatch = lineContent.match(/Module not found:\s+Can't resolve\s+'([^']+)'\s+in\s+'([^']+)'/i);
      if (webpackMatch) {
        const missingModule = webpackMatch[1]!;
        const importerFile  = webpackMatch[2]!;
        const isLocal = missingModule.startsWith('.') || missingModule.startsWith('@/');
        diagnostics.push({
          category: isLocal ? 'import' : 'dependency',
          severity: 'fatal',
          file: importerFile.trim(),
          message: `Cannot resolve module "${missingModule}"`,
          suggestedRepair: isLocal ? 'REPAIR_IMPORT_PATH' : 'INSTALL_DEPENDENCY'
        });
        continue;
      }

      // 3. Prisma model duplicate definition:
      // Pattern: UserError: Model "User" is defined twice
      const prismaDupMatch = lineContent.match(/Model\s+"([^"]+)"\s+is defined twice/i);
      if (prismaDupMatch) {
        const [, modelName] = prismaDupMatch;
        diagnostics.push({
          category: 'prisma',
          severity: 'fatal',
          file: 'prisma/schema.prisma',
          message: `Duplicate Prisma model definition: "${modelName}"`,
          suggestedRepair: 'REMOVE_DUPLICATE_PRISMA_MODEL'
        });
        continue;
      }

      // 4. Prisma invalid field list type:
      // Pattern: Field "posts" in model "User" can't be list
      const prismaFieldMatch = lineContent.match(/Field\s+"([^"]+)"\s+in model\s+"([^"]+)"\s+(.+)/i);
      if (prismaFieldMatch && lineContent.includes('prisma')) {
        const [, fieldName, modelName, details] = prismaFieldMatch;
        diagnostics.push({
          category: 'prisma',
          severity: 'fatal',
          file: 'prisma/schema.prisma',
          message: `Prisma schema invalid field: "${fieldName}" in model "${modelName}". Details: ${details}`,
          suggestedRepair: 'FIX_PRISMA_FIELD'
        });
        continue;
      }

      // 5. JSX syntax parsing errors (generic):
      // Pattern: Expected corresponding JSX closing tag for 'div'
      const jsxClosingMatch = lineContent.match(/Expected corresponding JSX closing tag for\s+'([^']+)'/i);
      if (jsxClosingMatch) {
        diagnostics.push({
          category: 'jsx',
          severity: 'fatal',
          message: lineContent.trim(),
          suggestedRepair: 'CLOSE_JSX_TAG'
        });
        continue;
      }

      // 6. Generic node_modules missing dependency error:
      // Pattern: Error: Cannot find module 'lucide-react'
      const nodeModuleMatch = lineContent.match(/Error:\s+Cannot find module\s+'([^']+)'/i);
      if (nodeModuleMatch) {
        const depName = nodeModuleMatch[1]!;
        const isLocal = depName.startsWith('.') || depName.startsWith('@/');
        diagnostics.push({
          category: isLocal ? 'import' : 'dependency',
          severity: 'fatal',
          message: `Missing dependency: "${depName}"`,
          suggestedRepair: isLocal ? 'REPAIR_IMPORT_PATH' : 'INSTALL_DEPENDENCY'
        });
        continue;
      }
    }

    // Deduplicate diagnostics to avoid repeated attempts on identical issues
    const unique = new Map<string, Diagnostic>();
    for (const d of diagnostics) {
      const key = `${d.category}:${d.file ?? ''}:${d.line ?? 0}:${d.message}`;
      if (!unique.has(key)) {
        unique.set(key, d);
      }
    }

    return Array.from(unique.values());
  }
}
export default ErrorClassifier;
