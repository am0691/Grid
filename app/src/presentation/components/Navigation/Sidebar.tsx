/**
 * Sidebar Navigation Component (Desktop)
 * Linear-style dark sidebar with indigo theme
 */

import { NavLink } from 'react-router-dom';
import { Home, Users, BarChart, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSoulStore } from '@/store/soulStore';

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
  const { souls } = useSoulStore();

  return (
    <aside
      className={cn(
        'flex flex-col w-64 sidebar-gradient border-r border-sidebar-border',
        className
      )}
    >
      {/* Logo/Brand */}
      <div className="flex items-center gap-3 h-14 px-5 border-b border-white/[0.06]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow-indigo">
          <span className="text-base font-extrabold text-white">G</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-white tracking-tight">GRID</span>
          {souls.length > 0 && (
            <span className="text-[11px] font-medium text-sidebar-foreground/60 bg-white/[0.06] px-1.5 py-0.5 rounded-md">
              {souls.length}
            </span>
          )}
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative',
                  isActive
                    ? 'bg-white/[0.08] text-white'
                    : 'text-sidebar-foreground/70 hover:text-white hover:bg-white/[0.04]'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active indicator bar */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary" />
                  )}
                  <Icon className={cn(
                    'w-[18px] h-[18px] transition-colors',
                    isActive ? 'text-primary' : 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80'
                  )} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-3 border-t border-white/[0.06]">
        <div className="px-3 py-2 text-[11px] text-sidebar-foreground/40 font-medium">
          GRID v1.0
        </div>
      </div>
    </aside>
  );
}
