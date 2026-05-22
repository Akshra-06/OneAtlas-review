import { ModelRouter } from '../../gateway/router/model.router';
import { ValidationOrchestrator } from '@oneatlas/validation-engine';
import { CRITICAL_RETRY_CONFIG } from '@oneatlas/validation-engine';
import { FeatureSchema, FeatureArchitecture } from '@oneatlas/validation-engine';

export class FeatureExtractor {
  constructor(private router: ModelRouter) {}

  /**
   * Analyzes the prompt to extract complex architectural features, entities with fields, and pages.
   */
  async extract(promptContext: string): Promise<FeatureArchitecture> {
    const { config } = this.router.getProviderForTask('FEATURE_EXTRACTION');
    const orchestrator = new ValidationOrchestrator(this.router, 'FEATURE_EXTRACTION');

    const result = await orchestrator.executeWithValidation<FeatureArchitecture>(
      {
        prompt: promptContext,
        systemPrompt: `SYSTEM: Senior AI Software Architect with expertise in full-stack application design.
TASK: Extract a comprehensive Intent Graph from the user's software description with deep semantic understanding.

ANALYSIS REQUIREMENTS:
1. ENTITY SEMANTICS: Understand the business domain and extract entities with meaningful relationships
2. FIELD INFERENCE: Deduce field types from context (email, phone, dates, currency, status, etc.)
3. RELATIONSHIP DEPTH: Identify implicit relationships (e.g., "patient has doctor appointments" → many-to-many)
4. BUSINESS LOGIC: Extract workflows that represent actual business processes
5. UI PATTERNS: Identify common UI patterns (dashboards, forms, lists, detail views)

GRAPH CONSTRAINTS:
1. ENTITIES: Every data model must have a unique ID (e.g., "ent_user"), PascalCase name, and meaningful attributes
2. ATTRIBUTES: Include semanticType when applicable (email, password, url, phone, date, datetime, currency, status, priority, description, boolean)
3. RELATIONS: Use specific types (one-to-one, one-to-many, many-to-many). targetEntity MUST refer to existing Entity ID.
4. PAGES: routes MUST be unique and start with "/". requiredEntities MUST refer to existing Entity IDs. Use appropriate layoutTemplate (dashboard, form, list, detail).
5. WORKFLOWS: steps MUST be ordered business actions. triggerType: USER_ACTION, SYSTEM_EVENT, SCHEDULED.

SEMANTIC TYPE GUIDELINES:
- email: for email addresses
- phone: for phone numbers
- date/datetime: for dates and timestamps
- currency: for monetary values
- status: for state fields (active/inactive, pending/approved)
- priority: for importance levels
- description: for long text content
- boolean: for yes/no flags
- relation: for foreign key references

OUTPUT FORMAT:
Return a STRICT JSON object matching this structure:
{
  "features": [{ "id": "feat_auth", "name": "Authentication", "description": "User login/signup with role-based access" }],
  "pages": [{ "id": "p_dashboard", "name": "Dashboard", "route": "/", "description": "Main dashboard with KPIs and recent activity", "requiredEntities": ["ent_user", "ent_task"], "layoutTemplate": "dashboard" }],
  "entities": [{ 
    "id": "ent_user", 
    "name": "User", 
    "description": "System user with profile and preferences", 
    "attributes": [
      {"name":"email","type":"string","isRequired":true,"semanticType":"email"},
      {"name":"fullName","type":"string","isRequired":true},
      {"name":"isActive","type":"boolean","isRequired":false,"semanticType":"boolean"}
    ], 
    "relations": [{"targetEntity":"ent_organization","type":"many-to-one","description":"User belongs to organization"}] 
  }],
  "workflows": [{ "id": "wf_onboarding", "name": "User Onboarding", "description": "Complete new user registration flow", "triggerType": "USER_ACTION", "executionMode": "SYNC", "steps": ["Validate email format", "Check for existing user", "Create account", "Send welcome email", "Redirect to dashboard"] }]
}`,
        schemaName: 'FeatureExtraction',
        modelTier: config.preferredTier,
        schema: FeatureSchema
      }, 
      CRITICAL_RETRY_CONFIG
    );

    if (result.success) return result.data;
    
    return { features: [], pages: [], entities: [], workflows: [] };
  }
}
