import type { ComponentDefinition, ComponentRegistry } from './types.js';

class Registry implements ComponentRegistry {
  private definitions = new Map<string, ComponentDefinition>();

  constructor(definitions?: ComponentDefinition[]) {
    if (definitions) {
      for (const def of definitions) {
        this.register(def);
      }
    }
  }

  register(definition: ComponentDefinition): void {
    if (this.definitions.has(definition.type)) {
      throw new Error(`Component type "${definition.type}" is already registered`);
    }
    this.definitions.set(definition.type, definition);
  }

  get(type: string): ComponentDefinition | undefined {
    return this.definitions.get(type);
  }

  has(type: string): boolean {
    return this.definitions.has(type);
  }

  list(): ComponentDefinition[] {
    return Array.from(this.definitions.values());
  }

  byCategory(): Record<string, ComponentDefinition[]> {
    const result: Record<string, ComponentDefinition[]> = {};
    for (const def of this.definitions.values()) {
      const category = def.category ?? 'Uncategorized';
      if (!result[category]) result[category] = [];
      result[category].push(def);
    }
    return result;
  }
}

export function createRegistry(definitions?: ComponentDefinition[]): ComponentRegistry {
  return new Registry(definitions);
}
