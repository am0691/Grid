/**
 * CellDialog - Cell Detail Dialog Component
 * Shows activities for a specific area/week cell
 * - View/add/edit/delete activities
 * - Mark cell as complete
 * - Add memos
 * - Activity recommendations
 */

import { useState, useMemo, useEffect } from 'react';
import type { Area, TrainingType } from '@/types';
import { getAreaMeta } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Calendar, Plus, Trash2, Sparkles, AlertCircle } from 'lucide-react';
import type { ActivityPlan, ActivityEvaluation } from '@/domain/entities/activity-plan';

interface CellData {
  soulId: string;
  areaId: Area;
  week: number;
  status: 'completed' | 'current' | 'future';
  memo?: string;
  completedAt?: string;
}

// Area-specific activity templates
const AREA_RECOMMENDATIONS: Record<string, string[]> = {
  // Convert areas
  salvation: ['복음 핵심 나누기', '구원의 확신 점검', '간증 나누기', '복음 요약 연습'],
  word: ['성경 함께 읽기', '말씀 암송하기', '큐티 나눔', '성경 적용점 나누기'],
  fellowship: ['식사 교제', '안부 전화하기', '커피 타임', '삶 나눔 시간'],
  sin: ['회개 기도 함께하기', '변화된 삶 나누기', '성령 충만 기도', '거룩한 삶 점검'],
  notes: ['특별 기도제목 나누기', '감사 나눔', '격려 메시지'],
  // Disciple areas
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

interface CellDialogProps {
  cellData: CellData | null;
  trainingType: TrainingType;
  activities: ActivityPlan[];
  allActivities: ActivityPlan[];
  onClose: () => void;
  onToggleComplete: () => void;
  onSaveMemo: (memo: string) => void;
  onAddActivity: (title: string, isRecommended?: boolean) => Promise<void>;
  onToggleActivityComplete: (activityId: string) => void;
  onDeleteActivity: (activityId: string) => void;
  onEvaluateActivity: (activityId: string, evaluation: ActivityEvaluation) => void;
}

export function CellDialog({
  cellData,
  trainingType,
  activities,
  allActivities,
  onClose,
  onToggleComplete,
  onSaveMemo,
  onAddActivity,
  onToggleActivityComplete,
  onDeleteActivity,
  onEvaluateActivity,
}: CellDialogProps) {
  const [memoText, setMemoText] = useState('');
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const [quickEvalActivity, setQuickEvalActivity] = useState<string | null>(null);
  const [quickRating, setQuickRating] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [quickNote, setQuickNote] = useState('');

  // Sync memo text when cell data changes
  useEffect(() => {
    setMemoText(cellData?.memo || '');
  }, [cellData?.memo]);

  const weekLabel = trainingType === 'convert' ? '주차' : '월차';

  // Generate recommendations based on past activities and area templates
  const recommendations = useMemo(() => {
    if (!cellData) return [];

    const result: string[] = [];
    const areaId = cellData.areaId;
    const currentWeek = cellData.week;

    // 1. Follow-up activities from last week (same area)
    const lastWeekActivities = allActivities.filter(
      (p) => p.areaId === areaId && p.week === currentWeek - 1 && p.status === 'completed'
    );
    lastWeekActivities.forEach((activity) => {
      result.push(`${activity.title} (후속)`);
    });

    // 2. Pattern-based recommendations from this week's other areas
    const thisWeekOtherAreas = allActivities.filter(
      (p) => p.week === currentWeek && p.areaId !== areaId && p.status === 'completed'
    );
    if (thisWeekOtherAreas.length > 0) {
      const completedTitles = thisWeekOtherAreas.map((a) => a.title);
      if (completedTitles.some((t) => t.includes('만남') || t.includes('교제'))) {
        result.push('함께 시간 보내기');
      }
      if (completedTitles.some((t) => t.includes('기도'))) {
        result.push('중보기도 시간 갖기');
      }
    }

    // 3. Default area templates
    const areaTemplates = AREA_RECOMMENDATIONS[areaId] || [];
    const existingTitles = activities.map((a) => a.title.toLowerCase());

    areaTemplates.forEach((template) => {
      if (!existingTitles.includes(template.toLowerCase()) &&
          !result.some((r) => r.toLowerCase() === template.toLowerCase())) {
        result.push(template);
      }
    });

    return result.slice(0, 5);
  }, [cellData, activities, allActivities]);

  const handleAddPlan = async () => {
    if (!newPlanTitle.trim()) return;
    await onAddActivity(newPlanTitle.trim());
    setNewPlanTitle('');
  };

  const handleAddRecommendation = async (title: string) => {
    await onAddActivity(title, true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddPlan();
    }
  };

  const handleSaveMemo = () => {
    onSaveMemo(memoText);
  };

  const handleActivityToggle = (activityId: string) => {
    const activity = activities.find(a => a.id === activityId);
    if (!activity) return;

    // If completing an activity (not yet completed), show quick evaluation
    if (activity.status !== 'completed') {
      setQuickEvalActivity(activityId);
      setQuickRating(3);
      setQuickNote('');
      onToggleActivityComplete(activityId);
    } else {
      // If uncompleting, just toggle
      onToggleActivityComplete(activityId);
    }
  };

  const handleQuickEvaluate = (activityId: string) => {
    const evaluation: ActivityEvaluation = {
      rating: quickRating,
      evaluationNotes: quickNote || undefined,
      evaluatedAt: new Date().toISOString(),
    };
    onEvaluateActivity(activityId, evaluation);
    setQuickEvalActivity(null);
    setQuickNote('');
  };

  const handleSkipEvaluation = () => {
    setQuickEvalActivity(null);
    setQuickNote('');
  };

  if (!cellData) return null;

  const areaMeta = getAreaMeta(cellData.areaId, trainingType);

  return (
    <Dialog open={!!cellData} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            <span style={{ color: areaMeta.color }}>
              {areaMeta.name} - {cellData.week}{weekLabel}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Status display */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: cellData.status === 'completed'
                  ? areaMeta.lightBgColor
                  : cellData.status === 'current'
                    ? areaMeta.color
                    : '#f3f4f6'
              }}
            >
              {cellData.status === 'completed' && (
                <Check className="w-5 h-5" style={{ color: areaMeta.color }} />
              )}
              {cellData.status === 'current' && (
                <Star className="w-5 h-5 text-white" />
              )}
              {cellData.status === 'future' && (
                <span className="text-gray-400">-</span>
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium">
                {cellData.status === 'completed' && '완료됨'}
                {cellData.status === 'current' && '현재 진도'}
                {cellData.status === 'future' && '미래'}
              </p>
              {cellData.completedAt && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  완료일: {cellData.completedAt}
                </p>
              )}
            </div>
            <Button
              variant={cellData.status === 'completed' ? 'outline' : 'default'}
              size="sm"
              onClick={onToggleComplete}
              style={cellData.status !== 'completed' ? {
                backgroundColor: areaMeta.color,
                borderColor: areaMeta.color
              } : {}}
            >
              {cellData.status === 'completed' ? '완료 취소' : '완료'}
            </Button>
          </div>

          {/* Activity plans section */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              활동 계획
              {activities.length > 0 && (
                <Badge variant="secondary">
                  {activities.length}개
                </Badge>
              )}
            </h4>

            {/* Activity list */}
            {activities.length > 0 ? (
              <ScrollArea className="max-h-[180px]">
                <div className="space-y-2">
                  {activities.map((activity) => {
                    const isEvaluated = activity.status === 'completed' && activity.evaluation;
                    const needsEvaluation = activity.status === 'completed' && !activity.evaluation;

                    return (
                      <div key={activity.id}>
                        <div
                          className={`flex items-center gap-3 p-2 rounded-lg border transition-colors ${
                            activity.status === 'completed'
                              ? 'bg-green-50 border-green-200'
                              : 'bg-white hover:bg-gray-50'
                          }`}
                        >
                          <Checkbox
                            checked={activity.status === 'completed'}
                            onCheckedChange={() => handleActivityToggle(activity.id)}
                          />
                          <span className={`flex-1 text-sm ${
                            activity.status === 'completed' ? 'line-through text-muted-foreground' : ''
                          }`}>
                            {activity.title}
                          </span>

                          {/* Visual indicators */}
                          {isEvaluated && (
                            <div className="flex items-center gap-1 text-yellow-500">
                              <Star className="w-4 h-4 fill-yellow-500" />
                              <span className="text-xs font-medium">{activity.evaluation?.rating}</span>
                            </div>
                          )}
                          {needsEvaluation && (
                            <div title="평가 필요">
                              <AlertCircle className="w-4 h-4 text-orange-500" />
                            </div>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-red-500"
                            onClick={() => onDeleteActivity(activity.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Quick evaluation prompt */}
                        {quickEvalActivity === activity.id && (
                          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                            <p className="text-sm font-medium text-blue-900">활동을 평가해주세요</p>

                            {/* Quick rating */}
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((value) => (
                                <button
                                  key={value}
                                  type="button"
                                  onClick={() => setQuickRating(value as 1 | 2 | 3 | 4 | 5)}
                                  className={`p-1 rounded transition-all ${
                                    value <= quickRating ? 'text-yellow-500' : 'text-gray-300'
                                  }`}
                                >
                                  <Star
                                    className="w-6 h-6"
                                    fill={value <= quickRating ? 'currentColor' : 'none'}
                                  />
                                </button>
                              ))}
                            </div>

                            {/* Quick note */}
                            <Input
                              placeholder="간단한 메모 (선택사항)"
                              value={quickNote}
                              onChange={(e) => setQuickNote(e.target.value)}
                              className="text-sm"
                            />

                            {/* Action buttons */}
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleSkipEvaluation}
                                className="flex-1 text-xs"
                              >
                                나중에 평가
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleQuickEvaluate(activity.id)}
                                className="flex-1 text-xs"
                                style={{
                                  backgroundColor: areaMeta.color,
                                  borderColor: areaMeta.color
                                }}
                              >
                                저장
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-3 bg-muted/50 rounded-lg">
                아직 계획이 없습니다
              </p>
            )}

            {/* New activity input */}
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
                  backgroundColor: areaMeta.color,
                  borderColor: areaMeta.color
                }}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Recommendations section */}
          {recommendations.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2 text-purple-600">
                <Sparkles className="w-4 h-4" />
                추천 활동
              </h4>
              <div className="flex flex-wrap gap-2">
                {recommendations.map((rec, index) => (
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

          {/* Memo section */}
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
      </DialogContent>

    </Dialog>
  );
}
