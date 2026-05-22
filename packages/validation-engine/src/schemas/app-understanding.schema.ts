import { z } from 'zod';

export const EntityAttributeSchema = z.object({
  name: z.string().describe("Name of the attribute (e.g., 'email', 'price')"),
  type: z.enum(["string", "number", "boolean", "date", "reference", "json"]).describe("Data type of the attribute"),
  isRequired: z.boolean().describe("Whether this attribute is required"),
  uiComponent: z.enum(["Input", "Textarea", "Switch", "DatePicker", "Select", "NumberInput", "Combobox", "Checkbox", "Radio", "Multiselect"]).optional().describe("UI component to use for this field"),
  enumValues: z.array(z.string()).optional().describe("For Select/Combobox/Radio/Multiselect components, provide the enum values (e.g., ['Low', 'Medium', 'High', 'Critical'] for priority)")
}).refine(
  (data) => {
    // If uiComponent is a select-like component, enumValues must be provided
    if (data.uiComponent && ["Select", "Combobox", "Radio", "Multiselect"].includes(data.uiComponent)) {
      return data.enumValues && data.enumValues.length > 0;
    }
    return true;
  },
  {
    message: "enumValues must be provided when uiComponent is Select, Combobox, Radio, or Multiselect",
    path: ["enumValues"]
  }
);

export const EntitySchema = z.object({
  name: z.string().describe("Name of the entity (e.g., 'User', 'Invoice')"),
  description: z.string().describe("Brief description of the entity's role"),
  attributes: z.array(EntityAttributeSchema).describe("Data fields for this entity"),
  relationships: z.array(z.object({
    targetEntity: z.string(),
    type: z.enum(["one-to-one", "one-to-many", "many-to-many"])
  })).describe("Relationships to other entities. If none, return an empty array.")
});

export const PageSchema = z.object({
  name: z.string().describe("Name of the page (e.g., 'Dashboard', 'Settings')"),
  route: z.string().describe("URL route (e.g., '/dashboard', '/settings')"),
  description: z.string().describe("What the user does on this page"),
  requiredEntities: z.array(z.string()).describe("Entities accessed or modified on this page (by name)"),
  layoutTemplate: z.enum(["dashboard", "landing", "auth", "crud-list", "crud-detail", "form", "blank"]).describe("The Team 4 layout template to use")
});

export const WorkflowSchema = z.object({
  name: z.string().describe("Name of the workflow"),
  trigger: z.enum(["user_action", "scheduled", "system_event"]),
  description: z.string().describe("Step-by-step logic description")
});

export const AppUnderstandingSchema = z.object({
  appName: z.string().describe("The normalized, human-readable name of the application"),
  appType: z.enum(["dashboard", "e-commerce", "social", "productivity", "internal-tool", "crm", "saas", "other"]).describe("The core archetype of the application"),
  targetAudience: z.string().describe("Who is the primary user of this application?"),
  features: z.array(z.string()).describe("A list of core features extracted from the user's prompt"),
  pages: z.array(PageSchema).describe("Structured pages/views required"),
  entities: z.array(EntitySchema).describe("Structured data entities with attributes and relationships"),
  workflows: z.array(WorkflowSchema).describe("Core business logic workflows"),
  authRequirements: z.object({
    needsAuth: z.boolean(),
    roles: z.array(z.string()).describe("Required user roles (e.g., ['admin', 'user'])")
  }).describe("Authentication and RBAC requirements"),
  operationalContext: z.any().optional().describe("Operational context including scale, team size, data volume"),
  realisticKPIs: z.any().optional().describe("Realistic KPI definitions based on business context"),
  roleBasedDashboards: z.any().optional().describe("Role-specific dashboard configurations"),
  businessPriorities: z.any().optional().describe("Business priorities with urgency levels"),
  realisticDataPatterns: z.any().optional().describe("Realistic data patterns for mock data generation"),
  genericPatternDetection: z.any().optional().describe("Detection results for generic patterns")
});

export type AppUnderstanding = z.infer<typeof AppUnderstandingSchema>;
