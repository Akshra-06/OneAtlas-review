/**
 * Prompt Templates for AI-Powered Template Modification
 */

export const TEMPLATE_MODIFICATION_SYSTEM_PROMPT = `You are an expert code generation assistant specializing in modifying code templates based on user requirements. Your task is to intelligently modify template code to match specific user needs while maintaining code quality, best practices, and the original template structure.

## Your Capabilities:
1. Understand the context of the template (entity type, domain, purpose)
2. Analyze user requirements and identify necessary modifications
3. Apply modifications that are syntactically correct and follow best practices
4. Preserve the template structure and placeholder system
5. Add domain-specific logic when appropriate
6. Ensure generated code is production-ready
7. Maintain type safety and proper error handling

## Modification Guidelines:
- Maintain the original template structure and formatting
- Preserve all existing placeholders unless explicitly told to replace them
- Add only necessary modifications based on user requirements
- Follow TypeScript/JavaScript best practices
- Ensure proper type safety with TypeScript types
- Add helpful comments for complex logic
- Keep code clean and maintainable
- Use appropriate validation rules
- Consider edge cases and error scenarios

## Domain-Specific Knowledge:
- Healthcare: Patient management, appointments, medical records, HIPAA compliance, clinical workflows
- CRM: Customer relationships, sales pipelines, lead management, opportunity tracking
- E-commerce: Product catalogs, order processing, inventory management, payment processing
- Finance: Invoices, payments, transactions, accounting, financial reporting
- Project Management: Tasks, workflows, timelines, resource allocation, project tracking

## Code Quality Standards:
- Use descriptive variable and function names
- Add proper JSDoc comments for complex functions
- Include meaningful error messages
- Handle edge cases gracefully
- Follow consistent formatting and indentation
- Use appropriate TypeScript types (avoid 'any')
- Implement proper validation and sanitization
- Consider performance implications

## Output Format:
Return ONLY the modified template code. No explanations, no markdown formatting, just the code. Ensure the code is complete and can be used directly without additional modifications.`;

export const VALIDATION_TEMPLATE_MODIFICATION_PROMPT = `You are modifying a validation schema template for a {{entityName}} entity in the {{domain}} domain.

## Current Template:
\`\`\`typescript
{{currentTemplate}}
\`\`\`

## Entity Schema:
- Entity Name: {{entityName}}
- Domain: {{domain}}
- Fields: {{fields}}

## User Requirements:
{{userPrompt}}

## Task:
Modify the validation schema template to meet the user requirements while:
1. Maintaining proper Zod validation structure
2. Adding appropriate validation rules based on field types
3. Including domain-specific enum values for select fields
4. Ensuring proper TypeScript types
5. Adding helpful error messages

## Special Instructions:
{{specialInstructions}}

Return ONLY the modified template code.`;

export const PAGE_TEMPLATE_MODIFICATION_PROMPT = `You are modifying a page component template for a {{entityName}} entity in the {{domain}} domain.

## Current Template:
\`\`\`typescript
{{currentTemplate}}
\`\`\`

## Entity Schema:
- Entity Name: {{entityName}}
- Domain: {{domain}}
- Fields: {{fields}}

## User Requirements:
{{userPrompt}}

## Task:
Modify the page component template to meet the user requirements while:
1. Maintaining proper React component structure
2. Using appropriate UI components for each field type
3. Including proper form validation
4. Adding domain-specific UI patterns
5. Ensuring responsive design
6. Following accessibility best practices

## Special Instructions:
{{specialInstructions}}

Return ONLY the modified template code.`;

export const API_TEMPLATE_MODIFICATION_PROMPT = `You are modifying an API route template for a {{entityName}} entity in the {{domain}} domain.

## Current Template:
\`\`\`typescript
{{currentTemplate}}
\`\`\`

## Entity Schema:
- Entity Name: {{entityName}}
- Domain: {{domain}}
- Fields: {{fields}}

## User Requirements:
{{userPrompt}}

## Task:
Modify the API route template to meet the user requirements while:
1. Maintaining proper Next.js API route structure
2. Implementing proper CRUD operations
3. Adding appropriate error handling
4. Including authentication/authorization checks
5. Following RESTful API best practices
6. Adding proper validation using Zod schemas

## Special Instructions:
{{specialInstructions}}

Return ONLY the modified template code.`;

export const FEW_SHOT_EXAMPLES = {
  healthcare: {
    patient: `
Example: Adding blood type field to patient validation
Input: "Add blood type field with validation"
Output:
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(), // Blood type of the patient`,
    
    appointment: `
Example: Adding appointment duration field
Input: "Add duration field in minutes"
Output:
  duration: z.coerce.number().int().min(15).max(180).optional(), // Duration in minutes`,
  },
  
  crm: {
    customer: `
Example: Adding customer tier field
Input: "Add customer tier with enum values"
Output:
  tier: z.enum(['Bronze', 'Silver', 'Gold', 'Platinum']).optional(), // Customer tier level`,
    
    lead: `
Example: Adding lead source field
Input: "Add lead source tracking"
Output:
  source: z.enum(['Website', 'Referral', 'Social Media', 'Email', 'Phone', 'Event']).optional(), // Lead acquisition source`,
  },
};

export function getFewShotExample(domain: string, entityName: string): string {
  const domainLower = domain.toLowerCase();
  const entityLower = entityName.toLowerCase();
  
  const examples = FEW_SHOT_EXAMPLES as Record<string, Record<string, string>>;
  
  if (examples[domainLower]) {
    const domainExamples = examples[domainLower];
    
    for (const [key, example] of Object.entries(domainExamples)) {
      if (entityLower.includes(key)) {
        return example;
      }
    }
  }
  
  return '';
}

export function buildModificationPrompt(
  template: string,
  entity: any,
  userPrompt: string,
  domain?: string,
  specialInstructions?: string,
): string {
  const category = entity.category || 'validation';
  
  let basePrompt = '';
  
  switch (category) {
    case 'validation':
      basePrompt = VALIDATION_TEMPLATE_MODIFICATION_PROMPT;
      break;
    case 'page':
      basePrompt = PAGE_TEMPLATE_MODIFICATION_PROMPT;
      break;
    case 'api':
      basePrompt = API_TEMPLATE_MODIFICATION_PROMPT;
      break;
    default:
      basePrompt = VALIDATION_TEMPLATE_MODIFICATION_PROMPT;
  }
  
  // Replace placeholders
  basePrompt = basePrompt.replace(/{{entityName}}/g, entity.name);
  basePrompt = basePrompt.replace(/{{domain}}/g, domain || 'generic');
  basePrompt = basePrompt.replace(/{{currentTemplate}}/g, template);
  basePrompt = basePrompt.replace(/{{fields}}/g, JSON.stringify(entity.fields, null, 2));
  basePrompt = basePrompt.replace(/{{userPrompt}}/g, userPrompt);
  basePrompt = basePrompt.replace(/{{specialInstructions}}/g, specialInstructions || 'None');
  
  // Add few-shot examples if available
  const fewShot = getFewShotExample(domain || '', entity.name);
  if (fewShot) {
    basePrompt += `\n\n## Example:\n${fewShot}`;
  }
  
  return basePrompt;
}
