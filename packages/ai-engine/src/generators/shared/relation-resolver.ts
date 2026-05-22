/**
 * Relation Resolver Intelligence
 * Converts raw relation IDs into semantic selectors and form components
 */

import type { EntityNode, EntityRelation } from '@oneatlas/shared';

interface ResolvedRelation {
  fieldName: string;
  displayName: string;
  targetEntity: string;
  relationType: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';
  isSearchable: boolean;
  component: 'Select' | 'Combobox' | 'Multiselect';
  placeholder: string;
  description?: string;
}

/**
 * Create semantic display name from entity name
 */
function createDisplayName(entityName: string): string {
  return entityName
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .replace(/^./, (char) => char.toUpperCase());
}

/**
 * Convert relation type string to canonical form
 */
function normalizeRelationType(
  type: string,
): ResolvedRelation['relationType'] {
  const normalized = type.toLowerCase().replace(/\s+/g, '-');

  if (normalized.includes('one-to-one')) return 'one-to-one';
  if (normalized.includes('one-to-many')) return 'one-to-many';
  if (normalized.includes('many-to-one')) return 'many-to-one';
  if (normalized.includes('many-to-many')) return 'many-to-many';

  return 'many-to-one'; // Default
}

/**
 * Select best component for a relation
 */
function selectComponentForRelation(
  relationType: ResolvedRelation['relationType'],
): 'Select' | 'Combobox' | 'Multiselect' {
  switch (relationType) {
    case 'one-to-one':
    case 'many-to-one':
      return 'Combobox'; // Searchable for large datasets
    case 'many-to-many':
    case 'one-to-many':
      return 'Multiselect';
    default:
      return 'Combobox';
  }
}

/**
 * Resolve a relation with semantic context
 */
export function resolveRelation(
  relation: EntityRelation,
  sourceEntityName: string,
  allEntities: EntityNode[],
): ResolvedRelation {
  const targetEntity =
    allEntities.find(
      (e) => e.id === relation.targetEntity || e.name === relation.targetEntity,
    )?.name || relation.targetEntity;

  const relationType = normalizeRelationType(relation.type);
  const component = selectComponentForRelation(relationType);

  // Generate field name based on relation type
  const fieldName =
    relationType === 'many-to-one' || relationType === 'one-to-one'
      ? `${targetEntity.charAt(0).toLowerCase()}${targetEntity.slice(1)}Id`
      : `${targetEntity.toLowerCase()}Ids`;

  const displayName =
    relation.displayName ||
    createDisplayName(targetEntity);

  return {
    fieldName,
    displayName,
    targetEntity,
    relationType,
    isSearchable: component !== 'Select',
    component,
    placeholder: `Select ${displayName.toLowerCase()}...`,
    description: relation.description,
  };
}

/**
 * Resolve all relations for an entity
 */
export function resolveAllRelations(
  entity: EntityNode,
  allEntities: EntityNode[],
): ResolvedRelation[] {
  return (entity.relations || []).map((relation) =>
    resolveRelation(relation, entity.name, allEntities),
  );
}

/**
 * Generate a searchable combobox for a relation
 */
export function generateRelationCombobox(
  relation: ResolvedRelation,
): string {
  return `
<FormField
  control={form.control}
  name="${relation.fieldName}"
  render={({ field }) => (
    <FormItem>
      <FormLabel>${relation.displayName}</FormLabel>
      
      <Popover>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant="outline"
              role="combobox"
              className="w-full justify-between"
            >
              {field.value
                ? items.find((item) => item.value === field.value)?.label
                : '${relation.placeholder}'}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search..." />
            <CommandEmpty>No ${relation.displayName.toLowerCase()} found.</CommandEmpty>
            
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  value={item.value}
                  key={item.value}
                  onSelect={() => {
                    form.setValue('${relation.fieldName}', item.value);
                  }}
                >
                  <Check
                    className={\`mr-2 h-4 w-4 \${
                      field.value === item.value
                        ? 'opacity-100'
                        : 'opacity-0'
                    }\`}
                  />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      
      <FormMessage />
    </FormItem>
  )}
/>`;
}

/**
 * Generate a select for a relation
 */
export function generateRelationSelect(relation: ResolvedRelation): string {
  return `
<FormField
  control={form.control}
  name="${relation.fieldName}"
  render={({ field }) => (
    <FormItem>
      <FormLabel>${relation.displayName}</FormLabel>
      
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="${relation.placeholder}" />
          </SelectTrigger>
        </FormControl>
        
        <SelectContent>
          {/* Fetch ${relation.targetEntity} options */}
          <SelectItem value="1">${relation.displayName} Option</SelectItem>
        </SelectContent>
      </Select>
      
      <FormMessage />
    </FormItem>
  )}
/>`;
}

/**
 * Generate proper validation for a relation field
 */
export function generateRelationValidation(
  relation: ResolvedRelation,
): string {
  const baseValidation =
    relation.relationType === 'many-to-many' ||
    relation.relationType === 'one-to-many'
      ? `z.array(z.string())`
      : `z.string()`;

  return `${baseValidation}.optional()`;
}

/**
 * Check if two entities are related
 */
export function areEntitiesRelated(
  source: EntityNode,
  target: EntityNode,
): boolean {
  return (source.relations || []).some(
    (rel) =>
      rel.targetEntity === target.name ||
      rel.targetEntity === target.id,
  );
}

/**
 * Get the relationship type between two entities
 */
export function getRelationshipType(
  source: EntityNode,
  target: EntityNode,
): EntityNode['relations'][0]['type'] | null {
  const relation = (source.relations || []).find(
    (rel) =>
      rel.targetEntity === target.name ||
      rel.targetEntity === target.id,
  );

  return relation?.type || null;
}

/**
 * Generate a form field name for a relation
 */
export function generateRelationFieldName(
  targetEntityName: string,
  relationType: ResolvedRelation['relationType'],
): string {
  const base =
    targetEntityName.charAt(0).toLowerCase() +
    targetEntityName.slice(1);

  if (relationType === 'many-to-many' || relationType === 'one-to-many') {
    return `${base}Ids`;
  }

  return `${base}Id`;
}

/**
 * Infer display properties for relation
 */
export function inferRelationDisplay(
  targetEntityName: string,
): {
  singular: string;
  plural: string;
} {
  const singular = targetEntityName
    .replace(/([A-Z])/g, ' $1')
    .trim();

  const plural =
    singular.endsWith('s')
      ? singular
      : `${singular}s`;

  return { singular, plural };
}

export const relationResolver = {
  resolveRelation,
  resolveAllRelations,
  generateRelationCombobox,
  generateRelationSelect,
  generateRelationValidation,
  areEntitiesRelated,
  getRelationshipType,
  generateRelationFieldName,
  inferRelationDisplay,
};
