<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-05 | Updated: 2026-02-05 -->

# app/src/ - Source Code Organization

## Purpose

This directory contains all TypeScript/React source code organized by Clean Architecture layers. Each layer has specific responsibilities and must maintain strict boundaries.

## Directory Structure Overview

```
src/
├── domain/                 # Layer 1: Domain (framework-agnostic business logic)
├── application/            # Layer 2: Application (use cases, ports, services)
├── infrastructure/         # Layer 3: Infrastructure (external implementations)
├── presentation/           # Layer 4: Presentation (React, UI, pages)
├── store/                  # Zustand state management
├── components/             # Shared UI components
├── lib/                    # Utility libraries
├── types/                  # Global type definitions
├── utils/                  # Utility functions
├── App.tsx                # Root component
└── main.tsx               # Entry point
```

## Layer 1: Domain (`domain/`)

**Responsibility**: Pure business logic, framework-agnostic, testable in isolation.

**Key principle**: Domain layer has ZERO imports from React, Supabase, or any framework.

### Structure

```
domain/
├── entities/               # Business entities (immutable records)
│   ├── index.ts
│   ├── soul.ts            # Individual being discipled
│   ├── activity-plan.ts   # Training activities
│   ├── progress.ts        # Progress per area per soul
│   ├── user.ts            # Trainer/pastor
│   ├── spiritual-state.ts # Spiritual assessment
│   ├── spiritual-prescription.ts  # Guidance
│   ├── encouragement.ts   # Encouragement records
│   ├── breakthrough.ts    # Breakthrough moments
│   ├── crisis-alert.ts    # Crisis alerts
│   ├── relationship-timeline.ts   # Relationship history
│   └── reproduction-readiness.ts  # Reproduction readiness
│
├── value-objects/         # Immutable value types
│   ├── index.ts
│   └── area.ts           # Discipleship area types
│
├── services/              # Domain business services
│   ├── crisis-detection.service.ts
│   └── encouragement.service.ts
│
├── data/                  # Lookup data, recommendations
│   ├── recommendations/
│   └── (other constants)
│
└── index.ts              # Barrel export
```

### What Goes Here

- **Entities**: Core business objects (Soul, ActivityPlan, Progress)
- **Value Objects**: Immutable concepts (Area, Status enums)
- **Domain Services**: Pure business logic (CrisisDetectionService)
- **Interfaces**: Contracts for external dependencies (defined as ports in Application layer)
- **Constants**: Business rules, lookup tables

### What Does NOT Go Here

- No React imports
- No Supabase imports
- No HTTP clients
- No Database access
- No Framework-specific code

### Example Entity

```typescript
// domain/entities/soul.ts
export interface Soul {
  readonly id: string;
  readonly userId: string;
  readonly name: string;
  readonly birthDate?: Date;
  readonly email?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface CreateSoulDto {
  name: string;
  birthDate?: Date;
  email?: string;
}
```

## Layer 2: Application (`application/`)

**Responsibility**: Use cases and application workflows that orchestrate domain logic.

**Key principle**: Defines contracts (interfaces/ports) that infrastructure implements.

### Structure

```
application/
├── ports/                 # Interface contracts for external dependencies
│   ├── index.ts
│   └── services.ts       # Service interfaces (IPdfParserService, etc.)
│
├── services/              # Application-level business services
│   ├── recommendation-service.ts      # Recommendation algorithm
│   └── trend-recommendation-service.ts # Trend analysis
│
├── use-cases/             # Business use cases/workflows
│   ├── auth/
│   │   ├── index.ts
│   │   ├── sign-up.ts
│   │   └── sign-in.ts
│   ├── souls/
│   │   ├── index.ts
│   │   ├── create-soul.ts
│   │   ├── update-soul.ts
│   │   └── list-souls.ts
│   ├── activity-plans/
│   │   ├── index.ts
│   │   └── (activity plan use cases)
│   ├── progress/
│   │   ├── index.ts
│   │   └── (progress use cases)
│   └── index.ts
│
└── index.ts              # Barrel export
```

### What Goes Here

- **Ports/Interfaces**: Contracts for repositories, services (ISoulRepository, IPdfParserService)
- **Use Cases**: Business workflows that coordinate domain logic
- **Application Services**: Cross-domain business services
- **DTOs**: Data transfer objects for API/database contracts

### What Does NOT Go Here

- No React imports
- No Supabase imports (only uses ports/interfaces)
- No concrete repository implementations
- No HTTP client code

### Example Use Case

```typescript
// application/use-cases/souls/create-soul.ts
import type { Soul, CreateSoulDto } from '@/domain/entities';
import type { ISoulRepository } from '@/application/ports';

export class CreateSoulUseCase {
  constructor(private soulRepository: ISoulRepository) {}

  async execute(dto: CreateSoulDto, userId: string): Promise<Soul> {
    // Business logic here
    const soul = await this.soulRepository.create({
      ...dto,
      userId,
    });
    return soul;
  }
}
```

### Example Port

```typescript
// application/ports/services.ts
export interface IPdfParserService {
  extractText(file: File): Promise<string>;
  extractMetadata(file: File): Promise<PdfMetadata>;
}

export interface PdfMetadata {
  title?: string;
  pageCount: number;
  // ... more fields
}
```

## Layer 3: Infrastructure (`infrastructure/`)

**Responsibility**: External service implementations that satisfy Application ports.

**Key principle**: Implements Application interfaces; handles database, APIs, external services.

### Structure

```
infrastructure/
├── database/              # Database schema and utilities
│   ├── schema.ts         # Database schema definitions
│   ├── queries.example.ts # Example queries
│   └── index.ts
│
├── repositories/          # Data access layer
│   ├── soul.repository.ts           # Repository interface
│   ├── activity-plan.repository.ts  # Repository interface
│   ├── progress.repository.ts       # Repository interface
│   ├── user.repository.ts           # Repository interface
│   ├── supabase/
│   │   ├── soul-repository.ts           # Supabase implementation
│   │   ├── activity-plan-repository.ts  # Supabase implementation
│   │   ├── progress-repository.ts       # Supabase implementation
│   │   ├── index.ts
│   │   └── (other implementations)
│   └── index.ts
│
├── services/              # External service implementations
│   ├── auth/
│   │   ├── auth-service.ts   # Supabase auth implementation
│   │   ├── types.ts          # Auth types
│   │   └── index.ts
│   ├── supabase/
│   │   ├── client.ts         # Supabase client config
│   │   └── index.ts
│   ├── pdf/
│   │   ├── pdf-parser.service.ts  # PDF parser implementation
│   │   ├── index.ts
│   │   └── README.md
│   └── index.ts
│
└── index.ts              # Barrel export
```

### What Goes Here

- **Repository Implementations**: Database access (SoulRepository implementing ISoulRepository)
- **Service Implementations**: External services (AuthService, PdfParserService)
- **Database Client Config**: Supabase client initialization
- **Schema Definitions**: Database schema and type definitions
- **API Integrations**: HTTP clients, external API calls

### What Does NOT Go Here

- No business logic (that's domain/application)
- No React components
- No direct use case code

### Example Repository Implementation

```typescript
// infrastructure/repositories/supabase/soul-repository.ts
import { supabase } from '../supabase/client';
import type { ISoulRepository } from '@/application/ports';
import type { Soul, CreateSoulDto } from '@/domain/entities';

export class SoulRepository implements ISoulRepository {
  async create(data: CreateSoulDto & { userId: string }): Promise<Soul> {
    const { data: result, error } = await supabase
      .from('souls')
      .insert([data])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return result as Soul;
  }

  async getById(id: string): Promise<Soul | null> {
    const { data, error } = await supabase
      .from('souls')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data as Soul;
  }

  // ... more methods
}
```

## Layer 4: Presentation (`presentation/`)

**Responsibility**: React components, routes, pages, UI logic.

**Key principle**: Orchestrates Application layer; uses Zustand for state.

### Structure

```
presentation/
├── pages/                 # Full-screen page components
│   ├── LoginPage.tsx
│   ├── SignupPage.tsx
│   └── RecommendationsPage.tsx
│
├── components/            # Feature-specific components
│   ├── ActivityEvaluationDialog.tsx
│   ├── BreakthroughJournal.tsx
│   ├── CrisisAlertPanel.tsx
│   ├── EncouragementPanel.tsx
│   ├── RelationshipTimeline.tsx
│   ├── ReproductionReadinessPanel.tsx
│   ├── SoulTemperaturePanel.tsx
│   ├── SpiritualPrescriptionPanel.tsx
│   └── ThisWeekActivityPanel.tsx
│
├── hooks/                 # Custom React hooks
│   └── useAuth.ts
│
├── providers/             # React context providers
│   └── AuthProvider.tsx
│
├── routes/                # Route definitions
│   └── index.tsx         # AppRouter component
│
├── layouts/               # Layout components
│   └── (layout wrappers)
│
├── examples/              # Component usage examples
│   └── (demo components)
│
└── types/                 # Presentation-specific types
    └── (presentation types)
```

### What Goes Here

- **Pages**: Full-screen components (LoginPage, SignupPage)
- **Components**: Feature-specific UI components
- **Hooks**: Custom React hooks (useAuth, custom hooks)
- **Providers**: React context providers (AuthProvider)
- **Routes**: Route definitions (AppRouter)
- **Layouts**: Common layout wrappers
- **Types**: Presentation-specific types (not domain/application types)

### What Does NOT Go Here

- Business logic (that's domain/application)
- Database access (that's infrastructure)
- Complex algorithms (that's domain)

### Example Page Component

```typescript
// presentation/pages/LoginPage.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password too short'),
});

export function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });
  const { signIn } = useAuthStore();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    const result = await signIn(data);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      {/* more form fields */}
      <button type="submit">Sign In</button>
    </form>
  );
}
```

## State Management (`store/`)

**All global state uses Zustand** - lightweight, TypeScript-first state management.

### Files

```
store/
├── soulStore.ts           # Soul/disciplee state
├── progressStore.ts       # Progress tracking state
├── activityPlanStore.ts   # Activity plan state
├── pastoralCareStore.ts   # Pastoral care state
├── gridStore.ts           # Legacy grid state (deprecated)
└── index.ts              # Barrel export
```

### Store Pattern

```typescript
// store/soulStore.ts
import { create } from 'zustand';
import type { Soul } from '@/domain/entities';
import { useSoulRepository } from '@/infrastructure/repositories';

interface SoulStore {
  souls: Soul[];
  isLoading: boolean;
  error: string | null;

  fetchSouls: (userId: string) => Promise<void>;
  addSoul: (soul: Soul) => void;
  removeSoul: (id: string) => void;
}

export const useSoulStore = create<SoulStore>((set) => ({
  souls: [],
  isLoading: false,
  error: null,

  fetchSouls: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const repository = useSoulRepository();
      const souls = await repository.listByTrainer(userId);
      set({ souls });
    } catch (error) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  addSoul: (soul) => set((state) => ({
    souls: [...state.souls, soul],
  })),

  removeSoul: (id) => set((state) => ({
    souls: state.souls.filter(s => s.id !== id),
  })),
}));
```

## Shared Components (`components/ui/`)

**Radix UI wrapper components** with Tailwind styling.

```
components/
├── ui/
│   ├── button.tsx
│   ├── input.tsx
│   ├── dialog.tsx
│   ├── card.tsx
│   ├── tabs.tsx
│   ├── form.tsx
│   └── ... (30+ components)
└── index.ts
```

These are unstyled Radix UI components wrapped with Tailwind CSS classes for consistent styling across the app.

## Type Definitions (`types/`)

```
types/
├── index.ts              # Global types
└── supabase.ts           # Supabase auto-generated types
```

## Utilities (`lib/`, `utils/`)

Helper functions and utility code.

```
lib/
├── (utility libraries)

utils/
├── (utility functions)
```

## Entry Points

- **`main.tsx`**: React app entry point (ReactDOM.createRoot)
- **`App.tsx`**: Root component (AuthProvider + AppRouter)

## For AI Agents Working in src/

### Dependency Direction (CRITICAL)

```
Components → Stores → Use Cases → Domain
Components → Infrastructure → Use Cases → Domain
                Infrastructure → Application → Domain
                                Domain → (nothing)
```

**NEVER reverse this direction.**

### Checklist for Adding a Feature

1. **Domain layer** - Define entity in `domain/entities/`
2. **Application layer** - Define port in `application/ports/`
3. **Infrastructure layer** - Implement repository in `infrastructure/repositories/supabase/`
4. **Application layer** - Create use case in `application/use-cases/`
5. **Store** - Create Zustand store in `store/`
6. **Presentation** - Create component in `presentation/components/`
7. **Routes** - Add route in `presentation/routes/`
8. **Test** - Add tests for each layer

### Import Patterns

Always use `@/` alias (never relative imports):

```typescript
// CORRECT
import type { Soul } from '@/domain/entities';
import { useSoulStore } from '@/store';
import { SoulRepository } from '@/infrastructure/repositories';

// WRONG
import type { Soul } from '../../../domain/entities';
import { useSoulStore } from '../store';
```

### Type Safety Rules

- No `any` types
- All functions have return types
- All parameters have types
- Use `readonly` for immutable properties
- Use discriminated unions for variants

## Notes

- Each layer has a single responsibility
- No circular dependencies allowed
- Domain layer is framework-agnostic
- Application layer defines contracts
- Infrastructure implements contracts
- Presentation uses stores for state
- All global state uses Zustand
- TypeScript strict mode enabled
