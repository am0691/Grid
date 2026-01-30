# Activity Plan UI Components

A comprehensive set of React components for managing activity plans in the GRID discipleship training system.

## Components

### 1. AddActivityPlanDialog

Modal dialog for creating new personal activity plans.

**Features:**
- Area selection with color-coded visual indicators
- Week/month selection based on training type
- Form validation using Zod
- Loading states during submission
- Accessible form controls

**Props:**
- `soul: Soul` - The soul (trainee) for whom the activity is being created
- `open: boolean` - Dialog open state
- `onOpenChange: (open: boolean) => void` - Callback for dialog state changes
- `onSubmit: (data) => Promise<void>` - Form submission handler
- `defaultAreaId?: Area` - Pre-selected area
- `defaultWeek?: number` - Pre-selected week

**Usage:**
```tsx
<AddActivityPlanDialog
  soul={soul}
  open={showDialog}
  onOpenChange={setShowDialog}
  onSubmit={handleCreatePlan}
  defaultAreaId="salvation"
  defaultWeek={3}
/>
```

---

### 2. ActivityPlanCard

Display component for individual activity plans.

**Features:**
- Visual distinction between recommended and personal activities
- Completion checkbox with status tracking
- Area-specific color coding
- Hover-based action menu for edit/delete
- Compact and full display modes
- Accessibility support (ARIA labels, keyboard navigation)

**Props:**
- `plan: ActivityPlan` - The activity plan to display
- `soul: Soul` - Related soul information
- `isRecommended?: boolean` - Whether this is a recommended activity
- `recommendation?: ActivityRecommendation` - Full recommendation data
- `onToggleComplete?: (planId) => void` - Toggle completion handler
- `onEdit?: (plan) => void` - Edit handler
- `onDelete?: (planId) => void` - Delete handler
- `compact?: boolean` - Use compact display mode

**Design:**
- Recommended activities: Gradient background with dashed border
- Personal activities: Solid border, clean background
- Completed activities: Reduced opacity, strike-through text

---

### 3. ActivityPlanPanel

Comprehensive panel for managing all activity plans for a soul.

**Features:**
- Tab-based filtering (All, Recommended, Personal, Completed, Incomplete)
- Additional filters: Week/month, Area
- Statistics display (total, completed, recommended counts)
- Recommended activities section with "add to plan" CTA
- Personal activities section with full CRUD
- Empty states with contextual messages
- Scrollable content area

**Props:**
- `soul: Soul` - The soul whose activities are being managed
- `plans: ActivityPlan[]` - Array of personal activity plans
- `recommendations: ActivityRecommendation[]` - Array of recommended activities
- `selectedWeek?: number` - Pre-filter to specific week
- `selectedAreaId?: Area` - Pre-filter to specific area
- `onCreatePlan: (data) => Promise<void>` - Create plan handler
- `onUpdatePlan?: (planId, data) => Promise<void>` - Update plan handler
- `onDeletePlan?: (planId) => Promise<void>` - Delete plan handler
- `onToggleComplete?: (planId) => void` - Toggle completion handler

---

### 4. WeeklyActivityView

Week-focused view showing all activities grouped by area.

**Features:**
- Area-based grouping with color-coded headers
- Separate sections for recommended and personal activities
- Statistics per area (activity counts)
- Compact activity cards
- Scrollable content
- Empty state for weeks without activities

**Props:**
- `soul: Soul` - The soul information
- `week: number` - The week to display
- `plans: ActivityPlan[]` - All activity plans (filtered internally)
- `recommendations: ActivityRecommendation[]` - All recommendations (filtered internally)
- `onToggleComplete?: (planId) => void` - Toggle completion handler
- `onEditPlan?: (plan) => void` - Edit handler
- `onDeletePlan?: (planId) => Promise<void>` - Delete handler

---

## Integration with GridView

The activity plan components are integrated into the existing GridView:

1. **Tab Navigation**: Switch between "그리드" (grid) and "활동 계획" (activities) views
2. **Cell Hover**: Hovering over grid cells reveals an activity icon for quick access
3. **Context Passing**: Selected week/area from grid is passed to activity views
4. **Seamless UX**: Maintains soul context throughout navigation

---

## Design System

### Color Coding

Activities inherit the color system from area definitions:

**Convert Areas:**
- Salvation (구원의 확신): Green (#16a34a)
- Word (말씀): Blue (#2563eb)
- Fellowship (교제): Yellow (#ca8a04)
- Sin (죄에서 떠남): Purple (#9333ea)
- Notes (참고사항): Gray (#6b7280)

**Disciple Areas:**
- Memorization (암송): Red (#dc2626)
- Bible Study (성경공부): Orange (#ea580c)
- Salvation (구원의 확신): Green (#16a34a)
- Devotion (경건의 시간): Cyan (#0891b2)
- Word (말씀): Blue (#2563eb)
- Prayer (기도): Violet (#7c3aed)
- Fellowship (교제): Yellow (#ca8a04)
- Witness (증거): Pink (#db2777)
- Lordship (주재권): Indigo (#4f46e5)
- Vision (세계비전): Emerald (#059669)
- Discipleship (양육): Amber (#b45309)
- Character (성품): Rose (#be185d)
- Notes (참고사항): Gray (#6b7280)
- Events (전체행사): Slate (#475569)

### Visual Hierarchy

1. **Recommended Activities**: Soft gradient backgrounds with dashed borders
2. **Personal Activities**: Solid borders with clean backgrounds
3. **Completed Activities**: Reduced opacity (75%) with strike-through text
4. **Active Elements**: Smooth transitions (300ms) on hover states

### Typography

- **Card Titles**: 18px (lg), semi-bold
- **Compact Titles**: 14px (sm), medium weight
- **Descriptions**: 14px (sm), muted foreground
- **Meta Text**: 12px (xs), uppercase tracking for labels

### Spacing

- Card padding: 24px (p-6)
- Element gaps: 12px - 24px (gap-3 to gap-6)
- Compact mode padding: 12px (p-3)

---

## Accessibility

All components follow WCAG 2.1 AA guidelines:

- **Keyboard Navigation**: Full support for tab, enter, escape keys
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **Focus Management**: Visible focus indicators with ring styles
- **Color Contrast**: Text meets minimum contrast ratios
- **Form Validation**: Error messages announced to screen readers

---

## State Management

Activity plan state should be managed using:

1. **Local Component State**: For UI-only state (open dialogs, filters)
2. **Zustand Store** (recommended): For global activity plan state
3. **Use Cases**: For data persistence and business logic

Example state structure:

```typescript
interface ActivityPlanStore {
  plans: ActivityPlan[];
  loading: boolean;
  error: string | null;

  fetchPlans: (soulId: string) => Promise<void>;
  createPlan: (plan: CreateActivityPlanDto) => Promise<void>;
  updatePlan: (planId: string, data: UpdateActivityPlanDto) => Promise<void>;
  deletePlan: (planId: string) => Promise<void>;
  toggleComplete: (planId: string) => void;
}
```

---

## API Integration

Connect components to backend using use cases:

```typescript
import { CreateActivityPlanUseCase } from '@/application/use-cases/activity-plans';
import { activityPlanRepository } from '@/infrastructure/repositories';

const createActivityPlanUseCase = new CreateActivityPlanUseCase(activityPlanRepository);

const handleCreatePlan = async (data: any) => {
  const plan = await createActivityPlanUseCase.execute({
    soulId: soul.id,
    title: data.title,
    type: 'meeting',
    scheduledAt: new Date().toISOString(),
    areaId: data.areaId,
    week: data.week,
    description: data.description,
  });

  // Update local state
  setPlans([...plans, plan]);
};
```

---

## Testing

Component testing with React Testing Library:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ActivityPlanCard } from './ActivityPlanCard';

test('toggles completion status', () => {
  const mockToggle = jest.fn();
  render(
    <ActivityPlanCard
      plan={mockPlan}
      soul={mockSoul}
      onToggleComplete={mockToggle}
    />
  );

  const checkbox = screen.getByRole('checkbox');
  fireEvent.click(checkbox);

  expect(mockToggle).toHaveBeenCalledWith(mockPlan.id);
});
```

---

## Performance Considerations

- **Virtualization**: Consider react-window for large activity lists
- **Memoization**: Use React.memo for ActivityPlanCard
- **Debouncing**: Debounce search/filter inputs
- **Lazy Loading**: Load recommendations on-demand

---

## Future Enhancements

1. **Drag & Drop**: Reorder activities within week
2. **Recurring Activities**: Template-based recurring plans
3. **Notifications**: Reminders for upcoming activities
4. **Attachments**: Add files/images to activities
5. **Notes**: Rich text editor for detailed notes
6. **Calendar View**: Full calendar integration
7. **Activity History**: Timeline view of past activities
8. **Analytics**: Activity completion rates and trends

---

## File Structure

```
/src/presentation/
├── components/
│   ├── ActivityPlanCard.tsx           # Individual card component
│   ├── ActivityPlanPanel.tsx          # Main management panel
│   ├── AddActivityPlanDialog.tsx      # Creation dialog
│   ├── WeeklyActivityView.tsx         # Week-focused view
│   ├── ActivityRecommendation.tsx     # Recommendation display
│   ├── ActivityPlanComponents.example.tsx  # Usage examples
│   ├── ActivityPlans.README.md        # This file
│   └── index.ts                       # Barrel export
├── types/
│   └── activity-plan-ui.ts            # UI-specific types
└── hooks/
    └── useActivityPlans.ts             # (Future) React Query hooks
```

---

## Dependencies

- `react-hook-form`: Form state management
- `zod`: Form validation schemas
- `@radix-ui/*`: Accessible UI primitives
- `lucide-react`: Icon library
- `tailwindcss`: Styling
- `class-variance-authority`: Component variants

---

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile Safari/Chrome: Latest 2 versions

---

## License

Part of the GRID discipleship training system.
