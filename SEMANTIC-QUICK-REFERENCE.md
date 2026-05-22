# Quick Reference Guide - Schema-Aware Generation

## 🎯 Quick Overview

The OneAtlas generation engine now generates handcrafted applications by consuming semantic metadata. Instead of generic "Option 1", you get "Draft", "Active", "Archived".

## 📚 The 5 Semantic Helpers

### 1️⃣ **field-semantics.ts**
Detects what a field represents

```typescript
import { fieldSemantics } from '../shared/field-semantics';

const analysis = fieldSemantics.analyze({
  name: "userEmail",
  type: "string",
  enumValues: ["personal", "work", "other"]
});

// Result:
// {
//   semanticType: "email",
//   uiComponent: "Input",
//   prismaType: "String",
//   isEnumField: true,
//   isRelation: false
// }
```

**Key Pattern Mappings**:
```
/email/      → email, Email input
/password/   → password, Password input
/price|cost/ → currency, NumberInput with step
/status/     → status, Select
/date/       → date, DatePicker
/is[A-Z]/    → boolean, Switch
```

### 2️⃣ **ux-copy.helper.ts**
Generates human-friendly text

```typescript
import { uxCopy } from '../shared/ux-copy.helper';

// Field labels
uxCopy.generateCopyForField("companyEmail")
// → { label: "Company Email", placeholder: "Enter company email...", helperText: "..." }

// Button text
uxCopy.generateButtonText("create", "Product")
// → "Create Product"

// Error messages
uxCopy.generateValidationError("Email Address", "invalid")
// → "Email Address is not valid"

// Field descriptions
uxCopy.generateFieldDescription("reorderThreshold")
// → "Minimum quantity before triggering a reorder"
```

### 3️⃣ **enum-renderer.ts**
Renders enums with semantic labels

```typescript
import { enumRenderer } from '../shared/enum-renderer';

const options = enumRenderer.renderEnumOptions(
  ["draft", "active", "archived"],
  "status"
);

// Result:
// [
//   { value: "draft", label: "Draft" },
//   { value: "active", label: "Active" },
//   { value: "archived", label: "Archived" }
// ]

// Generate JSX
const jsx = enumRenderer.generateSelectOptions(enumValues, fieldName);
// → '<SelectItem value="draft">Draft</SelectItem>\n...'
```

**Supported Semantic Enums**:
- `status`: Draft, Active, Inactive, Archived, Published, Pending, Approved, Rejected
- `priority`: Low, Medium, High, Urgent, Critical
- `role`: Administrator, User, Guest, Editor, Viewer, Moderator
- `category`: Product, Service, Digital, Physical, Bundle
- And more...

### 4️⃣ **relation-resolver.ts**
Converts relations to semantic selectors

```typescript
import { relationResolver } from '../shared/relation-resolver';

const resolved = relationResolver.resolveRelation(
  { targetEntity: "Company", type: "many-to-one" },
  "User",
  allEntities
);

// Result:
// {
//   fieldName: "companyId",
//   displayName: "Company",
//   targetEntity: "Company",
//   relationType: "many-to-one",
//   isSearchable: true,
//   component: "Combobox",
//   placeholder: "Select Company..."
// }

// Generate JSX for searchable selector
const jsx = relationResolver.generateRelationCombobox(resolved);
```

### 5️⃣ **workflow-inference.ts**
Infers domain and generates smart dashboards

```typescript
import { workflowInference } from '../shared/workflow-inference';

// Detect domain automatically
const domain = workflowInference.inferDomain(appUnderstanding);
// → "crm" | "inventory" | "project" | "ecommerce" | "blog" | "generic"

// Get domain-specific metrics
const metrics = workflowInference.getDashboardMetrics("crm");
// → [
//   { label: "New leads", description: "Recently captured opportunities" },
//   { label: "Pipeline value", description: "Total weighted revenue" },
//   ...
// ]

// Get domain workflows
const workflows = workflowInference.generateDomainWorkflows("inventory");
// → [
//   {
//     name: "Stock Management",
//     description: "Monitor and manage inventory levels",
//     steps: ["Add stock", "Remove stock", "Adjust count", "Check reorder"]
//   },
//   ...
// ]

// Get smart entity card fields for domain
const fields = workflowInference.getEntityCardFields("Lead", "crm");
// → ["name", "company", "email", "stage", "value"]
```

---

## 🔄 How Generators Use Them

### field.generator.ts
```typescript
function buildFieldSchema(fieldName: string, attribute?: EntityAttribute): FieldSchema {
  const analysis = fieldSemantics.analyze(attr);
  const copy = uxCopy.generateCopyForField(fieldName, analysis.semanticType);
  
  let enumValues = attr.enumValues;
  if (!enumValues && analysis.isEnumField) {
    enumValues = enumRenderer.inferEnumValuesFromSemantic(analysis.semanticType);
  }

  return {
    name: fieldName,
    prismaType: analysis.prismaType,
    uiComponent: analysis.uiComponent,
    label: copy.label,
    placeholder: copy.placeholder,
    helperText: copy.helperText,
    enumValues,
    semanticType: analysis.semanticType,
  };
}
```

### component.generator.ts
```typescript
const renderField = (field: FieldSchema): string => {
  const label = field.label || uxCopy.toTitleCase(field.name);
  const placeholder = field.placeholder || `Enter ${label.toLowerCase()}...`;

  if (field.enumValues) {
    const options = enumRenderer.generateSelectOptions(field.enumValues, field.name);
    return `<SelectContent>${options}</SelectContent>`;
  }

  return `<Input type="${fieldSemantics.getInputType({...})}" placeholder="${placeholder}" />`;
};
```

### workflow.generator.ts
```typescript
const generateWorkflowFiles = (understanding, entities) => {
  const domain = workflowInference.inferDomain(understanding);
  const metrics = workflowInference.getDashboardMetrics(domain);
  const actions = workflowInference.getDashboardActions(domain);
  const workflows = workflowInference.generateDomainWorkflows(domain);
  
  // Generate dashboard with domain intelligence
  return [{
    filePath: 'app/(dashboard)/page.tsx',
    content: generateDashboardPage({ domain, metrics, actions, workflows })
  }];
};
```

---

## 💡 Common Patterns

### Handling Enum Fields
```typescript
// Before: Hardcoded
enumValues: /status/i.test(fieldName) ? ['active', 'draft', 'archived'] : undefined

// After: Smart
const enumValues = attr.enumValues || 
  enumRenderer.inferEnumValuesFromSemantic(analysis.semanticType);
```

### Rendering Forms
```typescript
// Before: Generic
<SelectItem value="option-1">Option 1</SelectItem>

// After: Semantic
<SelectItem value="draft">Draft</SelectItem>
```

### Field Labels
```typescript
// Before: Raw
<FormLabel>status</FormLabel>

// After: Human-friendly
<FormLabel>{copy.label}</FormLabel>  // "Status"
```

### Validation
```typescript
// Before: Type-only
z.string()

// After: Semantic
const validation = enumRenderer.generateEnumValidation(enumValues);
// z.enum(['draft', 'active', 'archived'])
```

---

## 🎨 Field Type Reference

| Input | Semantic Type | Component | Input Type | Example |
|-------|---------------|-----------|-----------|---------|
| email | `email` | Input | email | user@example.com |
| password | `password` | Input | password | •••••••• |
| url | `url` | Input | url | https://example.com |
| phone | `phone` | Input | tel | +1 (555) 000-0000 |
| price | `currency` | NumberInput | number (step=0.01) | 99.99 |
| date | `date` | DatePicker | date | 2024-01-15 |
| datetime | `datetime` | DatePicker | datetime | 2024-01-15T10:30 |
| status | `status` | Select | - | Active |
| priority | `priority` | Select | - | High |
| active | `boolean` | Switch | checkbox | ✓ |
| description | `description` | Textarea | - | Long text... |
| companyId | `relation` | Combobox | - | (searchable) |
| generic | `generic` | Input | text | Any text |

---

## 🌍 Domain Types

### CRM
- **Detection**: Contains "crm", "lead", "contact", "pipeline", "deal"
- **Metrics**: New leads, Pipeline value, Conversion rate, Activities
- **Actions**: Create lead, Create deal, Schedule activity, View pipeline
- **Workflows**: Lead Nurturing, Deal Management, Activity Tracking

### Inventory
- **Detection**: Contains "inventory", "warehouse", "stock", "reorder", "product"
- **Metrics**: Low stock items, Warehouse transfers, Reorder queue, Total value
- **Actions**: Create reorder, Transfer stock, Review low stock, Add product
- **Workflows**: Stock Management, Reorder Processing, Warehouse Operations

### Project Management
- **Detection**: Contains "project", "kanban", "task", "sprint", "assignee"
- **Metrics**: Open tasks, Blocked items, Due this week, Team velocity
- **Actions**: Create task, Start sprint, Update status, Assign work
- **Workflows**: Sprint Management, Task Management, Progress Tracking

### E-commerce
- **Detection**: Contains "ecommerce", "store", "order", "customer", "product"
- **Metrics**: Orders today, Revenue, Pending shipments, Customer satisfaction
- **Actions**: Create order, View orders, Process return, View products
- **Workflows**: Order Processing, Product Management, Customer Management

### Blog
- **Detection**: Contains "blog", "post", "article", "comment"
- **Metrics**: Published posts, Total views, Pending comments, Subscribers
- **Actions**: Create post, View analytics, Approve comments, Email newsletter
- **Workflows**: Content Creation, Comment Moderation

---

## 🔧 Adding New Semantic Types

### Add to field-semantics.ts
```typescript
const SEMANTIC_RULES = [
  // ... existing rules
  {
    patterns: [/customPattern/i],
    semanticType: 'myCustomType',
    uiComponent: 'CustomComponent',
    prismaType: 'String',
  },
];
```

### Add to ux-copy.helper.ts
```typescript
const SEMANTIC_COPY = {
  // ... existing
  myCustomType: {
    label: 'Custom Label',
    placeholder: 'Enter custom value...',
    helperText: 'Help text here',
  },
};
```

### Add to enum-renderer.ts
```typescript
const SEMANTIC_ENUM_LABELS = {
  // ... existing
  myEnum: {
    value1: 'Semantic Label 1',
    value2: 'Semantic Label 2',
  },
};
```

---

## 📚 Import Paths

```typescript
// Field semantics
import { fieldSemantics } from '../shared/field-semantics';

// UX Copy
import { uxCopy } from '../shared/ux-copy.helper';

// Enum rendering
import { enumRenderer } from '../shared/enum-renderer';

// Relations
import { relationResolver } from '../shared/relation-resolver';

// Workflows
import { workflowInference } from '../shared/workflow-inference';
```

---

## ✅ Quality Checklist

When updating generators:
- ✅ Use `fieldSemantics.analyze()` for field detection
- ✅ Use `uxCopy.generateCopyForField()` for labels/placeholders
- ✅ Use `enumRenderer.*` for enum rendering
- ✅ Use `relationResolver.*` for relations
- ✅ Use `workflowInference.*` for dashboard logic
- ✅ Never hardcode "Option 1", "Option 2"
- ✅ Always include semantic metadata
- ✅ Add field descriptions where helpful
- ✅ Test with multiple domains
- ✅ Verify generated code quality

---

## 🚀 Result

Generated applications now feel **handcrafted** instead of **scaffolded** by leveraging semantic intelligence at every step.

**Example Transform**:
```
reorderThreshold: Int
  ↓ [field-semantics]
  Semantic Type: currency
  ↓ [ux-copy]
  Label: "Reorder Threshold"
  Placeholder: "Enter reorder threshold..."
  ↓ [component generation]
  <Input type="number" placeholder="Enter reorder threshold..." />
  Description: "Minimum quantity before triggering a reorder"
  ✨ Professional, semantic, helpful!
```
