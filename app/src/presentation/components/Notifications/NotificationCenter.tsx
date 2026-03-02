/**
 * NotificationCenter Component
 * Displays notifications in a popover with badge, grouped by type
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, AlertTriangle, BellRing, Star, Info } from 'lucide-react';
import { useNotificationStore } from '@/store/notificationStore';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Notification, NotificationType } from '@/store/notificationStore';

// Icon mapping for notification types
const notificationIcons: Record<NotificationType, { icon: typeof Bell; color: string }> = {
  crisis_alert: { icon: AlertTriangle, color: 'text-red-500' },
  reminder: { icon: BellRing, color: 'text-blue-500' },
  milestone: { icon: Star, color: 'text-green-500' },
  system: { icon: Info, color: 'text-gray-500' },
};

// Type labels for grouping
const typeLabels: Record<NotificationType, string> = {
  crisis_alert: 'Crisis Alerts',
  reminder: 'Reminders',
  milestone: 'Milestones',
  system: 'System',
};

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onNavigate: (notification: Notification) => void;
}

function NotificationItem({ notification, onMarkAsRead, onNavigate }: NotificationItemProps) {
  const { icon: Icon, color } = notificationIcons[notification.type];

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    onNavigate(notification);
  };

  return (
    <div
      className={cn(
        'flex gap-3 p-3 rounded-md hover:bg-accent cursor-pointer transition-colors group',
        !notification.isRead && 'bg-blue-50 dark:bg-blue-950/20'
      )}
      onClick={handleClick}
    >
      <div className={cn('shrink-0 mt-0.5', color)}>
        <Icon className="h-4 w-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn(
            'text-sm font-medium',
            !notification.isRead && 'font-semibold'
          )}>
            {notification.title}
          </p>
          {!notification.isRead && (
            <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
          )}
        </div>

        {notification.message && (
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
            {notification.message}
          </p>
        )}

        <p className="text-xs text-muted-foreground mt-1">
          {formatTimeAgo(notification.createdAt)}
        </p>
      </div>
    </div>
  );
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
  } = useNotificationStore();

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleNavigate = (notification: Notification) => {
    setIsOpen(false);

    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    } else if (notification.soulId) {
      // Navigate to soul detail page
      navigate(`/souls/${notification.soulId}`);
    }
  };

  // Group notifications by type
  const groupedNotifications = notifications.reduce((acc, notification) => {
    if (!acc[notification.type]) {
      acc[notification.type] = [];
    }
    acc[notification.type].push(notification);
    return acc;
  }, {} as Record<NotificationType, Notification[]>);

  const hasNotifications = notifications.length > 0;
  const unread = unreadCount();

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
            >
              {unread > 9 ? '9+' : unread}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-96 p-0"
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {hasNotifications && unread > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto py-1 px-2 text-xs"
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>

        {/* Notifications list */}
        {hasNotifications ? (
          <ScrollArea className="h-[400px]">
            <div className="p-2 space-y-4">
              {(Object.keys(groupedNotifications) as NotificationType[]).map((type) => {
                const items = groupedNotifications[type];
                if (!items || items.length === 0) return null;

                return (
                  <div key={type}>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase px-2 mb-2">
                      {typeLabels[type]}
                    </h4>
                    <div className="space-y-1">
                      {items.map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onMarkAsRead={handleMarkAsRead}
                          onNavigate={handleNavigate}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Bell className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No notifications</p>
            <p className="text-xs text-muted-foreground mt-1">
              You're all caught up!
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
