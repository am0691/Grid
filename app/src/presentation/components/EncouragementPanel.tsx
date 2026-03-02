/**
 * Encouragement Panel (격려 패널)
 * localStorage 기반 격려 메시지 목록 표시
 */

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Heart, Bell, CheckCircle } from 'lucide-react';
import type { Encouragement } from '@/domain/entities/encouragement';

const STORAGE_KEY = 'grid_encouragements';

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage errors
  }
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays === 1) return '어제';
  if (diffDays < 7) return `${diffDays}일 전`;
  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

interface EncouragementPanelProps {
  trainerId: string;
}

export function EncouragementPanel({ trainerId }: EncouragementPanelProps) {
  const [encouragements, setEncouragements] = useState<Encouragement[]>([]);

  useEffect(() => {
    const all = loadFromStorage<Encouragement[]>(STORAGE_KEY, []);
    setEncouragements(all.filter(e => e.trainerId === trainerId));
  }, [trainerId]);

  const unreadCount = encouragements.filter(e => !e.isRead).length;

  const handleMarkRead = useCallback((id: string) => {
    setEncouragements(prev => {
      const updated = prev.map(e =>
        e.id === id ? { ...e, isRead: true } : e
      );
      const all = loadFromStorage<Encouragement[]>(STORAGE_KEY, []);
      const merged = all.map(e => (e.id === id ? { ...e, isRead: true } : e));
      saveToStorage(STORAGE_KEY, merged);
      return updated;
    });
  }, []);

  const handleMarkAllRead = useCallback(() => {
    setEncouragements(prev => {
      const updated = prev.map(e => ({ ...e, isRead: true }));
      const all = loadFromStorage<Encouragement[]>(STORAGE_KEY, []);
      const ids = new Set(updated.map(e => e.id));
      const merged = all.map(e => (ids.has(e.id) ? { ...e, isRead: true } : e));
      saveToStorage(STORAGE_KEY, merged);
      return updated;
    });
  }, []);

  return (
    <Card className="border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-background">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Heart className="h-5 w-5 text-pink-500" />
            격려 메시지
            {unreadCount > 0 && (
              <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-pink-500 px-1.5 text-xs font-medium text-white">
                {unreadCount}
              </span>
            )}
          </CardTitle>
          {unreadCount > 0 && (
            <Button
              size="sm"
              variant="ghost"
              className="text-xs text-muted-foreground"
              onClick={handleMarkAllRead}
            >
              모두 읽음
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {encouragements.length > 0 ? (
          <ScrollArea className="h-[260px]">
            <div className="space-y-2 pr-2">
              {encouragements.map(enc => (
                <div
                  key={enc.id}
                  className={`rounded-lg border p-3 transition-colors ${
                    enc.isRead
                      ? 'bg-muted/30 border-border'
                      : 'bg-background border-pink-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${enc.isRead ? 'text-muted-foreground' : 'font-medium'}`}>
                        {enc.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {enc.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1.5">
                        {timeAgo(enc.createdAt)}
                      </p>
                    </div>
                    {!enc.isRead && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 shrink-0 text-pink-400 hover:text-pink-600"
                        onClick={() => handleMarkRead(enc.id)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Bell className="h-8 w-8 mb-2 opacity-40" />
            <p className="text-sm">아직 격려 메시지가 없습니다</p>
            <p className="text-xs mt-1 opacity-70">양육 활동을 기록하면 격려를 받을 수 있습니다</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
