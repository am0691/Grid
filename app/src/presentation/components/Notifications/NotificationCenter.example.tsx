/**
 * NotificationCenter Integration Example
 *
 * This example shows how to integrate NotificationCenter into your top bar/header
 */

import { NotificationCenter } from './NotificationCenter';
import { useNotificationStore } from '@/store/notificationStore';
import { useEffect } from 'react';

// Example: Top Bar Component with NotificationCenter
export function TopBarExample() {
  const { addNotification } = useNotificationStore();

  // Example: Add some demo notifications on mount
  useEffect(() => {
    // Crisis alert
    addNotification({
      type: 'crisis_alert',
      title: 'Critical: Soul in Crisis',
      message: 'John Doe requires immediate pastoral attention',
      soulId: 'soul-123',
      actionUrl: '/souls/soul-123',
    });

    // Reminder
    addNotification({
      type: 'reminder',
      title: 'Weekly Check-in Due',
      message: 'Jane Smith weekly check-in scheduled for today',
      soulId: 'soul-456',
      actionUrl: '/souls/soul-456',
    });

    // Milestone
    addNotification({
      type: 'milestone',
      title: 'Breakthrough Achieved!',
      message: 'Sarah Johnson completed her spiritual growth milestone',
      soulId: 'soul-789',
      actionUrl: '/souls/soul-789',
    });

    // System notification
    addNotification({
      type: 'system',
      title: 'System Update',
      message: 'New features have been added to the Grid dashboard',
    });
  }, [addNotification]);

  return (
    <div className="flex items-center justify-between p-4 border-b bg-background">
      {/* Left side: Logo/Title */}
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold">Grid Church Management</h1>
      </div>

      {/* Right side: Notification Center */}
      <div className="flex items-center gap-2">
        <NotificationCenter />
        {/* Add other top bar items here (user menu, settings, etc.) */}
      </div>
    </div>
  );
}

// Example: How to trigger notifications programmatically
export function NotificationTriggerExample() {
  const { addNotification } = useNotificationStore();

  const triggerCrisisAlert = () => {
    addNotification({
      type: 'crisis_alert',
      title: 'Critical Situation Detected',
      message: 'Immediate attention required for spiritual crisis',
      soulId: 'soul-123',
      actionUrl: '/souls/soul-123',
    });
  };

  const triggerReminder = () => {
    addNotification({
      type: 'reminder',
      title: 'Upcoming Activity',
      message: 'Prayer meeting scheduled in 30 minutes',
      actionUrl: '/activities/prayer-meeting',
    });
  };

  const triggerMilestone = () => {
    addNotification({
      type: 'milestone',
      title: 'Growth Milestone Reached',
      message: 'Member completed discipleship program',
      soulId: 'soul-456',
    });
  };

  return (
    <div className="p-4 space-y-2">
      <h2 className="text-lg font-semibold mb-4">Trigger Demo Notifications</h2>
      <button
        onClick={triggerCrisisAlert}
        className="px-4 py-2 bg-red-500 text-white rounded"
      >
        Trigger Crisis Alert
      </button>
      <button
        onClick={triggerReminder}
        className="px-4 py-2 bg-blue-500 text-white rounded ml-2"
      >
        Trigger Reminder
      </button>
      <button
        onClick={triggerMilestone}
        className="px-4 py-2 bg-green-500 text-white rounded ml-2"
      >
        Trigger Milestone
      </button>
    </div>
  );
}

// Example: Integration with existing layout
export function LayoutWithNotifications({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      {/* Top Bar with Notification Center */}
      <header className="sticky top-0 z-50 border-b bg-background">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Grid</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Add NotificationCenter here */}
            <NotificationCenter />

            {/* Other header items */}
            <div className="h-8 w-8 rounded-full bg-gray-200" />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main>{children}</main>
    </div>
  );
}
