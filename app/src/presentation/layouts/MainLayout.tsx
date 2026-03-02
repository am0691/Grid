/**
 * MainLayout
 * 인증된 페이지를 위한 메인 레이아웃
 * - 데스크탑 사이드바 / 모바일 하단 네비게이션
 * - 상단 검색 바 (Cmd+K)
 * - 알림 센터
 * - 빠른 액션 FAB
 */

import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

// Placeholder components - to be implemented later
const Sidebar = ({ className }: { className?: string }) => (
  <aside className={cn('border-r bg-muted/30', className)}>
    <div className="p-6">
      <h2 className="text-2xl font-black tracking-tighter bg-gradient-to-br from-slate-900 via-blue-800 to-indigo-900 dark:from-slate-100 dark:via-blue-200 dark:to-indigo-100 bg-clip-text text-transparent">
        GRID
      </h2>
      <p className="text-xs text-muted-foreground mt-1">영적 성장 추적</p>
    </div>
    {/* Sidebar navigation items will be implemented */}
    <nav className="px-4 space-y-2">
      <div className="text-sm text-muted-foreground px-3 py-2">
        Navigation items coming soon...
      </div>
    </nav>
  </aside>
);

const MobileNav = ({ className }: { className?: string }) => (
  <nav className={cn('border-t bg-background', className)}>
    <div className="flex items-center justify-around h-16 px-4">
      <div className="text-xs text-muted-foreground">
        Mobile nav coming soon...
      </div>
    </div>
  </nav>
);

const NotificationCenter = () => (
  <div className="relative">
    {/* Placeholder for notification center */}
    <Button variant="ghost" size="icon-sm">
      <div className="w-2 h-2 rounded-full bg-red-500 absolute top-1.5 right-1.5" />
      <span className="sr-only">알림</span>
      🔔
    </Button>
  </div>
);

const GlobalSearch = ({
  open,
  onOpenChange
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-background rounded-lg shadow-2xl border p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="검색... (Cmd+K)"
            className="flex-1 bg-transparent outline-none text-lg"
            autoFocus
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Global search coming soon...
        </div>
      </div>
    </div>
  );
};

const QuickActionsButton = () => (
  <Button
    size="icon-lg"
    className="fixed bottom-6 right-6 rounded-full shadow-lg z-40 md:bottom-8 md:right-8"
  >
    <span className="text-xl">⚡</span>
  </Button>
);

export function MainLayout() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Cmd+K handler for global search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/50">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between h-14 px-4">
          {/* Mobile Menu Button */}
          <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="md:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <Sidebar />
            </SheetContent>
          </Sheet>

          {/* Desktop Logo (hidden on mobile when sidebar shows) */}
          <div className="hidden md:block md:w-64" />

          {/* Search Button */}
          <div className="flex-1 max-w-md mx-4">
            <Button
              variant="outline"
              className="w-full justify-start text-muted-foreground"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">검색...</span>
              <kbd className="ml-auto hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
          </div>

          {/* Notification Center */}
          <NotificationCenter />
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar className="hidden md:block md:w-64 overflow-y-auto" />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-4 md:p-6 pb-20 md:pb-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav className="md:hidden fixed bottom-0 left-0 right-0 z-20" />

      {/* Global Search Modal */}
      <GlobalSearch open={isSearchOpen} onOpenChange={setIsSearchOpen} />

      {/* Quick Actions FAB */}
      <QuickActionsButton />
    </div>
  );
}
