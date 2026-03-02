/**
 * ThisWeekActivityPanel - 이번주 활동 패널
 * GridView 내에서 현재 주차의 활동을 한눈에 보여주는 Bento-style 패널
 */

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  CalendarDays,
  Sparkles,
  Target,
  TrendingUp,
  Plus,
} from 'lucide-react';
import type { Soul, Area, TrainingType } from '@/types';
import { CONVERT_AREAS, DISCIPLE_AREAS } from '@/types';
import type { ActivityPlan } from '@/domain/entities/activity-plan';
import type { ActivityRecommendation } from '@/domain/entities/recommendation';

interface ThisWeekActivityPanelProps {
  soul: Soul;
  currentWeek: number;
  plans: ActivityPlan[];
  recommendations: ActivityRecommendation[];
  onToggleComplete: (planId: string) => void;
  onAddPlan: (areaId: Area, week: number) => void;
  onQuickAdd?: (title: string, areaId: Area, week: number) => void;
  onEvaluate: (plan: ActivityPlan) => void;
}

/**
 * 이번주 활동 완료율 계산
 */
function calculateCompletionRate(plans: ActivityPlan[]): number {
  if (plans.length === 0) return 0;
  const completed = plans.filter((p) => p.status === 'completed').length;
  return Math.round((completed / plans.length) * 100);
}

/**
 * 활동을 영역별로 그룹화
 */
function groupByArea(
  plans: ActivityPlan[],
  trainingType: TrainingType
): Map<Area, ActivityPlan[]> {
  const grouped = new Map<Area, ActivityPlan[]>();
  const areas = trainingType === 'convert' ? CONVERT_AREAS : DISCIPLE_AREAS;

  // 모든 영역을 초기화
  areas.forEach((area) => {
    grouped.set(area.id, []);
  });

  // 계획을 영역별로 분류
  plans.forEach((plan) => {
    if (plan.areaId) {
      const current = grouped.get(plan.areaId) || [];
      grouped.set(plan.areaId, [...current, plan]);
    }
  });

  return grouped;
}

export function ThisWeekActivityPanel({
  soul,
  currentWeek,
  plans,
  recommendations,
  onToggleComplete,
  onAddPlan,
  onQuickAdd: _onQuickAdd,
  onEvaluate,
}: ThisWeekActivityPanelProps) {
  const weekLabel = soul.trainingType === 'convert' ? '주차' : '월차';
  const areas = soul.trainingType === 'convert' ? CONVERT_AREAS : DISCIPLE_AREAS;

  // 이번주 활동만 필터링
  const thisWeekPlans = useMemo(
    () => plans.filter((p) => p.week === currentWeek),
    [plans, currentWeek]
  );

  // 이번주 추천만 필터링
  const thisWeekRecommendations = useMemo(
    () => recommendations.filter((r) => r.week === currentWeek),
    [recommendations, currentWeek]
  );

  // 영역별 그룹화
  const plansByArea = useMemo(
    () => groupByArea(thisWeekPlans, soul.trainingType),
    [thisWeekPlans, soul.trainingType]
  );

  // 통계 계산
  const completionRate = calculateCompletionRate(thisWeekPlans);
  const completedCount = thisWeekPlans.filter((p) => p.status === 'completed').length;
  const pendingCount = thisWeekPlans.filter((p) => p.status === 'planned').length;
  const needsEvaluation = thisWeekPlans.filter(
    (p) => p.status === 'completed' && !p.evaluation
  );

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CalendarDays className="h-5 w-5 text-primary" />
            이번 {weekLabel} 활동
            <Badge variant="outline" className="ml-2">
              {currentWeek}{weekLabel}
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={completionRate >= 80 ? 'default' : 'secondary'}>
              <TrendingUp className="h-3 w-3 mr-1" />
              {completionRate}%
            </Badge>
          </div>
        </div>

        {/* 진행률 바 */}
        <div className="mt-2 space-y-1">
          <Progress value={completionRate} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{completedCount}개 완료</span>
            <span>{pendingCount}개 진행 예정</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* 평가 필요 알림 */}
        {needsEvaluation.length > 0 && (
          <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <Target className="h-4 w-4" />
              <span className="text-sm font-medium">
                {needsEvaluation.length}개 활동의 평가가 필요합니다
              </span>
            </div>
          </div>
        )}

        <ScrollArea className="h-[280px] pr-4">
          <div className="space-y-4">
            {areas.map((area) => {
              const areaPlans = plansByArea.get(area.id) || [];
              const areaRecommendations = thisWeekRecommendations.filter(
                (r) => r.areaId === area.id
              );

              // 계획이나 추천이 없으면 미니멀하게 표시
              if (areaPlans.length === 0 && areaRecommendations.length === 0) {
                return (
                  <div
                    key={area.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: area.color }}
                      />
                      <span className="text-sm text-muted-foreground">{area.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => onAddPlan(area.id, currentWeek)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      추가
                    </Button>
                  </div>
                );
              }

              return (
                <div key={area.id} className="space-y-2">
                  {/* 영역 헤더 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: area.color }}
                      />
                      <span className="text-sm font-medium">{area.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {areaPlans.length}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => onAddPlan(area.id, currentWeek)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* 활동 목록 */}
                  <div className="space-y-1 pl-5">
                    {areaPlans.map((plan) => (
                      <div
                        key={plan.id}
                        className={`
                          flex items-center gap-2 p-2 rounded-md transition-all
                          ${plan.status === 'completed'
                            ? 'bg-green-50 dark:bg-green-900/20'
                            : 'hover:bg-muted/50'
                          }
                        `}
                      >
                        <Checkbox
                          checked={plan.status === 'completed'}
                          onCheckedChange={() => onToggleComplete(plan.id)}
                          className="h-4 w-4"
                        />
                        <span
                          className={`flex-1 text-sm ${
                            plan.status === 'completed'
                              ? 'text-muted-foreground line-through'
                              : ''
                          }`}
                        >
                          {plan.title}
                        </span>
                        {plan.status === 'completed' && !plan.evaluation && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs text-amber-600 hover:text-amber-700"
                            onClick={() => onEvaluate(plan)}
                          >
                            평가
                          </Button>
                        )}
                        {plan.evaluation && (
                          <Badge variant="outline" className="text-xs">
                            {'★'.repeat(plan.evaluation.rating)}
                          </Badge>
                        )}
                      </div>
                    ))}

                    {/* 추천 활동 (계획에 없는 것만) */}
                    {areaRecommendations.slice(0, 2).map((rec) => (
                      <div
                        key={rec.id}
                        className="flex items-center gap-2 p-2 rounded-md bg-purple-50/50 dark:bg-purple-900/10 border border-dashed border-purple-200 dark:border-purple-800"
                      >
                        <Sparkles className="h-3 w-3 text-purple-500" />
                        <span className="flex-1 text-sm text-muted-foreground">
                          {rec.title}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs text-purple-600 hover:text-purple-700"
                          onClick={() => onAddPlan(area.id, currentWeek)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          추가
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
