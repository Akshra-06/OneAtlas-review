# Base44-Style Architecture Migration Plan

## Overview

This is a controlled structural migration of the existing packages/ai monolith into clearly-bounded, purpose-specific engine packages that match the target Base44-style architecture. No business logic will change. No systems will be rewritten. Files move; imports update; new package.json + index.ts barrel files get created.

**IMPORTANT**

This plan maps every existing file in packages/ai/src to its target location. All moves use git mv to preserve history. TypeScript must pass after each phase.

## 1. Current State Analysis

### 1.1 Existing Monorepo Layout (OneaAtlas-Backend/)

```
packages/
  ai/          @oneatlas/ai      — monolith containing ALL AI logic
  shared/      @oneatlas/shared  — cross-team contracts, utils, validators
  db/          @oneatlas/db      — Prisma schema, repositories
```

### 1.2 Current packages/ai/src/ — Full Directory Map

| Directory | Key Files | Size / Complexity |
|-----------|-----------|-------------------|
| gateway/ | gateway.ts, usage.ts, index.ts | Core — 316-line AIGateway class, multi-provider fallback logic |
| gateway/providers/ | claude.ts, openai.ts, gemini.ts, deepseek.ts, groq.ts, openrouter.ts, mistral.ts, base.provider.ts, safe-completion.ts | 9 provider files |
| gateway/router/ | model.router.ts, routing.config.ts | ModelRouter, routing config |
| gateway/config/ | models.config.ts, provider.config.ts | Model tier registry, 10KB config |
| gateway/types/ | gateway.types.ts | Types for AIGateway (10.9KB) |
| semantic/ | 8 flat .ts files | domain-knowledge.ts, entity-clustering.ts, entity-similarity.ts, entity-understanding.ts, intent-classifier.ts, relationship-detector.ts, requirement-analyzer.ts, requirement-prioritizer.ts |
| understanding/ | Subdirs: advanced/, detector/, extractors/, memory/, mutation/, normalizer/, orchestrator/, parser/, tests/ | Understanding orchestrator and extractor pipeline |
| validation/ | Subdirs: accessibility/, compiler/, formatters/, orchestrator/, performance/, preview/, recovery/, registry/, repair/, schemas/, security/, semantic/ + 7 flat files | Large — full validation + repair pipeline |
| workflows/ | pipeline/: 4 files, optimization/: 6 files, state/: 2 files | Generation pipeline, retry, circuit-breaker, monitoring |
| cache/ | responseCache.ts | Redis-backed AI response cache |
| calibration/ | ai-output-calibration.ts (26KB), visual-benchmarking.ts (24KB), index.ts | AI quality calibration + visual benchmarking |
| templates/ | template-registry.ts, template-generator.ts, template-modifier.ts, quality-scorer.ts, telemetry.ts, ai-cache.ts, errors.ts + healthcare/, crm/ | Template-based generation system |
| generators/ | Subdirs: code/, schema/, dynamic/, intelligence/, rendering/, shared/ + index.ts | All code + schema generators |
| prompts/ | context-engine.ts, subdirs: chains/, context/, system/, templates/ | Prompt context engine |
| intelligence/ | Subdirs: classification/, dashboard/, evaluation/, generation/, knowledge/, reasoning/, validation/, workflow/ | Advanced intelligence layer |
| product/ | Subdirs: archetype/, architecture/, component/, dashboard/, metrics/, ux/, visual/, workflow/ | Product-level generation systems |
| runtime/ | golden-template.ts (47KB), subdirs: error-boundaries/, safe-mode/ | Golden template engine, safe mode |
| generation/ | Subdirs: caching/, determinism/ | Generation determinism + caching |
| shared/ | Subdirs: constants/, contracts/, errors/, types/, utils/ | Internal shared types: app-understanding.types.ts, generation.types.ts, common.types.ts |
| queue/ | job-queue.ts (9KB), subdirs: cancellation/, monitoring/, retry/ | Job queue system |
| streaming/ | (to explore) | Streaming pipeline |
| storage/ | (to explore) | Storage integration |

### 1.3 Current Consumer Dependencies

All consumers import from @oneatlas/ai — the single package name must be preserved or re-exported from a compatibility shim during migration.

Known consumers:
- apps/api — imports AIGateway, gateway, UnderstandingOrchestrator, PIPELINE_STEPS, runGenerationPipeline, AppUnderstanding, GenerationResult
- apps/web — imports AI types and preview validators
- apps/executor — imports generation pipeline and validators

## 2. Target Architecture — New Package Map

The migration creates these new workspace packages under packages/:

| New Package | npm Name | Contains | Source |
|-------------|----------|----------|--------|
| packages/ai-engine | @oneatlas/ai-engine | gateway, providers, router, semantic, understanding, prompts, generators, orchestration | ai/src/gateway/, ai/src/semantic/, ai/src/understanding/ |
| packages/template-engine | @oneatlas/template-engine | templates, archetypes | ai/src/templates/ |
| packages/validation-engine | @oneatlas/validation-engine | validation, repair | ai/src/validation/ |
| packages/observability-engine | @oneatlas/observability-engine | calibration, benchmarking, scoring, telemetry, replay | ai/src/calibration/ |
| packages/runtime-engine | @oneatlas/runtime-engine | queue, retry, cancellation, execution runtime | ai/src/queue/ |
| packages/cache-engine | @oneatlas/cache-engine | cache, generation caching | ai/src/cache/, ai/src/generation/ |
| packages/shared (EXPAND) | @oneatlas/shared | + shared types from ai/src/shared/types/ | ai/src/shared/types/ |

**NOTE**

packages/ai becomes a thin compatibility shim that re-exports everything from the new engine packages. This preserves all @oneatlas/ai imports without touching consumers.

## 3. File Migration Mapping

### 3.1 → packages/ai-engine

**From packages/ai/src/gateway/ → packages/ai-engine/src/gateway/**

| Source File | Target File | Notes |
|-------------|-------------|-------|
| gateway/gateway.ts | gateway/gateway.ts | Move as-is |
| gateway/usage.ts | gateway/usage.ts | Move as-is |
| gateway/index.ts | gateway/index.ts | Update relative imports |
| gateway/types/gateway.types.ts | gateway/types/gateway.types.ts | Move as-is |
| gateway/config/models.config.ts | gateway/config/models.config.ts | Move as-is |
| gateway/config/provider.config.ts | gateway/config/provider.config.ts | Move as-is |
| gateway/providers/ (all 9 files) | gateway/providers/ | Move as-is |
| gateway/router/model.router.ts | gateway/router/model.router.ts | Move as-is |
| gateway/router/routing.config.ts | gateway/router/routing.config.ts | Move as-is |
| gateway/router/provider.health.ts | gateway/router/provider.health.ts | Move as-is |

**From packages/ai/src/semantic/ → packages/ai-engine/src/semantic/**

| Source File | Target File |
|-------------|-------------|
| semantic/domain-knowledge.ts | semantic/domain-knowledge.ts |
| semantic/entity-clustering.ts | semantic/entity-clustering.ts |
| semantic/entity-similarity.ts | semantic/entity-similarity.ts |
| semantic/entity-understanding.ts | semantic/entity-understanding.ts |
| semantic/intent-classifier.ts | semantic/intent-classifier.ts |
| semantic/relationship-detector.ts | semantic/relationship-detector.ts |
| semantic/requirement-analyzer.ts | semantic/requirement-analyzer.ts |
| semantic/requirement-prioritizer.ts | semantic/requirement-prioritizer.ts |

**From packages/ai/src/understanding/ → packages/ai-engine/src/understanding/**

All subdirectories and files move verbatim:
- advanced/, detector/, extractors/, memory/, mutation/, normalizer/, orchestrator/, parser/, tests/
- index.ts

**Additional ai-engine files (stay in ai-engine):**
- prompts/ → ai-engine/src/prompts/
- generators/ → ai-engine/src/generators/
- intelligence/ → ai-engine/src/intelligence/
- product/ → ai-engine/src/product/
- runtime/ → ai-engine/src/runtime/
- streaming/ → ai-engine/src/streaming/
- storage/ → ai-engine/src/storage/

### 3.2 → packages/template-engine

**From packages/ai/src/templates/ → packages/template-engine/src/**

| Source File | Target File |
|-------------|-------------|
| templates/template-registry.ts | src/template-registry.ts |
| templates/template-generator.ts | src/template-generator.ts |
| templates/template-modifier.ts | src/template-modifier.ts |
| templates/quality-scorer.ts | src/quality-scorer.ts |
| templates/telemetry.ts | src/telemetry.ts |
| templates/ai-cache.ts | src/ai-cache.ts |
| templates/errors.ts | src/errors.ts |
| templates/healthcare/ | src/healthcare/ |
| templates/crm/ | src/crm/ |
| templates/index.ts | src/index.ts (update imports) |

### 3.3 → packages/validation-engine

**From packages/ai/src/validation/ → packages/validation-engine/src/**

All files and subdirectories move verbatim:
- accessibility/, compiler/, formatters/, orchestrator/, performance/, preview/, recovery/, registry/, repair/, schemas/, security/, semantic/
- Flat files: ai-code-reviewer.ts, comprehensive-quality-scorer.ts, error-corrector.ts, error-pattern-recognizer.ts, feedback-loop.ts, generated-output.validator.ts
- index.ts

### 3.4 → packages/observability-engine

**From packages/ai/src/calibration/ → packages/observability-engine/src/calibration/**

| Source File | Target File |
|-------------|-------------|
| calibration/ai-output-calibration.ts | src/calibration/ai-output-calibration.ts |
| calibration/visual-benchmarking.ts | src/calibration/visual-benchmarking.ts |
| calibration/index.ts | src/calibration/index.ts |

**Rationale:** Calibration belongs to benchmarking, scoring, telemetry, replay, observability — NOT validation.

### 3.5 → packages/runtime-engine

**From packages/ai/src/queue/ → packages/runtime-engine/src/queue/**

| Source File | Target File |
|-------------|-------------|
| queue/job-queue.ts | src/queue/job-queue.ts |
| queue/cancellation/ | src/queue/cancellation/ |
| queue/monitoring/ | src/queue/monitoring/ |
| queue/retry/ | src/queue/retry/ |
| queue/index.ts | src/queue/index.ts |

**Rationale:** queue/retry/cancellation = execution runtime — NOT workflow logic.

### 3.6 → packages/workflow-engine

**From packages/ai/src/workflows/ → packages/workflow-engine/src/**

| Source Directory | Target |
|-------------------|--------|
| workflows/pipeline/ | src/pipeline/ |
| workflows/optimization/ | src/optimization/ |
| workflows/state/ | src/state/ |
| workflows/index.ts | src/index.ts (update imports) |

### 3.7 → packages/cache-engine

**From packages/ai/src/cache/ → packages/cache-engine/src/**

| Source File | Target File |
|-------------|-------------|
| cache/responseCache.ts | src/responseCache.ts |

**From packages/ai/src/generation/ → packages/cache-engine/src/generation/**

| Source File | Target File |
|-------------|-------------|
| generation/caching/ | src/generation/caching/ |
| generation/determinism/ | src/generation/determinism/ |
| generation/index.ts | src/generation/index.ts |

### 3.8 → packages/shared (EXPAND)

**From packages/ai/src/shared/types/ → packages/shared/src/types/**

| Source File | Target File | Notes |
|-------------|-------------|-------|
| shared/types/app-understanding.types.ts | src/types/app-understanding.types.ts | Cross-team contract |
| shared/types/generation.types.ts | src/types/generation.types.ts | Cross-team contract |
| shared/types/common.types.ts | src/types/common.types.ts | Base types |

**WARNING**

packages/ai/src/shared/ also contains constants/, contracts/, errors/, and utils/. These can either stay inside ai-engine (since they are AI-internal) or be moved to @oneatlas/shared. Decision: Move types/ only to @oneatlas/shared. Keep constants/, contracts/, errors/, utils/ inside ai-engine/src/shared/.

## 4. New Package Structures

### 4.1 packages/ai-engine/package.json

```json
{
  "name": "@oneatlas/ai-engine",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@oneatlas/shared": "workspace:*",
    "@oneatlas/cache-engine": "workspace:*",
    "@upstash/redis": "^1.34.0",
    "zod": "^3.22.4",
    "@anthropic-ai/sdk": "^0.96.0",
    "@google/genai": "^2.2.0",
    "openai": "^6.37.0",
    "dotenv": "^17.4.2"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "typescript": "^5.3.3"
  }
}
```

### 4.2 packages/template-engine/package.json

```json
{
  "name": "@oneatlas/template-engine",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@oneatlas/shared": "workspace:*",
    "@oneatlas/ai-engine": "workspace:*"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "typescript": "^5.3.3"
  }
}
```

### 4.3 packages/validation-engine/package.json

```json
{
  "name": "@oneatlas/validation-engine",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@oneatlas/shared": "workspace:*",
    "@oneatlas/ai-engine": "workspace:*",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "typescript": "^5.3.3"
  }
}
```

### 4.4 packages/observability-engine/package.json

```json
{
  "name": "@oneatlas/observability-engine",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@oneatlas/shared": "workspace:*",
    "@oneatlas/ai-engine": "workspace:*"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "typescript": "^5.3.3"
  }
}
```

### 4.5 packages/runtime-engine/package.json

```json
{
  "name": "@oneatlas/runtime-engine",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@oneatlas/shared": "workspace:*",
    "@oneatlas/cache-engine": "workspace:*",
    "@upstash/redis": "^1.34.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "typescript": "^5.3.3"
  }
}
```

### 4.6 packages/workflow-engine/package.json

```json
{
  "name": "@oneatlas/workflow-engine",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@oneatlas/shared": "workspace:*",
    "@oneatlas/ai-engine": "workspace:*",
    "@oneatlas/runtime-engine": "workspace:*",
    "@oneatlas/cache-engine": "workspace:*"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "typescript": "^5.3.3"
  }
}
```

### 4.7 packages/cache-engine/package.json

```json
{
  "name": "@oneatlas/cache-engine",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@upstash/redis": "^1.34.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "typescript": "^5.3.3"
  }
}
```

## 5. Compatibility Shim Strategy

packages/ai becomes a zero-logic re-export shim. All existing consumers continue to import from "@oneatlas/ai" without any changes.

**packages/ai/src/index.ts (new shim content)**

```typescript
// =============================================================================
// packages/ai/src/index.ts — COMPATIBILITY SHIM
//
// Re-exports everything from the new engine packages.
// Consumers should migrate to direct engine imports over time,
// but this shim guarantees zero breaking changes during migration.
// =============================================================================

// Gateway + Providers
export * from "@oneatlas/ai-engine/gateway";

// Understanding
export * from "@oneatlas/ai-engine/understanding";

// Semantic
export * from "@oneatlas/ai-engine/semantic";

// Generators + Prompts
export * from "@oneatlas/ai-engine/generators";
export * from "@oneatlas/ai-engine/prompts";

// Validation
export * from "@oneatlas/validation-engine";

// Calibration (moved to observability-engine)
export * from "@oneatlas/observability-engine/calibration";

// Templates
export * from "@oneatlas/template-engine";

// Workflows + Pipeline
export * from "@oneatlas/workflow-engine";

// Queue (moved to runtime-engine)
export * from "@oneatlas/runtime-engine/queue";

// Cache
export * from "@oneatlas/cache-engine";
```

**packages/ai/package.json (updated shim)**

```json
{
  "name": "@oneatlas/ai",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "dependencies": {
    "@oneatlas/ai-engine": "workspace:*",
    "@oneatlas/validation-engine": "workspace:*",
    "@oneatlas/observability-engine": "workspace:*",
    "@oneatlas/runtime-engine": "workspace:*",
    "@oneatlas/template-engine": "workspace:*",
    "@oneatlas/workflow-engine": "workspace:*",
    "@oneatlas/cache-engine": "workspace:*"
  }
}
```

## 6. Placeholder Packages (Future Systems)

These packages are not yet implemented in the current codebase. Create minimal placeholders with index.ts stubs only — no actual logic.

| Package | npm Name | Status |
|---------|----------|--------|
| packages/agent-system | @oneatlas/agent-system | Placeholder — multi-agent coordination not yet built |
| packages/entity-engine | @oneatlas/entity-engine | Placeholder — entity builder not yet built |
| packages/function-engine | @oneatlas/function-engine | Placeholder — Deno runtime not yet built |
| packages/storage-engine | @oneatlas/storage-engine | Placeholder — S3/R2 not yet built |
| packages/auth-engine | @oneatlas/auth-engine | Placeholder — Clerk is used directly |
| packages/integration-engine | @oneatlas/integration-engine | Placeholder — no connectors built yet |
| packages/realtime-engine | @oneatlas/realtime-engine | Placeholder — WebSocket not yet built |
| packages/preview-engine | @oneatlas/preview-engine | Placeholder — iframe sandbox not yet built |
| packages/deployment-engine | @oneatlas/deployment-engine | Placeholder — Cloudflare deploy via wrangler |
| packages/workspace-manager | @oneatlas/workspace-manager | Placeholder — project lifecycle not yet built |

Each placeholder has this structure:

```
packages/<name>/
  src/
    index.ts    # export {}; // placeholder
  package.json
  tsconfig.json
```

**NOTE:** observability-engine and runtime-engine are now ACTIVE packages (not placeholders) as they contain calibration and queue respectively.

## 7. pnpm-workspace.yaml Update

```yaml
packages:
  - 'OneaAtlas-Backend/apps/*'
  - 'OneaAtlas-Backend/packages/*'

allowBuilds:
  '@clerk/shared': true
  '@google/genai': true
  '@prisma/client': true
  '@prisma/engines': true
  esbuild: true
  msw: true
  prisma: true
  protobufjs: true
  sharp: true
  unrs-resolver: true
  workerd: true
```

**NOTE**

No changes required to root pnpm-workspace.yaml. New packages automatically discovered under OneaAtlas-Backend/packages/*.

## 8. Phased Execution Plan

**IMPORTANT**

Run pnpm --filter @oneatlas/ai type-check after each phase before proceeding.

### Phase 0: Scaffold New Package Directories

**Owner:** Platform Team | **Est:** 1 hour

Create directory structure and package.json / tsconfig.json for all new packages. No files moved yet. Run pnpm install to register new packages.

**Packages to scaffold:**

- packages/ai-engine/
- packages/template-engine/
- packages/validation-engine/
- packages/observability-engine/
- packages/runtime-engine/
- packages/workflow-engine/
- packages/cache-engine/
- All 10 placeholder packages (agent-system, entity-engine, function-engine, storage-engine, auth-engine, integration-engine, realtime-engine, preview-engine, deployment-engine, workspace-manager)

**Verify:** pnpm install succeeds. All packages appear in workspace resolution.

### Phase 1: Migrate cache-engine (No dependencies on other new packages)

**Owner:** AI Team | **Est:** 30 min

**Steps:**

1. git mv OneaAtlas-Backend/packages/ai/src/cache/responseCache.ts OneaAtlas-Backend/packages/cache-engine/src/responseCache.ts
2. git mv OneaAtlas-Backend/packages/ai/src/generation/ OneaAtlas-Backend/packages/cache-engine/src/generation/
3. Create packages/cache-engine/src/index.ts barrel
4. Update packages/ai/src/gateway/gateway.ts import: ../cache/responseCache → @oneatlas/cache-engine
5. Update packages/ai/src/index.ts cache export: point to @oneatlas/cache-engine

**Verify:** pnpm --filter @oneatlas/cache-engine type-check ✓

### Phase 2: Migrate ai-engine gateway + semantic + understanding

**Owner:** AI Team | **Est:** 2-3 hours

**Steps:**

1. git mv entire packages/ai/src/gateway/ → packages/ai-engine/src/gateway/
2. git mv entire packages/ai/src/semantic/ → packages/ai-engine/src/semantic/
3. git mv entire packages/ai/src/understanding/ → packages/ai-engine/src/understanding/
4. git mv remaining ai-engine directories: prompts/, generators/, intelligence/, product/, runtime/, streaming/, storage/
5. Fix internal relative imports (e.g. ../cache/responseCache → @oneatlas/cache-engine)
6. Fix ../shared/types/... → @oneatlas/shared (after Phase 4 completes types migration)
7. Create packages/ai-engine/src/index.ts barrel re-exporting all submodules

**IMPORTANT STABILITY NOTE:**

Keep the following directories inside ai-engine for now. Do NOT prematurely split them into separate engines during this migration:

- generation-memory/ (if exists)
- runtime/ (golden-template.ts, error-boundaries/, safe-mode/)
- repair/ (if exists in ai-engine)
- orchestration/ (if exists in ai-engine)
- streaming/

These are core to the AI generation pipeline and should remain in ai-engine to ensure stability. Future refactoring can consider splitting them, but not during this migration.

**Verify:** pnpm --filter @oneatlas/ai-engine type-check ✓

### Phase 3: Migrate validation-engine

**Owner:** AI Team | **Est:** 2 hours

**Steps:**

1. git mv entire packages/ai/src/validation/ → packages/validation-engine/src/
2. Fix internal imports: ../gateway/... → @oneatlas/ai-engine; ../shared/... → @oneatlas/shared
3. Create packages/validation-engine/src/index.ts barrel

**Verify:** pnpm --filter @oneatlas/validation-engine type-check ✓

### Phase 4: Migrate observability-engine

**Owner:** AI Team | **Est:** 1 hour

**Steps:**

1. git mv entire packages/ai/src/calibration/ → packages/observability-engine/src/calibration/
2. Fix internal imports: ../gateway/... → @oneatlas/ai-engine; ../shared/... → @oneatlas/shared
3. Create packages/observability-engine/src/index.ts barrel
4. Create packages/observability-engine/src/calibration/index.ts sub-barrel

**Rationale:** Calibration belongs to benchmarking, scoring, telemetry, replay, observability — NOT validation.

**Verify:** pnpm --filter @oneatlas/observability-engine type-check ✓

### Phase 5: Migrate runtime-engine

**Owner:** AI Team | **Est:** 1 hour

**Steps:**

1. git mv entire packages/ai/src/queue/ → packages/runtime-engine/src/queue/
2. Fix internal imports: ../shared/... → @oneatlas/shared; ../cache/... → @oneatlas/cache-engine
3. Create packages/runtime-engine/src/index.ts barrel
4. Create packages/runtime-engine/src/queue/index.ts sub-barrel

**Rationale:** queue/retry/cancellation = execution runtime — NOT workflow logic.

**Verify:** pnpm --filter @oneatlas/runtime-engine type-check ✓

### Phase 6: Migrate shared types to @oneatlas/shared

**Owner:** AI Team + Backend Team | **Est:** 1 hour

**Steps:**

1. git mv packages/ai/src/shared/types/app-understanding.types.ts packages/shared/src/types/app-understanding.types.ts
2. git mv packages/ai/src/shared/types/generation.types.ts packages/shared/src/types/generation.types.ts
3. git mv packages/ai/src/shared/types/common.types.ts packages/shared/src/types/common.types.ts
4. Update packages/shared/src/index.ts to export ./types/app-understanding.types, ./types/generation.types, ./types/common.types
5. Update all consumers of @oneatlas/ai that import these types — they continue to work through shim
6. Leave packages/ai/src/shared/constants/, contracts/, errors/, utils/ in ai-engine/src/shared/

**Verify:** pnpm --filter @oneatlas/shared type-check ✓

### Phase 7: Migrate template-engine

**Owner:** AI Team | **Est:** 1 hour

**Steps:**

1. git mv all files from packages/ai/src/templates/ → packages/template-engine/src/
2. Fix imports: update ./healthcare/..., ./crm/... relative imports (same structure, just root changes)
3. Create packages/template-engine/src/index.ts barrel

**Verify:** pnpm --filter @oneatlas/template-engine type-check ✓

### Phase 8: Migrate workflow-engine

**Owner:** AI Team | **Est:** 1.5 hours

**Steps:**

1. git mv packages/ai/src/workflows/ → packages/workflow-engine/src/
2. Fix internal imports: ../shared/... → @oneatlas/shared; ../gateway/... → @oneatlas/ai-engine; ../cache/... → @oneatlas/cache-engine; ../queue/... → @oneatlas/runtime-engine
3. Create packages/workflow-engine/src/index.ts barrel

**Verify:** pnpm --filter @oneatlas/workflow-engine type-check ✓

### Phase 9: Update packages/ai Compatibility Shim

**Owner:** Platform Team | **Est:** 30 min

**Steps:**

1. Replace packages/ai/src/index.ts with the shim content from §5
2. Update packages/ai/package.json to remove direct deps; add engine packages as deps
3. Delete all now-empty src subdirectories in packages/ai/src/

**Verify:** pnpm --filter @oneatlas/ai type-check ✓

### Phase 10: Consumer Import Update (Optional, non-blocking)

**Owner:** All Teams | **Est:** Ongoing

This phase is optional and non-breaking. Consumers can stay on @oneatlas/ai indefinitely. When teams choose to, they can migrate to direct engine imports:

```typescript
// Before (still works via shim)
import { AIGateway } from "@oneatlas/ai";

// After (direct engine import)
import { AIGateway } from "@oneatlas/ai-engine";
```

### Phase 11: Full-Stack Verification

**Owner:** All Teams | **Est:** 1 hour

```bash
# Type-check all packages
pnpm type-check

# Boot full dev stack
pnpm dev:full

# Verify API health
curl http://localhost:3001/api/v1/ai/health
```

## 9. tsconfig Inheritance Pattern

Each new package uses a shared base config:

```json
// packages/<engine>/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## 10. Import Resolution Rules

| From Package | Allowed to import | NOT allowed to import |
|--------------|-------------------|----------------------|
| cache-engine | (nothing from monorepo) | anything else |
| shared | (nothing from monorepo) | any engine |
| ai-engine | @oneatlas/shared, @oneatlas/cache-engine | validation-engine, workflow-engine, template-engine, observability-engine, runtime-engine |
| validation-engine | @oneatlas/shared, @oneatlas/ai-engine | workflow-engine, template-engine, runtime-engine |
| observability-engine | @oneatlas/shared, @oneatlas/ai-engine | workflow-engine, template-engine, runtime-engine |
| runtime-engine | @oneatlas/shared, @oneatlas/cache-engine | validation-engine, template-engine, workflow-engine |
| workflow-engine | @oneatlas/shared, @oneatlas/ai-engine, @oneatlas/runtime-engine, @oneatlas/cache-engine | validation-engine, template-engine |
| template-engine | @oneatlas/shared, @oneatlas/ai-engine | workflow-engine, validation-engine, runtime-engine |
| @oneatlas/ai (shim) | all engines | (it IS the shim — no logic) |
| apps/* | all packages | (consumers) |

## 11. Open Questions

**IMPORTANT**

**Q1:** Should packages/ai/src/shared/constants/ and contracts/ move to @oneatlas/shared or stay as ai-engine/src/shared/? Currently scoped to AI internals — recommend keeping in ai-engine unless other teams need them.

**IMPORTANT**

**Q2:** The apps/api currently uses apps/api/src/app/api/v1/... Next.js routes. The target architecture shows apps/api as a Hono on Node server with routes/services/middleware structure. Is this backend framework migration in scope for this ticket, or is it a future phase?

**IMPORTANT**

**Q3:** Should the apps/web frontend also be refactored to the new route group structure ((marketing)/, (auth)/, (dashboard)/) in this migration, or is the frontend scope limited to the engine packages?

**WARNING**

Circular dependency risk: validation-engine imports from ai-engine, and ai-engine's runtime/ contains golden-template.ts which may import from validation. Verify with madge --circular after Phase 3 before proceeding to Phase 9.

## 12. Verification Checklist Per Phase

- **Phase 0:** □ pnpm install succeeds □ All new packages resolve in workspace
- **Phase 1:** □ cache-engine type-check □ ai/gateway imports updated
- **Phase 2:** □ ai-engine type-check □ No broken imports in gateway/semantic/understanding □ runtime/repair/orchestration/streaming kept in ai-engine
- **Phase 3:** □ validation-engine type-check □ Calibration NOT moved here
- **Phase 4:** □ observability-engine type-check □ Calibration sub-barrel works
- **Phase 5:** □ runtime-engine type-check □ Queue sub-barrel works
- **Phase 6:** □ shared type-check □ AppUnderstanding type accessible from @oneatlas/shared
- **Phase 7:** □ template-engine type-check □ healthcare + crm templates register correctly
- **Phase 8:** □ workflow-engine type-check □ runGenerationPipeline still callable □ Queue imports updated to runtime-engine
- **Phase 9:** □ @oneatlas/ai type-check □ All apps/* still compile □ No regressions
- **Phase 10:** □ (optional) direct imports work for migrated consumers
- **Phase 11:** □ pnpm type-check (all) □ pnpm dev:full □ API health 200
