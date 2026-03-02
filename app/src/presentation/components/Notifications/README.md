# Notification Center Component

A fully-featured notification center component for the Grid church management app.

## Features

- **Bell icon button** with unread badge count
- **Popover dropdown** showing notifications list
- **Grouped by type**: crisis alerts, reminders, milestones, system
- **Mark as read** on click (optimistic updates)
- **Mark all as read** button
- **Empty state** when no notifications
- **Click to navigate** to related soul/activity
- **Time ago** formatting (e.g., "5m ago", "2h ago")
- **Icon mapping** based on notification type with color coding

## Components

### NotificationCenter
Main component that renders the notification bell button and popover.

**Props**: None (uses Zustand store)

**Store Methods Used**:
- `notifications` - Array of all notifications
- `unreadCount()` - Returns count of unread notifications
- `markAsRead(id)` - Marks a notification as read
- `markAllAsRead()` - Marks all notifications as read
- `fetchNotifications()` - Fetches notifications from backend

### NotificationItem
Internal component that renders a single notification item.

## Notification Types

| Type | Icon | Color | Label |
|------|------|-------|-------|
| `crisis_alert` | AlertTriangle | Red | Crisis Alerts |
| `reminder` | BellRing | Blue | Reminders |
| `milestone` | Star | Green | Milestones |
| `system` | Info | Gray | System |

## Usage

### Basic Integration

```tsx
import { NotificationCenter } from '@/presentation/components/Notifications';

function TopBar() {
  return (
    <header>
      <div className="flex items-center justify-between p-4">
        <h1>Grid</h1>
        <NotificationCenter />
      </div>
    </header>
  );
}
```

### Adding Notifications Programmatically

```tsx
import { useNotificationStore } from '@/store/notificationStore';

function MyComponent() {
  const { addNotification } = useNotificationStore();

  const triggerAlert = () => {
    addNotification({
      type: 'crisis_alert',
      title: 'Critical Situation',
      message: 'Immediate attention required',
      soulId: 'soul-123',
      actionUrl: '/souls/soul-123',
    });
  };

  return <button onClick={triggerAlert}>Send Alert</button>;
}
```

## Navigation Behavior

When a notification is clicked:

1. If `actionUrl` is present → navigate to that URL
2. Else if `soulId` is present → navigate to `/souls/{soulId}`
3. Mark notification as read (if unread)
4. Close the popover

## Styling

The component uses:
- **shadcn/ui components**: Popover, ScrollArea, Badge, Button
- **Lucide React icons**: Bell, AlertTriangle, BellRing, Star, Info
- **Tailwind CSS** for styling
- **Dark mode support** via Tailwind's dark: prefix

## Dependencies

- `react` & `react-router-dom`
- `lucide-react` (icons)
- `@radix-ui/react-popover`
- `@radix-ui/react-scroll-area`
- `zustand` (state management)

## State Management

Uses the centralized `notificationStore` (Zustand) with:
- **Optimistic updates** for instant UI feedback
- **Rollback on error** if backend operations fail
- **Local state** for real-time notifications

## Accessibility

- Proper ARIA labels on button (`aria-label="Notifications"`)
- Keyboard navigation support (via Radix UI Popover)
- Visual indicators for unread notifications
- Hover states for interactive elements

## Examples

See `NotificationCenter.example.tsx` for:
- Top bar integration
- Programmatic notification triggers
- Layout integration patterns
