<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-05 | Updated: 2026-02-05 -->

# hooks - Custom React Hooks (Legacy)

## Purpose
Legacy custom React hooks directory. Being gradually migrated to presentation/hooks/ as part of Clean Architecture refactoring.

## Key Files
Currently minimal or empty.

## Subdirectories
None

## For AI Agents

### Working In This Directory
1. **Migration in progress**: New hooks should go in presentation/hooks/
2. **Don't expand this directory**: Add new hooks to presentation/hooks/ instead
3. **Use for legacy compatibility**: Keep existing hooks during migration
4. **Update imports gradually**: Change from @/hooks to @/presentation/hooks
5. **Follow React hooks rules**: All hooks must follow React's Rules of Hooks

### Testing Requirements
- Test with @testing-library/react-hooks
- Test all hook states and transitions
- Test cleanup functions
- Test error scenarios

### Common Patterns
```typescript
// Data fetching hook
export function useSoul(soulId: string) {
  const [soul, setSoul] = useState<Soul | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSoul = async () => {
      try {
        setLoading(true);
        const useCase = new GetSoulUseCase(new SoulRepository());
        const result = await useCase.execute(soulId);
        setSoul(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchSoul();
  }, [soulId]);

  return { soul, loading, error };
}

// Form hook
export function useForm<T>(initialValues: T) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const handleChange = (field: keyof T, value: T[keyof T]) => {
    setValues(prev => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    // Validation logic
  };

  return { values, errors, handleChange, validate };
}
```

### Migration Strategy
1. **Identify hooks in use**: Find all imports from @/hooks
2. **Copy to presentation/hooks/**: Move files with same structure
3. **Update imports**: Change @/hooks to @/presentation/hooks
4. **Test thoroughly**: Ensure no breaking changes
5. **Remove legacy directory**: Once migration complete

## Dependencies

### Internal
- Hooks → Store (Zustand, being migrated to use cases)
- Hooks → Infrastructure (direct calls, should use application layer)
- Being replaced by: presentation/hooks/

### External
- **React**: For hooks API (useState, useEffect, etc.)
- **Zustand**: For store access (being phased out)

## Hook Categories (Future in presentation/hooks/)

### Data Hooks
- useSoul(id) - Fetch single soul
- useSouls() - Fetch all souls
- useProgress(soulId) - Fetch progress data
- useActivityPlans(soulId) - Fetch activity plans

### Auth Hooks
- useAuth() - Current user and auth state
- usePermissions() - User permissions check
- useProtectedRoute() - Route protection

### Form Hooks
- useForm(initialValues) - Form state management
- useFormValidation(schema) - Form validation
- useFieldArray(name) - Dynamic form fields

### UI Hooks
- useDisclosure() - Open/close state for modals
- useToast() - Toast notifications
- useDebounce(value, delay) - Debounced values
- useMediaQuery(query) - Responsive breakpoints

### Utility Hooks
- useLocalStorage(key) - Persist state to localStorage
- usePrevious(value) - Previous value tracking
- useInterval(callback, delay) - Interval timer
- useEventListener(event, handler) - Event subscription

<!-- MANUAL: -->
