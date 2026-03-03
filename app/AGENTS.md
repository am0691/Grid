<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-05 | Updated: 2026-02-05 -->

# app/ - GRID React Application

## Purpose

The `app/` directory contains the complete React + TypeScript frontend application for GRID. This is a Vite-based SPA that implements Clean Architecture principles with four distinct layers: Domain, Application, Infrastructure, and Presentation.

## Directory Structure

```
app/
├── src/
│   ├── domain/                 # Domain layer (framework-agnostic business logic)
│   │   ├── entities/          # Core domain entities
│   │   ├── value-objects/     # Immutable business concepts
│   │   ├── services/          # Domain-level business services
│   │   └── data/              # Lookup data and constants
│   │
│   ├── application/           # Application layer (use cases and ports)
│   │   ├── ports/            # Interface contracts for repositories/services
│   │   ├── services/         # Application-level services
│   │   └── use-cases/        # Business use case implementations
│   │
│   ├── infrastructure/        # Infrastructure layer (external service implementations)
│   │   ├── database/         # Database schema and query examples
│   │   ├── repositories/     # Data access implementations
│   │   └── services/         # External service implementations (Auth, PDF, etc.)
│   │
│   ├── presentation/          # Presentation layer (React-specific)
│   │   ├── pages/           # Full-page components
│   │   ├── components/      # Feature-specific components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── providers/       # React context providers
│   │   ├── routes/          # Route definitions
│   │   ├── layouts/         # Layout components
│   │   ├── examples/        # Component usage examples
│   │   └── types/           # Presentation layer types
│   │
│   ├── store/                 # Zustand state management (global client state)
│   ├── components/            # Shared UI components
│   │   └── ui/              # Radix UI component wrappers
│   ├── lib/                   # Utility libraries
│   ├── types/                 # Global TypeScript type definitions
│   ├── utils/                 # Utility functions
│   ├── App.tsx               # Root component
│   └── main.tsx              # Entry point
│
├── index.html                # HTML template
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript configuration
├── eslint.config.js          # ESLint configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── postcss.config.js         # PostCSS configuration
└── package.json              # Dependencies and scripts

```

## Key Files by Layer

### Domain Layer (`src/domain/`)

| File | Purpose |
|------|---------|
| `entities/soul.ts` | Individual being discipled |
| `entities/activity-plan.ts` | Training activities and evaluations |
| `entities/progress.ts` | Progress tracking per area per soul |
| `entities/user.ts` | Trainer/pastor user |
| `entities/spiritual-state.ts` | Soul's spiritual state assessment |
| `entities/spiritual-prescription.ts` | Personalized spiritual guidance |
| `entities/encouragement.ts` | Encouragement records and messages |
| `entities/breakthrough.ts` | Spiritual breakthrough moments |
| `entities/crisis-alert.ts` | Crisis detection and alerts |
| `entities/relationship-timeline.ts` | Trainer-soul relationship history |
| `entities/reproduction-readiness.ts` | Readiness to disciple others assessment |
| `value-objects/area.ts` | Discipleship area types (CONVERT/DISCIPLE areas) |
| `services/crisis-detection.service.ts` | Crisis pattern recognition logic |
| `services/encouragement.service.ts` | Encouragement generation logic |
| `data/recommendations/` | Recommendation engine lookup data |

### Application Layer (`src/application/`)

| File | Purpose |
|------|---------|
| `ports/services.ts` | Service interface contracts (e.g., IPdfParserService) |
| `services/recommendation-service.ts` | Recommendation algorithm implementation |
| `services/trend-recommendation-service.ts` | Trend-based recommendation logic |
| `use-cases/auth/` | Authentication workflows |
| `use-cases/souls/` | Soul management workflows |
| `use-cases/activity-plans/` | Activity planning workflows |
| `use-cases/progress/` | Progress tracking workflows |

### Infrastructure Layer (`src/infrastructure/`)

| File | Purpose |
|------|---------|
| `database/schema.ts` | Database schema and type definitions |
| `repositories/soul.repository.ts` | Soul data access interface |
| `repositories/activity-plan.repository.ts` | Activity plan data access interface |
| `repositories/progress.repository.ts` | Progress data access interface |
| `repositories/supabase/*-repository.ts` | Supabase implementations |
| `services/auth/auth-service.ts` | Supabase authentication service |
| `services/pdf/pdf-parser.service.ts` | PDF text/metadata extraction |

### Presentation Layer (`src/presentation/`)

| File | Purpose |
|------|---------|
| `pages/LoginPage.tsx` | User login page |
| `pages/SignupPage.tsx` | User registration page |
| `pages/RecommendationsPage.tsx` | Recommendations display page |
| `components/*.tsx` | Feature-specific components (Activity, Breakthrough, Crisis, etc.) |
| `hooks/useAuth.ts` | Authentication state hook |
| `providers/AuthProvider.tsx` | Auth context and session management |
| `routes/index.tsx` | Route definitions and AppRouter |

### State Management (`src/store/`)

| File | Purpose |
|------|---------|
| `soulStore.ts` | Soul/disciplee state and actions |
| `progressStore.ts` | Progress tracking state |
| `activityPlanStore.ts` | Activity plan state |
| `pastoralCareStore.ts` | Pastoral care data state |

## For AI Agents

### Working in the app/ Directory

1. **Understand the architecture first**
   - Read `/Users/seo/dev/Grid/AGENTS.md` for full architecture overview
   - Know the four layers and their boundaries
   - Domain layer has NO framework imports

2. **File location decisions**
   - **New entity** → `src/domain/entities/your-entity.ts`
   - **New use case** → `src/application/use-cases/feature-name/`
   - **New repository** → `src/infrastructure/repositories/supabase/`
   - **New page** → `src/presentation/pages/YourPage.tsx`
   - **New component** → `src/presentation/components/YourComponent.tsx`
   - **Zustand store** → `src/store/yourStore.ts`

3. **Dependency flow (never reverse)**
   ```
   Presentation → Store → Application → Domain
   Presentation → Infrastructure → Application → Domain
   Infrastructure → Application → Domain
   Domain → (nothing)
   ```

4. **Critical rules**
   - No circular dependencies between layers
   - No Supabase imports in domain/application
   - No React imports in domain/application
   - All entities immutable
   - Type everything (no `any` types)
   - Consistent error handling
   - Store naming: `use{Feature}Store`
   - Use `@/` alias for all imports

### Testing Requirements

```bash
npm run dev          # Start dev server (port 5173)
npm run build        # Production build
npm run lint         # Code quality check
npm run preview      # Preview production build
tsc -b              # Type checking
```

### Common Patterns

**Adding a new feature:**
1. Define entity in `domain/entities/`
2. Define repository interface in `application/ports/`
3. Implement repository in `infrastructure/repositories/supabase/`
4. Create use case in `application/use-cases/`
5. Create Zustand store in `store/`
6. Create React component in `presentation/components/`
7. Create page if needed in `presentation/pages/`
8. Add route in `presentation/routes/`

**Form handling pattern** (react-hook-form + Zod):
```typescript
const schema = z.object({
  name: z.string().min(1, 'Required'),
});

export function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  return <form onSubmit={handleSubmit(onSubmit)}>{/* ... */}</form>;
}
```

**Zustand store pattern**:
```typescript
export const useMyStore = create<MyStore>((set) => ({
  items: [],
  addItem: (item) => set((state) => ({
    items: [...state.items, item],
  })),
}));
```

### File Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Entity | PascalCase | `Soul.ts` |
| Service | PascalCase + Service | `SoulService.ts` |
| Repository | PascalCase + Repository | `SoulRepository.ts` |
| Component | PascalCase | `SoulCard.tsx` |
| Hook | use + PascalCase | `useAuth.ts` |
| Store | camelCase + Store | `soulStore.ts` |
| Use case | kebab-case | `create-soul.ts` |

## Dependencies

**Key packages**:
- `react` ^19.2.0 - UI framework
- `typescript` ~5.9.3 - Type safety
- `vite` ^7.2.4 - Build tool
- `react-router-dom` ^7.13.0 - Routing
- `zustand` ^5.0.10 - State management
- `@supabase/supabase-js` ^2.93.3 - Backend
- `react-hook-form` ^7.70.0 - Forms
- `zod` ^4.3.5 - Validation
- `tailwindcss` ^3.4.19 - Styling
- `@radix-ui/*` - Components
- `recharts` ^2.15.4 - Charts
- `pdfjs-dist` ^5.4.624 - PDF parsing

## Build & Deployment

```bash
npm run dev          # Development with hot reload
npm run build        # Production build to dist/
npm run preview      # Preview production build locally
npm run lint         # Check code quality
```

## Notes

- All state uses Zustand (lightweight, TypeScript-first)
- Radix UI provides accessible base components
- Tailwind CSS for all styling
- Clean Architecture layers strictly maintained
- No framework imports in domain/application
- Supabase client in `infrastructure/services/supabase/client.ts`
