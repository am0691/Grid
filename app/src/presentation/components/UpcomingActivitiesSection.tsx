/**
 * Upcoming Activities Section
 * 대시보드에 표시되는 다가오는 활동 목록 (날짜별 그룹)
 */

import { useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { CalendarDays } from 'lucide-react';
import { useActivityPlanStore } from '@/store/activityPlanStore';
import { groupActivitiesByDate } from '@/domain/services/group-activities-by-date';
import { getAreaMeta } from '@/types';
import type { Soul } from '@/types';
import type { ActivityPlan } from '@/domain/entities/activity-plan';
import type { Area } from '@/domain/value-objects/area';

interface UpcomingActivitiesSectionProps {
  souls: Soul[];
}

export function UpcomingActivitiesSection({ souls }: UpcomingActivitiesSectionProps) {
  const { plans, togglePlanComplete } = useActivityPlanStore();

  const soulMap = useMemo(() => {
    const map = new Map<string, { name: string; trainingType: 'convert' | 'disciple' }>();
    souls.forEach(soul => {
      map.set(soul.id, { name: soul.name, trainingType: soul.trainingType });
    });
    return map;
  }, [souls]);

  const allPlans = useMemo(() => {
    const result: ActivityPlan[] = [];
    for (const soulId of Object.keys(plans)) {
      result.push(...(plans[soulId] || []));
    }
    return result;
  }, [plans]);

  const groups = useMemo(
    () => groupActivitiesByDate(allPlans, soulMap),
    [allPlans, soulMap],
  );

  const hasActivities = groups.some(g => g.activities.length > 0);

  if (!hasActivities) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <CalendarDays className="w-5 h-5 text-primary" />
        다가오는 활동
      </h2>
      <div className="bg-white rounded-xl p-3 md:p-5 shadow-sm border space-y-3 md:space-y-5">
        {groups.map(group => {
          if (group.activities.length === 0) return null;
          return (
            <div key={group.key} className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                {group.label}{' '}
                <span className="text-xs">({group.dateRange})</span>
              </h3>
              <div className="space-y-1.5">
                {group.activities.map(activity => {
                  const areaMeta = activity.areaId
                    ? getAreaMeta(activity.areaId as Area, activity.trainingType)
                    : null;

                  return (
                    <div
                      key={activity.id}
                      className="flex items-center gap-2 md:gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        checked={activity.status === 'completed'}
                        onCheckedChange={() => togglePlanComplete(activity.id)}
                      />
                      <span className="text-sm font-medium min-w-0 shrink-0">
                        {activity.soulName}
                      </span>
                      <span className="text-sm flex-1 truncate">
                        {activity.title}
                      </span>
                      {areaMeta && (
                        <Badge
                          variant="outline"
                          className="text-xs shrink-0 hidden sm:inline-flex"
                          style={{
                            borderColor: areaMeta.color,
                            color: areaMeta.color,
                          }}
                        >
                          {areaMeta.name}
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
