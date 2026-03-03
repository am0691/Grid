<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-05 | Updated: 2026-02-05 -->

# app/src/infrastructure/ - Infrastructure Layer (Implementations)

## Purpose

The Infrastructure layer implements the contracts (ports/interfaces) defined in the Application layer. It handles all external concerns: databases, APIs, authentication services, file processing, etc.

## Structure

```
infrastructure/
├── database/              # Database schema and utilities
│   ├── schema.ts         # Database schema definitions
│   ├── queries.example.ts # Example query patterns
│   ├── index.ts
│   └── (migrations config)
│
├── repositories/          # Data access implementations
│   ├── soul.repository.ts           # Repository interface (abstract)
│   ├── activity-plan.repository.ts  # Repository interface (abstract)
│   ├── progress.repository.ts       # Repository interface (abstract)
│   ├── user.repository.ts           # Repository interface (abstract)
│   │
│   ├── supabase/                    # Supabase implementations
│   │   ├── soul-repository.ts       # Implements ISoulRepository
│   │   ├── activity-plan-repository.ts
│   │   ├── progress-repository.ts
│   │   ├── user-repository.ts
│   │   └── index.ts
│   │
│   └── index.ts
│
├── services/              # External service implementations
│   ├── auth/
│   │   ├── auth-service.ts   # Supabase auth implementation
│   │   ├── types.ts          # Auth-specific types
│   │   └── index.ts
│   │
│   ├── supabase/
│   │   ├── client.ts         # Supabase client initialization
│   │   └── index.ts
│   │
│   ├── pdf/
│   │   ├── pdf-parser.service.ts  # PDF processing (pdfjs-dist)
│   │   ├── index.ts
│   │   └── README.md          # PDF service documentation
│   │
│   └── index.ts
│
└── index.ts              # Barrel export
```

## Repositories

Repositories implement the Repository Pattern for data access. Each repository implements its corresponding interface from Application layer.

### Repository Interface Pattern

Abstract interface (in same file or application layer):
```typescript
// infrastructure/repositories/soul.repository.ts
export interface ISoulRepository {
  create(soul: CreateSoulDto & { userId: string }): Promise<Soul>;
  getById(id: string): Promise<Soul | null>;
  update(id: string, soul: UpdateSoulDto): Promise<Soul>;
  delete(id: string): Promise<void>;
  listByTrainer(trainerId: string): Promise<Soul[]>;
}
```

### Concrete Implementation (Supabase)

```typescript
// infrastructure/repositories/supabase/soul-repository.ts
import { supabase } from '../supabase/client';
import type { ISoulRepository } from '../soul.repository';
import type { Soul, CreateSoulDto, UpdateSoulDto } from '@/domain/entities';

export class SoulRepository implements ISoulRepository {
  async create(soul: CreateSoulDto & { userId: string }): Promise<Soul> {
    const { data, error } = await supabase
      .from('souls')
      .insert([soul])
      .select()
      .single();

    if (error) throw new RepositoryError(error.message);
    return data as Soul;
  }

  async getById(id: string): Promise<Soul | null> {
    const { data, error } = await supabase
      .from('souls')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new RepositoryError(error.message);
    }

    return data ? (data as Soul) : null;
  }

  async update(id: string, soul: UpdateSoulDto): Promise<Soul> {
    const { data, error } = await supabase
      .from('souls')
      .update(soul)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new RepositoryError(error.message);
    return data as Soul;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('souls')
      .delete()
      .eq('id', id);

    if (error) throw new RepositoryError(error.message);
  }

  async listByTrainer(trainerId: string): Promise<Soul[]> {
    const { data, error } = await supabase
      .from('souls')
      .select('*')
      .eq('user_id', trainerId);

    if (error) throw new RepositoryError(error.message);
    return data as Soul[];
  }
}
```

### Key Patterns

1. **Error handling** - Convert database errors to application errors
2. **Type mapping** - Map database rows to domain entities
3. **Query optimization** - Use efficient queries, select only needed fields
4. **Null handling** - Return null for not found, throw for errors
5. **Transactions** - Group related operations in transactions when needed

## Services

Services implement interfaces defined in Application layer ports.

### AuthService (Supabase Auth)

```typescript
// infrastructure/services/auth/auth-service.ts
import { supabase } from '../supabase/client';
import type { AuthResult, SignUpData, SignInData } from './types';

export const signUpWithEmail = async (data: SignUpData): Promise<AuthResult> => {
  try {
    const { email, password, fullName } = data;

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (authError) {
      return {
        success: false,
        error: {
          code: authError.name || 'SIGNUP_ERROR',
          message: authError.message,
        },
      };
    }

    return {
      success: true,
      data: {
        user: authData.user!,
        session: authData.session,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: { code: 'UNKNOWN_ERROR', message: String(error) },
    };
  }
};
```

### PdfParserService

Implements `IPdfParserService` from Application ports using pdfjs-dist.

```typescript
// infrastructure/services/pdf/pdf-parser.service.ts
import * as pdfjsLib from 'pdfjs-dist';
import type { IPdfParserService, PdfMetadata } from '@/application/ports/services';

export class PdfParserService implements IPdfParserService {
  constructor() {
    // Configure worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.js',
      import.meta.url,
    ).toString();
  }

  async extractText(file: File): Promise<string> {
    const pdf = await pdfjsLib.getDocument(await file.arrayBuffer()).promise;
    let text = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: any) => item.str).join(' ');
      text += pageText + '\n\n';
    }

    return text;
  }

  async extractMetadata(file: File): Promise<PdfMetadata> {
    const pdf = await pdfjsLib.getDocument(await file.arrayBuffer()).promise;
    const metadata = await pdf.getMetadata();

    return {
      title: metadata.info?.Title,
      author: metadata.info?.Author,
      pageCount: pdf.numPages,
    };
  }
}
```

## Database Schema

```typescript
// infrastructure/database/schema.ts
export interface DatabaseSchema {
  users: {
    id: string;
    email: string;
    full_name: string;
    role: 'trainer' | 'admin';
    created_at: string;
    updated_at: string;
  };

  souls: {
    id: string;
    user_id: string;
    name: string;
    email?: string;
    birth_date?: string;
    created_at: string;
    updated_at: string;
  };

  progress: {
    id: string;
    soul_id: string;
    area_id: string;
    week: number;
    status: 'not_started' | 'in_progress' | 'completed';
    notes?: string;
    created_at: string;
    updated_at: string;
  };

  // ... other tables
}
```

## Supabase Client Configuration

```typescript
// infrastructure/services/supabase/client.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

## For AI Agents

### Working in Infrastructure Layer

1. **Implement ports** - Create classes that implement Application interfaces
2. **Handle errors** - Convert external errors to application errors
3. **Map data** - Transform database rows to domain entities
4. **Optimize queries** - Use efficient Supabase queries
5. **Avoid circular dependencies** - Don't import from Presentation layer

### Adding a New Repository

1. Create abstract interface: `repositories/my-entity.repository.ts`
2. Create implementation: `repositories/supabase/my-entity-repository.ts`
3. Implement all interface methods
4. Export from `index.ts`

```typescript
// Step 1: Interface
export interface IMyEntityRepository {
  create(entity: CreateMyEntityDto): Promise<MyEntity>;
  getById(id: string): Promise<MyEntity | null>;
  // ... other methods
}

// Step 2: Implementation
export class MyEntityRepository implements IMyEntityRepository {
  async create(entity: CreateMyEntityDto): Promise<MyEntity> {
    const { data, error } = await supabase
      .from('my_entities')
      .insert([entity])
      .select()
      .single();

    if (error) throw new RepositoryError(error.message);
    return data as MyEntity;
  }
  // ... other methods
}
```

### Adding a New Service

1. Create interface: `application/ports/services.ts`
2. Create implementation: `infrastructure/services/my-service.ts`
3. Export from services `index.ts`

```typescript
// application/ports/services.ts
export interface IMyService {
  doSomething(input: Input): Promise<Output>;
}

// infrastructure/services/my-service.ts
export class MyService implements IMyService {
  async doSomething(input: Input): Promise<Output> {
    // Implementation
  }
}
```

### Error Handling Pattern

```typescript
export class RepositoryError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'RepositoryError';
  }
}

// Usage
try {
  const data = await supabase.from('table').select();
  if (error) throw new RepositoryError(error.message, error.code);
} catch (error) {
  if (error instanceof RepositoryError) {
    // Handle repository-specific error
  } else {
    // Handle unexpected error
  }
}
```

### Testing Infrastructure Layer

Infrastructure tests are integration tests with test database:

```typescript
// infrastructure/repositories/supabase/__tests__/soul-repository.test.ts
import { SoulRepository } from '../soul-repository';
import { supabase } from '../../supabase/client';

describe('SoulRepository', () => {
  const repository = new SoulRepository();

  it('should create and retrieve a soul', async () => {
    const soul = await repository.create({
      userId: 'test-user',
      name: 'Test Soul',
    });

    const retrieved = await repository.getById(soul.id);
    expect(retrieved?.name).toBe('Test Soul');

    // Cleanup
    await repository.delete(soul.id);
  });
});
```

## Rules (CRITICAL)

1. **Implement ports** - Every class implements an Application interface
2. **Error handling** - Convert external errors to application errors
3. **Data mapping** - Transform database/API responses to domain entities
4. **No business logic** - Business logic stays in Domain/Application
5. **Query optimization** - Use efficient queries, avoid N+1
6. **Dependency injection** - Accept dependencies in constructor
7. **Transaction handling** - Use transactions for multi-step operations
8. **Configuration** - Use environment variables for external endpoints

## Repository Implementation Checklist

- [ ] Implements interface from Application layer
- [ ] All methods async/await
- [ ] Error handling for each operation
- [ ] Type-safe query results
- [ ] Null vs error distinction
- [ ] Proper field selection (not SELECT *)
- [ ] Indexes on frequently queried fields
- [ ] Exported from `index.ts`
- [ ] Integration tests included

## Service Implementation Checklist

- [ ] Implements interface from Application ports
- [ ] Error handling for external failures
- [ ] Proper initialization (client setup, config)
- [ ] No side effects outside service scope
- [ ] Dependency injection in constructor
- [ ] Type-safe responses
- [ ] Exported from `services/index.ts`
- [ ] Unit/integration tests included

## Notes

- Infrastructure is the "dirty" layer - handles messy details
- All external communication happens here
- Database, APIs, file systems live here
- Domain and Application layers don't know about infrastructure
- Easy to swap implementations (Supabase → Firebase, etc.)
- Configuration and secrets managed here
