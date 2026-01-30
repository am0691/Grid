import { useState } from 'react';
import type { Soul, AreaProgress, Area } from '@/types';
import { useGridStore } from '@/store/gridStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Star, Calendar, MessageSquare, ListTodo } from 'lucide-react';
import { CONVERT_AREAS, DISCIPLE_AREAS, CONVERT_WEEKS, DISCIPLE_MONTHS, getAreaMeta } from '@/types';
import { ActivityPlanPanel } from '@/presentation/components/ActivityPlanPanel';
import { WeeklyActivityView } from '@/presentation/components/WeeklyActivityView';

interface GridViewProps {
  soul: Soul;
  progress: AreaProgress[];
  onClose: () => void;
}

interface CellData {
  soulId: string;
  areaId: Area;
  week: number;
  status: 'completed' | 'current' | 'future';
  memo?: string;
  completedAt?: string;
}

export function GridView({ soul, progress, onClose }: GridViewProps) {
  const [selectedCell, setSelectedCell] = useState<CellData | null>(null);
  const [memoText, setMemoText] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'activities'>('grid');
  const [selectedWeekForActivities, setSelectedWeekForActivities] = useState<number | undefined>();

  const { toggleCellComplete, setCellMemo } = useGridStore();

  // Placeholder data for activity plans - should come from API/store
  const activityPlans: any[] = [];
  const recommendations: any[] = [];
  
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

  const handleCellClick = (areaId: Area, week: number) => {
    const cellData = getCellData(areaId, week);
    setSelectedCell(cellData);
    setMemoText(cellData.memo || '');
  };

  const handleShowActivities = (week?: number) => {
    setSelectedWeekForActivities(week);
    setViewMode('activities');
  };

  const handleCreatePlan = async (data: any) => {
    console.log('Create activity plan:', data);
    // TODO: Implement with actual use case
  };

  const handleTogglePlanComplete = (planId: string) => {
    console.log('Toggle plan complete:', planId);
    // TODO: Implement with actual use case
  };

  const handleDeletePlan = async (planId: string) => {
    console.log('Delete plan:', planId);
    // TODO: Implement with actual use case
  };

  const handleToggleComplete = () => {
    if (!selectedCell) return;
    toggleCellComplete(selectedCell.soulId, selectedCell.areaId, selectedCell.week);
    setSelectedCell(null);
  };

  const handleSaveMemo = () => {
    if (!selectedCell) return;
    setCellMemo(selectedCell.soulId, selectedCell.areaId, selectedCell.week, memoText);
    setSelectedCell(null);
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
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{soul.name}님의 GRID</h2>
          <p className="text-muted-foreground">
            {soul.trainingType === 'convert' ? 'Convert (13주)' : 'Disciple (12개월)'}
            {' '}• 시작일: {soul.startDate}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'activities')}>
            <TabsList>
              <TabsTrigger value="grid">그리드</TabsTrigger>
              <TabsTrigger value="activities" className="gap-2">
                <ListTodo className="w-4 h-4" />
                활동 계획
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" onClick={onClose}>닫기</Button>
        </div>
      </div>

      {/* 범례 */}
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

      {/* Content - Grid or Activities */}
      {viewMode === 'grid' ? (
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
                  className="p-3 text-center font-medium border-b-2 min-w-[100px]"
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
                    
                    return (
                      <td key={area.id} className="p-2">
                        <div className="relative group">
                          <button
                            onClick={() => handleCellClick(area.id, week)}
                            className="w-full h-12 rounded-md border-2 flex items-center justify-center transition-all hover:scale-105 relative"
                            style={style}
                          >
                            {cellData.status === 'completed' && (
                              <Check className="w-5 h-5" />
                            )}
                            {cellData.status === 'current' && (
                              <Star className="w-5 h-5" />
                            )}
                            {hasMemo && (
                              <div className="absolute top-1 right-1">
                                <MessageSquare className="w-3 h-3 opacity-70" />
                              </div>
                            )}
                          </button>
                          <button
                            onClick={() => handleShowActivities(week)}
                            className="absolute -bottom-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full shadow-md p-1 border hover:bg-gray-50"
                            title="활동 계획 보기"
                          >
                            <ListTodo className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      ) : (
        <div className="h-[600px]">
          {selectedWeekForActivities ? (
            <WeeklyActivityView
              soul={soul}
              week={selectedWeekForActivities}
              plans={activityPlans}
              recommendations={recommendations}
              onToggleComplete={handleTogglePlanComplete}
              onDeletePlan={handleDeletePlan}
            />
          ) : (
            <ActivityPlanPanel
              soul={soul}
              plans={activityPlans}
              recommendations={recommendations}
              onCreatePlan={handleCreatePlan}
              onToggleComplete={handleTogglePlanComplete}
              onDeletePlan={handleDeletePlan}
            />
          )}
        </div>
      )}

      {/* 셀 상세 다이얼로그 */}
      <Dialog open={!!selectedCell} onOpenChange={() => setSelectedCell(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedCell && (
                <>
                  {getAreaMeta(selectedCell.areaId, soul.trainingType).name} - 
                  {selectedCell.week}{weekLabel}
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedCell && (
            <div className="space-y-4">
              {/* 상태 표시 */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ 
                    backgroundColor: selectedCell.status === 'completed' 
                      ? getAreaMeta(selectedCell.areaId, soul.trainingType).lightBgColor
                      : selectedCell.status === 'current'
                        ? getAreaMeta(selectedCell.areaId, soul.trainingType).color
                        : '#f3f4f6'
                  }}
                >
                  {selectedCell.status === 'completed' && (
                    <Check className="w-5 h-5" style={{ color: getAreaMeta(selectedCell.areaId, soul.trainingType).color }} />
                  )}
                  {selectedCell.status === 'current' && (
                    <Star className="w-5 h-5 text-white" />
                  )}
                  {selectedCell.status === 'future' && (
                    <span className="text-gray-400">-</span>
                  )}
                </div>
                <div>
                  <p className="font-medium">
                    {selectedCell.status === 'completed' && '완료됨'}
                    {selectedCell.status === 'current' && '현재 진도'}
                    {selectedCell.status === 'future' && '미래'}
                  </p>
                  {selectedCell.completedAt && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      완료일: {selectedCell.completedAt}
                    </p>
                  )}
                </div>
              </div>

              {/* 메모 입력 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">메모</label>
                <Textarea
                  value={memoText}
                  onChange={(e) => setMemoText(e.target.value)}
                  placeholder="이번 주차/월차의 만남 내용을 기록하세요..."
                  rows={4}
                />
              </div>

              {/* 액션 버튼 */}
              <div className="flex gap-2">
                <Button 
                  variant={selectedCell.status === 'completed' ? 'outline' : 'default'}
                  className="flex-1"
                  onClick={handleToggleComplete}
                  style={selectedCell.status !== 'completed' ? {
                    backgroundColor: getAreaMeta(selectedCell.areaId, soul.trainingType).color,
                    borderColor: getAreaMeta(selectedCell.areaId, soul.trainingType).color
                  } : {}}
                >
                  {selectedCell.status === 'completed' ? '완료 취소' : '완료로 표시'}
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={handleSaveMemo}
                >
                  메모 저장
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
