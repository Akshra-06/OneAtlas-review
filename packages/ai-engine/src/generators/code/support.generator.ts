import type { GeneratedFile } from '@oneatlas/shared';

export const generateSupportFiles = (): GeneratedFile[] => {
  return [
    {
      filePath: 'lib/mock-storage.ts',
      fileType: 'support',
      entityName: 'MockStorage',
      content: `/**
 * Lightweight in-memory storage for preview mode
 * Used when Docker/database is unavailable
 */

interface MockRecord {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
  [key: string]: any;
}

class MockStorage {
  private data: Map<string, MockRecord[]> = new Map();

  private getCollection(entityName: string): MockRecord[] {
    if (!this.data.has(entityName)) {
      this.data.set(entityName, []);
    }
    return this.data.get(entityName)!;
  }

  async findMany(entityName: string, where: any = {}, options: any = {}) {
    const collection = this.getCollection(entityName);
    let results = [...collection];

    if (where.tenantId) {
      results = results.filter(r => r.tenantId === where.tenantId);
    }

    if (where.OR) {
      results = results.filter(r => {
        return where.OR.some((condition: any) => {
          const key = Object.keys(condition)[0];
          const value = Object.values(condition)[0] as string;
          if (condition.contains) {
            return r[key]?.toLowerCase().includes(value.toLowerCase());
          }
          return r[key] === value;
        });
      });
    }

    const skip = options.skip || 0;
    const take = options.take || 20;
    const total = results.length;

    return {
      data: results.slice(skip, skip + take),
      total,
    };
  }

  async create(entityName: string, data: any) {
    const collection = this.getCollection(entityName);
    const record: MockRecord = {
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    };
    collection.push(record);
    return record;
  }

  async findUnique(entityName: string, where: any) {
    const collection = this.getCollection(entityName);
    return collection.find(r => r.id === where.id);
  }

  async update(entityName: string, where: any, data: any) {
    const collection = this.getCollection(entityName);
    const index = collection.findIndex(r => r.id === where.id);
    if (index === -1) return null;
    
    collection[index] = {
      ...collection[index],
      ...data,
      updatedAt: new Date(),
    };
    return collection[index];
  }

  async delete(entityName: string, where: any) {
    const collection = this.getCollection(entityName);
    const index = collection.findIndex(r => r.id === where.id);
    if (index === -1) return null;
    
    const deleted = collection.splice(index, 1)[0];
    return deleted;
  }

  async count(entityName: string, where: any = {}) {
    const collection = this.getCollection(entityName);
    if (where.tenantId) {
      return collection.filter(r => r.tenantId === where.tenantId).length;
    }
    return collection.length;
  }
}

export const mockStorage = new MockStorage();
`,
    },
  ];
};

export const supportGenerator = {
  generate: generateSupportFiles,
};

export default supportGenerator;
