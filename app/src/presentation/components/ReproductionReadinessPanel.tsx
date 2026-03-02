/**
 * Reproduction Readiness Panel (재생산 준비도 패널)
 * 양육자로 세워질 준비도를 추적하는 컴포넌트
 * Phase 3: localStorage 기반 로컬 state로 전환
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Sprout, GraduationCap, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import type {
  ReadinessCheckItem,
  ReadinessStatus,
  ReadinessCheckResult,
  ReproductionReadiness,
} from '@/domain/entities/reproduction-readiness';
import {
  READINESS_CHECK_ITEMS,
  READINESS_LEVELS,
  calculateReadinessScore,
  getReadinessLevel,
} from '@/domain/entities/reproduction-readiness';

const READINESS_STORAGE_KEY = 'grid_readiness';

function loadReadiness(): Record<string, ReproductionReadiness> {
  try {
    const stored = localStorage.getItem(READINESS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveReadiness(records: Record<string, ReproductionReadiness>): void {
  try {
    localStorage.setItem(READINESS_STORAGE_KEY, JSON.stringify(records));
  } catch {
    // Ignore storage errors
  }
}

interface ReproductionReadinessPanelProps {
  soulId: string;
  soulName: string;
}

export function ReproductionReadinessPanel({ soulId, soulName }: ReproductionReadinessPanelProps) {
  const [readinessRecords, setReadinessRecords] = useState<Record<string, ReproductionReadiness>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [checkResults, setCheckResults] = useState<Record<ReadinessCheckItem, ReadinessStatus>>({} as any);

  // Initialize from localStorage
  useEffect(() => {
    setReadinessRecords(loadReadiness());
  }, []);

  const readiness = readinessRecords[soulId] || null;

  // 초기화
  const initializeChecks = () => {
    const initial: Record<ReadinessCheckItem, ReadinessStatus> = {} as any;
    const items = Object.keys(READINESS_CHECK_ITEMS) as ReadinessCheckItem[];

    items.forEach((item) => {
      const existing = readiness?.checkResults.find((r) => r.item === item);
      initial[item] = existing?.status || 'not_started';
    });

    setCheckResults(initial);
    setIsDialogOpen(true);
  };

  const handleStatusChange = (item: ReadinessCheckItem, status: ReadinessStatus) => {
    setCheckResults((prev) => ({
      ...prev,
      [item]: status,
    }));
  };

  const handleSave = () => {
    const results: ReadinessCheckResult[] = Object.entries(checkResults).map(([item, status]) => ({
      item: item as ReadinessCheckItem,
      status,
    }));

    const score = calculateReadinessScore(results);
    const level = getReadinessLevel(score);

    const strengths = results
      .filter((r) => r.status === 'completed' || r.status === 'verified')
      .map((r) => r.item);

    const areasToImprove = results
      .filter((r) => r.status === 'not_started' || r.status === 'in_progress')
      .map((r) => r.item);

    const newReadiness: ReproductionReadiness = {
      id: `readiness-${soulId}`,
      soulId,
      checkResults: results,
      overallScore: score,
      readinessLevel: level,
      strengths,
      areasToImprove,
      recommendations: [],
      suggestedNextSteps: areasToImprove.slice(0, 3).map((item) => `${item} 영역 강화 필요`),
      isGraduationReady: level === 'ready',
      lastAssessedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setReadinessRecords((prev) => {
      const updated = { ...prev, [soulId]: newReadiness };
      saveReadiness(updated);
      return updated;
    });
    setIsDialogOpen(false);
  };

  const getStatusIcon = (status: ReadinessStatus) => {
    switch (status) {
      case 'completed':
      case 'verified':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Loader2 className="h-4 w-4 text-blue-500" />;
      default:
        return <Circle className="h-4 w-4 text-gray-300" />;
    }
  };

  const getLevelInfo = (level: string) => {
    return READINESS_LEVELS[level as keyof typeof READINESS_LEVELS] || READINESS_LEVELS.not_ready;
  };

  return (
    <>
      <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-background">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sprout className="h-5 w-5 text-green-500" />
              재생산 준비도
            </CardTitle>
            <Button size="sm" onClick={initializeChecks}>
              평가
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {readiness ? (
            <div className="space-y-4">
              {/* 종합 점수 */}
              <div className="text-center p-4 rounded-lg bg-background border">
                <div className="text-3xl font-bold" style={{ color: getLevelInfo(readiness.readinessLevel).color }}>
                  {readiness.overallScore}%
                </div>
                <Badge
                  className="mt-2"
                  style={{ backgroundColor: getLevelInfo(readiness.readinessLevel).color }}
                >
                  {getLevelInfo(readiness.readinessLevel).label}
                </Badge>
              </div>

              {/* 진행 바 */}
              <Progress value={readiness.overallScore} className="h-3" />

              {/* 체크리스트 요약 */}
              <div className="grid grid-cols-2 gap-2">
                {readiness.checkResults.slice(0, 6).map((result) => {
                  const itemInfo = READINESS_CHECK_ITEMS[result.item];
                  return (
                    <div
                      key={result.item}
                      className="flex items-center gap-2 p-2 rounded bg-muted/50 text-sm"
                    >
                      {getStatusIcon(result.status)}
                      <span className="truncate">{itemInfo.name}</span>
                    </div>
                  );
                })}
              </div>

              {/* 다음 단계 */}
              {readiness.areasToImprove.length > 0 && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <p className="text-sm font-medium text-amber-700 mb-2">다음 단계 제안</p>
                  <ul className="text-xs text-amber-600 space-y-1">
                    {readiness.suggestedNextSteps.slice(0, 3).map((step, i) => (
                      <li key={i}>• {step}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 졸업 준비 완료 */}
              {readiness.isGraduationReady && (
                <div className="p-3 rounded-lg bg-green-50 border border-green-200 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-700">
                    양육자로 세워질 준비가 되었습니다!
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Sprout className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">아직 평가가 없습니다</p>
              <p className="text-xs">재생산 준비도를 평가해주세요</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 평가 다이얼로그 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{soulName}님 재생산 준비도 평가</DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-4 py-4">
              {(Object.keys(READINESS_CHECK_ITEMS) as ReadinessCheckItem[]).map((item) => {
                const info = READINESS_CHECK_ITEMS[item];
                const currentStatus = checkResults[item] || 'not_started';

                return (
                  <div key={item} className="p-4 rounded-lg border bg-background">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-medium">{info.name}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {info.description}
                        </p>
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground mb-1">충족 기준:</p>
                          <ul className="text-xs text-muted-foreground space-y-0.5">
                            {info.criteria.map((c, i) => (
                              <li key={i}>• {c}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {info.weight}점
                      </Badge>
                    </div>

                    {/* 상태 선택 */}
                    <div className="mt-3 flex gap-2">
                      {(['not_started', 'in_progress', 'completed'] as ReadinessStatus[]).map((status) => (
                        <Button
                          key={status}
                          size="sm"
                          variant={currentStatus === status ? 'default' : 'outline'}
                          className="flex-1 text-xs"
                          onClick={() => handleStatusChange(item, status)}
                        >
                          {status === 'not_started' && '시작 전'}
                          {status === 'in_progress' && '진행 중'}
                          {status === 'completed' && '완료'}
                        </Button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSave}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
