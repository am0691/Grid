import { useState } from 'react';
import { useGridStore } from '@/store/gridStore';
import { SoulCard } from './SoulCard';
import { AddSoulDialog } from './AddSoulDialog';
import { GridView } from './GridView';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Users, BookOpen, GraduationCap, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Soul } from '@/types';
import { CONVERT_AREAS, DISCIPLE_AREAS } from '@/types';

export function Dashboard() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [viewingSoul, setViewingSoul] = useState<Soul | null>(null);
  
  const { 
    souls, 
    filter, 
    setFilter, 
    getSoulProgress, 
    getOverallProgress,
    getDelayedAreas 
  } = useGridStore();

  // 필터링된 영혼 목록
  const filteredSouls = souls.filter(soul => {
    if (filter === 'all') return true;
    return soul.trainingType === filter;
  });

  // 통계
  const stats = {
    total: souls.length,
    convert: souls.filter(s => s.trainingType === 'convert').length,
    disciple: souls.filter(s => s.trainingType === 'disciple').length
  };

  // 주의가 필요한 영역 찾기
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
    
    return alerts.slice(0, 3); // 최대 3개만 표시
  };

  const alerts = getAlerts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* 헤더 */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">GRID</h1>
                <p className="text-xs text-muted-foreground">영역별 독립 진도 양육 관리 시스템</p>
              </div>
            </div>
            
            <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              새 영혼
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewingSoul ? (
          // 그리드 뷰
          <GridView
            soul={viewingSoul}
            progress={getSoulProgress(viewingSoul.id)}
            onClose={() => setViewingSoul(null)}
          />
        ) : (
          // 대시보드
          <div className="space-y-8">
            {/* 통계 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-sm text-muted-foreground">전체 영혼</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.convert}</p>
                    <p className="text-sm text-muted-foreground">Convert (13주)</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.disciple}</p>
                    <p className="text-sm text-muted-foreground">Disciple (12개월)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 주의가 필요한 영역 */}
            {alerts.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  주의가 필요한 영역
                </h2>
                <div className="space-y-2">
                  {alerts.map((alert, idx) => (
                    <Alert key={idx} variant="default" className="bg-amber-50 border-amber-200">
                      <AlertDescription>
                        <span className="font-medium">{alert.soulName}</span>님의 
                        <span className="font-medium"> "{alert.areaName}"</span> 영역이 
                        <span className="font-medium text-amber-600"> {alert.delayWeeks}주 지연</span>되고 있습니다.
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}

            {/* 필터 및 영혼 목록 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">양육 중인 영혼</h2>
                <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
                  <TabsList>
                    <TabsTrigger value="all">전체</TabsTrigger>
                    <TabsTrigger value="convert">Convert</TabsTrigger>
                    <TabsTrigger value="disciple">Disciple</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {filteredSouls.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border">
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
                    <Button onClick={() => setIsAddDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      새 영혼 추가
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          </div>
        )}
      </main>

      {/* 새 영혼 추가 다이얼로그 */}
      <AddSoulDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </div>
  );
}
