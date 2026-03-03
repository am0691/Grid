<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-05 | Updated: 2026-02-05 -->

# components - Shared Component Library (Legacy)

## Purpose
Shared UI components library. This is a legacy directory being gradually migrated to presentation/components/. Contains core dashboard components and shadcn/ui component library.

## Key Files
| File | Description |
|------|-------------|
| Dashboard.tsx | Main dashboard layout component |
| GridView.tsx | Grid-based soul overview with progress tracking |
| AddSoulDialog.tsx | Modal dialog for adding new souls |
| SoulCard.tsx | Card component displaying soul information |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| ui/ | shadcn/ui component library (button, dialog, card, etc.) |

## For AI Agents

### Working In This Directory
1. **Migration in progress**: New components should go in presentation/components/
2. **Use ui/ components**: Leverage shadcn/ui primitives (Button, Dialog, Card, etc.)
3. **Follow shadcn patterns**: Match existing component structure and styling
4. **Keep components pure**: Props in, JSX out - minimal logic
5. **Zustand integration**: These components currently use Zustand stores

### Testing Requirements
- Component tests for user interactions
- Visual regression tests recommended
- Accessibility testing for ui/ components
- Integration tests for complex components like GridView

### Common Patterns
```typescript
// Using shadcn/ui components
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';

export function MyComponent() {
  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>Title</DialogHeader>
        <Button>Action</Button>
      </DialogContent>
    </Dialog>
  );
}

// Using Zustand store
import { useSoulStore } from '@/store';

export function SoulList() {
  const { souls, fetchSouls } = useSoulStore();

  useEffect(() => {
    fetchSouls();
  }, []);

  return <div>{souls.map(renderSoul)}</div>;
}
```

### Migration Strategy
1. **Leave ui/ alone**: shadcn/ui components stay here
2. **Move domain components**: Dashboard, GridView → presentation/components/
3. **Update imports**: Change @/components to @/presentation/components
4. **Refactor to use cases**: Replace Zustand with use case hooks
5. **Keep backward compatibility**: During transition period

## Dependencies

### Internal
- Components → Store (Zustand, being migrated out)
- Components → Types (legacy types/, being migrated to domain/)

### External
- **React 18+**: Component framework
- **shadcn/ui**: UI component primitives
- **Tailwind CSS**: Styling utilities
- **Lucide React**: Icon library
- **Radix UI**: Headless UI primitives (used by shadcn)
- **Zustand**: State management (being phased out)

## shadcn/ui Components (ui/)

### Form Components
- **Button**: Interactive buttons with variants
- **Input**: Text input fields
- **Textarea**: Multi-line text input
- **Select**: Dropdown selection
- **Checkbox**: Boolean selection
- **RadioGroup**: Single selection from options
- **Switch**: Toggle switch
- **Label**: Form field labels

### Layout Components
- **Card**: Content container with header/footer
- **Dialog**: Modal dialogs
- **Popover**: Floating content
- **Tabs**: Tabbed interface
- **Accordion**: Collapsible sections
- **ScrollArea**: Custom scrollbars
- **Separator**: Visual dividers

### Feedback Components
- **Alert**: Notification messages
- **Badge**: Small status indicators
- **Progress**: Progress bars
- **Skeleton**: Loading placeholders
- **Toast**: Toast notifications
- **Tooltip**: Hover information

### Data Display
- **Table**: Data tables
- **Avatar**: User avatars
- **Calendar**: Date selection
- **Dropdown Menu**: Action menus

## Component Customization

### Variant System
```typescript
// shadcn components use class-variance-authority
<Button variant="default" size="lg">Click</Button>
<Button variant="outline" size="sm">Cancel</Button>
<Button variant="ghost">Icon</Button>
```

### Theming
- Configured in tailwind.config.js
- CSS variables in index.css
- Dark mode support via next-themes

<!-- MANUAL: -->
