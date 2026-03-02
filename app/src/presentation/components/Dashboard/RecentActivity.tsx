/**
 * Recent Activity Component
 * Shows recent activity feed across all souls based on PastoralLog data
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Activity,
  Sparkles,
  BookOpen,
  Clock,
  ArrowRight
} from 'lucide-react';
import { usePastoralLogStore } from '@/store/pastoralLogStore';
import { useSoulStore } from '@/store/soulStore';
import { MOOD_LABELS } from '@/domain/entities/pastoral-log';

interface RecentActivityProps {
  limit?: number;
  onNavigateToSoul?: (soulId: string) => void;
}

type ActivityItem = {
  id: string;
  soulId: string;
  soulName: string;
  type: 'pastoral_log' | 'breakthrough';
  title: string;
  description?: string;
  timestamp: string;
  icon: React.ElementType;
  iconColor: string;
};

export function RecentActivity({ limit = 10, onNavigateToSoul }: RecentActivityProps) {
  const logs = usePastoralLogStore((s) => s.logs);
  const { souls } = useSoulStore();

  // Aggregate activities from PastoralLog data
  const activities: ActivityItem[] = [];

  for (const [soulId, soulLogs] of Object.entries(logs)) {
    const soul = souls.find(s => s.id === soulId);
    if (!soul) continue;

    for (const log of soulLogs) {
      // Add as pastoral log entry
      activities.push({
        id: log.id,
        soulId,
        soulName: soul.name,
        type: 'pastoral_log',
        title: `목양 일지 - ${MOOD_LABELS[log.mood]}`,
        description: log.observations?.slice(0, 50) || undefined,
        timestamp: log.recordedAt,
        icon: BookOpen,
        iconColor: log.mood === 'growing' ? 'text-green-600' : log.mood === 'stable' ? 'text-yellow-600' : 'text-red-600',
      });

      // Add breakthrough entries separately if present
      if (log.hasBreakthrough && log.breakthroughTitle) {
        activities.push({
          id: `${log.id}-bt`,
          soulId,
          soulName: soul.name,
          type: 'breakthrough',
          title: log.breakthroughTitle,
          description: log.breakthroughCategory || undefined,
          timestamp: log.recordedAt,
          icon: Sparkles,
          iconColor: 'text-yellow-600',
        });
      }
    }
  }

  // Sort by timestamp (most recent first) and limit
  const sortedActivities = activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  };

  const handleActivityClick = (soulId: string) => {
    onNavigateToSoul?.(soulId);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5 text-green-600" />
          최근 활동
        </CardTitle>
      </CardHeader>

      <CardContent>
        {sortedActivities.length > 0 ? (
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {sortedActivities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div
                    key={activity.id}
                    className="p-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => handleActivityClick(activity.soulId)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg bg-muted flex-shrink-0`}>
                        <Icon className={`h-4 w-4 ${activity.iconColor}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {activity.soulName}
                            </p>
                            <p className="text-sm text-muted-foreground truncate">
                              {activity.title}
                            </p>
                            {activity.description && (
                              <Badge variant="secondary" className="text-xs mt-1">
                                {activity.description}
                              </Badge>
                            )}
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        </div>

                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{formatTimestamp(activity.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">
              아직 활동 기록이 없습니다
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              양육 활동을 시작해보세요
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
