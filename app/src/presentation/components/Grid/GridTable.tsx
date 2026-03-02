/**
 * GridTable - Training Grid Table Component
 * Displays training progress in a grid format
 * - Rows: training areas (Convert: 5 areas, Disciple: 14 areas)
 * - Columns: weeks (Convert: 13 weeks, Disciple: 12 months)
 */

import type { Soul, AreaProgress, Area } from '@/types';
import { CONVERT_AREAS, DISCIPLE_AREAS, CONVERT_WEEKS, DISCIPLE_MONTHS } from '@/types';
import { Check, Star, MessageSquare, CheckSquare, Square } from 'lucide-react';
import type { ActivityPlan } from '@/domain/entities/activity-plan';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CellData {
  soulId: string;
  areaId: Area;
  week: number;
  status: 'completed' | 'current' | 'future';
  memo?: string;
  completedAt?: string;
}

interface GridTableProps {
  soul: Soul;
  progress: AreaProgress[];
  activityPlans: ActivityPlan[];
  onCellClick: (areaId: Area, week: number) => void;
}

export function GridTable({ soul, progress, activityPlans, onCellClick }: GridTableProps) {
  const areas = soul.trainingType === 'convert' ? CONVERT_AREAS : DISCIPLE_AREAS;
  const maxWeek = soul.trainingType === 'convert' ? CONVERT_WEEKS : DISCIPLE_MONTHS;
  const weekLabel = soul.trainingType === 'convert' ? '주차' : '월차';

  const getCellData = (areaId: Area, week: number): CellData => {
    const areaProgress = progress.find(p => p.areaId === areaId);
    const item = areaProgress?.items.find(i => i.week === week);

    return {
      soulId: soul.id,
      areaId,
      week,
      status: item?.status || 'future',
      memo: item?.memo,
      completedAt: item?.completedAt
    };
  };

  const getCellActivities = (areaId: Area, week: number): ActivityPlan[] => {
    return activityPlans.filter(
      (p) => p.areaId === areaId && p.week === week
    );
  };

  const getActivityBadgeColor = (activities: ActivityPlan[]) => {
    if (activities.length === 0) return { bg: 'bg-gray-200', text: 'text-gray-600' };

    const completedCount = activities.filter(a => a.status === 'completed').length;
    const totalCount = activities.length;

    if (completedCount === totalCount) {
      return { bg: 'bg-green-500', text: 'text-white' };
    } else if (completedCount > 0) {
      return { bg: 'bg-amber-500', text: 'text-white' };
    } else {
      return { bg: 'bg-gray-300', text: 'text-gray-700' };
    }
  };

  const getCellStyle = (status: 'completed' | 'current' | 'future', color: string, lightBgColor: string) => {
    switch (status) {
      case 'completed':
        return {
          backgroundColor: lightBgColor,
          borderColor: color,
          color: color
        };
      case 'current':
        return {
          backgroundColor: color,
          borderColor: color,
          color: 'white',
          boxShadow: `0 0 0 2px ${color}, 0 0 0 4px white, 0 0 0 6px ${color}`
        };
      default:
        return {
          backgroundColor: '#f3f4f6',
          borderColor: '#e5e7eb',
          color: '#9ca3af'
        };
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="p-3 text-left font-medium text-muted-foreground border-b-2">
              {weekLabel}
            </th>
            {areas.map(area => (
              <th
                key={area.id}
                className="p-3 text-center font-medium border-b-2 min-w-[120px]"
                style={{ borderColor: area.color, color: area.color }}
              >
                <div className="text-sm">{area.name}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: maxWeek }, (_, weekIndex) => {
            const week = weekIndex + 1;
            return (
              <tr key={week} className="border-b hover:bg-muted/50">
                <td className="p-3 font-medium text-muted-foreground">
                  {week}{weekLabel}
                </td>
                {areas.map(area => {
                  const cellData = getCellData(area.id, week);
                  const style = getCellStyle(cellData.status, area.color, area.lightBgColor);
                  const hasMemo = !!cellData.memo;
                  const cellActivities = getCellActivities(area.id, week);
                  const badgeColor = getActivityBadgeColor(cellActivities);

                  return (
                    <td key={area.id} className="p-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => onCellClick(area.id, week)}
                              className="w-full min-h-[90px] max-h-[120px] rounded-md border-2 flex flex-col items-start justify-start p-2 transition-all hover:scale-[1.02] relative text-left"
                              style={style}
                            >
                              {/* Top: Status icon */}
                              <div className="flex items-center justify-between w-full mb-1">
                                <div className="flex items-center gap-1">
                                  {cellData.status === 'completed' && (
                                    <Check className="w-4 h-4" />
                                  )}
                                  {cellData.status === 'current' && (
                                    <Star className="w-4 h-4" />
                                  )}
                                </div>
                                <div className="flex items-center gap-1">
                                  {hasMemo && (
                                    <MessageSquare className="w-3 h-3 opacity-70" />
                                  )}
                                  {/* Activity count badge */}
                                  {cellActivities.length > 0 && (
                                    <span className={`${badgeColor.bg} ${badgeColor.text} text-xs px-1.5 py-0.5 rounded-full font-medium`}>
                                      {cellActivities.length}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Activity list (max 3 with checkbox icons) */}
                              {cellActivities.length > 0 ? (
                                <div className="w-full space-y-0.5 text-sm">
                                  {cellActivities.slice(0, 3).map((activity) => (
                                    <div
                                      key={activity.id}
                                      className="flex items-start gap-1 truncate"
                                    >
                                      {activity.status === 'completed' ? (
                                        <CheckSquare className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                      ) : (
                                        <Square className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                      )}
                                      <span className={`truncate ${
                                        activity.status === 'completed' ? 'line-through opacity-60' : ''
                                      }`}>
                                        {activity.title}
                                      </span>
                                    </div>
                                  ))}
                                  {cellActivities.length > 3 && (
                                    <div className="opacity-70 text-xs pl-5">
                                      +{cellActivities.length - 3}개 더
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="text-sm opacity-50 italic">
                                  클릭하여 추가
                                </div>
                              )}
                            </button>
                          </TooltipTrigger>
                          {cellActivities.length > 0 && (
                            <TooltipContent side="top" className="max-w-xs">
                              <div className="space-y-1">
                                <div className="font-semibold text-sm mb-2">
                                  활동 목록 ({cellActivities.length}개)
                                </div>
                                {cellActivities.map((activity) => (
                                  <div key={activity.id} className="flex items-start gap-1 text-xs">
                                    {activity.status === 'completed' ? (
                                      <CheckSquare className="w-3 h-3 flex-shrink-0 mt-0.5" />
                                    ) : (
                                      <Square className="w-3 h-3 flex-shrink-0 mt-0.5" />
                                    )}
                                    <span className={activity.status === 'completed' ? 'line-through opacity-60' : ''}>
                                      {activity.title}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/**
 * GridLegend - Legend component for the grid
 */
export function GridLegend() {
  return (
    <div className="flex gap-6 text-sm">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded bg-green-100 border border-green-600 flex items-center justify-center">
          <Check className="w-4 h-4 text-green-600" />
        </div>
        <span>완료</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded bg-green-600 flex items-center justify-center shadow-[0_0_0_2px_white,0_0_0_4px_green]">
          <Star className="w-4 h-4 text-white" />
        </div>
        <span>현재 진도</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded bg-gray-100 border border-gray-200" />
        <span>미래</span>
      </div>
    </div>
  );
}
