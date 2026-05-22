OneAtlas/                                \# BASE44 CLONE — AI-NATIVE FULL-STACK APP BUILDER  
│  
│  
├── apps/  
│   │  
│   ├── web/                                          \# MAIN FRONTEND (NEXT.JS 14 APP ROUTER)  
│   │   │  
│   │   ├── public/  
│   │   │   ├── fonts/  
│   │   │   ├── icons/  
│   │   │   ├── images/  
│   │   │   ├── logos/  
│   │   │   └── og/  
│   │   │  
│   │   ├── src/  
│   │   │   │  
│   │   │   ├── app/  
│   │   │   │   │  
│   │   │   │   ├── (marketing)/  
│   │   │   │   │   ├── page.tsx  
│   │   │   │   │   ├── pricing/  
│   │   │   │   │   │   └── page.tsx  
│   │   │   │   │   ├── enterprise/  
│   │   │   │   │   │   └── page.tsx  
│   │   │   │   │   ├── blog/  
│   │   │   │   │   │   ├── page.tsx  
│   │   │   │   │   │   └── \[slug\]/  
│   │   │   │   │   │       └── page.tsx  
│   │   │   │   │   ├── changelog/  
│   │   │   │   │   │   └── page.tsx  
│   │   │   │   │   └── community/  
│   │   │   │   │       └── page.tsx  
│   │   │   │   │  
│   │   │   │   ├── (auth)/  
│   │   │   │   │   ├── login/  
│   │   │   │   │   │   └── page.tsx  
│   │   │   │   │   ├── signup/  
│   │   │   │   │   │   └── page.tsx  
│   │   │   │   │   ├── forgot-password/  
│   │   │   │   │   │   └── page.tsx  
│   │   │   │   │   ├── verify/  
│   │   │   │   │   │   └── page.tsx  
│   │   │   │   │   └── onboarding/  
│   │   │   │   │       └── page.tsx  
│   │   │   │   │  
│   │   │   │   ├── (dashboard)/  
│   │   │   │   │   │  
│   │   │   │   │   ├── dashboard/  
│   │   │   │   │   │   └── page.tsx  
│   │   │   │   │   │  
│   │   │   │   │   ├── projects/  
│   │   │   │   │   │   ├── page.tsx  
│   │   │   │   │   │   ├── new/  
│   │   │   │   │   │   │   └── page.tsx  
│   │   │   │   │   │   └── \[projectId\]/  
│   │   │   │   │   │       └── page.tsx  
│   │   │   │   │   │  
│   │   │   │   │   ├── builder/  
│   │   │   │   │   │   └── \[projectId\]/  
│   │   │   │   │   │       ├── page.tsx             \# Main builder canvas  
│   │   │   │   │   │       ├── chat/  
│   │   │   │   │   │       │   └── page.tsx  
│   │   │   │   │   │       ├── data/  
│   │   │   │   │   │       │   └── page.tsx         \# Entity / schema manager  
│   │   │   │   │   │       ├── pages/  
│   │   │   │   │   │       │   └── page.tsx  
│   │   │   │   │   │       ├── workflows/  
│   │   │   │   │   │       │   └── page.tsx         \# Visual workflow builder  
│   │   │   │   │   │       ├── functions/  
│   │   │   │   │   │       │   └── page.tsx  
│   │   │   │   │   │       ├── integrations/  
│   │   │   │   │   │       │   └── page.tsx  
│   │   │   │   │   │       ├── permissions/  
│   │   │   │   │   │       │   └── page.tsx  
│   │   │   │   │   │       └── settings/  
│   │   │   │   │   │           └── page.tsx  
│   │   │   │   │   │  
│   │   │   │   │   ├── preview/  
│   │   │   │   │   │   └── \[projectId\]/  
│   │   │   │   │   │       └── page.tsx  
│   │   │   │   │   │  
│   │   │   │   │   ├── deployments/  
│   │   │   │   │   │   ├── page.tsx  
│   │   │   │   │   │   └── \[deploymentId\]/  
│   │   │   │   │   │       └── page.tsx  
│   │   │   │   │   │  
│   │   │   │   │   ├── templates/  
│   │   │   │   │   │   ├── page.tsx                 \# Template marketplace  
│   │   │   │   │   │   └── \[templateId\]/  
│   │   │   │   │   │       └── page.tsx  
│   │   │   │   │   │  
│   │   │   │   │   ├── analytics/  
│   │   │   │   │   │   └── \[projectId\]/  
│   │   │   │   │   │       └── page.tsx  
│   │   │   │   │   │  
│   │   │   │   │   ├── observability/  
│   │   │   │   │   │   └── \[projectId\]/  
│   │   │   │   │   │       ├── page.tsx             \# Pipeline inspector UI  
│   │   │   │   │   │       ├── traces/  
│   │   │   │   │   │       │   └── page.tsx  
│   │   │   │   │   │       └── replay/  
│   │   │   │   │   │           └── page.tsx         \# Generation replay viewer  
│   │   │   │   │   │  
│   │   │   │   │   ├── billing/  
│   │   │   │   │   │   └── page.tsx  
│   │   │   │   │   │  
│   │   │   │   │   ├── team/  
│   │   │   │   │   │   └── page.tsx  
│   │   │   │   │   │  
│   │   │   │   │   └── settings/  
│   │   │   │   │       └── page.tsx  
│   │   │   │   │  
│   │   │   │   ├── api/                             \# Next.js route handlers — thin proxies only  
│   │   │   │   │   ├── auth/  
│   │   │   │   │   │   └── \[...nextauth\]/  
│   │   │   │   │   │       └── route.ts  
│   │   │   │   │   ├── health/  
│   │   │   │   │   │   └── route.ts  
│   │   │   │   │   └── webhooks/  
│   │   │   │   │       └── stripe/  
│   │   │   │   │           └── route.ts  
│   │   │   │   │  
│   │   │   │   ├── layout.tsx  
│   │   │   │   ├── loading.tsx  
│   │   │   │   ├── error.tsx  
│   │   │   │   ├── not-found.tsx  
│   │   │   │   └── globals.css  
│   │   │   │  
│   │   │   │  
│   │   │   ├── components/  
│   │   │   │   │  
│   │   │   │   ├── ui/                              \# ShadCN base components  
│   │   │   │   │  
│   │   │   │   ├── shared/  
│   │   │   │   │   ├── navbar/  
│   │   │   │   │   ├── footer/  
│   │   │   │   │   ├── sidebar/  
│   │   │   │   │   ├── loaders/  
│   │   │   │   │   ├── modals/  
│   │   │   │   │   ├── dialogs/  
│   │   │   │   │   ├── command-menu/  
│   │   │   │   │   ├── empty-state/  
│   │   │   │   │   └── error-state/  
│   │   │   │   │  
│   │   │   │   ├── builder/                         \# THE CORE BUILDER UI  
│   │   │   │   │   ├── chat-panel/  
│   │   │   │   │   │   ├── ChatPanel.tsx  
│   │   │   │   │   │   ├── MessageBubble.tsx  
│   │   │   │   │   │   ├── PromptInput.tsx  
│   │   │   │   │   │   ├── StreamingResponse.tsx  
│   │   │   │   │   │   └── SuggestionChips.tsx  
│   │   │   │   │   │  
│   │   │   │   │   ├── canvas/  
│   │   │   │   │   │   ├── BuilderCanvas.tsx  
│   │   │   │   │   │   ├── PageFrame.tsx  
│   │   │   │   │   │   ├── ComponentOverlay.tsx  
│   │   │   │   │   │   └── DeviceToggle.tsx  
│   │   │   │   │   │  
│   │   │   │   │   ├── entity-editor/  
│   │   │   │   │   │   ├── EntityEditor.tsx  
│   │   │   │   │   │   ├── EntityList.tsx  
│   │   │   │   │   │   ├── FieldRow.tsx  
│   │   │   │   │   │   ├── RelationEditor.tsx  
│   │   │   │   │   │   └── SchemaPreview.tsx  
│   │   │   │   │   │  
│   │   │   │   │   ├── workflow-builder/            \# Visual workflow graph editor  
│   │   │   │   │   │   ├── WorkflowBuilder.tsx  
│   │   │   │   │   │   ├── NodeCanvas.tsx  
│   │   │   │   │   │   ├── TriggerNode.tsx  
│   │   │   │   │   │   ├── ActionNode.tsx  
│   │   │   │   │   │   ├── ConditionNode.tsx  
│   │   │   │   │   │   └── EdgeConnector.tsx  
│   │   │   │   │   │  
│   │   │   │   │   ├── page-manager/  
│   │   │   │   │   │   ├── PageManager.tsx  
│   │   │   │   │   │   ├── PageTree.tsx  
│   │   │   │   │   │   └── RouteEditor.tsx  
│   │   │   │   │   │  
│   │   │   │   │   ├── function-editor/  
│   │   │   │   │   │   ├── FunctionEditor.tsx  
│   │   │   │   │   │   ├── MonacoEditor.tsx  
│   │   │   │   │   │   ├── FunctionList.tsx  
│   │   │   │   │   │   └── FunctionLogs.tsx  
│   │   │   │   │   │  
│   │   │   │   │   ├── template-picker/             \# Archetype selection UI  
│   │   │   │   │   │   ├── TemplatePicker.tsx  
│   │   │   │   │   │   ├── ArchetypeCard.tsx  
│   │   │   │   │   │   ├── TemplatePreview.tsx  
│   │   │   │   │   │   └── CategoryFilter.tsx  
│   │   │   │   │   │  
│   │   │   │   │   ├── integration-panel/  
│   │   │   │   │   │   ├── IntegrationPanel.tsx  
│   │   │   │   │   │   ├── ConnectorCard.tsx  
│   │   │   │   │   │   └── OAuthButton.tsx  
│   │   │   │   │   │  
│   │   │   │   │   ├── permission-editor/  
│   │   │   │   │   │   ├── PermissionEditor.tsx  
│   │   │   │   │   │   ├── RuleBuilder.tsx  
│   │   │   │   │   │   └── RoleManager.tsx  
│   │   │   │   │   │  
│   │   │   │   │   └── toolbar/  
│   │   │   │   │       ├── BuilderToolbar.tsx  
│   │   │   │   │       ├── UndoRedo.tsx  
│   │   │   │   │       ├── PreviewButton.tsx  
│   │   │   │   │       └── PublishButton.tsx  
│   │   │   │   │  
│   │   │   │   ├── observability/                   \# Pipeline inspector UI components  
│   │   │   │   │   ├── TraceViewer.tsx  
│   │   │   │   │   ├── PipelineInspector.tsx  
│   │   │   │   │   ├── ReplayTimeline.tsx  
│   │   │   │   │   ├── FailureDetail.tsx  
│   │   │   │   │   └── MetricsPanel.tsx  
│   │   │   │   │  
│   │   │   │   ├── dashboard/  
│   │   │   │   │   ├── ProjectCard.tsx  
│   │   │   │   │   ├── ProjectGrid.tsx  
│   │   │   │   │   ├── NewProjectPrompt.tsx  
│   │   │   │   │   ├── UsageStats.tsx  
│   │   │   │   │   └── RecentActivity.tsx  
│   │   │   │   │  
│   │   │   │   ├── deployments/  
│   │   │   │   │   ├── DeploymentCard.tsx  
│   │   │   │   │   ├── DeploymentLogs.tsx  
│   │   │   │   │   ├── DomainManager.tsx  
│   │   │   │   │   └── StatusBadge.tsx  
│   │   │   │   │  
│   │   │   │   ├── analytics/  
│   │   │   │   │   ├── UsageChart.tsx  
│   │   │   │   │   ├── EventFeed.tsx  
│   │   │   │   │   └── MetricsGrid.tsx  
│   │   │   │   │  
│   │   │   │   ├── marketing/  
│   │   │   │   │   ├── hero/  
│   │   │   │   │   ├── features/  
│   │   │   │   │   ├── pricing/  
│   │   │   │   │   ├── faq/  
│   │   │   │   │   ├── testimonials/  
│   │   │   │   │   └── integrations/  
│   │   │   │   │  
│   │   │   │   └── auth/  
│   │   │   │  
│   │   │   │  
│   │   │   ├── hooks/  
│   │   │   │   ├── use-auth.ts  
│   │   │   │   ├── use-builder.ts  
│   │   │   │   ├── use-entity.ts  
│   │   │   │   ├── use-workflow.ts  
│   │   │   │   ├── use-preview.ts  
│   │   │   │   ├── use-projects.ts  
│   │   │   │   ├── use-deployments.ts  
│   │   │   │   ├── use-functions.ts  
│   │   │   │   ├── use-integrations.ts  
│   │   │   │   ├── use-permissions.ts  
│   │   │   │   ├── use-templates.ts  
│   │   │   │   ├── use-realtime.ts  
│   │   │   │   ├── use-observability.ts  
│   │   │   │   ├── use-analytics.ts  
│   │   │   │   └── use-theme.ts  
│   │   │   │  
│   │   │   │  
│   │   │   ├── api-client/                          \# Thin HTTP wrappers — no business logic  
│   │   │   │   ├── auth.client.ts  
│   │   │   │   ├── ai.client.ts  
│   │   │   │   ├── project.client.ts  
│   │   │   │   ├── entity.client.ts  
│   │   │   │   ├── workflow.client.ts  
│   │   │   │   ├── function.client.ts  
│   │   │   │   ├── template.client.ts  
│   │   │   │   ├── preview.client.ts  
│   │   │   │   ├── deployment.client.ts  
│   │   │   │   ├── integration.client.ts  
│   │   │   │   ├── analytics.client.ts  
│   │   │   │   ├── observability.client.ts  
│   │   │   │   └── storage.client.ts  
│   │   │   │  
│   │   │   │  
│   │   │   ├── store/                               \# Zustand global state  
│   │   │   │   ├── auth-store.ts  
│   │   │   │   ├── builder-store.ts  
│   │   │   │   ├── entity-store.ts  
│   │   │   │   ├── workflow-store.ts  
│   │   │   │   ├── preview-store.ts  
│   │   │   │   ├── deployment-store.ts  
│   │   │   │   └── ui-store.ts  
│   │   │   │  
│   │   │   │  
│   │   │   ├── providers/  
│   │   │   │   ├── query-provider.tsx  
│   │   │   │   ├── theme-provider.tsx  
│   │   │   │   ├── auth-provider.tsx  
│   │   │   │   ├── realtime-provider.tsx  
│   │   │   │   └── builder-provider.tsx  
│   │   │   │  
│   │   │   │  
│   │   │   ├── lib/  
│   │   │   │   ├── axios.ts  
│   │   │   │   ├── fetcher.ts  
│   │   │   │   ├── auth.ts  
│   │   │   │   ├── env.ts  
│   │   │   │   ├── logger.ts  
│   │   │   │   ├── utils.ts  
│   │   │   │   ├── constants.ts  
│   │   │   │   └── validations/  
│   │   │   │  
│   │   │   ├── styles/  
│   │   │   │   ├── animations.css  
│   │   │   │   ├── themes.css  
│   │   │   │   └── builder.css  
│   │   │   │  
│   │   │   ├── types/  
│   │   │   │   ├── auth.ts  
│   │   │   │   ├── project.ts  
│   │   │   │   ├── entity.ts  
│   │   │   │   ├── workflow.ts  
│   │   │   │   ├── function.ts  
│   │   │   │   ├── template.ts  
│   │   │   │   ├── deployment.ts  
│   │   │   │   ├── integration.ts  
│   │   │   │   └── analytics.ts  
│   │   │   │  
│   │   │   ├── config/  
│   │   │   │   ├── navigation.ts  
│   │   │   │   ├── site.ts  
│   │   │   │   └── dashboard.ts  
│   │   │   │  
│   │   │   ├── constants/  
│   │   │   ├── utils/  
│   │   │   └── middleware.ts  
│   │   │  
│   │   │  
│   │   ├── tests/  
│   │   │   ├── unit/  
│   │   │   ├── integration/  
│   │   │   └── e2e/  
│   │   │  
│   │   ├── next.config.ts  
│   │   ├── tailwind.config.ts  
│   │   ├── tsconfig.json  
│   │   ├── postcss.config.js  
│   │   ├── .env.local  
│   │   └── package.json  
│   │  
│   │  
│   └── api/                                         \# BACKEND (HONO ON NODE)  
│       │  
│       ├── src/  
│       │   │  
│       │   ├── routes/  
│       │   │   ├── auth/  
│       │   │   │   ├── index.ts  
│       │   │   │   ├── google.ts  
│       │   │   │   └── magic-link.ts  
│       │   │   ├── ai/  
│       │   │   │   ├── index.ts  
│       │   │   │   ├── generate.ts  
│       │   │   │   ├── iterate.ts  
│       │   │   │   └── stream.ts  
│       │   │   ├── projects/  
│       │   │   │   ├── index.ts  
│       │   │   │   └── \[projectId\]/  
│       │   │   │       ├── index.ts  
│       │   │   │       ├── entities.ts  
│       │   │   │       ├── pages.ts  
│       │   │   │       ├── workflows.ts  
│       │   │   │       ├── functions.ts  
│       │   │   │       └── permissions.ts  
│       │   │   ├── templates/  
│       │   │   ├── deployments/  
│       │   │   ├── integrations/  
│       │   │   ├── storage/  
│       │   │   ├── analytics/  
│       │   │   ├── observability/  
│       │   │   ├── billing/  
│       │   │   ├── health/  
│       │   │   └── webhooks/  
│       │   │  
│       │   │  
│       │   ├── services/                            \# Orchestration only — delegates to packages  
│       │   │   ├── ai.service.ts  
│       │   │   ├── project.service.ts  
│       │   │   ├── entity.service.ts  
│       │   │   ├── workflow.service.ts  
│       │   │   ├── function.service.ts  
│       │   │   ├── template.service.ts  
│       │   │   ├── preview.service.ts  
│       │   │   ├── deployment.service.ts  
│       │   │   ├── storage.service.ts  
│       │   │   ├── integration.service.ts  
│       │   │   ├── realtime.service.ts  
│       │   │   ├── analytics.service.ts  
│       │   │   ├── observability.service.ts  
│       │   │   └── billing.service.ts  
│       │   │  
│       │   │  
│       │   ├── middleware/  
│       │   │   ├── auth.middleware.ts  
│       │   │   ├── rate-limit.middleware.ts  
│       │   │   ├── error.middleware.ts  
│       │   │   ├── logger.middleware.ts  
│       │   │   └── validate.middleware.ts  
│       │   │  
│       │   │  
│       │   ├── validators/  
│       │   │   ├── project.validator.ts  
│       │   │   ├── entity.validator.ts  
│       │   │   ├── workflow.validator.ts  
│       │   │   ├── function.validator.ts  
│       │   │   ├── deployment.validator.ts  
│       │   │   └── ai.validator.ts  
│       │   │  
│       │   │  
│       │   ├── workers/  
│       │   │   ├── build.worker.ts  
│       │   │   ├── deploy.worker.ts  
│       │   │   ├── preview.worker.ts  
│       │   │   ├── workflow.worker.ts               \# Async workflow execution  
│       │   │   └── cleanup.worker.ts  
│       │   │  
│       │   │  
│       │   ├── queues/  
│       │   │   ├── build.queue.ts  
│       │   │   ├── deploy.queue.ts  
│       │   │   ├── preview.queue.ts  
│       │   │   └── workflow.queue.ts  
│       │   │  
│       │   │  
│       │   ├── events/  
│       │   │   ├── emitter.ts  
│       │   │   └── handlers/  
│       │   │       ├── project.handler.ts  
│       │   │       ├── deployment.handler.ts  
│       │   │       ├── workflow.handler.ts  
│       │   │       └── ai.handler.ts  
│       │   │  
│       │   │  
│       │   ├── realtime/  
│       │   │   ├── server.ts  
│       │   │   ├── channels/  
│       │   │   │   ├── builder.channel.ts  
│       │   │   │   ├── workflow.channel.ts  
│       │   │   │   └── project.channel.ts  
│       │   │   └── adapters/  
│       │   │       └── redis.adapter.ts  
│       │   │  
│       │   │  
│       │   ├── telemetry/  
│       │   │   ├── tracer.ts  
│       │   │   └── metrics.ts  
│       │   │  
│       │   ├── logs/  
│       │   ├── utils/  
│       │   ├── types/  
│       │   ├── config/  
│       │   └── constants/  
│       │  
│       │  
│       ├── tests/  
│       │   ├── unit/  
│       │   ├── integration/  
│       │   └── e2e/  
│       │  
│       ├── tsconfig.json  
│       ├── .env  
│       └── package.json  
│  
│  
├── packages/  
│   │  
│   │  
│   ├── shared/                                      \# CROSS-TEAM CONTRACTS \+ SHARED TYPES  
│   │   └── src/  
│   │       ├── types/  
│   │       │   ├── ai/  
│   │       │   │   ├── generation.types.ts  
│   │       │   │   ├── providers.types.ts  
│   │       │   │   └── index.ts  
│   │       │   ├── understanding/                   \# TEAM 3 CONTRACT BOUNDARY  
│   │       │   │   ├── app-understanding.types.ts  
│   │       │   │   └── index.ts  
│   │       │   ├── entity/  
│   │       │   │   ├── entity.types.ts  
│   │       │   │   ├── field.types.ts  
│   │       │   │   ├── relation.types.ts  
│   │       │   │   └── index.ts  
│   │       │   ├── workflow/  
│   │       │   │   ├── workflow.types.ts  
│   │       │   │   ├── trigger.types.ts  
│   │       │   │   ├── action.types.ts  
│   │       │   │   └── index.ts  
│   │       │   ├── project/  
│   │       │   │   ├── project.types.ts  
│   │       │   │   └── index.ts  
│   │       │   ├── deployment/  
│   │       │   │   ├── deployment.types.ts  
│   │       │   │   └── index.ts  
│   │       │   ├── function/  
│   │       │   │   ├── function.types.ts  
│   │       │   │   └── index.ts  
│   │       │   ├── integration/  
│   │       │   │   ├── connector.types.ts  
│   │       │   │   └── index.ts  
│   │       │   ├── template/  
│   │       │   │   ├── template.types.ts  
│   │       │   │   ├── archetype.types.ts  
│   │       │   │   └── index.ts  
│   │       │   └── index.ts  
│   │       │  
│   │       ├── constants/  
│   │       │   ├── ai.constants.ts  
│   │       │   ├── entity.constants.ts  
│   │       │   ├── workflow.constants.ts  
│   │       │   ├── deployment.constants.ts  
│   │       │   └── index.ts  
│   │       │  
│   │       ├── helpers/  
│   │       ├── utils/  
│   │       ├── validations/  
│   │       └── index.ts  
│   │  
│   │  
│   ├── contracts/                                   \# DETERMINISTIC AI OUTPUT CONTRACTS  
│   │   └── src/  
│   │       ├── generation/  
│   │       │   ├── app-generation.contract.ts       \# Full app output shape  
│   │       │   ├── page-generation.contract.ts      \# Single page output shape  
│   │       │   ├── component-generation.contract.ts  
│   │       │   └── index.ts  
│   │       ├── entities/  
│   │       │   ├── entity-output.contract.ts        \# Schema generation output  
│   │       │   ├── field-output.contract.ts  
│   │       │   └── index.ts  
│   │       ├── functions/  
│   │       │   ├── function-output.contract.ts      \# Function generation output  
│   │       │   └── index.ts  
│   │       ├── preview/  
│   │       │   ├── preview-manifest.contract.ts  
│   │       │   └── index.ts  
│   │       ├── deployment/  
│   │       │   ├── deployment-manifest.contract.ts  
│   │       │   └── index.ts  
│   │       ├── workflow/  
│   │       │   ├── workflow-graph.contract.ts  
│   │       │   └── index.ts  
│   │       └── index.ts  
│   │  
│   │  
│   ├── config/                                      \# SHARED ENV \+ FEATURE FLAGS  
│   │   └── src/  
│   │       ├── env.ts  
│   │       ├── flags.ts  
│   │       ├── constants.ts  
│   │       └── index.ts  
│   │  
│   │  
│   ├── db/                                          \# DATABASE LAYER (PLATFORM META-DATA)  
│   │   ├── prisma/  
│   │   │   ├── schema.prisma  
│   │   │   ├── migrations/  
│   │   │   └── seed.ts  
│   │   │  
│   │   └── src/  
│   │       ├── repositories/  
│   │       │   ├── user.repository.ts  
│   │       │   ├── project.repository.ts  
│   │       │   ├── entity.repository.ts  
│   │       │   ├── workflow.repository.ts  
│   │       │   ├── deployment.repository.ts  
│   │       │   └── billing.repository.ts  
│   │       ├── adapters/  
│   │       ├── helpers/  
│   │       └── index.ts  
│   │  
│   │  
│   ├── ui/                                          \# SHARED UI COMPONENT SYSTEM  
│   │   └── src/  
│   │       ├── components/  
│   │       ├── layouts/  
│   │       ├── themes/  
│   │       ├── animations/  
│   │       ├── charts/  
│   │       ├── icons/  
│   │       ├── typography/  
│   │       └── index.ts  
│   │  
│   │  
│   ├── ai-engine/                                   \# CORE AI LAYER — TEAM 3 OWNS THIS  
│   │   └── src/  
│   │       ├── gateway/  
│   │       │   ├── gateway.ts  
│   │       │   ├── router.ts                        \# Routes to Claude / Gemini / OpenAI  
│   │       │   └── index.ts  
│   │       │  
│   │       ├── providers/  
│   │       │   ├── anthropic.ts                     \# Claude Sonnet 4  
│   │       │   ├── google.ts                        \# Gemini 2.5 Pro  
│   │       │   ├── openai.ts  
│   │       │   └── index.ts  
│   │       │  
│   │       ├── understanding/  
│   │       │   ├── parser.ts  
│   │       │   ├── enricher.ts  
│   │       │   ├── classifier.ts  
│   │       │   └── index.ts  
│   │       │  
│   │       ├── semantic/  
│   │       │   ├── field-semantics/  
│   │       │   ├── relation-resolver/  
│   │       │   ├── workflow-inference/  
│   │       │   ├── enum-renderer/  
│   │       │   ├── ux-copy/  
│   │       │   ├── heuristics/  
│   │       │   ├── mappings/  
│   │       │   └── index.ts  
│   │       │  
│   │       ├── prompts/  
│   │       │   ├── system/  
│   │       │   │   ├── base.prompt.ts  
│   │       │   │   └── constraints.prompt.ts  
│   │       │   ├── understanding/  
│   │       │   │   └── intent.prompt.ts  
│   │       │   ├── generation/  
│   │       │   │   ├── schema.prompt.ts  
│   │       │   │   ├── frontend.prompt.ts  
│   │       │   │   ├── functions.prompt.ts  
│   │       │   │   ├── workflow.prompt.ts  
│   │       │   │   └── permissions.prompt.ts  
│   │       │   ├── iteration/  
│   │       │   │   └── refine.prompt.ts  
│   │       │   └── repair/  
│   │       │       └── fix.prompt.ts  
│   │       │  
│   │       ├── generators/  
│   │       │   ├── schema-generator.ts  
│   │       │   ├── page-generator.ts  
│   │       │   ├── component-generator.ts  
│   │       │   ├── function-generator.ts  
│   │       │   ├── workflow-generator.ts  
│   │       │   ├── permission-generator.ts  
│   │       │   ├── api-generator.ts  
│   │       │   └── index.ts  
│   │       │  
│   │       ├── orchestration/  
│   │       │   ├── orchestrator.ts  
│   │       │   ├── pipeline.ts  
│   │       │   ├── step-runner.ts  
│   │       │   └── index.ts  
│   │       │  
│   │       ├── iteration/  
│   │       │   ├── diff-engine.ts  
│   │       │   ├── patch-applier.ts  
│   │       │   └── index.ts  
│   │       │  
│   │       ├── reasoning/  
│   │       │   ├── chain-of-thought.ts  
│   │       │   └── index.ts  
│   │       │  
│   │       ├── validation/  
│   │       │   ├── output-validator.ts  
│   │       │   └── index.ts  
│   │       │  
│   │       ├── repair/  
│   │       │   ├── repair-engine.ts  
│   │       │   └── index.ts  
│   │       │  
│   │       ├── memory/  
│   │       │   ├── context-store.ts  
│   │       │   ├── summarizer.ts  
│   │       │   └── index.ts  
│   │       │  
│   │       ├── cache/  
│   │       │   ├── prompt-cache.ts  
│   │       │   └── index.ts  
│   │       │  
│   │       ├── output/  
│   │       │   ├── formatter.ts  
│   │       │   └── index.ts  
│   │       │  
│   │       └── index.ts  
│   │  
│   │  
│   ├── agent-system/                                \# MULTI-AGENT COORDINATION LAYER  
│   │   └── src/  
│   │       ├── coordinator/                         \# Manages agent lifecycle \+ handoff  
│   │       │   ├── coordinator.ts  
│   │       │   ├── task-router.ts                   \# Routes tasks to correct agent  
│   │       │   └── index.ts  
│   │       │  
│   │       ├── planner/                             \# Decomposes prompt into task graph  
│   │       │   ├── planner.ts  
│   │       │   ├── task-decomposer.ts  
│   │       │   └── index.ts  
│   │       │  
│   │       ├── frontend-agent/                      \# Owns UI generation  
│   │       │   ├── frontend-agent.ts  
│   │       │   ├── layout-decider.ts  
│   │       │   └── index.ts  
│   │       │  
│   │       ├── backend-agent/                       \# Owns schema \+ API \+ functions  
│   │       │   ├── backend-agent.ts  
│   │       │   ├── schema-decider.ts  
│   │       │   └── index.ts  
│   │       │  
│   │       ├── validator-agent/                     \# Validates output from other agents  
│   │       │   ├── validator-agent.ts  
│   │       │   ├── contract-checker.ts  
│   │       │   └── index.ts  
│   │       │  
│   │       ├── repair-agent/                        \# Fixes broken output autonomously  
│   │       │   ├── repair-agent.ts  
│   │       │   ├── error-analyzer.ts  
│   │       │   └── index.ts  
│   │       │  
│   │       ├── memory/                              \# Shared agent memory \+ context  
│   │       │   ├── agent-memory.ts  
│   │       │   └── index.ts  
│   │       │  
│   │       └── index.ts  
│   │  
│   │  
│   ├── template-engine/                             \# REUSABLE UI DNA \+ INSTANT GENERATION  
│   │   └── src/  
│   │       ├── archetypes/                          \# Pre-built full app archetypes  
│   │       │   ├── crm/  
│   │       │   │   ├── archetype.ts  
│   │       │   │   ├── schema.ts  
│   │       │   │   ├── pages.ts  
│   │       │   │   └── workflows.ts  
│   │       │   ├── admin/  
│   │       │   │   ├── archetype.ts  
│   │       │   │   ├── schema.ts  
│   │       │   │   ├── pages.ts  
│   │       │   │   └── workflows.ts  
│   │       │   ├── ai-saas/  
│   │       │   │   ├── archetype.ts  
│   │       │   │   ├── schema.ts  
│   │       │   │   ├── pages.ts  
│   │       │   │   └── workflows.ts  
│   │       │   ├── ecommerce/  
│   │       │   │   ├── archetype.ts  
│   │       │   │   ├── schema.ts  
│   │       │   │   ├── pages.ts  
│   │       │   │   └── workflows.ts  
│   │       │   ├── productivity/  
│   │       │   │   ├── archetype.ts  
│   │       │   │   ├── schema.ts  
│   │       │   │   ├── pages.ts  
│   │       │   │   └── workflows.ts  
│   │       │   └── portfolio/  
│   │       │       ├── archetype.ts  
│   │       │       ├── schema.ts  
│   │       │       └── pages.ts  
│   │       │  
│   │       ├── layouts/                             \# Reusable layout shells  
│   │       ├── sections/                            \# Composable page sections  
│   │       ├── widgets/                             \# Atomic UI widgets  
│   │       ├── themes/                              \# Design token sets per archetype  
│   │       ├── composition/                         \# Assembles archetypes from parts  
│   │       │   ├── composer.ts  
│   │       │   └── slot-resolver.ts  
│   │       ├── registry/                            \# Template metadata \+ discovery  
│   │       │   └── template-registry.ts  
│   │       └── index.ts  
│   │  
│   │  
│   ├── workflow-engine/                             \# AUTOMATION \+ WORKFLOW GRAPH EXECUTION  
│   │   └── src/  
│   │       ├── graph/                               \# DAG structure for workflow steps  
│   │       │   ├── graph-builder.ts  
│   │       │   ├── node.ts  
│   │       │   └── edge.ts  
│   │       │  
│   │       ├── execution/                           \# Runs workflow graphs  
│   │       │   ├── executor.ts  
│   │       │   ├── step-runner.ts  
│   │       │   └── state-machine.ts  
│   │       │  
│   │       ├── triggers/                            \# What starts a workflow  
│   │       │   ├── webhook.trigger.ts  
│   │       │   ├── schedule.trigger.ts  
│   │       │   ├── event.trigger.ts  
│   │       │   └── manual.trigger.ts  
│   │       │  
│   │       ├── actions/                             \# What a workflow step does  
│   │       │   ├── http.action.ts  
│   │       │   ├── db.action.ts  
│   │       │   ├── email.action.ts  
│   │       │   ├── ai.action.ts  
│   │       │   └── function.action.ts  
│   │       │  
│   │       ├── conditions/                          \# Branching logic  
│   │       │   ├── condition-evaluator.ts  
│   │       │   └── expression-parser.ts  
│   │       │  
│   │       ├── scheduler/                           \# Cron-based trigger scheduling  
│   │       │   ├── scheduler.ts  
│   │       │   └── cron-parser.ts  
│   │       │  
│   │       ├── memory/                              \# Workflow run state \+ history  
│   │       │   ├── run-store.ts  
│   │       │   └── execution-log.ts  
│   │       │  
│   │       └── index.ts  
│   │  
│   │  
│   ├── cache-engine/                                \# GENERATION \+ SEMANTIC CACHING  
│   │   └── src/  
│   │       ├── prompt-cache/                        \# Caches identical prompts  
│   │       │   ├── prompt-cache.ts  
│   │       │   └── hash-generator.ts  
│   │       │  
│   │       ├── generation-cache/                    \# Caches full generation outputs  
│   │       │   ├── generation-cache.ts  
│   │       │   └── invalidation-strategy.ts  
│   │       │  
│   │       ├── semantic-cache/                      \# Caches semantically similar results  
│   │       │   ├── semantic-cache.ts  
│   │       │   └── similarity-scorer.ts  
│   │       │  
│   │       ├── template-cache/                      \# Caches pre-rendered archetype outputs  
│   │       │   ├── template-cache.ts  
│   │       │   └── warm-up.ts  
│   │       │  
│   │       ├── adapters/  
│   │       │   ├── redis.adapter.ts  
│   │       │   └── memory.adapter.ts               \# Dev-only in-memory adapter  
│   │       │  
│   │       └── index.ts  
│   │  
│   │  
│   ├── entity-engine/                               \# DATA MODEL \+ SCHEMA MANAGEMENT  
│   │   └── src/  
│   │       ├── builder/  
│   │       │   ├── entity-builder.ts  
│   │       │   ├── field-builder.ts  
│   │       │   └── relation-builder.ts  
│   │       ├── migrations/  
│   │       │   ├── migration-generator.ts  
│   │       │   └── migration-runner.ts  
│   │       ├── query-engine/  
│   │       │   ├── query-builder.ts  
│   │       │   └── filter-parser.ts  
│   │       ├── validators/  
│   │       │   └── schema-validator.ts  
│   │       ├── security/  
│   │       │   ├── rls-engine.ts  
│   │       │   └── policy-evaluator.ts  
│   │       └── index.ts  
│   │  
│   │  
│   ├── function-engine/                             \# DENO SERVERLESS FUNCTIONS RUNTIME  
│   │   └── src/  
│   │       ├── runtime/  
│   │       │   ├── deno-runner.ts  
│   │       │   ├── sandbox.ts  
│   │       │   └── executor.ts  
│   │       ├── bundler/  
│   │       │   └── bundler.ts  
│   │       ├── registry/  
│   │       │   └── function-registry.ts  
│   │       ├── secrets/  
│   │       │   └── secret-manager.ts  
│   │       ├── logs/  
│   │       │   └── function-logger.ts  
│   │       └── index.ts  
│   │  
│   │  
│   ├── storage-engine/                              \# FILE STORAGE \+ CDN  
│   │   └── src/  
│   │       ├── providers/  
│   │       │   ├── s3.provider.ts  
│   │       │   ├── r2.provider.ts  
│   │       │   └── local.provider.ts  
│   │       ├── cdn/  
│   │       │   ├── cdn-manager.ts  
│   │       │   └── url-signer.ts  
│   │       ├── permissions/  
│   │       │   └── access-control.ts  
│   │       ├── processors/  
│   │       │   ├── image-optimizer.ts  
│   │       │   └── file-validator.ts  
│   │       └── index.ts  
│   │  
│   │  
│   ├── auth-engine/                                 \# AUTH \+ IDENTITY MANAGEMENT  
│   │   └── src/  
│   │       ├── providers/  
│   │       │   ├── google.provider.ts  
│   │       │   ├── github.provider.ts  
│   │       │   ├── magic-link.provider.ts  
│   │       │   └── password.provider.ts  
│   │       ├── session/  
│   │       │   ├── session-manager.ts  
│   │       │   └── token-service.ts  
│   │       ├── sso/  
│   │       │   ├── saml.ts  
│   │       │   └── oidc.ts  
│   │       ├── guards/  
│   │       │   └── role-guard.ts  
│   │       └── index.ts  
│   │  
│   │  
│   ├── integration-engine/                          \# THIRD-PARTY CONNECTORS \+ OAUTH  
│   │   └── src/  
│   │       ├── connectors/  
│   │       │   ├── stripe.connector.ts  
│   │       │   ├── gmail.connector.ts  
│   │       │   ├── slack.connector.ts  
│   │       │   ├── google-drive.connector.ts  
│   │       │   ├── salesforce.connector.ts  
│   │       │   ├── twilio.connector.ts  
│   │       │   ├── openai.connector.ts  
│   │       │   └── zapier.connector.ts  
│   │       ├── oauth/  
│   │       │   ├── oauth-manager.ts  
│   │       │   └── token-store.ts  
│   │       ├── registry/  
│   │       │   └── connector-registry.ts  
│   │       ├── webhooks/  
│   │       │   └── webhook-handler.ts  
│   │       └── index.ts  
│   │  
│   │  
│   ├── realtime-engine/                             \# WEBSOCKET \+ LIVE DATA SUBSCRIPTIONS  
│   │   └── src/  
│   │       ├── server/  
│   │       │   ├── ws-server.ts  
│   │       │   └── socket-manager.ts  
│   │       ├── subscriptions/  
│   │       │   ├── entity-subscription.ts  
│   │       │   └── builder-subscription.ts  
│   │       ├── adapters/  
│   │       │   └── redis-pubsub.ts  
│   │       └── index.ts  
│   │  
│   │  
│   ├── preview-engine/                              \# LIVE APP PREVIEW  
│   │   └── src/  
│   │       ├── renderer/  
│   │       │   ├── page-renderer.ts  
│   │       │   └── component-renderer.ts  
│   │       ├── sandbox/  
│   │       │   ├── iframe-sandbox.ts  
│   │       │   └── hot-reload.ts  
│   │       ├── snapshot/  
│   │       │   └── snapshot-manager.ts  
│   │       └── index.ts  
│   │  
│   │  
│   ├── deployment-engine/                           \# PUBLISH \+ HOSTING  
│   │   └── src/  
│   │       ├── providers/  
│   │       │   ├── vercel.provider.ts  
│   │       │   ├── cloudflare.provider.ts  
│   │       │   └── docker.provider.ts  
│   │       ├── builds/  
│   │       │   ├── build-pipeline.ts  
│   │       │   └── build-optimizer.ts  
│   │       ├── dns/  
│   │       │   ├── dns-manager.ts  
│   │       │   └── subdomain-allocator.ts  
│   │       ├── ssl/  
│   │       │   └── ssl-provisioner.ts  
│   │       ├── cdn/  
│   │       │   └── cdn-config.ts  
│   │       └── index.ts  
│   │  
│   │  
│   ├── workspace-manager/                           \# GENERATED APP LIFECYCLE MANAGEMENT  
│   │   └── src/  
│   │       ├── creator/                             \# Spins up new project workspaces  
│   │       │   ├── workspace-creator.ts  
│   │       │   └── template-seeder.ts  
│   │       ├── snapshots/                           \# Point-in-time workspace saves  
│   │       │   ├── snapshot-creator.ts  
│   │       │   └── snapshot-restorer.ts  
│   │       ├── versioning/                          \# Branch previews \+ version history  
│   │       │   ├── version-manager.ts  
│   │       │   └── branch-manager.ts  
│   │       ├── recovery/                            \# Recovers from failed generations  
│   │       │   ├── recovery-manager.ts  
│   │       │   └── checkpoint-store.ts  
│   │       ├── cleanup/                             \# Purges stale workspaces  
│   │       │   ├── cleanup-scheduler.ts  
│   │       │   └── ttl-manager.ts  
│   │       └── index.ts  
│   │  
│   │  
│   ├── validation-engine/                           \# AI OUTPUT VALIDATION \+ AUTO-REPAIR  
│   │   └── src/  
│   │       ├── code-validator/  
│   │       │   ├── syntax-checker.ts  
│   │       │   ├── import-validator.ts  
│   │       │   └── type-checker.ts  
│   │       ├── schema-validator/  
│   │       │   └── entity-schema-validator.ts  
│   │       ├── contract-validator/                  \# Validates against contracts package  
│   │       │   └── contract-checker.ts  
│   │       ├── runtime-validator/  
│   │       │   └── runtime-checker.ts  
│   │       ├── repair-engine/  
│   │       │   ├── auto-repair.ts  
│   │       │   └── error-classifier.ts  
│   │       └── index.ts  
│   │  
│   │  
│   ├── observability-engine/                        \# AI PIPELINE TRACING \+ DEBUGGING  
│   │   └── src/  
│   │       ├── tracing/                             \# Distributed traces across pipeline steps  
│   │       │   ├── tracer.ts  
│   │       │   ├── span-manager.ts  
│   │       │   └── trace-exporter.ts  
│   │       ├── logs/  
│   │       │   ├── log-collector.ts  
│   │       │   └── log-formatter.ts  
│   │       ├── replay/                              \# Replays any past generation run  
│   │       │   ├── replay-engine.ts  
│   │       │   ├── replay-store.ts  
│   │       │   └── step-recorder.ts  
│   │       ├── pipeline-inspector/                  \# Step-by-step generation debugger  
│   │       │   ├── inspector.ts  
│   │       │   └── step-diff-viewer.ts  
│   │       ├── metrics/  
│   │       │   ├── pipeline-metrics.ts  
│   │       │   └── token-usage-tracker.ts  
│   │       └── index.ts  
│   │  
│   │  
│   ├── billing-engine/                              \# STRIPE \+ USAGE-BASED BILLING  
│   │   └── src/  
│   │       ├── stripe/  
│   │       │   ├── stripe-client.ts  
│   │       │   ├── subscription-manager.ts  
│   │       │   └── webhook-handler.ts  
│   │       ├── usage/  
│   │       │   ├── usage-tracker.ts  
│   │       │   └── quota-enforcer.ts  
│   │       ├── plans/  
│   │       │   └── plan-config.ts  
│   │       └── index.ts  
│   │  
│   │  
│   └── analytics-engine/                            \# PLATFORM \+ APP-LEVEL ANALYTICS  
│       └── src/  
│           ├── telemetry/  
│           │   └── tracer.ts  
│           ├── monitoring/  
│           │   └── health-monitor.ts  
│           ├── metrics/  
│           │   ├── platform-metrics.ts  
│           │   └── app-metrics.ts  
│           ├── events/  
│           │   └── event-collector.ts  
│           ├── logs/  
│           │   └── log-aggregator.ts  
│           └── index.ts  
│  
│  
├── sandbox/                                         \# EPHEMERAL RUNTIME DATA — NOT SOURCE CODE  
│   ├── generated-apps/                              \# AI-generated app code, per project  
│   ├── preview-cache/                               \# Cached preview builds  
│   ├── function-cache/                              \# Compiled serverless functions  
│   ├── workspace-snapshots/                         \# Point-in-time workspace saves  
│   ├── replay-recordings/                           \# Stored generation replays  
│   ├── logs/  
│   └── temp/  
│  
│  
├── scripts/  
│   ├── setup/  
│   │   └── init.sh  
│   ├── preview/  
│   ├── cleanup/  
│   │   └── purge-sandbox.sh  
│   ├── migration/  
│   ├── validation/  
│   └── deployment/  
│  
│  
├── docs/  
│   ├── architecture/  
│   │   ├── overview.md  
│   │   └── data-flow.md  
│   ├── ai-pipeline/  
│   ├── agent-system/  
│   ├── contracts/  
│   ├── entity-engine/  
│   ├── function-engine/  
│   ├── workflow-engine/  
│   ├── cache-engine/  
│   ├── observability/  
│   ├── workspace-manager/  
│   ├── template-engine/  
│   ├── auth/  
│   ├── integrations/  
│   ├── realtime/  
│   ├── preview/  
│   ├── deployment/  
│   └── roadmap/  
│  
│  
├── .github/  
│   ├── workflows/  
│   │   ├── ci.yml  
│   │   ├── preview.yml  
│   │   └── deploy.yml  
│   ├── ISSUE\_TEMPLATE/  
│   └── PULL\_REQUEST\_TEMPLATE/  
│  
├── .husky/  
│   ├── pre-commit  
│   └── commit-msg  
│  
├── .changeset/  
│   └── config.json  
│  
├── .env  
├── .env.example  
├── turbo.json  
├── pnpm-workspace.yaml  
├── tsconfig.json  
├── package.json  
├── README.md  
└── .gitignore

