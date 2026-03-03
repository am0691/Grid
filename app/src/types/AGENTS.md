<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-05 | Updated: 2026-02-05 -->

# types - TypeScript Type Definitions (Legacy)

## Purpose
Legacy TypeScript type definitions. This directory is being gradually migrated to domain/entities/ as part of the Clean Architecture refactoring.

## Key Files
| File | Description |
|------|-------------|
| index.ts | Legacy type definitions (Soul, Progress, Area, etc.) |
| supabase.ts | Supabase-generated database types |

## Subdirectories
None

## For AI Agents

### Working In This Directory
1. **Migration in progress**: New types should go in domain/entities/ or domain/value-objects/
2. **Don't expand this file**: Add new types to appropriate domain layer instead
3. **Use for legacy compatibility**: During migration, keep these for backward compatibility
4. **Update imports gradually**: Change from @/types to @/domain/entities
5. **Supabase types stay**: supabase.ts contains generated types, keep it here

### Testing Requirements
- Type tests (TypeScript compilation is the test)
- Ensure backward compatibility during migration
- Test type imports in components

### Common Patterns
```typescript
// Legacy type (index.ts)
export interface Soul {
  id: string;
  name: string;
  trainingType: 'convert' | 'disciple';
  startDate: string;
  createdAt: string;
  updatedAt: string;
}

// New location (domain/entities/soul.ts)
export interface Soul {
  id: string;
  name: string;
  trainingType: TrainingType;
  startDate: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}
```

### Migration Strategy
1. **Phase 1**: Copy types to domain/entities/
2. **Phase 2**: Re-export from types/index.ts for compatibility
```typescript
// types/index.ts
export { Soul, Progress } from '../domain/entities';
```
3. **Phase 3**: Update imports in components
```typescript
// Old
import { Soul } from '@/types';
// New
import { Soul } from '@/domain/entities';
```
4. **Phase 4**: Remove re-exports when no longer used
5. **Phase 5**: Delete types/index.ts

## Dependencies

### Internal
- Currently used by: components/, presentation/, store/
- Being replaced by: domain/entities/, domain/value-objects/

### External
- **@supabase/supabase-js**: For Supabase type generation

## Legacy Type Definitions

### Core Types (index.ts)
- **Soul**: Person being mentored/discipled
- **Progress**: Progress tracking data
- **Area**: Training area definitions
- **ActivityPlan**: Activity planning
- **TrainingType**: 'convert' | 'disciple'

### Database Types (supabase.ts)
- Generated from Supabase schema
- Database table types
- Row types with snake_case fields
- Used by infrastructure/repositories/

## Supabase Type Generation

### Regenerate Types
```bash
# Generate types from Supabase schema
npx supabase gen types typescript --project-id <project-id> > src/types/supabase.ts
```

### Usage
```typescript
import type { Database } from '@/types/supabase';

type SoulRow = Database['public']['Tables']['souls']['Row'];
type SoulInsert = Database['public']['Tables']['souls']['Insert'];
type SoulUpdate = Database['public']['Tables']['souls']['Update'];
```

## Migration Checklist

- [ ] Copy Soul type to domain/entities/soul.ts
- [ ] Copy Progress type to domain/entities/progress.ts
- [ ] Copy ActivityPlan to domain/entities/activity-plan.ts
- [ ] Copy TrainingType to domain/value-objects/training-type.ts
- [ ] Copy Area to domain/value-objects/area.ts
- [ ] Update all imports in components/
- [ ] Update all imports in presentation/
- [ ] Update all imports in store/
- [ ] Remove re-exports from types/index.ts
- [ ] Keep only supabase.ts in types/

<!-- MANUAL: -->
