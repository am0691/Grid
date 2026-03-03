<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-05 | Updated: 2026-02-05 -->

# app/src/store/ - Zustand State Management

## Purpose

This directory contains all global state management using Zustand. Each store manages a specific domain of application state (souls, progress, activities, etc.) and provides actions to modify that state.

## Structure

```
store/
├── soulStore.ts           # Soul/disciplee state and actions
├── progressStore.ts       # Progress tracking state
├── activityPlanStore.ts   # Activity plan state
├── pastoralCareStore.ts   # Pastoral care tracking state
├── gridStore.ts           # Legacy grid state (deprecated)
└── index.ts              # Barrel export of all stores
```

## Stores Overview

### soulStore

Manages souls (disciplees) and trainer-soul relationships.

```typescript
interface SoulStore {
  // State
  souls: Soul[];
  currentSoul: Soul | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchSouls: (trainerId: string) => Promise<void>;
  fetchSoulById: (id: string) => Promise<void>;
  createSoul: (dto: CreateSoulDto) => Promise<Soul>;
  updateSoul: (id: string, dto: UpdateSoulDto) => Promise<Soul>;
  deleteSoul: (id: string) => Promise<void>;
}
```

Usage:
```typescript
const { souls, currentSoul, fetchSouls, createSoul } = useSoulStore();
```

### progressStore

Manages progress tracking per soul per area.

```typescript
interface ProgressStore {
  // State
  progress: Progress[];
  soulProgress: Progress[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchProgress: (soulId: string) => Promise<void>;
  updateProgress: (id: string, dto: UpdateProgressDto) => Promise<Progress>;
  recordProgress: (dto: CreateProgressDto) => Promise<Progress>;
}
```

### activityPlanStore

Manages activity plans and evaluations.

```typescript
interface ActivityPlanStore {
  // State
  activities: ActivityPlan[];
  currentActivity: ActivityPlan | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchActivities: (soulId: string) => Promise<void>;
  createActivity: (dto: CreateActivityPlanDto) => Promise<ActivityPlan>;
  updateActivity: (id: string, dto: UpdateActivityPlanDto) => Promise<ActivityPlan>;
  evaluateActivity: (id: string, evaluation: ActivityEvaluation) => Promise<void>;
}
```

### pastoralCareStore

Manages pastoral care tracking and follow-ups.

```typescript
interface PastoralCareStore {
  // State
  careRecords: CareRecord[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchCareRecords: (soulId: string) => Promise<void>;
  recordCare: (dto: CreateCareRecordDto) => Promise<CareRecord>;
}
```

## Store Pattern

All stores follow the same pattern:

```typescript
// store/myStore.ts
import { create } from 'zustand';
import type { MyEntity, CreateMyEntityDto } from '@/domain/entities';
import { MyRepository } from '@/infrastructure/repositories/supabase';

interface MyStore {
  // State
  items: MyEntity[];
  currentItem: MyEntity | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetch: () => Promise<void>;
  getById: (id: string) => Promise<void>;
  create: (dto: CreateMyEntityDto) => Promise<MyEntity>;
  update: (id: string, dto: Partial<MyEntity>) => Promise<MyEntity>;
  delete: (id: string) => Promise<void>;
  clear: () => void;
}

const repository = new MyRepository();

export const useMyStore = create<MyStore>((set, get) => ({
  // Initial state
  items: [],
  currentItem: null,
  isLoading: false,
  error: null,

  // Actions
  fetch: async () => {
    set({ isLoading: true, error: null });
    try {
      const items = await repository.list();
      set({ items });
    } catch (error) {
      set({ error: String(error) });
    } finally {
      set({ isLoading: false });
    }
  },

  getById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const item = await repository.getById(id);
      set({ currentItem: item });
    } catch (error) {
      set({ error: String(error) });
    } finally {
      set({ isLoading: false });
    }
  },

  create: async (dto: CreateMyEntityDto) => {
    try {
      const item = await repository.create(dto);
      set((state) => ({
        items: [...state.items, item],
      }));
      return item;
    } catch (error) {
      set({ error: String(error) });
      throw error;
    }
  },

  update: async (id: string, dto: Partial<MyEntity>) => {
    try {
      const updated = await repository.update(id, dto);
      set((state) => ({
        items: state.items.map((item) =>
          item.id === id ? updated : item
        ),
        currentItem: state.currentItem?.id === id ? updated : state.currentItem,
      }));
      return updated;
    } catch (error) {
      set({ error: String(error) });
      throw error;
    }
  },

  delete: async (id: string) => {
    try {
      await repository.delete(id);
      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
        currentItem: state.currentItem?.id === id ? null : state.currentItem,
      }));
    } catch (error) {
      set({ error: String(error) });
      throw error;
    }
  },

  clear: () => {
    set({
      items: [],
      currentItem: null,
      isLoading: false,
      error: null,
    });
  },
}));
```

## For AI Agents

### Working with Stores

1. **Create store** - Use create() from zustand
2. **Define interface** - Type all state and actions
3. **Initialize state** - Set default values
4. **Implement actions** - Handle loading, errors
5. **Export hook** - Export useStore for components

### Creating a New Store

1. Create file: `store/myStore.ts`
2. Define MyStore interface
3. Create repository instance
4. Implement create() with actions
5. Export from `index.ts`

```typescript
// store/myStore.ts
import { create } from 'zustand';
import type { MyEntity } from '@/domain/entities';
import { MyRepository } from '@/infrastructure/repositories/supabase';

interface MyStore {
  items: MyEntity[];
  isLoading: boolean;
  error: string | null;

  fetch: () => Promise<void>;
  create: (dto: CreateDto) => Promise<MyEntity>;
}

const repository = new MyRepository();

export const useMyStore = create<MyStore>((set) => ({
  items: [],
  isLoading: false,
  error: null,

  fetch: async () => {
    set({ isLoading: true });
    try {
      const items = await repository.list();
      set({ items, error: null });
    } catch (error) {
      set({ error: String(error) });
    } finally {
      set({ isLoading: false });
    }
  },

  create: async (dto) => {
    try {
      const item = await repository.create(dto);
      set((state) => ({ items: [...state.items, item] }));
      return item;
    } catch (error) {
      set({ error: String(error) });
      throw error;
    }
  },
}));
```

Export from index.ts:
```typescript
// store/index.ts
export * from './myStore';
```

### Using Stores in Components

```typescript
// In components
import { useMyStore } from '@/store';

export function MyComponent() {
  const { items, isLoading, error, fetch, create } = useMyStore();

  useEffect(() => {
    fetch();
  }, [fetch]);

  const handleCreate = async () => {
    try {
      await create({ /* data */ });
    } catch (error) {
      // Error already in store.error
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {items.map((item) => (
        <div key={item.id}>{item.name}</div>
      ))}
      <button onClick={handleCreate}>Create</button>
    </div>
  );
}
```

## Store Patterns

### List + Detail Pattern

```typescript
interface MyStore {
  // List
  items: MyEntity[];
  isLoadingList: boolean;

  // Detail
  currentItem: MyEntity | null;
  isLoadingDetail: boolean;

  // Actions
  fetchList: () => Promise<void>;
  fetchDetail: (id: string) => Promise<void>;
}
```

### Filtered List Pattern

```typescript
interface MyStore {
  items: MyEntity[];
  filter: MyFilter;
  isLoading: boolean;

  setFilter: (filter: MyFilter) => void;
  fetchFiltered: () => Promise<void>;
}
```

### Form State Pattern

```typescript
interface MyStore {
  formData: FormData;
  isSubmitting: boolean;
  errors: Record<string, string>;

  setField: (field: string, value: any) => void;
  submit: () => Promise<void>;
}
```

## Error Handling in Stores

```typescript
async function fetchData() {
  set({ isLoading: true, error: null });
  try {
    const data = await api.fetch();
    set({ data, error: null });
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error';
    set({ error: errorMessage });
  } finally {
    set({ isLoading: false });
  }
}
```

## State Selectors

Use selectors to access specific parts of state:

```typescript
// Selector function
const useItemCount = () => useMyStore((state) => state.items.length);
const useIsLoading = () => useMyStore((state) => state.isLoading);

// In component
const count = useItemCount();
const isLoading = useIsLoading();
```

## Store Rules (CRITICAL)

1. **Immutable updates** - Use set() with new objects/arrays
2. **Error handling** - Always try/catch, set error state
3. **Loading states** - Set isLoading before/after async
4. **Repository injection** - Create once, reuse
5. **Type safety** - Interface all state and actions
6. **Single store** - One store per domain entity
7. **No side effects** - Only call repository methods
8. **Stateless repository** - Repositories are stateless
9. **Consistent naming** - fetch, create, update, delete
10. **Export from index** - Always re-export from store/index.ts

## Store Checklist

- [ ] Interface defined for state and actions
- [ ] Repository injected at module level
- [ ] Initial state provided
- [ ] All actions handle loading states
- [ ] All actions handle error states
- [ ] Async operations use try/catch
- [ ] State updates immutable
- [ ] Actions typed with proper return types
- [ ] Exported from store/index.ts
- [ ] Used in components with proper cleanup

## Notes

- Zustand stores are the single source of truth for global state
- Each store handles one domain (Soul, Progress, Activity, etc.)
- Actions perform CRUD operations via repositories
- Loading and error states mandatory for async actions
- Component local state via useState, global state via stores
- No component state should duplicate store state
- Selectors for performance optimization in large lists
