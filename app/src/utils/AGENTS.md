<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-05 | Updated: 2026-02-05 -->

# utils - Utility Functions

## Purpose
General utility functions and helper methods. Currently minimal, can be expanded with domain-agnostic utilities.

## Key Files
Currently empty or minimal files.

## Subdirectories
None

## For AI Agents

### Working In This Directory
1. **Pure functions only**: No side effects, no state
2. **Domain-agnostic**: Business logic goes in domain/services/
3. **Well-tested**: Every utility needs unit tests
4. **TypeScript strict**: Proper typing, no any types
5. **Document clearly**: JSDoc for all exported functions

### Testing Requirements
- Unit tests for all functions
- Test edge cases (null, undefined, empty arrays, etc.)
- Test error handling
- 100% code coverage recommended

### Common Patterns
```typescript
// Date utilities
export function formatDate(date: Date, format: string): string {
  // Implementation
}

export function parseDate(dateString: string): Date {
  // Implementation
}

// String utilities
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

// Array utilities
export function groupBy<T, K extends keyof T>(
  array: T[],
  key: K
): Record<string, T[]> {
  return array.reduce((acc, item) => {
    const group = String(item[key]);
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

// Type guards
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export function isNonEmpty<T>(arr: T[]): arr is [T, ...T[]] {
  return arr.length > 0;
}

// Object utilities
export function pick<T, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  return keys.reduce((acc, key) => {
    acc[key] = obj[key];
    return acc;
  }, {} as Pick<T, K>);
}
```

### Utility Categories to Add

#### Date/Time
- formatDate, parseDate, addDays, addWeeks, diffDays
- getWeekNumber, getWeeksInRange
- isWeekend, isToday

#### String Manipulation
- capitalize, titleCase, camelCase, kebabCase
- truncate, ellipsis
- stripHtml, sanitize

#### Array Operations
- groupBy, partition, chunk
- unique, uniqueBy
- sortBy, orderBy
- flatten, flattenDeep

#### Object Operations
- pick, omit, deepClone
- merge, mergeDeep
- mapKeys, mapValues

#### Validation
- isValidEmail, isValidUrl
- isValidDate, isValidPhoneNumber
- isEmpty, isNonEmpty

#### Number/Math
- clamp, round, randomInt
- percentage, average, sum

## Dependencies

### Internal
- None (pure utilities)

### External
- Potentially add: date-fns, lodash (if needed)

## vs. lib/utils.ts

### Difference
- **lib/utils.ts**: UI-specific utilities (className merging, etc.)
- **utils/**: General-purpose utilities (dates, strings, arrays, etc.)

### When to use which?
- **lib/**: UI/styling related
- **utils/**: Data manipulation, formatting, validation

<!-- MANUAL: -->
