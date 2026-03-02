import { useState, useMemo, useEffect } from 'react';
import type { Soul, AreaProgress, Area } from '@/types';
import { useGridStore } from '@/store/gridStore';
import { useActivityPlanStore } from '@/store/activityPlanStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Star, Calendar, MessageSquare, Plus, Trash2, Sparkles, Heart, Grid3X3 } from 'lucide-react';
import { CONVERT_AREAS, DISCIPLE_AREAS, CONVERT_WEEKS, DISCIPLE_MONTHS, getAreaMeta } from '@/types';
import type { ActivityPlan } from '@/domain/entities/activity-plan';


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

// 영역별 추천 활동 템플릿
const AREA_RECOMMENDATIONS: Record<string, string[]> = {
  // Convert 영역
  salvation: ['복음 핵심 나누기', '구원의 확신 점검', '간증 나누기', '복음 요약 연습'],
  word: ['성경 함께 읽기', '말씀 암송하기', '큐티 나눔', '성경 적용점 나누기'],
  fellowship: ['식사 교제', '안부 전화하기', '커피 타임', '삶 나눔 시간'],
  sin: ['회개 기도 함께하기', '변화된 삶 나누기', '성령 충만 기도', '거룩한 삶 점검'],
  notes: ['특별 기도제목 나누기', '감사 나눔', '격려 메시지'],
  // Disciple 영역
  memorization: ['암송 구절 점검', '새 구절 함께 외우기', '암송 복습'],
  bibleStudy: ['성경공부 진도 체크', '교리 질문 답변', '성경 배경 설명'],
  devotion: ['경건의 시간 나눔', '묵상 나눔', '주야 묵상 점검'],
  prayer: ['중보기도 시간', '기도제목 나누기', '합심 기도', '감사 기도'],
  witness: ['전도 대상자 정하기', '전도 연습', '간증 나누기', '복음 전파 계획'],
  lordship: ['주재권 점검', '순종 영역 나눔', '헌신 결단'],
  vision: ['세계 선교 기도', '비전 나눔', '선교 정보 공유'],
  discipleship: ['재생산 점검', '양육 계획 나눔', '제자 삼기 실천'],
  character: ['성품 점검', '열매 나눔', '변화 영역 나누기'],
  events: ['행사 참여 계획', '모임 안내', '수련회 준비'],
};

export function GridView({ soul, progress, onClose }: GridViewProps) {
  const [selectedCell, setSelectedCell] = useState<CellData | null>(null);
  const [memoText, setMemoText] = useState('');
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const [activeTab, setActiveTab] = useState<'grid' | 'pastoral'>('grid');

  const { toggleCellComplete, setCellMemo } = useGridStore();
  const { plans, fetchPlans, togglePlanComplete, addPlan, deletePlan } = useActivityPlanStore();

  // 활동 계획 로드
  useEffect(() => {
    fetchPlans(soul.id);
  }, [soul.id, fetchPlans]);

  // Soul의 활동 계획 (already aligned with domain model)
  const activityPlans = useMemo(() => {
    const soulPlans = plans[soul.id] || [];
    return soulPlans as ActivityPlan[];
  }, [plans, soul.id]);

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
    setNewPlanTitle('');
  };

  // 셀의 활동 계획 목록 가져오기
  const getCellActivities = (areaId: Area, week: number): ActivityPlan[] => {
    return activityPlans.filter(
      (p) => p.areaId === areaId && p.week === week
    );
  };

  // 선택된 셀의 활동 목록
  const selectedCellActivities = useMemo(() => {
    if (!selectedCell) return [];
    return getCellActivities(selectedCell.areaId, selectedCell.week);
  }, [selectedCell, activityPlans]);

  // 추천 활동 생성 (지난주 활동 + 영역별 템플릿 기반)
  const getRecommendations = useMemo(() => {
    if (!selectedCell) return [];

    const recommendations: string[] = [];
    const areaId = selectedCell.areaId;
    const currentWeek = selectedCell.week;

    // 1. 지난주 완료한 활동들 (같은 영역)
    const lastWeekActivities = activityPlans.filter(
      (p) => p.areaId === areaId && p.week === currentWeek - 1 && p.status === 'completed'
    );

    // 지난주 완료한 활동을 기반으로 후속 활동 추천
    lastWeekActivities.forEach((activity) => {
      recommendations.push(`${activity.title} (후속)`);
    });

    // 2. 이번 주차에 다른 영역에서 수행한 활동 패턴
    const thisWeekOtherAreas = activityPlans.filter(
      (p) => p.week === currentWeek && p.areaId !== areaId && p.status === 'completed'
    );

    if (thisWeekOtherAreas.length > 0) {
      // 비슷한 유형의 활동 추천
      const completedTitles = thisWeekOtherAreas.map((a) => a.title);
      if (completedTitles.some((t) => t.includes('만남') || t.includes('교제'))) {
        recommendations.push('함께 시간 보내기');
      }
      if (completedTitles.some((t) => t.includes('기도'))) {
        recommendations.push('중보기도 시간 갖기');
      }
    }

    // 3. 영역별 기본 추천 템플릿
    const areaTemplates = AREA_RECOMMENDATIONS[areaId] || [];

    // 이미 이번 셀에 있는 활동 제목들
    const existingTitles = selectedCellActivities.map((a) => a.title.toLowerCase());

    // 중복되지 않는 템플릿 추천 추가
    areaTemplates.forEach((template) => {
      if (!existingTitles.includes(template.toLowerCase()) &&
          !recommendations.some((r) => r.toLowerCase() === template.toLowerCase())) {
        recommendations.push(template);
      }
    });

    // 최대 5개까지만 반환
    return recommendations.slice(0, 5);
  }, [selectedCell, activityPlans, selectedCellActivities]);

  const handleToggleComplete = () => {
    if (!selectedCell) return;
    toggleCellComplete(selectedCell.soulId, selectedCell.areaId, selectedCell.week);
    setSelectedCell(null);
  };

  const handleSaveMemo = () => {
    if (!selectedCell) return;
    setCellMemo(selectedCell.soulId, selectedCell.areaId, selectedCell.week, memoText);
  };

  const handleAddPlan = async () => {
    if (!selectedCell || !newPlanTitle.trim()) return;
    try {
      await addPlan({
        soulId: soul.id,
        title: newPlanTitle.trim(),
        type: 'meeting',
        scheduledAt: new Date().toISOString(),
        areaId: selectedCell.areaId,
        week: selectedCell.week,
      });
      setNewPlanTitle('');
    } catch (error) {
      console.error('활동 계획 추가 실패:', error);
      alert('활동 계획 추가에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleAddRecommendation = async (title: string) => {
    if (!selectedCell) return;
    try {
      await addPlan({
        soulId: soul.id,
        title,
        type: 'meeting',
        scheduledAt: new Date().toISOString(),
        areaId: selectedCell.areaId,
        week: selectedCell.week,
      });
    } catch (error) {
      console.error('추천 활동 추가 실패:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddPlan();
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (deletePlan) {
      await deletePlan(planId);
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
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'grid' | 'pastoral')}>
            <TabsList>
              <TabsTrigger value="grid" className="gap-1">
                <Grid3X3 className="w-4 h-4" />
                그리드
              </TabsTrigger>
              <TabsTrigger value="pastoral" className="gap-1">
                <Heart className="w-4 h-4" />
                목양 케어
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" onClick={onClose}>닫기</Button>
        </div>
      </div>


      {/* 그리드 뷰 */}
      {activeTab === 'grid' && (
        <>
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

      {/* 그리드 (전체 너비) */}
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

                    return (
                      <td key={area.id} className="p-1">
                        <button
                          onClick={() => handleCellClick(area.id, week)}
                          className="w-full min-h-[70px] rounded-md border-2 flex flex-col items-start justify-start p-2 transition-all hover:scale-[1.02] relative text-left"
                          style={style}
                        >
                          {/* 상단: 상태 아이콘 */}
                          <div className="flex items-center justify-between w-full mb-1">
                            <div className="flex items-center gap-1">
                              {cellData.status === 'completed' && (
                                <Check className="w-4 h-4" />
                              )}
                              {cellData.status === 'current' && (
                                <Star className="w-4 h-4" />
                              )}
                            </div>
                            {hasMemo && (
                              <MessageSquare className="w-3 h-3 opacity-70" />
                            )}
                          </div>

                          {/* 활동 목록 (최대 2개) */}
                          {cellActivities.length > 0 ? (
                            <div className="w-full space-y-0.5 text-xs">
                              {cellActivities.slice(0, 2).map((activity) => (
                                <div
                                  key={activity.id}
                                  className={`truncate ${
                                    activity.status === 'completed' ? 'line-through opacity-60' : ''
                                  }`}
                                >
                                  • {activity.title}
                                </div>
                              ))}
                              {cellActivities.length > 2 && (
                                <div className="opacity-70">
                                  +{cellActivities.length - 2}개 더
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-xs opacity-50 italic">
                              클릭하여 추가
                            </div>
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

        </>
      )}

      {/* 셀 상세 팝업 (활동 계획 + 추천) */}
      <Dialog open={!!selectedCell} onOpenChange={() => setSelectedCell(null)}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedCell && (
                <span style={{ color: getAreaMeta(selectedCell.areaId, soul.trainingType).color }}>
                  {getAreaMeta(selectedCell.areaId, soul.trainingType).name} - {selectedCell.week}{weekLabel}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedCell && (
            <div className="space-y-5">
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
                <div className="flex-1">
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
                <Button
                  variant={selectedCell.status === 'completed' ? 'outline' : 'default'}
                  size="sm"
                  onClick={handleToggleComplete}
                  style={selectedCell.status !== 'completed' ? {
                    backgroundColor: getAreaMeta(selectedCell.areaId, soul.trainingType).color,
                    borderColor: getAreaMeta(selectedCell.areaId, soul.trainingType).color
                  } : {}}
                >
                  {selectedCell.status === 'completed' ? '완료 취소' : '완료'}
                </Button>
              </div>

              {/* 활동 계획 섹션 */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  활동 계획
                  {selectedCellActivities.length > 0 && (
                    <Badge variant="secondary">
                      {selectedCellActivities.length}개
                    </Badge>
                  )}
                </h4>

                {/* 활동 목록 */}
                {selectedCellActivities.length > 0 ? (
                  <ScrollArea className="max-h-[180px]">
                    <div className="space-y-2">
                      {selectedCellActivities.map((activity) => (
                        <div
                          key={activity.id}
                          className={`flex items-center gap-3 p-2 rounded-lg border transition-colors ${
                            activity.status === 'completed'
                              ? 'bg-green-50 border-green-200'
                              : 'bg-white hover:bg-gray-50'
                          }`}
                        >
                          <Checkbox
                            checked={activity.status === 'completed'}
                            onCheckedChange={() => togglePlanComplete(activity.id)}
                          />
                          <span className={`flex-1 text-sm ${
                            activity.status === 'completed' ? 'line-through text-muted-foreground' : ''
                          }`}>
                            {activity.title}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-red-500"
                            onClick={() => handleDeletePlan(activity.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-3 bg-muted/50 rounded-lg">
                    아직 계획이 없습니다
                  </p>
                )}

                {/* 새 활동 입력 */}
                <div className="flex gap-2">
                  <Input
                    value={newPlanTitle}
                    onChange={(e) => setNewPlanTitle(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="새 활동 계획 입력..."
                    className="flex-1"
                  />
                  <Button
                    onClick={handleAddPlan}
                    disabled={!newPlanTitle.trim()}
                    style={{
                      backgroundColor: getAreaMeta(selectedCell.areaId, soul.trainingType).color,
                      borderColor: getAreaMeta(selectedCell.areaId, soul.trainingType).color
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* 추천 활동 섹션 */}
              {getRecommendations.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2 text-purple-600">
                    <Sparkles className="w-4 h-4" />
                    추천 활동
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {getRecommendations.map((rec, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs h-8 border-dashed border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-400"
                        onClick={() => handleAddRecommendation(rec)}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        {rec}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* 메모 섹션 */}
              <div className="space-y-2">
                <h4 className="font-medium">메모</h4>
                <Textarea
                  value={memoText}
                  onChange={(e) => setMemoText(e.target.value)}
                  placeholder="만남 내용이나 특이사항을 기록하세요..."
                  rows={3}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveMemo}
                  className="w-full"
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
