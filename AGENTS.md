<!-- Generated: 2026-02-05 | Updated: 2026-02-05 -->

# GRID - 영역별 독립 진도 양육 관리 시스템

## Purpose

GRID is a digital discipleship training management system for churches. It replaces paper-based GRID forms by enabling digital tracking of spiritual growth across independent progress areas per soul. The system supports two discipleship programs:

- **CONVERT**: 13-week foundational discipleship program with 5 core areas
- **DISCIPLE**: 12-month advanced discipleship program with 14 growth areas

Philosophy: Individualization (각 영혼의 속도 존중), balanced structure and flexibility (체계성과 유연성), relationship-centered (관계 중심), and data as a pastoral tool (목회적 활용).

**Key Differential Feature**: Independent progress tracking per area allows each soul to progress at their own pace in each discipline area, not locked to a single "week" or "month" number.

## Project Structure

```
Grid/
├── app/                          # Main React + TypeScript application
│   ├── src/
│   │   ├── domain/              # Domain layer (entities, value objects, services)
│   │   ├── application/         # Application layer (use cases, services, ports)
│   │   ├── infrastructure/      # Infrastructure layer (repositories, services, database)
│   │   ├── presentation/        # Presentation layer (pages, components, hooks, providers)
│   │   ├── store/              # Zustand state management
│   │   ├── components/         # Reusable UI components (using Radix UI)
│   │   ├── lib/                # Utilities and helpers
│   │   ├── types/              # TypeScript type definitions
│   │   └── utils/              # Utility functions
│   ├── vite.config.ts          # Vite bundler configuration
│   ├── tsconfig.json           # TypeScript configuration
│   └── package.json            # Node dependencies
├── supabase/                    # Backend configuration and database
│   ├── migrations/             # Database migration scripts
│   ├── SCHEMA_DIAGRAM.md       # Database schema documentation
│   └── quick_setup.sql         # Quick database setup script
├── PRD.md                       # Complete product requirements document (Korean)
├── PRD-Vision-Philosophy.md     # Vision and philosophy details
├── PRD_사용자경험.md            # User experience requirements
├── PRD_핵심기능.md              # Core features specification
├── DATABASE_SETUP.md            # Database setup instructions
└── IMPLEMENTATION_SUMMARY.md    # Recent implementation notes

```

## Clean Architecture Layers

The codebase follows **Clean Architecture** principles with four distinct layers:

### 1. Domain Layer (`app/src/domain/`)
**Responsibility**: Business logic and domain rules (framework-agnostic)

**Key Components**:
- `entities/`: Core business entities
  - `soul.ts` - Individual being discipled
  - `activity-plan.ts` - Training activities and evaluations
  - `progress.ts` - Progress tracking per area
  - `user.ts` - Trainer/pastor user
  - `spiritual-state.ts` - Soul's spiritual state assessment
  - `spiritual-prescription.ts` - Personalized spiritual recommendations
  - `encouragement.ts` - Encouragement records
  - `breakthrough.ts` - Spiritual breakthrough moments
  - `crisis-alert.ts` - Crisis detection alerts
  - `relationship-timeline.ts` - Relationship history
  - `reproduction-readiness.ts` - Readiness to disciple others

- `value-objects/`: Immutable business concepts
  - `area.ts` - Discipleship area types

- `services/`: Domain-level business logic
  - `crisis-detection.service.ts` - Crisis pattern recognition
  - `encouragement.service.ts` - Encouragement generation logic

- `data/`: Lookup data and recommendations
  - `recommendations/` - Recommendation engine data

### 2. Application Layer (`app/src/application/`)
**Responsibility**: Use cases and application-specific logic

**Key Components**:
- `ports/`: Interfaces (contracts for repositories/services)
  - `services.ts` - Service interfaces (IPdfParserService, etc.)
  - Repository interfaces

- `use-cases/`: Application workflows
  - `auth/` - Authentication workflows
  - `souls/` - Soul management use cases
  - `activity-plans/` - Activity planning use cases
  - `progress/` - Progress tracking use cases

- `services/`: Application-level services
  - `recommendation-service.ts` - Recommendation logic
  - `trend-recommendation-service.ts` - Trend-based recommendations

### 3. Infrastructure Layer (`app/src/infrastructure/`)
**Responsibility**: External service implementations (database, auth, APIs)

**Key Components**:
- `database/`
  - `schema.ts` - Database schema definitions
  - `queries.example.ts` - Example database queries

- `repositories/`
  - `supabase/` - Supabase-specific implementations
    - `soul-repository.ts`
    - `progress-repository.ts`
    - `activity-plan-repository.ts`
  - Abstract repository interfaces (non-database specific)

- `services/`
  - `auth/` - Supabase authentication service
    - `auth-service.ts` - Auth implementation
    - `types.ts` - Auth types
  - `supabase/` - Supabase client configuration
  - `pdf/` - PDF parsing service (pdfjs-dist)

### 4. Presentation Layer (`app/src/presentation/`)
**Responsibility**: UI, routes, and user interaction

**Key Components**:
- `pages/` - Page components (full screen views)
  - `LoginPage.tsx`
  - `SignupPage.tsx`
  - `RecommendationsPage.tsx`

- `components/` - Feature-specific components
  - `ActivityEvaluationDialog.tsx`
  - `BreakthroughJournal.tsx`
  - `CrisisAlertPanel.tsx`
  - `EncouragementPanel.tsx`
  - `RelationshipTimeline.tsx`
  - `ReproductionReadinessPanel.tsx`
  - `SoulTemperaturePanel.tsx`
  - `SpiritualPrescriptionPanel.tsx`
  - `ThisWeekActivityPanel.tsx`

- `hooks/` - React hooks
  - `useAuth.ts` - Authentication hook

- `providers/` - React context providers
  - `AuthProvider.tsx` - Auth context setup

- `routes/` - Route definitions and AppRouter component

- `layouts/` - Common layout components

## State Management

**Technology**: Zustand (lightweight state management)

**Stores** (`app/src/store/`):
- `soulStore.ts` - Soul (disciplee) state
- `progressStore.ts` - Progress tracking state
- `activityPlanStore.ts` - Activity plan state
- `pastoralCareStore.ts` - Pastoral care tracking state
- `gridStore.ts` - Legacy grid state (deprecated)

All stores use Zustand for reactive, TypeScript-safe state without boilerplate.

## Key Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19 + TypeScript | UI framework with type safety |
| **Build** | Vite | Fast bundling and development server |
| **Routing** | React Router DOM v7 | SPA routing |
| **UI Components** | Radix UI | Accessible, unstyled component library |
| **Styling** | Tailwind CSS | Utility-first CSS framework |
| **Forms** | react-hook-form + Zod | Type-safe form validation |
| **State** | Zustand | Lightweight state management |
| **Backend** | Supabase | PostgreSQL + Auth + Real-time |
| **Charts** | recharts | Data visualization |
| **PDF** | pdfjs-dist | PDF parsing and text extraction |
| **Notifications** | sonner | Toast notifications |
| **Theme** | next-themes | Dark/light mode support |

## Database Schema (Supabase PostgreSQL)

**Core Tables**:
- `users` - Trainers/pastors
- `souls` - Disciplees being trained
- `progress` - Per-soul, per-area progress tracking
- `activity_plans` - Planned activities and meetings
- `souls_relationships` - Trainer-trainee relationships
- `recommendations` - Personalized recommendations
- `spiritual_prescriptions` - Customized spiritual guidance

See `/Users/seo/dev/Grid/supabase/SCHEMA_DIAGRAM.md` for complete schema.

## For AI Agents

### Working in This Repository

1. **Architecture Understanding**
   - Always respect the four-layer Clean Architecture
   - Domain layer is framework-agnostic (no React, no Supabase imports)
   - Application layer defines contracts (interfaces), Infrastructure implements them
   - Presentation layer is framework-aware (React, routing, UI)

2. **Code Organization**
   - Entities go in `domain/entities/`
   - Use cases go in `application/use-cases/`
   - Implementations go in `infrastructure/`
   - React components go in `presentation/`
   - Zustand stores go in `store/`

3. **Type Safety**
   - Always use TypeScript types and interfaces
   - Define DTOs for data transfer between layers
   - Use discriminated unions for variants (e.g., `ActivityType`, `ActivityStatus`)

4. **Dependency Injection Pattern**
   - Infrastructure services implement Application port interfaces
   - Do NOT directly import infrastructure implementations in domain layer
   - Use dependency inversion: domain defines interfaces, infra implements

5. **Naming Conventions**
   - Entities: PascalCase (`Soul`, `ActivityPlan`, `Progress`)
   - Services: PascalCase with `Service` suffix (`SoulService`, `AuthService`)
   - Store hooks: camelCase with `use` prefix (`useSoulStore`, `useProgressStore`)
   - Repository interfaces: `I{Entity}Repository` (e.g., `ISoulRepository`)

### Testing Requirements

1. **Unit Tests**
   - Test domain services in isolation
   - Test use case logic without infrastructure
   - Mock repositories and external services
   - Focus on business logic correctness

2. **Integration Tests**
   - Test repository implementations with test database
   - Test end-to-end use case workflows
   - Verify data transformations between layers

3. **Component Tests**
   - Test React components with React Testing Library
   - Mock Zustand stores for presentation layer tests
   - Test user interactions and form submissions

4. **Commands to Know**
   ```bash
   npm run dev          # Start dev server (port 5173)
   npm run build        # Production build
   npm run lint         # ESLint check
   npm run preview      # Preview production build locally
   tsc -b              # Type check (runs before build)
   ```

### Common Patterns

#### 1. Adding a New Feature (Entity + Use Cases + Components)

**Step 1: Domain Layer**
```typescript
// app/src/domain/entities/my-feature.ts
export interface MyFeature {
  id: string;
  soulId: string;
  // domain properties
}
```

**Step 2: Application Layer (Port)**
```typescript
// app/src/application/ports/repositories.ts
export interface IMyFeatureRepository {
  create(data: CreateMyFeatureDto): Promise<MyFeature>;
  getById(id: string): Promise<MyFeature | null>;
  update(id: string, data: UpdateMyFeatureDto): Promise<MyFeature>;
}
```

**Step 3: Infrastructure Layer (Implementation)**
```typescript
// app/src/infrastructure/repositories/supabase/my-feature-repository.ts
import { supabase } from '../supabase/client';
import type { IMyFeatureRepository } from '../../../application/ports';

export class MyFeatureRepository implements IMyFeatureRepository {
  async create(data: CreateMyFeatureDto): Promise<MyFeature> {
    const { data: result, error } = await supabase
      .from('my_features')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return result;
  }
  // ... more methods
}
```

**Step 4: Application Layer (Use Case)**
```typescript
// app/src/application/use-cases/my-features/create-my-feature.ts
export class CreateMyFeatureUseCase {
  constructor(private myFeatureRepository: IMyFeatureRepository) {}

  async execute(dto: CreateMyFeatureDto): Promise<MyFeature> {
    return this.myFeatureRepository.create(dto);
  }
}
```

**Step 5: Presentation Layer**
```typescript
// app/src/presentation/components/MyFeatureForm.tsx
import { useCallback } from 'react';
import { useMyFeatureStore } from '@/store';

export function MyFeatureForm() {
  const { createFeature } = useMyFeatureStore();

  const handleSubmit = useCallback(async (data) => {
    await createFeature(data);
  }, [createFeature]);

  return (
    // React component
  );
}
```

#### 2. Zustand Store Pattern

```typescript
// app/src/store/myStore.ts
import { create } from 'zustand';
import type { MyEntity } from '@/domain/entities';

interface MyStore {
  // State
  items: MyEntity[];
  isLoading: boolean;

  // Actions
  fetchItems: () => Promise<void>;
  addItem: (item: MyEntity) => void;
  removeItem: (id: string) => void;
}

export const useMyStore = create<MyStore>((set) => ({
  items: [],
  isLoading: false,

  fetchItems: async () => {
    set({ isLoading: true });
    try {
      // fetch logic
      set({ items: data });
    } finally {
      set({ isLoading: false });
    }
  },

  addItem: (item) => set((state) => ({
    items: [...state.items, item],
  })),

  removeItem: (id) => set((state) => ({
    items: state.items.filter(item => item.id !== id),
  })),
}));
```

#### 3. Form Validation with react-hook-form + Zod

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
});

type FormData = z.infer<typeof schema>;

export function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}
    </form>
  );
}
```

#### 4. Repository Pattern

```typescript
// Abstract interface in application layer
export interface ISoulRepository {
  create(soul: CreateSoulDto): Promise<Soul>;
  getById(id: string): Promise<Soul | null>;
  update(id: string, soul: UpdateSoulDto): Promise<Soul>;
  delete(id: string): Promise<void>;
  listByTrainer(trainerId: string): Promise<Soul[]>;
}

// Implementation in infrastructure
export class SoulRepository implements ISoulRepository {
  async create(soul: CreateSoulDto): Promise<Soul> {
    const { data, error } = await supabase
      .from('souls')
      .insert([soul])
      .select()
      .single();

    if (error) throw new RepositoryError(error.message);
    return data;
  }
  // ... rest of implementation
}
```

### Key Files by Purpose

| Purpose | Files |
|---------|-------|
| **Authentication** | `/app/src/infrastructure/services/auth/auth-service.ts`, `/app/src/presentation/providers/AuthProvider.tsx` |
| **Soul Management** | `/app/src/domain/entities/soul.ts`, `/app/src/infrastructure/repositories/supabase/soul-repository.ts`, `/app/src/store/soulStore.ts` |
| **Progress Tracking** | `/app/src/domain/entities/progress.ts`, `/app/src/infrastructure/repositories/supabase/progress-repository.ts`, `/app/src/store/progressStore.ts` |
| **Activity Planning** | `/app/src/domain/entities/activity-plan.ts`, `/app/src/infrastructure/repositories/supabase/activity-plan-repository.ts`, `/app/src/store/activityPlanStore.ts` |
| **Recommendations** | `/app/src/application/services/recommendation-service.ts`, `/app/src/application/services/trend-recommendation-service.ts` |
| **Styling** | `tailwind.config.js`, `/app/src/components/ui/` (Radix UI wrapper components) |
| **Routing** | `/app/src/presentation/routes/`, `/app/src/App.tsx` |
| **Type Definitions** | `/app/src/types/index.ts`, `/app/src/types/supabase.ts` |

### Critical Conventions

1. **Always preserve the four-layer architecture** - Do not create circular dependencies between layers
2. **Type everything** - No `any` types; use proper TypeScript interfaces
3. **Error handling** - Implement try-catch in repositories, return `AuthResult` or custom error types from services
4. **Async operations** - Use async/await consistently; handle promises properly
5. **Supabase imports** - Only import Supabase in infrastructure layer, never in domain
6. **React imports** - Only in presentation layer; keep domain and application framework-agnostic

## Dependencies

### Key Production Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^19.2.0 | UI framework |
| `typescript` | ~5.9.3 | Type safety |
| `vite` | ^7.2.4 | Build tool |
| `react-router-dom` | ^7.13.0 | SPA routing |
| `@supabase/supabase-js` | ^2.93.3 | Backend SDK |
| `zustand` | ^5.0.10 | State management |
| `react-hook-form` | ^7.70.0 | Form handling |
| `zod` | ^4.3.5 | Schema validation |
| `tailwindcss` | ^3.4.19 | Styling |
| `@radix-ui/*` | Various | Accessible components |
| `recharts` | ^2.15.4 | Charts/visualization |
| `pdfjs-dist` | ^5.4.624 | PDF parsing |
| `sonner` | ^2.0.7 | Notifications |
| `next-themes` | ^0.4.6 | Theme switching |

### Development Dependencies

- `typescript-eslint` - Linting
- `@vitejs/plugin-react` - React plugin for Vite
- `tailwindcss` & `autoprefixer` - CSS processing
- `@types/*` - Type definitions

### Supabase Setup

- PostgreSQL database (cloud-hosted)
- Row-level security (RLS) policies
- Real-time subscriptions available
- Authentication via Supabase Auth

See `/Users/seo/dev/Grid/supabase/quick_setup.sql` for database initialization.

## Documentation References

- **PRD (Product Requirements)**: `/Users/seo/dev/Grid/PRD.md` (Korean)
- **Vision & Philosophy**: `/Users/seo/dev/Grid/PRD-Vision-Philosophy.md`
- **Database Schema**: `/Users/seo/dev/Grid/supabase/SCHEMA_DIAGRAM.md`
- **Implementation Notes**: `/Users/seo/dev/Grid/IMPLEMENTATION_SUMMARY.md`
- **Setup Instructions**: `/Users/seo/dev/Grid/DATABASE_SETUP.md`

## Git Information

- **Repository**: Git-based with commits
- **Recent commits**:
  - `d6f58f6` - Add Netlify build configuration
  - `39c6fcc` - Initial commit: Grid church management app

<!-- MANUAL: Add custom notes about the project below -->

## Project Notes

### Core Value Propositions

1. **Independent Area Progress** - Each soul progresses independently in each discipline area, not locked to a single week/month
2. **Pastoral Data Tool** - Data serves pastoral care, not performance evaluation
3. **Flexible Structure** - Systematic curriculum without rigid sequencing
4. **Relationship-Centered** - Technology supports human relationships, doesn't replace them

### Known Architectural Decisions

- **Clean Architecture with 4 layers** ensures testability and maintainability
- **Zustand over Redux** for lightweight, TypeScript-native state management
- **Supabase over custom backend** for rapid development and real-time capabilities
- **Radix UI over styled-from-scratch** for accessible components
- **Zod over runtime validation** for compile-time type safety

### Future Considerations

- OCR support for scanned GRID forms
- Batch import from spreadsheets
- Advanced analytics and trend analysis
- Mobile app (React Native)
- Multi-language support
- Offline-first capabilities with sync
