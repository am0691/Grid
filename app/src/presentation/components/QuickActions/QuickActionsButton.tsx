/**
 * QuickActionsButton - Floating Action Button (FAB)
 * Expandable menu for quick actions in bottom-right corner
 */

import { useState } from 'react';
import { Plus, UserPlus, Calendar, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface QuickActionsButtonProps {
  onAddSoul?: () => void;
  onLogMeeting?: () => void;
  onRecordBreakthrough?: () => void;
}

export function QuickActionsButton({
  onAddSoul,
  onLogMeeting,
  onRecordBreakthrough,
}: QuickActionsButtonProps) {
  const [open, setOpen] = useState(false);

  const actions = [
    {
      label: '새 영혼 추가',
      icon: UserPlus,
      onClick: () => {
        onAddSoul?.();
        setOpen(false);
      },
      color: 'text-blue-600',
      bgColor: 'hover:bg-blue-50',
    },
    {
      label: '미팅 기록',
      icon: Calendar,
      onClick: () => {
        onLogMeeting?.();
        setOpen(false);
      },
      color: 'text-green-600',
      bgColor: 'hover:bg-green-50',
    },
    {
      label: '돌파 기록',
      icon: Zap,
      onClick: () => {
        onRecordBreakthrough?.();
        setOpen(false);
      },
      color: 'text-amber-600',
      bgColor: 'hover:bg-amber-50',
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            size="icon-lg"
            className={cn(
              'rounded-full shadow-lg transition-all duration-200',
              'bg-primary hover:bg-primary/90',
              'w-14 h-14'
            )}
            aria-label="Quick actions"
          >
            <Plus
              className={cn(
                'transition-transform duration-200',
                open && 'rotate-45'
              )}
              size={24}
            />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          side="top"
          align="end"
          className="w-56 p-2"
          sideOffset={8}
        >
          <div className="space-y-1">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={action.onClick}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-md',
                    'transition-colors duration-150',
                    'text-left text-sm font-medium',
                    action.bgColor,
                    'dark:hover:bg-accent/50'
                  )}
                >
                  <Icon className={cn('w-5 h-5', action.color)} />
                  <span className="text-foreground">{action.label}</span>
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
