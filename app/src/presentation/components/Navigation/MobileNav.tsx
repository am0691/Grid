/**
 * Mobile Navigation Component
 * Fixed bottom navigation bar for mobile devices
 */

import { NavLink } from 'react-router-dom';
import { Home, Users, BarChart, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  className?: string;
}

const navItems = [
  {
    to: '/',
    icon: Home,
    label: '대시보드',
  },
  {
    to: '/souls',
    icon: Users,
    label: '영혼',
  },
  {
    to: '/insights',
    icon: BarChart,
    label: '인사이트',
  },
  {
    to: '/settings',
    icon: Settings,
    label: '설정',
  },
];

export function MobileNav({ className }: MobileNavProps) {
  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'bg-background border-t border-border',
        'md:hidden', // Only visible on mobile
        className
      )}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center gap-1',
                  'min-w-0 flex-1 py-2 px-1 rounded-lg transition-colors',
                  'hover:bg-accent',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
