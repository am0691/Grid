<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-05 | Updated: 2026-02-05 -->

# lib - Utility Libraries

## Purpose
Utility functions and helper libraries. Currently contains minimal utilities for UI styling.

## Key Files
| File | Description |
|------|-------------|
| utils.ts | Utility functions (currently only cn() for className merging) |

## Subdirectories
None

## For AI Agents

### Working In This Directory
1. **Add pure utilities**: Functions with no side effects, framework-agnostic
2. **Keep it simple**: Small, focused utilities
3. **TypeScript friendly**: Proper typing for all functions
4. **No business logic**: Domain logic goes in domain/services/
5. **Document usage**: Add JSDoc comments for complex utilities

### Testing Requirements
- Unit tests for all utilities
- Test edge cases and error handling
- 100% coverage for pure functions

### Common Patterns
```typescript
// Utility function
export function formatDate(date: Date | string): string {
  // Implementation
}

// Type-safe helper
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

// Composition helper
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Utility Categories to Add

#### Date/Time Utilities
```typescript
// Format dates for display
export function formatDate(date: Date): string;
export function formatDateTime(date: Date): string;
export function getWeekNumber(date: Date): number;
export function addWeeks(date: Date, weeks: number): Date;
```

#### String Utilities
```typescript
// String manipulation
export function capitalize(str: string): string;
export function truncate(str: string, length: number): string;
export function slugify(str: string): string;
```

#### Array Utilities
```typescript
// Array helpers
export function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]>;
export function unique<T>(arr: T[]): T[];
export function sortBy<T>(arr: T[], key: keyof T): T[];
```

#### Validation Utilities
```typescript
// Input validation
export function isValidEmail(email: string): boolean;
export function isValidDate(date: string): boolean;
export function isValidUrl(url: string): boolean;
```

## Dependencies

### Internal
- None (pure utilities)

### External
- **clsx**: Conditional className construction
- **tailwind-merge**: Merge Tailwind CSS classes intelligently

## Current Utilities

### cn() - ClassName Helper
```typescript
import { cn } from '@/lib/utils';

// Merge classes with conflict resolution
<div className={cn(
  'base-class',
  isActive && 'active-class',
  className
)} />
```

**Purpose**: Combines `clsx` for conditional classes with `tailwind-merge` to handle Tailwind class conflicts (e.g., `p-4` overrides `p-2`).

**Usage:**
- Base styles + conditional styles
- Component className prop overrides
- Tailwind utility class merging

<!-- MANUAL: -->
