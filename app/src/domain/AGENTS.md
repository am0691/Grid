<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-05 | Updated: 2026-02-05 -->

# app/src/domain/ - Domain Layer (Business Logic)

## Purpose

The Domain layer contains pure business logic and entities that are **completely framework-agnostic**. No React, no Supabase, no HTTP clients here. This layer should be testable without any external dependencies.

## Structure

```
domain/
├── entities/               # Core business entities
│   ├── soul.ts
│   ├── activity-plan.ts
│   ├── progress.ts
│   ├── user.ts
│   ├── spiritual-state.ts
│   ├── spiritual-prescription.ts
│   ├── encouragement.ts
│   ├── breakthrough.ts
│   ├── crisis-alert.ts
│   ├── relationship-timeline.ts
│   ├── reproduction-readiness.ts
│   ├── recommendation.ts
│   └── index.ts
│
├── value-objects/         # Immutable value types
│   ├── area.ts
│   └── index.ts
│
├── services/              # Domain business services
│   ├── crisis-detection.service.ts
│   ├── encouragement.service.ts
│   └── index.ts
│
├── data/                  # Lookup data, constants
│   ├── recommendations/
│   │   └── (recommendation templates)
│   └── index.ts
│
└── index.ts              # Barrel export
```

## Key Entities

### Soul (`entities/soul.ts`)
Represents an individual being discipled. Core properties: id, userId, name, email, dates.

### ActivityPlan (`entities/activity-plan.ts`)
Represents a training activity: type (meeting, call, study, event, prayer, other), status, scheduled date, evaluation.

### Progress (`entities/progress.ts`)
Tracks progress per soul, per area. Contains: soulId, areaId, week/month number, status, notes.

### SpiritualState (`entities/spiritual-state.ts`)
Assesses soul's spiritual condition. Temperature scale, areas, observations.

### SpiritualPrescription (`entities/spiritual-prescription.ts`)
Personalized guidance. Type (prayer, study, community, reflection, action), content, rationale.

### User (`entities/user.ts`)
Trainer/pastor. Properties: id, email, name, role, dates.

### Other Entities
- **Encouragement**: Records of encouragement given
- **Breakthrough**: Significant spiritual breakthrough moments
- **CrisisAlert**: Crisis patterns and alerts
- **RelationshipTimeline**: History of trainer-soul relationship
- **ReproductionReadiness**: Assessment of readiness to disciple others

## Value Objects

### Area (`value-objects/area.ts`)
Represents the different discipleship areas. Examples:
- CONVERT program: 5 areas (Assurance, Word, Fellowship, Freedom, Vision)
- DISCIPLE program: 14 areas (expanded curriculum)

Value objects are immutable and should not be modified after creation.

## Domain Services

### CrisisDetectionService
Contains algorithms for detecting crisis patterns. Methods like:
- `detectPatterns(soulId, activities, spiritualState)`: Returns CrisisAlert if patterns detected
- `assessRiskLevel(factors)`: Returns risk level (low, medium, high, critical)

### EncouragementService
Generates appropriate encouragement. Methods like:
- `suggestEncouragement(soulId, context)`: Returns suggestion
- `validateEncouragement(encouragement)`: Returns validation result

## For AI Agents

### Working in Domain Layer

1. **No external imports** - Don't import from React, Supabase, or infrastructure
2. **Immutable entities** - Use `readonly` for properties, no setters
3. **Pure functions** - Domain services should be deterministic
4. **Type-first design** - Use TypeScript interfaces, enums for types
5. **No side effects** - Don't make API calls or database queries

### Adding a New Entity

1. Create file: `domain/entities/my-entity.ts`
2. Define interface with all properties
3. Create DTO interfaces (Create, Update)
4. Export from `index.ts`

```typescript
// domain/entities/my-entity.ts
export interface MyEntity {
  readonly id: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  // ... properties
}

export interface CreateMyEntityDto {
  // ... required fields for creation
}

export interface UpdateMyEntityDto {
  // ... optional fields for update
}
```

### Adding a Domain Service

1. Create file: `domain/services/my-service.ts`
2. Export as class or set of functions
3. Keep logic pure and testable
4. Export from `index.ts`

```typescript
// domain/services/my-service.ts
export class MyService {
  static analyze(data: MyData): Result {
    // Pure business logic, no side effects
    return result;
  }
}
```

### Testing Domain Layer

Domain layer tests are pure unit tests with no mocking:

```typescript
// domain/services/__tests__/my-service.test.ts
import { MyService } from '../my-service';

describe('MyService', () => {
  it('should analyze data correctly', () => {
    const data = { /* test data */ };
    const result = MyService.analyze(data);
    expect(result).toEqual({ /* expected */ });
  });
});
```

## Rules (CRITICAL)

1. **Zero framework imports** - No React, Supabase, axios, etc.
2. **Immutability** - All properties readonly
3. **No side effects** - No API calls, no database access, no mutations
4. **Pure types** - Use interfaces and types, not classes with state
5. **No circular dependencies** - Keep entities independent
6. **Deterministic** - Same input always produces same output
7. **Testable** - Should be testable without any mocking

## Entity Checklist

- [ ] All properties marked `readonly`
- [ ] No constructor with side effects
- [ ] No methods that mutate state
- [ ] All required properties in Create DTO
- [ ] All optional properties in Update DTO
- [ ] Proper TypeScript types, no `any`
- [ ] Exported from layer's `index.ts`
- [ ] Documented with JSDoc comments

## Notes

- Domain entities are data structures, not objects with behavior
- Keep entities simple and focused
- Business logic goes in domain services, not entities
- Value objects are immutable by design
- This layer is reusable across projects (no GRID-specific imports)
