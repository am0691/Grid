/**
 * Sidebar Navigation Component (Desktop)
 * Vertical navigation for desktop with logo and navigation items
 */

import { NavLink } from 'react-router-dom';
import { Home, Users, BarChart, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
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
    label: '영혼 목록',
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

export function Sidebar({ className }: SidebarProps) {
  return (
    <aside
      className={cn(
        'flex flex-col w-64 bg-background border-r border-border',
        className
      )}
    >
      {/* Logo/Brand */}
      <div className="flex items-center gap-2 h-16 px-6 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-lg font-bold text-primary-foreground">G</span>
        </div>
        <span className="text-xl font-bold">GRID</span>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground'
                )
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
