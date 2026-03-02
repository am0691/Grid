/**
 * SoulOverviewPage
 * 영혼 상세 개요 페이지 - 요약 정보 및 미니 그리드
 */

import { useSoulDetailContext } from '@/presentation/layouts/SoulDetailLayout';
import { useProgressStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Calendar,
  Clock,
  TrendingUp,
  CheckCircle2,
  Target,
  Activity,
} from 'lucide-react';
import { CONVERT_AREAS, DISCIPLE_AREAS, CONVERT_WEEKS, DISCIPLE_MONTHS } from '@/types';

export function SoulOverviewPage() {
  const { soul, soulId } = useSoulDetailContext();
  const { getSoulProgress, getOverallProgress } = useProgressStore();

  const progress = getSoulProgress(soulId);
  const overallProgress = getOverallProgress(soulId);
  const areas = soul.trainingType === 'convert' ? CONVERT_AREAS : DISCIPLE_AREAS;
  const maxWeek = soul.trainingType === 'convert' ? CONVERT_WEEKS : DISCIPLE_MONTHS;
  const periodLabel = soul.trainingType === 'convert' ? '주차' : '개월차';

  // 날짜 계산
  const startDate = new Date(soul.startDate);
  const today = new Date();
  const daysSinceStart = Math.floor(
    (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const weeksSinceStart = Math.floor(daysSinceStart / 7);

  // 평균 진도
  const avgWeek = progress.length > 0
    ? Math.round(progress.reduce((sum, p) => sum + p.currentWeek, 0) / progress.length)
    : 1;

  // 완료된 영역 수
  const completedAreas = progress.filter(p =>
    p.items.every(item => item.status === 'completed')
  ).length;

  // 현재 진행 중인 영역
  const currentAreas = progress
    .filter(p => p.items.some(item => item.status === 'current'))
    .map(p => {
      const areaMeta = areas.find(a => a.id === p.areaId);
      return {
        name: areaMeta?.name || p.areaId,
        currentWeek: p.currentWeek,
        color: areaMeta?.color || '#6b7280',
      };
    });

  // 추천 다음 행동
  const getRecommendedActions = () => {
    const actions: string[] = [];

    // 지연된 영역 찾기
    const delayedAreas = progress.filter(p => {
      const expectedWeek = Math.min(weeksSinceStart + 1, maxWeek);
      return p.currentWeek < expectedWeek;
    });

    if (delayedAreas.length > 0) {
      const areaMeta = areas.find(a => a.id === delayedAreas[0].areaId);
      actions.push(`"${areaMeta?.name}" 영역 진도를 확인하세요`);
    }

    // 완료 가능한 영역
    const nearCompleteAreas = progress.filter(p => {
      const completedCount = p.items.filter(i => i.status === 'completed').length;
      return completedCount >= maxWeek - 2 && completedCount < maxWeek;
    });

    if (nearCompleteAreas.length > 0) {
      const areaMeta = areas.find(a => a.id === nearCompleteAreas[0].areaId);
      actions.push(`"${areaMeta?.name}" 영역 완료를 앞두고 있습니다`);
    }

    // 기본 추천
    if (actions.length === 0) {
      if (currentAreas.length > 0) {
        actions.push(`${currentAreas[0].name} 영역을 이어서 진행하세요`);
      } else {
        actions.push('그리드에서 진도를 업데이트하세요');
      }
    }

    return actions;
  };

  const recommendedActions = getRecommendedActions();

  return (
    <div className="space-y-6">
      {/* 요약 정보 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 시작 후 경과 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              시작 후 경과
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{daysSinceStart}일</div>
            <p className="text-xs text-muted-foreground mt-1">
              약 {weeksSinceStart}주
            </p>
          </CardContent>
        </Card>

        {/* 전체 진도 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              전체 진도
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallProgress}%</div>
            <Progress value={overallProgress} className="h-2 mt-2" />
          </CardContent>
        </Card>

        {/* 평균 진행 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="w-4 h-4" />
              평균 진행
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {avgWeek}{periodLabel}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              총 {maxWeek}{periodLabel} 중
            </p>
          </CardContent>
        </Card>

        {/* 완료 영역 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              완료 영역
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedAreas}/{areas.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round((completedAreas / areas.length) * 100)}% 완료
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 미니 그리드 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            진도 현황 (미니 그리드)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {progress.map(areaProgress => {
              const areaMeta = areas.find(a => a.id === areaProgress.areaId);
              const completedCount = areaProgress.items.filter(
                i => i.status === 'completed'
              ).length;
              const progressPercent = Math.round((completedCount / maxWeek) * 100);

              return (
                <div key={areaProgress.areaId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: areaMeta?.color }}
                      />
                      <span className="text-sm font-medium">{areaMeta?.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        {completedCount}/{maxWeek}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {progressPercent}%
                      </Badge>
                    </div>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 현재 진행 중인 영역 */}
      {currentAreas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              현재 진행 중
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {currentAreas.map((area, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="px-3 py-1.5"
                  style={{
                    borderColor: area.color,
                    color: area.color,
                  }}
                >
                  {area.name} ({area.currentWeek}{periodLabel})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 추천 다음 행동 */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Target className="w-5 h-5" />
            추천 다음 행동
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {recommendedActions.map((action, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">{action}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
