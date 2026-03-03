<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-05 | Updated: 2026-02-05 -->

# app/src/presentation/ - Presentation Layer (React UI)

## Purpose

The Presentation layer contains all React-specific code: pages, components, hooks, routing, and UI logic. This layer consumes Zustand stores and Application services to build the user interface.

## Structure

```
presentation/
├── pages/                 # Full-page components (route targets)
│   ├── LoginPage.tsx
│   ├── SignupPage.tsx
│   └── RecommendationsPage.tsx
│
├── components/            # Feature-specific components
│   ├── ActivityEvaluationDialog.tsx   # Activity evaluation form
│   ├── BreakthroughJournal.tsx        # Breakthrough tracking
│   ├── CrisisAlertPanel.tsx           # Crisis alerts
│   ├── EncouragementPanel.tsx         # Encouragement display
│   ├── RelationshipTimeline.tsx       # Relationship history
│   ├── ReproductionReadinessPanel.tsx # Readiness assessment
│   ├── SoulTemperaturePanel.tsx       # Spiritual temperature
│   ├── SpiritualPrescriptionPanel.tsx # Prescription display
│   └── ThisWeekActivityPanel.tsx      # Weekly overview
│
├── hooks/                 # Custom React hooks
│   └── useAuth.ts         # Authentication state hook
│
├── providers/             # React context providers
│   └── AuthProvider.tsx   # Authentication context setup
│
├── routes/                # Route definitions
│   └── index.tsx         # AppRouter component
│
├── layouts/               # Common layout components
│   └── (shared layouts)
│
├── examples/              # Component usage examples
│   └── (demo components)
│
└── types/                 # Presentation-specific types
    └── (UI-specific types)
```

## Pages

Full-screen components that map to routes.

### LoginPage

User authentication entry point.

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
    } else {
      // Show error
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit(onSubmit)}>
        <input {...register('email')} placeholder="Email" />
        {errors.email && <span>{errors.email.message}</span>}
        {/* More fields */}
        <button type="submit">Sign In</button>
      </form>
    </div>
  );
}
```

### SignupPage

User registration page.

### RecommendationsPage

Display personalized recommendations.

## Components

Feature-specific, reusable components.

### Component Pattern

```typescript
// presentation/components/MyComponent.tsx
import { useState, useCallback } from 'react';
import type { MyEntity } from '@/domain/entities';
import { useMyStore } from '@/store';
import { Button } from '@/components/ui/button';

interface MyComponentProps {
  entityId: string;
  onSuccess?: () => void;
}

export function MyComponent({ entityId, onSuccess }: MyComponentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { fetchEntity, updateEntity } = useMyStore();
  const [entity, setEntity] = useState<MyEntity | null>(null);

  const handleUpdate = useCallback(async (data) => {
    setIsLoading(true);
    try {
      await updateEntity(entityId, data);
      onSuccess?.();
    } catch (error) {
      // Handle error
    } finally {
      setIsLoading(false);
    }
  }, [entityId, updateEntity, onSuccess]);

  return (
    <div className="component">
      {/* JSX */}
      <Button onClick={handleUpdate} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Update'}
      </Button>
    </div>
  );
}
```

### Key Principles

1. **Single Responsibility** - Each component does one thing
2. **Prop-based Configuration** - Accept configuration via props
3. **Callback Props** - Accept callbacks for events
4. **Store Integration** - Use Zustand stores for global state
5. **Form Handling** - Use react-hook-form for all forms
6. **Type-safe Props** - Define interface for all props
7. **Accessibility** - Use Radix UI for a11y
8. **Error States** - Handle loading, error, and success states

## Hooks

Custom React hooks for reusable logic.

### useAuth Hook

```typescript
// presentation/hooks/useAuth.ts
import { useContext } from 'react';
import { AuthContext } from '../providers/AuthProvider';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### Hook Pattern

```typescript
export function useMyFeature() {
  const { data, isLoading, error } = useMyStore();

  const handleAction = useCallback(async () => {
    // Implementation
  }, [dependencies]);

  return {
    data,
    isLoading,
    error,
    handleAction,
  };
}
```

## Providers

React context providers for shared state and functionality.

### AuthProvider

```typescript
// presentation/providers/AuthProvider.tsx
import { createContext, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/infrastructure/services/supabase/client';

export const AuthContext = createContext<{ session: Session | null }>({
  session: null,
});

export function AuthProvider({ children }) {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
      },
    );

    return () => subscription?.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session }}>
      {children}
    </AuthContext.Provider>
  );
}
```

## Routes

Route definitions and navigation structure.

### AppRouter

```typescript
// presentation/routes/index.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoginPage } from '../pages/LoginPage';
import { SignupPage } from '../pages/SignupPage';
import { DashboardPage } from '../pages/DashboardPage';

export function AppRouter() {
  const { session } = useAuth();

  return (
    <Router>
      <Routes>
        {!session ? (
          <>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        ) : (
          <>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </>
        )}
      </Routes>
    </Router>
  );
}
```

## For AI Agents

### Working in Presentation Layer

1. **Use Zustand stores** - All global state via stores, not React Context
2. **Use Radix UI** - Build on accessible base components
3. **Form validation** - Always use react-hook-form + Zod
4. **Type props** - Define interface for all component props
5. **Error handling** - Show errors to users gracefully
6. **Loading states** - Show loading UI while fetching
7. **Accessibility** - Use semantic HTML, ARIA when needed
8. **Mobile responsive** - Use Tailwind responsive utilities

### Creating a New Page

1. Create file: `presentation/pages/MyPage.tsx`
2. Use hooks to manage state
3. Call store actions for data
4. Render components
5. Add route in `presentation/routes/index.tsx`

```typescript
// presentation/pages/MyPage.tsx
import { useEffect } from 'react';
import { useMyStore } from '@/store';
import { MyComponent } from '../components/MyComponent';

export function MyPage() {
  const { data, isLoading, fetch } = useMyStore();

  useEffect(() => {
    fetch();
  }, [fetch]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="page">
      <h1>My Page</h1>
      <MyComponent data={data} />
    </div>
  );
}
```

### Creating a New Component

1. Create file: `presentation/components/MyComponent.tsx`
2. Accept props via interface
3. Use hooks for state
4. Call store actions
5. Render UI with Radix components
6. Export component

```typescript
// presentation/components/MyComponent.tsx
import { useCallback } from 'react';
import type { MyEntity } from '@/domain/entities';
import { useMyStore } from '@/store';
import { Button } from '@/components/ui/button';

interface MyComponentProps {
  entity: MyEntity;
  onUpdate?: (entity: MyEntity) => void;
}

export function MyComponent({ entity, onUpdate }: MyComponentProps) {
  const { update } = useMyStore();

  const handleClick = useCallback(async () => {
    const updated = await update(entity.id, { /* changes */ });
    onUpdate?.(updated);
  }, [entity.id, update, onUpdate]);

  return (
    <div>
      <h2>{entity.name}</h2>
      <Button onClick={handleClick}>Update</Button>
    </div>
  );
}
```

### Form Pattern (All Forms)

Always use react-hook-form + Zod:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Name required'),
  email: z.string().email('Invalid email'),
});

export function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    // Submit form
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}
      {/* More fields */}
      <button type="submit">Submit</button>
    </form>
  );
}
```

### Styling Pattern (Tailwind + Radix)

```typescript
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export function MyComponent() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">Title</h1>
      <p className="text-gray-600">Description</p>
      <Button className="w-full">Click me</Button>
      
      <Dialog>
        <DialogContent>Dialog content</DialogContent>
      </Dialog>
    </div>
  );
}
```

## Component Checklist

- [ ] Single responsibility
- [ ] Props typed with interface
- [ ] Uses Zustand stores (not Context)
- [ ] Form validation with Zod
- [ ] Error state handled
- [ ] Loading state shown
- [ ] Accessible (Radix UI components)
- [ ] Mobile responsive
- [ ] JSDoc comments
- [ ] Callback props for events
- [ ] No direct API calls (use store)

## Page Checklist

- [ ] Fetches data in useEffect
- [ ] Uses appropriate hooks
- [ ] Shows loading/error states
- [ ] Responsive layout
- [ ] Accessible navigation
- [ ] SEO metadata (title, etc.)
- [ ] Proper error boundaries
- [ ] Clean up effects

## Rules (CRITICAL)

1. **No business logic** - Use stores/services
2. **No direct API calls** - Call store actions instead
3. **Zustand for global state** - Not React Context
4. **Radix UI base components** - For accessibility
5. **Tailwind for styling** - Utility-first CSS
6. **react-hook-form for all forms** - Consistent form handling
7. **Type all props** - No implicit any
8. **Callback pattern for events** - Props for communication
9. **No circular imports** - Clean dependency graph
10. **Accessibility first** - WCAG compliance

## Notes

- Presentation layer is thin - orchestrates store/services
- Business logic belongs in Application layer
- Database access in Infrastructure layer
- Keep components small and focused
- Reuse Radix UI base components
- Use Tailwind for consistent styling
- Forms always use react-hook-form + Zod
- Loading and error states are mandatory
