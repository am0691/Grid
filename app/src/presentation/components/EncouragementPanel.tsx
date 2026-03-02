/**
 * Encouragement Panel (감사 & 격려 패널)
 * 양육자 격려 및 배지, 감사 메시지 표시
 * Phase 3: localStorage 기반 로컬 state로 전환
 */

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Heart, Award, MessageCircle, Bell, CheckCircle } from 'lucide-react';
import { BADGE_METADATA } from '@/domain/entities/encouragement';
import type { Encouragement, Badge as BadgeType, GratitudeMessage } from '@/domain/entities/encouragement';

const STORAGE_KEYS = {
  encouragements: 'grid_encouragements',
  badges: 'grid_badges',
  gratitudes: 'grid_gratitudes',
};

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
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

interface EncouragementPanelProps {
  trainerId: string;
}

export function EncouragementPanel({ trainerId }: EncouragementPanelProps) {
  const [encouragements, setEncouragements] = useState<Encouragement[]>([]);
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [gratitudes, setGratitudes] = useState<GratitudeMessage[]>([]);
  const [selectedTab, setSelectedTab] = useState('encouragements');
  const [viewAllBadges, setViewAllBadges] = useState(false);

  // Initialize from localStorage
  useEffect(() => {
    setEncouragements(loadFromStorage<Encouragement[]>(STORAGE_KEYS.encouragements, []));
    setBadges(loadFromStorage<BadgeType[]>(STORAGE_KEYS.badges, []));
    setGratitudes(loadFromStorage<GratitudeMessage[]>(STORAGE_KEYS.gratitudes, []));
  }, []);

  const unread = encouragements.filter((e) => !e.isRead);
  const trainerBadges = badges.filter((b) => b.trainerId === trainerId);
  const trainerGratitudes = gratitudes.filter((g) => g.toTrainerId === trainerId);

  const handleMarkRead = useCallback((id: string) => {
    setEncouragements((prev) => {
      const updated = prev.map((e) =>
        e.id === id ? { ...e, isRead: true, readAt: new Date().toISOString() } : e
      );
      saveToStorage(STORAGE_KEYS.encouragements, updated);
      return updated;
    });
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '오늘';
    if (diffDays === 1) return '어제';
    if (diffDays < 7) return `${diffDays}일 전`;
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  };

  // Simple stats
  const totalBreakthroughs = 0; // Would need cross-store data
  const crisesResolved = 0;

  return (
    <>
      <Card className="border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-background">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Heart className="h-5 w-5 text-pink-500" />
              격려 & 감사
              {unread.length > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {unread.length}
                </Badge>
              )}
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="encouragements" className="text-xs">
                <Bell className="h-3 w-3 mr-1" />
                알림
              </TabsTrigger>
              <TabsTrigger value="badges" className="text-xs">
                <Award className="h-3 w-3 mr-1" />
                배지
              </TabsTrigger>
              <TabsTrigger value="gratitudes" className="text-xs">
                <MessageCircle className="h-3 w-3 mr-1" />
                감사
              </TabsTrigger>
            </TabsList>

            {/* 격려 알림 */}
            <TabsContent value="encouragements" className="mt-3">
              {encouragements.length > 0 ? (
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {encouragements.slice(0, 10).map((enc) => (
                      <div
                        key={enc.id}
                        className={`p-3 rounded-lg border ${
                          enc.isRead ? 'bg-muted/30' : 'bg-background border-pink-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className={`text-sm ${enc.isRead ? 'text-muted-foreground' : 'font-medium'}`}>
                              {enc.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {enc.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDate(enc.createdAt)}
                            </p>
                          </div>
                          {!enc.isRead && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2"
                              onClick={() => handleMarkRead(enc.id)}
                            >
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">아직 알림이 없습니다</p>
                </div>
              )}
            </TabsContent>

            {/* 배지 */}
            <TabsContent value="badges" className="mt-3">
              {trainerBadges.length > 0 ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-4 gap-2">
                    {trainerBadges.slice(0, 8).map((badge) => {
                      const meta = BADGE_METADATA[badge.type];
                      return (
                        <div
                          key={badge.id}
                          className="flex flex-col items-center p-2 rounded-lg bg-background border hover:bg-muted/50 cursor-pointer"
                          title={`${meta.name}: ${meta.description}`}
                        >
                          <span className="text-2xl">{meta.emoji}</span>
                          <span className="text-xs text-center mt-1 text-muted-foreground truncate w-full">
                            {meta.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {trainerBadges.length > 8 && (
                    <Button
                      variant="ghost"
                      className="w-full text-xs"
                      onClick={() => setViewAllBadges(true)}
                    >
                      모든 배지 보기 ({trainerBadges.length})
                    </Button>
                  )}

                  {/* 다음 배지 힌트 */}
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs font-medium text-muted-foreground mb-1">다음 배지</p>
                    <div className="flex items-center gap-2">
                      <span className="text-lg opacity-30">🏆</span>
                      <div>
                        <p className="text-sm">10명의 목자</p>
                        <p className="text-xs text-muted-foreground">10명 이상 양육하기</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Award className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">아직 배지가 없습니다</p>
                  <p className="text-xs">양육을 시작하면 배지를 획득할 수 있습니다</p>
                </div>
              )}
            </TabsContent>

            {/* 감사 메시지 */}
            <TabsContent value="gratitudes" className="mt-3">
              {trainerGratitudes.length > 0 ? (
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {trainerGratitudes.map((gratitude) => (
                      <div
                        key={gratitude.id}
                        className="p-3 rounded-lg border bg-gradient-to-r from-pink-50 to-background"
                      >
                        <div className="flex items-start gap-2">
                          <Heart className="h-4 w-4 text-pink-500 mt-0.5" />
                          <div>
                            <p className="text-sm">{gratitude.message}</p>
                            {gratitude.memorableMoment && (
                              <p className="text-xs text-muted-foreground mt-1 italic">
                                "{gratitude.memorableMoment}"
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              {gratitude.isAnonymous ? '익명' : gratitude.fromSoulName} •{' '}
                              {formatDate(gratitude.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">아직 감사 메시지가 없습니다</p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* 통계 요약 */}
          <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-lg font-bold text-pink-600">{totalBreakthroughs}</p>
              <p className="text-xs text-muted-foreground">돌파 기록</p>
            </div>
            <div>
              <p className="text-lg font-bold text-pink-600">{crisesResolved}</p>
              <p className="text-xs text-muted-foreground">위기 해결</p>
            </div>
            <div>
              <p className="text-lg font-bold text-pink-600">{trainerBadges.length}</p>
              <p className="text-xs text-muted-foreground">배지</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 모든 배지 다이얼로그 */}
      <Dialog open={viewAllBadges} onOpenChange={setViewAllBadges}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>획득한 배지</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[400px]">
            <div className="grid grid-cols-3 gap-4 py-4">
              {trainerBadges.map((badge) => {
                const meta = BADGE_METADATA[badge.type];
                return (
                  <div
                    key={badge.id}
                    className="flex flex-col items-center p-4 rounded-lg border bg-background"
                  >
                    <span className="text-4xl">{meta.emoji}</span>
                    <p className="font-medium mt-2 text-center">{meta.name}</p>
                    <p className="text-xs text-muted-foreground text-center mt-1">
                      {meta.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDate(badge.earnedAt)} 획득
                    </p>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
