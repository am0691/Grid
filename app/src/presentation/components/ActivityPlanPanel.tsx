/**
 * Activity Plan Panel Component
 * Manages and displays activity plans for a specific soul with filtering
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Soul } from '@/types';
import type { ActivityPlan } from '@/domain/entities/activity-plan';
import type { ActivityRecommendation } from '@/domain/entities/recommendation';
import type { ActivityPlanFilterType } from '../types/activity-plan-ui';
import { ActivityPlanCard } from './ActivityPlanCard';
import { AddActivityPlanDialog } from './AddActivityPlanDialog';
import {
  PlusCircle,
  Sparkles,
  User,
  CheckCircle,
  Circle,
  ListFilter,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { getAreaMeta } from '@/types';
import type { Area } from '@/domain/value-objects/area';
import { cn } from '@/lib/utils';

interface ActivityPlanPanelProps {
  soul: Soul;
  plans: ActivityPlan[];
  recommendations: ActivityRecommendation[];
  selectedWeek?: number;
  selectedAreaId?: Area;
  onCreatePlan: (data: any) => Promise<void>;
  onUpdatePlan?: (planId: string, data: any) => Promise<void>;
  onDeletePlan?: (planId: string) => Promise<void>;
  onToggleComplete?: (planId: string) => void;
  className?: string;
}

export function ActivityPlanPanel({
  soul,
  plans,
  recommendations,
  selectedWeek,
  selectedAreaId,
  onCreatePlan,
  onUpdatePlan,
  onDeletePlan,
  onToggleComplete,
  className,
}: ActivityPlanPanelProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [filterType, setFilterType] = useState<ActivityPlanFilterType>('all');
  const [filterWeek, setFilterWeek] = useState<number | undefined>(selectedWeek);
  const [filterArea, setFilterArea] = useState<Area | undefined>(selectedAreaId);

  const weekLabel = soul.trainingType === 'convert' ? '주차' : '월차';

  // Get unique weeks and areas from plans
  const availableWeeks = useMemo(() => {
    const weeks = new Set(plans.map((p) => p.week).filter((w): w is number => w !== undefined));
    return Array.from(weeks).sort((a, b) => a - b);
  }, [plans]);

  const availableAreas = useMemo(() => {
    const areas = new Set(
      plans.map((p) => p.areaId).filter((a): a is Area => a !== undefined)
    );
    return Array.from(areas);
  }, [plans]);

  // Filter plans based on current filters
  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      // Filter by type
      if (filterType === 'completed' && plan.status !== 'completed') return false;
      if (filterType === 'incomplete' && plan.status === 'completed') return false;

      // Filter by week
      if (filterWeek !== undefined && plan.week !== filterWeek) return false;

      // Filter by area
      if (filterArea !== undefined && plan.areaId !== filterArea) return false;

      return true;
    });
  }, [plans, filterType, filterWeek, filterArea]);

  // Get recommended activities for the context
  const contextRecommendations = useMemo(() => {
    return recommendations.filter((rec) => {
      if (filterWeek !== undefined && rec.week !== filterWeek) return false;
      if (filterArea !== undefined && rec.areaId !== filterArea) return false;
      return true;
    });
  }, [recommendations, filterWeek, filterArea]);

  const showRecommended = filterType === 'all' || filterType === 'recommended';
  const showPersonal = filterType === 'all' || filterType === 'personal';

  const stats = {
    total: plans.length,
    completed: plans.filter((p) => p.status === 'completed').length,
    recommended: recommendations.length,
  };

  const handleAddActivity = () => {
    setShowAddDialog(true);
  };

  const handleCreatePlan = async (data: any) => {
    await onCreatePlan({
      ...data,
      soulId: soul.id,
      scheduledAt: new Date().toISOString(),
      type: 'meeting',
    });
  };

  const clearFilters = () => {
    setFilterType('all');
    setFilterWeek(undefined);
    setFilterArea(undefined);
  };

  const hasActiveFilters = filterWeek !== undefined || filterArea !== undefined;

  return (
    <>
      <Card className={cn('flex flex-col h-full', className)}>
        <CardHeader className="border-b">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl mb-1">활동 계획</CardTitle>
              <CardDescription>
                {soul.name}님의 {filterWeek ? `${filterWeek}${weekLabel}` : '전체'} 활동
              </CardDescription>

              {/* Stats */}
              <div className="flex items-center gap-3 mt-3">
                <Badge variant="outline" className="gap-1">
                  <Circle className="w-3 h-3 fill-current" />
                  전체 {stats.total}
                </Badge>
                <Badge variant="outline" className="gap-1 text-green-600">
                  <CheckCircle className="w-3 h-3" />
                  완료 {stats.completed}
                </Badge>
                <Badge variant="outline" className="gap-1 text-purple-600">
                  <Sparkles className="w-3 h-3" />
                  추천 {stats.recommended}
                </Badge>
              </div>
            </div>

            <Button onClick={handleAddActivity} size="sm" className="flex-shrink-0">
              <PlusCircle className="w-4 h-4 mr-2" />
              활동 추가
            </Button>
          </div>
        </CardHeader>

        {/* Filter Bar */}
        <div className="border-b px-6 py-3 bg-muted/30">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Type Filter Tabs */}
            <Tabs value={filterType} onValueChange={(v) => setFilterType(v as ActivityPlanFilterType)}>
              <TabsList className="h-8">
                <TabsTrigger value="all" className="text-xs h-7">
                  전체
                </TabsTrigger>
                <TabsTrigger value="recommended" className="text-xs h-7 gap-1">
                  <Sparkles className="w-3 h-3" />
                  추천
                </TabsTrigger>
                <TabsTrigger value="personal" className="text-xs h-7 gap-1">
                  <User className="w-3 h-3" />
                  개인
                </TabsTrigger>
                <TabsTrigger value="completed" className="text-xs h-7 gap-1">
                  <CheckCircle className="w-3 h-3" />
                  완료
                </TabsTrigger>
                <TabsTrigger value="incomplete" className="text-xs h-7 gap-1">
                  <Circle className="w-3 h-3" />
                  미완료
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Additional Filters */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-2">
                  <ListFilter className="w-4 h-4" />
                  필터
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-1 px-1.5 h-4 text-xs">
                      {(filterWeek ? 1 : 0) + (filterArea ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {/* Week filter */}
                <DropdownMenuLabel className="text-xs">주차/월차</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setFilterWeek(undefined)}>
                  전체 {weekLabel}
                </DropdownMenuItem>
                {availableWeeks.map((week) => (
                  <DropdownMenuItem
                    key={week}
                    onClick={() => setFilterWeek(week)}
                    className={cn(filterWeek === week && 'bg-accent')}
                  >
                    {week}
                    {weekLabel}
                  </DropdownMenuItem>
                ))}

                <DropdownMenuSeparator />

                {/* Area filter */}
                <DropdownMenuLabel className="text-xs">영역</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setFilterArea(undefined)}>
                  전체 영역
                </DropdownMenuItem>
                {availableAreas.map((areaId) => {
                  const meta = getAreaMeta(areaId, soul.trainingType);
                  return (
                    <DropdownMenuItem
                      key={areaId}
                      onClick={() => setFilterArea(areaId)}
                      className={cn(filterArea === areaId && 'bg-accent')}
                    >
                      <div
                        className="w-2 h-2 rounded-full mr-2"
                        style={{ backgroundColor: meta.color }}
                      />
                      {meta.name}
                    </DropdownMenuItem>
                  );
                })}

                {hasActiveFilters && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={clearFilters}>
                      필터 초기화
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Content */}
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full">
            <div className="p-6 space-y-6">
              {/* Recommended Activities */}
              {showRecommended && contextRecommendations.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      추천 활동
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {contextRecommendations.map((rec) => (
                      <div
                        key={rec.id}
                        className="p-4 rounded-lg border-2 border-dashed"
                        style={{
                          borderColor: getAreaMeta(rec.areaId, soul.trainingType).color,
                          backgroundColor: `${getAreaMeta(rec.areaId, soul.trainingType).lightBgColor}40`,
                        }}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium mb-1">{rec.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {rec.description}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            style={{
                              backgroundColor: getAreaMeta(rec.areaId, soul.trainingType)
                                .lightBgColor,
                              color: getAreaMeta(rec.areaId, soul.trainingType).color,
                              borderColor: getAreaMeta(rec.areaId, soul.trainingType).color,
                            }}
                          >
                            {getAreaMeta(rec.areaId, soul.trainingType).name}
                          </Badge>
                        </div>
                        {rec.activities && rec.activities.length > 0 && (
                          <ul className="space-y-1 mb-3">
                            {rec.activities.slice(0, 2).map((activity, idx) => (
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleCreatePlan({
                              title: rec.title,
                              areaId: rec.areaId,
                              week: rec.week,
                              description: rec.description,
                            })
                          }
                        >
                          활동 계획에 추가
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Personal Plans */}
              {showPersonal && filteredPlans.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      개인 활동 ({filteredPlans.length})
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {filteredPlans.map((plan) => (
                      <ActivityPlanCard
                        key={plan.id}
                        plan={plan}
                        soul={soul}
                        onToggleComplete={onToggleComplete}
                        onEdit={onUpdatePlan ? (p) => console.log('Edit:', p) : undefined}
                        onDelete={onDeletePlan}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {filteredPlans.length === 0 &&
                (filterType !== 'recommended' || contextRecommendations.length === 0) && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Circle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="text-sm mb-4">
                      {hasActiveFilters
                        ? '필터 조건에 맞는 활동이 없습니다'
                        : '아직 활동 계획이 없습니다'}
                    </p>
                    {!hasActiveFilters && (
                      <Button variant="outline" onClick={handleAddActivity}>
                        <PlusCircle className="w-4 h-4 mr-2" />
                        첫 활동 추가하기
                      </Button>
                    )}
                  </div>
                )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <AddActivityPlanDialog
        soul={soul}
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubmit={handleCreatePlan}
        defaultAreaId={filterArea}
        defaultWeek={filterWeek}
      />
    </>
  );
}
