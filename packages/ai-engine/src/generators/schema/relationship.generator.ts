import type { Entity } from '@oneatlas/shared';
import type { RelationSchema } from '@oneatlas/shared';

const ONE_TO_ONE_SUFFIXES = ['Profile', 'Detail', 'Settings'];

const toPascalCase = (value: string): string => {
  return value
    .replace(/[-_]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('');
};

const toCamelCase = (value: string): string => {
  const pascal = toPascalCase(value);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
};

const toPlural = (value: string): string => {
  const camel = toCamelCase(value);
  if (camel.endsWith('s')) return `${camel}es`;
  if (camel.endsWith('x') || camel.endsWith('z') || camel.endsWith('ch') || camel.endsWith('sh')) {
    return `${camel}es`;
  }
  return `${camel}s`;
};

const buildRelationKey = (
  from: string,
  to: string,
  type: RelationSchema['type'],
): string => {
  return [from, to, type].sort().join(':');
};

const buildRelationName = (
  fromEntity: string,
  toEntity: string,
  type: RelationSchema['type'],
): string => {
  const [first, second] = [fromEntity, toEntity].sort();
  return `${first}${second}${toPascalCase(type)}`;
};

const isJoinEntity = (entityName: string, entityNames: string[]): string[] => {
  return entityNames.filter(
    (name) =>
      name !== entityName &&
      entityName.toLowerCase().includes(name.toLowerCase()),
  );
};

const createOneToManyRelation = (
  fromEntity: string,
  toEntity: string,
): RelationSchema => ({
  type: 'one-to-many',
  fromEntity,
  toEntity,
  fieldName: toPlural(toEntity),
  isRequired: false,
  relationName: buildRelationName(fromEntity, toEntity, 'one-to-many'),
  ownerEntity: toEntity,
  inverseFieldName: toCamelCase(fromEntity),
  foreignKeyField: `${toCamelCase(fromEntity)}Id`,
  references: 'id',
});

const createManyToManyRelation = (
  fromEntity: string,
  toEntity: string,
): RelationSchema => ({
  type: 'many-to-many',
  fromEntity,
  toEntity,
  fieldName: toPlural(toEntity),
  isRequired: false,
  relationName: buildRelationName(fromEntity, toEntity, 'many-to-many'),
  ownerEntity: fromEntity,
  inverseFieldName: toPlural(fromEntity),
});

const createOneToOneRelation = (
  fromEntity: string,
  toEntity: string,
): RelationSchema => ({
  type: 'one-to-one',
  fromEntity,
  toEntity,
  fieldName: toCamelCase(toEntity),
  isRequired: true,
  relationName: buildRelationName(fromEntity, toEntity, 'one-to-one'),
  ownerEntity: toEntity,
  inverseFieldName: toCamelCase(fromEntity),
  foreignKeyField: `${toCamelCase(fromEntity)}Id`,
  references: 'id',
});

export const generateRelationships = (
  entities: Entity[],
): RelationSchema[] => {
  const relations: RelationSchema[] = [];
  const relationKeys = new Set<string>();

  const entityNames = entities.map((entity) => toPascalCase(entity.name));
  const entityNameMap = new Map(
    entities.map((entity) => [entity.name.toLowerCase(), toPascalCase(entity.name)]),
  );

  for (const entity of entities) {
    const sourceEntity = toPascalCase(entity.name);
    const relationTargets = (entity.relations || [])
      .map((r: any) => typeof r === 'string' ? r : r.targetEntity)
      .map((target: string) => entityNameMap.get(String(target).toLowerCase()) ?? toPascalCase(String(target)))
      .filter((target) => entityNames.includes(target) && target !== sourceEntity);

    for (const relatedEntity of relationTargets) {
      const declared = (entity.relations || []).find((r: any) => {
        const target = typeof r === 'string' ? r : r.targetEntity;
        return toPascalCase(String(target)) === relatedEntity;
      }) as any;

      const declaredType = String(declared?.type ?? '').toLowerCase();
      const relation = createOneToManyRelation(
        sourceEntity,
        relatedEntity,
      );
      if (declaredType.includes('many-to-many')) {
        Object.assign(relation, createManyToManyRelation(sourceEntity, relatedEntity));
      } else if (declaredType.includes('one-to-one')) {
        Object.assign(relation, createOneToOneRelation(sourceEntity, relatedEntity));
      }

      const key = buildRelationKey(
        relation.fromEntity,
        relation.toEntity,
        relation.type,
      );

      if (!relationKeys.has(key)) {
        relationKeys.add(key);
        relations.push(relation);
      }
    }

    const matchedEntities = isJoinEntity(sourceEntity, entityNames);

    if (matchedEntities.length === 2) {
      const [firstEntity, secondEntity] = matchedEntities;

      if (firstEntity && secondEntity) {
        const relation = createManyToManyRelation(
          firstEntity,
          secondEntity,
        );

        const key = buildRelationKey(
          relation.fromEntity,
          relation.toEntity,
          relation.type,
        );

        if (!relationKeys.has(key)) {
          relationKeys.add(key);
          relations.push(relation);
        }
      }
    }

    const oneToOneSuffix = ONE_TO_ONE_SUFFIXES.find((suffix) =>
      sourceEntity.endsWith(suffix),
    );

    if (oneToOneSuffix) {
      const parentEntity = sourceEntity.replace(oneToOneSuffix, '');

      if (entityNames.includes(parentEntity)) {
        const relation = createOneToOneRelation(
          parentEntity,
          entity.name,
        );

        const key = buildRelationKey(
          relation.fromEntity,
          relation.toEntity,
          relation.type,
        );

        if (!relationKeys.has(key)) {
          relationKeys.add(key);
          relations.push(relation);
        }
      }
    }
  }

  return relations;
};

export default generateRelationships;
