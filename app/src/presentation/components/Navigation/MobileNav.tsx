/**
 * Mobile Navigation Component
 * Dark bottom navigation bar with dot indicator
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
        'bg-sidebar border-t border-white/[0.06]',
        'md:hidden',
        'safe-area-pb',
        className
      )}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center gap-1',
                  'min-w-0 flex-1 py-2 px-1 rounded-lg transition-all press-feedback',
                  isActive
                    ? 'text-white'
                    : 'text-sidebar-foreground/50'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={cn(
                    'w-5 h-5 transition-colors',
                    isActive ? 'text-primary' : ''
                  )} />
                  <span className="text-[10px] font-medium truncate">{item.label}</span>
                  {/* Active dot indicator */}
                  {isActive && (
                    <div className="absolute bottom-1.5 w-1 h-1 rounded-full bg-primary" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
