import { useState, useEffect } from 'react';
import { useSoulStore } from '@/store/soulStore';
import { useProgressStore } from '@/store/progressStore';
import { SoulCard } from '@/components/SoulCard';
import { AddSoulDialog } from '@/components/AddSoulDialog';
import { GridView } from '@/components/GridView';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Users, BookOpen, GraduationCap, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UpcomingActivitiesSection } from '@/presentation/components/UpcomingActivitiesSection';
import { useActivityPlanStore } from '@/store/activityPlanStore';
import type { Soul } from '@/types';
import { CONVERT_AREAS, DISCIPLE_AREAS } from '@/types';

type FilterType = 'all' | 'convert' | 'disciple';

export function DashboardPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [viewingSoul, setViewingSoul] = useState<Soul | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');

  const { souls, fetchSouls, isLoading: soulsLoading } = useSoulStore();
  const { fetchProgress, getSoulProgress, getOverallProgress } = useProgressStore();
  const { fetchPlans } = useActivityPlanStore();

  useEffect(() => {
    fetchSouls();
  }, [fetchSouls]);

  useEffect(() => {
    souls.forEach(soul => {
      fetchProgress(soul.id);
      fetchPlans(soul.id);
    });
  }, [souls, fetchProgress, fetchPlans]);

  const filteredSouls = souls.filter(soul => {
    if (filter === 'all') return true;
    return soul.trainingType === filter;
  });

  const stats = {
    total: souls.length,
    convert: souls.filter(s => s.trainingType === 'convert').length,
    disciple: souls.filter(s => s.trainingType === 'disciple').length
  };

  const getDelayedAreas = (soulId: string) => {
    const progress = getSoulProgress(soulId);
    const soul = souls.find(s => s.id === soulId);
    if (!soul || !progress) return [];

    const delayed: { areaId: string; delayWeeks: number }[] = [];
    const today = new Date();
    const startDate = new Date(soul.startDate);

    progress.forEach(area => {
      area.items.forEach(item => {
        if (item.status !== 'completed') {
          const expectedDate = new Date(startDate);
          expectedDate.setDate(expectedDate.getDate() + (item.week * 7));
          const diffTime = today.getTime() - expectedDate.getTime();
          const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
          if (diffWeeks > 0) {
            delayed.push({ areaId: area.areaId, delayWeeks: diffWeeks });
          }
        }
      });
    });

    return delayed;
  };

  const getAlerts = () => {
    const alerts: { soulName: string; areaName: string; delayWeeks: number }[] = [];

    souls.forEach(soul => {
      const delayed = getDelayedAreas(soul.id);
      const areas = soul.trainingType === 'convert' ? CONVERT_AREAS : DISCIPLE_AREAS;

      delayed.forEach(d => {
        const area = areas.find(a => a.id === d.areaId);
        if (area) {
          alerts.push({
            soulName: soul.name,
            areaName: area.name,
            delayWeeks: d.delayWeeks
          });
        }
      });
    });

    return alerts.slice(0, 3);
  };

  const alerts = getAlerts();

  return (
    <div className="space-y-8 animate-fade-in">
      {viewingSoul ? (
        <GridView
          soul={viewingSoul}
          progress={getSoulProgress(viewingSoul.id)}
          onClose={() => setViewingSoul(null)}
        />
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">대시보드</h1>
              <p className="text-sm text-muted-foreground mt-1">양육 현황을 한눈에 확인하세요</p>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2 press-feedback">
              <Plus className="w-4 h-4" />
              새 영혼
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger-children">
            <div className="rounded-xl p-5 bg-card border border-border/50 shadow-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-[28px] font-bold leading-none tracking-tight">{stats.total}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">전체 영혼</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl p-5 bg-card border border-border/50 shadow-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-growth-light flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-growth" />
                </div>
                <div>
                  <p className="text-[28px] font-bold leading-none tracking-tight">{stats.convert}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">Convert (13주)</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl p-5 bg-card border border-border/50 shadow-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-violet-light flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-[28px] font-bold leading-none tracking-tight">{stats.disciple}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">Disciple (12개월)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Activities */}
          <UpcomingActivitiesSection souls={souls} />

          {/* Attention Needed Alerts */}
          {alerts.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-warning" />
                주의가 필요한 영역
              </h2>
              <div className="space-y-2">
                {alerts.map((alert, idx) => (
                  <Alert key={idx} variant="default" className="border-l-4 border-l-warning border-warning/30 bg-warning-light">
                    <AlertDescription>
                      <span className="font-medium">{alert.soulName}</span>님의
                      <span className="font-medium"> &ldquo;{alert.areaName}&rdquo;</span> 영역이
                      <span className="font-semibold text-warning"> {alert.delayWeeks}주 지연</span>되고 있습니다.
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>
          )}

          {/* Filter & Soul List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">양육 중인 영혼</h2>
              <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
                <TabsList>
                  <TabsTrigger value="all">전체</TabsTrigger>
                  <TabsTrigger value="convert">Convert</TabsTrigger>
                  <TabsTrigger value="disciple">Disciple</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {soulsLoading ? (
              <div className="text-center py-16 rounded-xl border border-border/50 bg-card">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Users className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">로딩 중...</p>
              </div>
            ) : filteredSouls.length === 0 ? (
              <div className="text-center py-16 rounded-xl border border-border/50 bg-card">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">
                  {souls.length === 0 ? '아직 등록된 영혼이 없습니다' : '필터에 맞는 영혼이 없습니다'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {souls.length === 0 ? '새로운 영혼을 추가하여 양육을 시작하세요.' : '다른 필터를 선택하거나 새 영혼을 추가하세요.'}
                </p>
                {souls.length === 0 && (
                  <Button onClick={() => setIsAddDialogOpen(true)} className="press-feedback">
                    <Plus className="w-4 h-4 mr-2" />
                    새 영혼 추가
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
                {filteredSouls.map(soul => (
                  <SoulCard
                    key={soul.id}
                    soul={soul}
                    progress={getSoulProgress(soul.id)}
                    overallProgress={getOverallProgress(soul.id)}
                    onClick={() => setViewingSoul(soul)}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <AddSoulDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </div>
  );
}
