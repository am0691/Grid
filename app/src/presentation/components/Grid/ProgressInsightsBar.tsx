/**
 * ProgressInsightsBar - Progress Insights Component
 * Shows overall progress and schedule status
 */

import { useMemo } from 'react';
import type { Soul, AreaProgress, Area } from '@/types';
import { CONVERT_WEEKS, DISCIPLE_MONTHS, CONVERT_AREAS, DISCIPLE_AREAS } from '@/types';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Target,
} from 'lucide-react';

interface ProgressInsightsBarProps {
  soul: Soul;
  progress: AreaProgress[];
}

interface AreaDelayInfo {
  areaId: Area;
  areaName: string;
  currentWeek: number;
  expectedWeek: number;
  delayWeeks: number;
  color: string;
}

export function ProgressInsightsBar({ soul, progress }: ProgressInsightsBarProps) {
  const maxWeek = soul.trainingType === 'convert' ? CONVERT_WEEKS : DISCIPLE_MONTHS;
  const areas = soul.trainingType === 'convert' ? CONVERT_AREAS : DISCIPLE_AREAS;
  const weekLabel = soul.trainingType === 'convert' ? '주' : '개월';

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    const totalCells = progress.length * maxWeek;
    if (totalCells === 0) return 0;

    const completedCells = progress.reduce((sum, area) => {
      return sum + area.items.filter(i => i.status === 'completed').length;
    }, 0);

    return Math.round((completedCells / totalCells) * 100);
  }, [progress, maxWeek]);

  // Calculate expected progress based on start date
  const expectedProgress = useMemo(() => {
    const startDate = new Date(soul.startDate);
    const now = new Date();
    const weeksPassed = Math.floor((now.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    const expectedWeek = Math.min(weeksPassed + 1, maxWeek);
    return Math.round((expectedWeek / maxWeek) * 100);
  }, [soul.startDate, maxWeek]);

  // Determine if on track
  const progressDiff = overallProgress - expectedProgress;
  const isOnTrack = progressDiff >= -10; // Allow 10% tolerance
  const isAhead = progressDiff > 5;

  // Calculate delayed areas
  const delayedAreas = useMemo((): AreaDelayInfo[] => {
    const fastestWeek = Math.max(...progress.map(p => p.currentWeek), 1);

    return progress
      .filter(p => fastestWeek - p.currentWeek >= 2)
      .map(p => {
        const areaMeta = areas.find(a => a.id === p.areaId);
        return {
          areaId: p.areaId,
          areaName: areaMeta?.name || p.areaId,
          currentWeek: p.currentWeek,
          expectedWeek: fastestWeek,
          delayWeeks: fastestWeek - p.currentWeek,
          color: areaMeta?.color || '#6b7280',
        };
      })
      .sort((a, b) => b.delayWeeks - a.delayWeeks);
  }, [progress, areas]);

  // Calculate completion stats
  const completionStats = useMemo(() => {
    const totalAreas = progress.length;
    const fullyCompletedAreas = progress.filter(p =>
      p.items.every(i => i.status === 'completed')
    ).length;
    const totalActivities = progress.reduce((sum, p) => sum + p.items.length, 0);
    const completedActivities = progress.reduce(
      (sum, p) => sum + p.items.filter(i => i.status === 'completed').length,
      0
    );

    return {
      totalAreas,
      fullyCompletedAreas,
      totalActivities,
      completedActivities,
    };
  }, [progress]);

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Main progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <span className="font-medium">전체 진행률</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{overallProgress}%</span>
              {isAhead ? (
                <Badge variant="default" className="bg-growth">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  앞서감
                </Badge>
              ) : isOnTrack ? (
                <Badge variant="secondary">
                  <Clock className="w-3 h-3 mr-1" />
                  정상 진행
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  지연됨
                </Badge>
              )}
            </div>
          </div>

          <div className="relative">
            <Progress value={overallProgress} className="h-3" />
            {/* Expected progress marker */}
            <div
              className="absolute top-0 h-3 w-0.5 bg-muted-foreground"
              style={{ left: `${expectedProgress}%` }}
              title={`예상 진도: ${expectedProgress}%`}
            />
          </div>

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>시작</span>
            <span>예상 진도: {expectedProgress}%</span>
            <span>완료</span>
          </div>
        </div>

        {/* Stats summary */}
        <div className="grid grid-cols-3 gap-4 pt-2 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <CheckCircle2 className="w-3 h-3" />
              <span className="text-xs">완료 셀</span>
            </div>
            <p className="font-semibold">
              {completionStats.completedActivities}
              <span className="text-muted-foreground font-normal">
                /{completionStats.totalActivities}
              </span>
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <Target className="w-3 h-3" />
              <span className="text-xs">완료 영역</span>
            </div>
            <p className="font-semibold">
              {completionStats.fullyCompletedAreas}
              <span className="text-muted-foreground font-normal">
                /{completionStats.totalAreas}
              </span>
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <Clock className="w-3 h-3" />
              <span className="text-xs">남은 기간</span>
            </div>
            <p className="font-semibold">
              {Math.max(0, maxWeek - Math.ceil(overallProgress / 100 * maxWeek))}
              <span className="text-muted-foreground font-normal">
                {weekLabel}
              </span>
            </p>
          </div>
        </div>

        {/* Delayed areas warning */}
        {delayedAreas.length > 0 && (
          <div className="pt-2 border-t">
            <div className="flex items-center gap-2 mb-2 text-warning">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">지연된 영역</span>
            </div>
            <div className="space-y-1">
              {delayedAreas.slice(0, 3).map((area) => (
                <div
                  key={area.areaId}
                  className="flex items-center justify-between text-sm p-2 rounded-md bg-warning-light dark:bg-warning/10"
                >
                  <span style={{ color: area.color }} className="font-medium">
                    {area.areaName}
                  </span>
                  <span className="text-warning">
                    {area.delayWeeks}{weekLabel} 지연
                  </span>
                </div>
              ))}
              {delayedAreas.length > 3 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{delayedAreas.length - 3}개 영역 더
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
