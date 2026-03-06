/**
 * Attention Needed Component
 * Shows souls requiring attention based on PastoralLog mood data
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertTriangle,
  Thermometer,
  TrendingDown,
  Phone,
  MessageCircle,
  ArrowRight
} from 'lucide-react';
import { usePastoralLogStore } from '@/store/pastoralLogStore';
import { useSoulStore } from '@/store/soulStore';
import { MOOD_LABELS } from '@/domain/entities/pastoral-log';
import type { SpiritualMood } from '@/domain/entities/pastoral-log';

interface AttentionNeededProps {
  onNavigateToSoul?: (soulId: string) => void;
}

interface SoulAttentionInfo {
  soulId: string;
  soulName: string;
  currentMood: SpiritualMood | null;
  moodTrend: 'improving' | 'stable' | 'declining';
  consecutiveStrugglingCount: number;
  needsAttention: boolean;
}

function computeAttentionInfo(soulId: string, soulName: string, logs: ReturnType<typeof usePastoralLogStore.getState>['logs']): SoulAttentionInfo {
  const soulLogs = logs[soulId] || [];
  if (soulLogs.length === 0) {
    return { soulId, soulName, currentMood: null, moodTrend: 'stable', consecutiveStrugglingCount: 0, needsAttention: false };
  }

  const sorted = [...soulLogs].sort(
    (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
  );

  const currentMood = sorted[0].mood;

  // Trend calculation
  let moodTrend: 'improving' | 'stable' | 'declining' = 'stable';
  if (sorted.length >= 3) {
    const recentMoods = sorted.slice(0, 3).map(s =>
      s.mood === 'growing' ? 2 : s.mood === 'stable' ? 1 : 0
    );
    const avgRecent = recentMoods.reduce((a: number, b: number) => a + b, 0) / 3;
    const olderMoods = sorted.slice(3, 6).map(s =>
      s.mood === 'growing' ? 2 : s.mood === 'stable' ? 1 : 0
    );
    if (olderMoods.length > 0) {
      const avgOlder = olderMoods.reduce((a: number, b: number) => a + b, 0) / olderMoods.length;
      if (avgRecent > avgOlder + 0.3) moodTrend = 'improving';
      else if (avgRecent < avgOlder - 0.3) moodTrend = 'declining';
    }
  }

  // Consecutive struggling count
  let consecutiveStrugglingCount = 0;
  for (const log of sorted) {
    if (log.mood === 'struggling') consecutiveStrugglingCount++;
    else break;
  }

  const needsAttention = currentMood === 'struggling' || consecutiveStrugglingCount >= 2;

  return { soulId, soulName, currentMood, moodTrend, consecutiveStrugglingCount, needsAttention };
}

export function AttentionNeeded({ onNavigateToSoul }: AttentionNeededProps) {
  const logs = usePastoralLogStore((s) => s.logs);
  const { souls } = useSoulStore();

  // Compute attention info for each soul from PastoralLog data
  const soulsNeedingAttention = souls
    .filter(soul => soul)
    .map(soul => computeAttentionInfo(soul.id, soul.name, logs))
    .filter(item => item.needsAttention)
    .sort((a, b) => b.consecutiveStrugglingCount - a.consecutiveStrugglingCount);

  const handleSoulClick = (soulId: string) => {
    onNavigateToSoul?.(soulId);
  };

  const handleQuickAction = (soulId: string, action: 'call' | 'message', e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement quick actions (open phone dialer, messaging app, etc.)
    console.log(`Quick action ${action} for soul ${soulId}`);
  };

  return (
    <Card className="border-2 border-warning/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-warning" />
            관심 필요
            {soulsNeedingAttention.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {soulsNeedingAttention.length}
              </Badge>
            )}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        {soulsNeedingAttention.length > 0 ? (
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {soulsNeedingAttention.map(({ soulId, soulName, currentMood, moodTrend, consecutiveStrugglingCount }) => (
                <div
                  key={soulId}
                  className="p-4 rounded-lg border-2 border-warning/20 bg-warning-light hover:bg-warning/20 transition-colors cursor-pointer"
                  onClick={() => handleSoulClick(soulId)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      {/* Soul Name */}
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{soulName}</h3>
                      </div>

                      {/* Mood Indicator */}
                      {currentMood && (
                        <div className="flex items-center gap-2 mb-2">
                          <Thermometer className="h-4 w-4 text-warning" />
                          <span className="text-sm">
                            {MOOD_LABELS[currentMood]}
                          </span>
                          {moodTrend === 'declining' && (
                            <TrendingDown className="h-3 w-3 text-danger" />
                          )}
                        </div>
                      )}

                      {/* Consecutive struggling */}
                      {consecutiveStrugglingCount > 0 && (
                        <p className="text-xs text-warning">
                          {consecutiveStrugglingCount}회 연속 위기 상태
                        </p>
                      )}

                      {/* Quick Action Buttons */}
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={(e) => handleQuickAction(soulId, 'call', e)}
                        >
                          <Phone className="h-3 w-3 mr-1" />
                          전화
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={(e) => handleQuickAction(soulId, 'message', e)}
                        >
                          <MessageCircle className="h-3 w-3 mr-1" />
                          메시지
                        </Button>
                      </div>
                    </div>

                    <ArrowRight className="h-5 w-5 text-warning flex-shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">
              현재 관심이 필요한 영혼이 없습니다
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              모두 안정적으로 성장하고 있습니다
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
