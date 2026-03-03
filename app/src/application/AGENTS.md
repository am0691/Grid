<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-05 | Updated: 2026-02-05 -->

# app/src/application/ - Application Layer (Use Cases & Ports)

## Purpose

The Application layer contains use cases and defines contracts (ports/interfaces) that the Infrastructure layer implements. It orchestrates domain logic and bridges between business rules and external implementations.

## Structure

```
application/
├── ports/                 # Interface contracts (what infrastructure must implement)
│   ├── index.ts
│   └── services.ts       # Service interfaces (IPdfParserService, etc.)
│
├── services/              # Application-level business services
│   ├── recommendation-service.ts      # Recommendation algorithm
│   ├── trend-recommendation-service.ts # Trend analysis
│   └── index.ts
│
├── use-cases/             # Use case implementations (business workflows)
│   ├── auth/
│   │   ├── index.ts
│   │   ├── sign-up.ts
│   │   ├── sign-in.ts
│   │   └── (other auth use cases)
│   ├── souls/
│   │   ├── index.ts
│   │   ├── create-soul.ts
│   │   ├── update-soul.ts
│   │   ├── list-souls.ts
│   │   └── (other soul use cases)
│   ├── activity-plans/
│   │   ├── index.ts
│   │   └── (activity plan use cases)
│   ├── progress/
│   │   ├── index.ts
│   │   └── (progress tracking use cases)
│   └── index.ts
│
└── index.ts              # Barrel export
```

## Ports (Interfaces)

Ports define contracts that Infrastructure implementations must satisfy. Never import concrete implementations here.

### Repository Ports

Defined elsewhere in `application/ports/repositories.ts` (or implicit in use cases):

```typescript
export interface ISoulRepository {
  create(soul: CreateSoulDto & { userId: string }): Promise<Soul>;
  getById(id: string): Promise<Soul | null>;
  update(id: string, soul: UpdateSoulDto): Promise<Soul>;
  delete(id: string): Promise<void>;
  listByTrainer(trainerId: string): Promise<Soul[]>;
}
```

### Service Ports

Defined in `application/ports/services.ts`:

```typescript
export interface IPdfParserService {
  extractText(file: File): Promise<string>;
  extractMetadata(file: File): Promise<PdfMetadata>;
}

export interface PdfMetadata {
  title?: string;
  author?: string;
  pageCount: number;
  creationDate?: Date;
  modificationDate?: Date;
}
```

## Use Cases

Use cases represent business workflows. Each use case has a single responsibility.

### Use Case Structure

```typescript
// application/use-cases/souls/create-soul.ts
import type { Soul, CreateSoulDto } from '@/domain/entities';
import type { ISoulRepository } from '@/application/ports';

export class CreateSoulUseCase {
  constructor(private soulRepository: ISoulRepository) {}

  async execute(dto: CreateSoulDto, userId: string): Promise<Soul> {
    // Business logic: validate, transform, delegate to repository
    const soul = await this.soulRepository.create({
      ...dto,
      userId,
    });
    
    return soul;
  }
}
```

### Key Characteristics

1. **Single Responsibility** - One workflow per use case
2. **Dependency Injection** - Dependencies passed to constructor
3. **Pure Logic** - No side effects except repository calls
4. **Async/Await** - All external operations are async
5. **Error Handling** - Proper exception handling
6. **Testability** - Easy to test with mock repositories

## Application Services

Services that coordinate across multiple entities or provide cross-cutting business logic.

### RecommendationService

Generates personalized recommendations based on soul state, progress, and patterns.

```typescript
// application/services/recommendation-service.ts
export class RecommendationService {
  constructor(private soulRepository: ISoulRepository) {}

  async generateRecommendations(soulId: string): Promise<Recommendation[]> {
    const soul = await this.soulRepository.getById(soulId);
    // Algorithm to generate recommendations
    return recommendations;
  }
}
```

### TrendRecommendationService

Analyzes trends in progress and provides trend-based recommendations.

```typescript
export class TrendRecommendationService {
  analyze(progressHistory: Progress[]): TrendAnalysis {
    // Trend analysis logic
    return analysis;
  }
}
```

## For AI Agents

### Working in Application Layer

1. **Define contracts first** - Create port interfaces before implementations
2. **Inject dependencies** - Never instantiate repositories/services directly
3. **Keep logic pure** - Use cases should be testable without external calls
4. **Use DTOs** - Data transfer objects for API boundaries
5. **Handle errors** - Implement consistent error handling
6. **No framework imports** - No React, no Supabase (only abstract ports)

### Adding a New Use Case

1. Create directory: `application/use-cases/feature-name/`
2. Create file: `application/use-cases/feature-name/operation-name.ts`
3. Define the use case class
4. Export from `index.ts`

```typescript
// Step 1: Define port (in ports/index.ts or implicit)
export interface IMyRepository {
  fetch(id: string): Promise<MyEntity>;
}

// Step 2: Create use case
export class FetchMyEntityUseCase {
  constructor(private myRepository: IMyRepository) {}

  async execute(id: string): Promise<MyEntity> {
    return this.myRepository.fetch(id);
  }
}

// Step 3: Export
export { FetchMyEntityUseCase };
```

### Adding a Port

1. Add interface to `application/ports/services.ts`
2. Ensure interface is generic (not implementation-specific)
3. Include clear documentation

```typescript
// application/ports/services.ts
/**
 * Service for analyzing data
 */
export interface IMyService {
  /**
   * Analyze the given data
   * @param data - Data to analyze
   * @returns Analysis result
   */
  analyze(data: MyData): Promise<AnalysisResult>;
}
```

### Testing Use Cases

Use cases are tested with mock repositories:

```typescript
// application/use-cases/souls/__tests__/create-soul.test.ts
import { CreateSoulUseCase } from '../create-soul';
import type { ISoulRepository } from '@/application/ports';

const mockRepository: ISoulRepository = {
  create: jest.fn(),
  getById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  listByTrainer: jest.fn(),
};

describe('CreateSoulUseCase', () => {
  it('should create a soul with the given data', async () => {
    const useCase = new CreateSoulUseCase(mockRepository);
    const dto = { name: 'John', email: 'john@example.com' };
    
    mockRepository.create.mockResolvedValue({ id: '1', ...dto });
    
    const result = await useCase.execute(dto, 'trainer-id');
    
    expect(mockRepository.create).toHaveBeenCalledWith({
      ...dto,
      userId: 'trainer-id',
    });
    expect(result.id).toBe('1');
  });
});
```

## Rules (CRITICAL)

1. **No concrete implementations** - Only use interfaces (ports)
2. **No framework imports** - No React, no Supabase
3. **Dependency injection** - All dependencies passed to constructor
4. **Pure logic** - Side effects only through repositories
5. **Error handling** - Proper exception handling and validation
6. **No circular dependencies** - Clean dependency graph
7. **DTOs for boundaries** - Transform between layers with DTOs
8. **Async patterns** - Proper async/await, promise handling

## Use Case Checklist

- [ ] Single responsibility (one workflow)
- [ ] Constructor takes all dependencies
- [ ] Execute method is public entry point
- [ ] Error handling implemented
- [ ] Uses ports (interfaces), not concrete implementations
- [ ] Testable with mock repositories
- [ ] Proper type annotations
- [ ] Exported from layer's `index.ts`
- [ ] JSDoc comments for public methods

## Port Interface Checklist

- [ ] Named with `I` prefix (ISoulRepository, IPdfParserService)
- [ ] All methods documented with JSDoc
- [ ] Return types are clear
- [ ] Error conditions documented
- [ ] Generic enough for multiple implementations
- [ ] Exported from `ports/index.ts`

## Notes

- Use cases orchestrate domain services and repositories
- Services handle cross-cutting concerns
- Ports define contracts, never implementations
- This layer is the core of business logic
- Should be testable without external dependencies
- Good place for business validation and transformation
