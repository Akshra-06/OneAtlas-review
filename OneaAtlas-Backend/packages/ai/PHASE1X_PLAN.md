# Phase 1.X: Streaming Runtime Architecture

## Overview

Phase 1.X focuses on transforming OneAtlas from a batch generation system to an interactive streaming generation system. The goal is to make the platform feel live, collaborative, incremental, reactive, and intelligent.

**Goal:** Transform OneAtlas from "AI scaffolding generator" to "AI-native collaborative application runtime"

---

## Primary Objective

Transform generation UX from:
- Batch generation (generate → wait → receive app)

To:
- Interactive streaming generation (live, collaborative, incremental, reactive, intelligent)

---

## Important Implementation Rules

- Extend existing queue systems
- Integrate with existing validation layer
- Integrate with existing repair systems
- Preserve deterministic generation
- Avoid unnecessary abstraction
- Avoid overengineering
- Prioritize UX responsiveness
- Prioritize perceived intelligence

---

## DO NOT DO

- Redesign folder structure
- Rewrite generators
- Rebuild validation systems
- Add drag-drop builders yet
- Build marketplace/community features
- Over-engineer dashboards

---

## Task 1 — Streaming Generation Engine

### Objective
Implement real-time generation streaming via SSE/WebSockets.

### Requirements
- Stream generation progress via SSE/WebSockets
- Stream partial AI responses
- Stream component generation incrementally
- Stream validation status
- Stream repair actions in real time
- Stream preview readiness updates
- Support chunk-based generation

### Implement
- `generation-stream-manager.ts`
- `stream-orchestrator.ts`
- `stream-session.ts`
- `stream-event-bus.ts`

### Streaming Events
- `generation_started`
- `understanding_complete`
- `entities_generated`
- `workflows_generated`
- `components_generated`
- `validation_started`
- `repair_applied`
- `preview_ready`
- `generation_completed`
- `generation_failed`

### Deliverables
- Streaming generation manager with SSE/WebSocket support
- Stream orchestrator for coordinating generation steps
- Stream session management for multiple concurrent sessions
- Event bus for streaming events
- Event type definitions and schemas

---

## Task 2 — Partial Preview Rendering

### Objective
Implement progressive preview updates without full reloads.

### Requirements
- Preview updates incrementally
- Partial UI renders before full completion
- Support optimistic rendering
- Avoid full preview reloads
- Preserve preview state during updates
- Support iframe hot updates

### Implement
- `partial-preview-renderer.ts`
- `preview-patch-engine.ts`
- `preview-state-manager.ts`
- `hot-reload-runtime.ts`

### Capabilities
- Render navbar before full app complete
- Render dashboard shell immediately
- Progressively inject widgets/components
- Patch changed components only

### Deliverables
- Partial preview renderer for incremental updates
- Preview patch engine for applying changes
- Preview state manager for preserving state
- Hot reload runtime for iframe updates
- Preview update protocol

---

## Task 3 — Patch-Based Regeneration

### Objective
Implement incremental regeneration instead of full rebuilds.

### Requirements
- Regenerate ONLY changed sections
- Preserve untouched generated code
- Generate AST/code diffs
- Apply patch operations safely
- Support rollback if patch fails

### Implement
- `patch-generator.ts`
- `incremental-regenerator.ts`
- `diff-engine.ts`
- `patch-validator.ts`

### Patch Operations
- Component patch
- Layout patch
- Workflow patch
- Schema patch
- Style patch

### Deliverables
- Patch generator for creating incremental changes
- Incremental regenerator for applying patches
- Diff engine for comparing code/AST
- Patch validator for safety checks
- Patch operation definitions

---

## Task 4 — Live Iteration Loop

### Objective
Implement conversational iterative editing.

### Requirements
- User can modify generated app via chat
- Support contextual edits
- Preserve generation memory
- Maintain generation history
- Support undo/redo across generations

### Examples
- "make dashboard more modern"
- "add charts"
- "change CRM into healthcare CRM"
- "add dark mode"
- "make analytics page cleaner"

### Implement
- `iteration-session-manager.ts`
- `contextual-memory.ts`
- `generation-history.ts`
- `conversational-patch-engine.ts`

### Deliverables
- Iteration session manager for conversational editing
- Contextual memory for preserving context
- Generation history for undo/redo
- Conversational patch engine for natural language edits
- Edit intent detection

---

## Task 5 — Real-Time Builder State

### Objective
Implement synchronized builder state across the application.

### Requirements
- Live builder updates
- Real-time generation state
- Synchronized preview status
- Streaming logs panel
- Live diagnostics panel

### Implement
- `builder-sync-engine.ts`
- `realtime-generation-store.ts`
- `generation-timeline.ts`
- `diagnostics-stream.ts`

### Deliverables
- Builder sync engine for state synchronization
- Real-time generation store for state management
- Generation timeline for progress visualization
- Diagnostics stream for live error reporting
- State synchronization protocol

---

## Task 6 — Generation Cancellation & Recovery

### Objective
Implement interruption-safe generation.

### Requirements
- Cancel generation mid-stream
- Recover interrupted generation
- Resume partial generation
- Checkpoint generation progress
- Queue-aware cancellation

### Implement
- `generation-checkpoint.ts`
- `cancellation-manager.ts`
- `recovery-engine.ts`
- `resumable-session.ts`

### Deliverables
- Generation checkpoint system for progress tracking
- Cancellation manager for safe interruption
- Recovery engine for resuming sessions
- Resumable session management
- Cancellation/recovery protocol

---

## Task 7 — Streaming UX Improvements

### Objective
Improve perceived intelligence dramatically through UX enhancements.

### Requirements
- Animated generation timeline
- Live typing/thinking indicators
- Generation step visualization
- Progressive confidence indicators
- Live repair notifications
- Component generation animations

### Goal
Generation should FEEL alive.

### Deliverables
- Animated timeline component
- Typing/thinking indicators
- Step visualization UI
- Confidence indicator components
- Repair notification system
- Animation library integration

---

## Task 8 — Performance Optimization

### Objective
Optimize streaming performance for responsiveness.

### Requirements
- Avoid full rebuilds
- Reduce preview startup time
- Optimize streaming payloads
- Implement chunk caching
- Support concurrent streaming sessions

### Deliverables
- Performance optimization for streaming
- Chunk caching system
- Concurrent session management
- Payload optimization
- Performance monitoring

---

## Implementation Order

### High Priority (Must Complete First)
1. Task 1: Streaming Generation Engine
2. Task 2: Partial Preview Rendering
3. Task 3: Patch-Based Regeneration
4. Task 4: Live Iteration Loop
5. Task 5: Real-Time Builder State
6. Task 6: Generation Cancellation & Recovery

### Medium Priority (Complete After High Priority)
7. Task 7: Streaming UX Improvements
8. Task 8: Performance Optimization

---

## Success Criteria

OneAtlas should:
- Stream generation live
- Update preview progressively
- Support iterative editing
- Regenerate partially
- Feel collaborative
- Avoid full preview reloads
- Recover interrupted sessions
- Provide real-time generation visibility

---

## Dependencies

Phase 1.X depends on:
- Existing queue infrastructure (JobQueueManager)
- Existing validation layer (ValidationOrchestrator)
- Existing repair systems (repair-undo, repair-suggestions)
- Existing intelligence layer (Phase 2 components)

Phase 1.X enables:
- Real-time collaboration features
- Interactive editing capabilities
- Live preview updates
- Conversational AI interaction

---

## Estimated Timeline

- High Priority Tasks: 3-4 weeks
- Medium Priority Tasks: 1-2 weeks
- **Total Estimated Time: 4-6 weeks**

---

## Technical Notes

### Streaming Protocol
- Use Server-Sent Events (SSE) for unidirectional streaming
- Use WebSockets for bidirectional communication
- Implement event batching for performance
- Add event compression for large payloads

### Preview Updates
- Use iframe isolation for preview
- Implement postMessage API for communication
- Use virtual DOM diffing for updates
- Preserve component state during updates

### Patch Generation
- Use AST-based diffing for code changes
- Implement safe patch application
- Add rollback capability
- Validate patches before application

### State Management
- Use reactive state for real-time updates
- Implement state synchronization
- Add state persistence
- Support state recovery

---

## Integration Points

### Existing Systems to Integrate With
- `src/queue/job-queue.ts` - Queue management for generation jobs
- `src/validation/orchestrator/validation-orchestrator.ts` - Validation integration
- `src/validation/repair/repair-undo.ts` - Repair system integration
- `src/validation/repair/repair-suggestions.ts` - Repair suggestions
- `src/intelligence/` - Intelligence layer integration

### New Directory Structure
```
src/streaming/
├── generation-stream-manager.ts
├── stream-orchestrator.ts
├── stream-session.ts
├── stream-event-bus.ts
├── preview/
│   ├── partial-preview-renderer.ts
│   ├── preview-patch-engine.ts
│   ├── preview-state-manager.ts
│   └── hot-reload-runtime.ts
├── patch/
│   ├── patch-generator.ts
│   ├── incremental-regenerator.ts
│   ├── diff-engine.ts
│   └── patch-validator.ts
├── iteration/
│   ├── iteration-session-manager.ts
│   ├── contextual-memory.ts
│   ├── generation-history.ts
│   └── conversational-patch-engine.ts
├── state/
│   ├── builder-sync-engine.ts
│   ├── realtime-generation-store.ts
│   ├── generation-timeline.ts
│   └── diagnostics-stream.ts
├── cancellation/
│   ├── generation-checkpoint.ts
│   ├── cancellation-manager.ts
│   ├── recovery-engine.ts
│   └── resumable-session.ts
└── index.ts
```

---

## Testing Strategy

### Unit Tests
- Stream manager tests
- Preview renderer tests
- Patch generator tests
- State management tests

### Integration Tests
- End-to-end streaming tests
- Preview update tests
- Iteration loop tests
- Cancellation/recovery tests

### Performance Tests
- Streaming payload optimization
- Preview update performance
- Concurrent session handling
- Memory usage monitoring

---

## Monitoring & Observability

### Metrics to Track
- Streaming latency
- Preview update time
- Patch application success rate
- Cancellation/recovery success rate
- Concurrent session count
- Memory usage per session

### Logs to Capture
- Stream event logs
- Preview update logs
- Patch application logs
- Cancellation logs
- Error logs with context

---

## Security Considerations

- Validate all streaming events
- Sanitize preview content
- Secure WebSocket connections
- Implement rate limiting for streaming
- Add authentication for streaming sessions
- Validate patch operations before application

---

## Final Goal

Transform OneAtlas from:
"AI scaffolding generator"

To:
"AI-native collaborative application runtime"
