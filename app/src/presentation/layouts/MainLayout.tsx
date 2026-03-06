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
import { Sidebar } from '../components/Navigation/Sidebar';
import { MobileNav } from '../components/Navigation/MobileNav';
import { GlobalSearch } from '../components/Search/GlobalSearch';
import { NotificationCenter } from '../components/Notifications/NotificationCenter';
import { QuickActionsButton } from '../components/QuickActions/QuickActionsButton';

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
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-md">
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
              className="w-full justify-start text-muted-foreground border-border/60 hover:border-primary/30 hover:bg-primary/5"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">검색...</span>
              <kbd className="ml-auto hidden sm:inline-flex h-5 select-none items-center gap-1 rounded-sm border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
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
          <div className="container mx-auto p-4 md:p-6 pb-20 md:pb-6 animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav className="md:hidden fixed bottom-0 left-0 right-0 z-20" />

      {/* Global Search Modal */}
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Quick Actions FAB */}
      <QuickActionsButton />
    </div>
  );
}
