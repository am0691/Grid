/**
 * Weekly Activity View Component
 * Displays all activities for a specific week, grouped by area
 */

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Soul } from '@/types';
import type { ActivityPlan } from '@/domain/entities/activity-plan';
import type { ActivityRecommendation } from '@/domain/entities/recommendation';
import { ActivityPlanCard } from './ActivityPlanCard';
import { getAreaMeta, getAreaIds } from '@/types';
import type { Area } from '@/domain/value-objects/area';
import { Calendar, Sparkles, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WeeklyActivityViewProps {
  soul: Soul;
  week: number;
  plans: ActivityPlan[];
  recommendations: ActivityRecommendation[];
  onToggleComplete?: (planId: string) => void;
  onEditPlan?: (plan: ActivityPlan) => void;
  onDeletePlan?: (planId: string) => Promise<void>;
  className?: string;
}

interface AreaActivitiesGroup {
  areaId: Area;
  plans: ActivityPlan[];
  recommendations: ActivityRecommendation[];
}

export function WeeklyActivityView({
  soul,
  week,
  plans,
  recommendations,
  onToggleComplete,
  onEditPlan,
  onDeletePlan,
  className,
}: WeeklyActivityViewProps) {
  const weekLabel = soul.trainingType === 'convert' ? '주차' : '월차';
  const allAreaIds = getAreaIds(soul.trainingType);

  // Group activities by area
  const areaGroups = useMemo<AreaActivitiesGroup[]>(() => {
    const groups: AreaActivitiesGroup[] = [];

    allAreaIds.forEach((areaId) => {
      const areaPlans = plans.filter((p) => p.week === week && p.areaId === areaId);
      const areaRecommendations = recommendations.filter(
        (r) => r.week === week && r.areaId === areaId
      );

      // Only include areas that have activities
      if (areaPlans.length > 0 || areaRecommendations.length > 0) {
        groups.push({
          areaId,
          plans: areaPlans,
          recommendations: areaRecommendations,
        });
      }
    });

    return groups;
  }, [allAreaIds, plans, recommendations, week]);

  const totalActivities = useMemo(() => {
    return plans.filter((p) => p.week === week).length;
  }, [plans, week]);

  const completedActivities = useMemo(() => {
    return plans.filter((p) => p.week === week && p.status === 'completed').length;
  }, [plans, week]);

  const totalRecommendations = useMemo(() => {
    return recommendations.filter((r) => r.week === week).length;
  }, [recommendations, week]);

  return (
    <Card className={cn('flex flex-col h-full', className)}>
      <CardHeader className="border-b">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-1 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {week}
              {weekLabel} 활동
            </CardTitle>
            <CardDescription>{soul.name}님의 주간 활동 계획</CardDescription>

            {/* Stats */}
            <div className="flex items-center gap-3 mt-3">
              <Badge variant="outline" className="gap-1">
                <User className="w-3 h-3" />
                개인 {totalActivities}
              </Badge>
              <Badge variant="outline" className="gap-1 text-accent">
                <Sparkles className="w-3 h-3" />
                추천 {totalRecommendations}
              </Badge>
              {totalActivities > 0 && (
                <Badge variant="outline" className="gap-1 text-growth">
                  완료 {completedActivities}/{totalActivities}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full">
          <div className="p-6">
            {areaGroups.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">
                  이 {weekLabel}에는 아직 활동이 없습니다
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {areaGroups.map((group) => {
                  const areaMeta = getAreaMeta(group.areaId, soul.trainingType);
                  return (
                    <div key={group.areaId} className="space-y-4">
                      {/* Area Header */}
                      <div className="flex items-center gap-3">
                        <div
                          className="w-1 h-8 rounded-full"
                          style={{ backgroundColor: areaMeta.color }}
                        />
                        <div className="flex-1">
                          <h3
                            className="font-semibold text-lg"
                            style={{ color: areaMeta.color }}
                          >
                            {areaMeta.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {areaMeta.description}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          style={{
                            backgroundColor: areaMeta.lightBgColor,
                            color: areaMeta.color,
                            borderColor: areaMeta.color,
                          }}
                        >
                          {group.plans.length + group.recommendations.length}개
                        </Badge>
                      </div>

                      {/* Recommendations */}
                      {group.recommendations.length > 0 && (
                        <div className="space-y-3 pl-6">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-3 h-3 text-accent" />
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              추천 활동
                            </span>
                          </div>
                          <div className="space-y-3">
                            {group.recommendations.map((rec) => (
                              <div
                                key={rec.id}
                                className="p-4 rounded-lg border-2 border-dashed transition-all hover:shadow-sm"
                                style={{
                                  borderColor: areaMeta.color,
                                  backgroundColor: `${areaMeta.lightBgColor}40`,
                                }}
                              >
                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                  <div
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: areaMeta.color }}
                                  />
                                  {rec.title}
                                </h4>
                                <p className="text-sm text-muted-foreground mb-3">
                                  {rec.description}
                                </p>
                                {rec.activities && rec.activities.length > 0 && (
                                  <ul className="space-y-1.5">
                                    {rec.activities.map((activity, idx) => (
                                      <li
                                        key={idx}
                                        className="text-sm text-muted-foreground flex items-start gap-2"
                                      >
                                        <span className="text-xs mt-0.5">•</span>
                                        <span>{activity}</span>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Personal Plans */}
                      {group.plans.length > 0 && (
                        <div className="space-y-3 pl-6">
                          <div className="flex items-center gap-2">
                            <User className="w-3 h-3 text-primary" />
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              개인 활동
                            </span>
                          </div>
                          <div className="space-y-3">
                            {group.plans.map((plan) => (
                              <ActivityPlanCard
                                key={plan.id}
                                plan={plan}
                                soul={soul}
                                onToggleComplete={onToggleComplete}
                                onEdit={onEditPlan}
                                onDelete={onDeletePlan}
                                compact
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
