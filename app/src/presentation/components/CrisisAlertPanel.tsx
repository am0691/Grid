/**
 * Crisis Alert Panel (위기 알림 패널)
 * 위기 상황을 표시하고 관리하는 컴포넌트
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Phone,
  Users,
  MessageCircle,
} from 'lucide-react';
import type { CrisisAlert, CrisisLevel } from '@/domain/services/crisis-detection.service';
import { CRISIS_LEVELS } from '@/domain/services/crisis-detection.service';
import { usePastoralLogStore } from '@/store/pastoralLogStore';
import { useActivityPlanStore } from '@/store/activityPlanStore';
import { CrisisDetectionService } from '@/domain/services/crisis-detection.service';

const CRISIS_STORAGE_KEY = 'grid_crisis_alerts';

function loadCrisisAlerts(): CrisisAlert[] {
  try {
    const stored = localStorage.getItem(CRISIS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCrisisAlerts(alerts: CrisisAlert[]): void {
  localStorage.setItem(CRISIS_STORAGE_KEY, JSON.stringify(alerts));
}

interface CrisisAlertPanelProps {
  soulId?: string;
  soulName?: string;
  showAll?: boolean;
}

export function CrisisAlertPanel({ soulId, soulName = '', showAll = false }: CrisisAlertPanelProps) {
  const [alerts, setAlerts] = useState<CrisisAlert[]>(() => loadCrisisAlerts());
  const [selectedAlert, setSelectedAlert] = useState<CrisisAlert | null>(null);
  const [resolveNotes, setResolveNotes] = useState('');

  const logs = usePastoralLogStore((s) => (soulId ? s.logs[soulId] || [] : []));
  const plans = useActivityPlanStore((s) => (soulId ? s.plans[soulId] || [] : []));

  // Run crisis detection when pastoral logs or plans change
  useEffect(() => {
    if (!soulId) return;

    const service = new CrisisDetectionService();
    const detected = service.detectCrises({
      soulId,
      soulName,
      activities: plans,
      pastoralLogs: logs,
      progress: [],
    });

    if (detected.length === 0) return;

    const alertData = service.createCrisisAlert(soulId, soulName, detected);
    if (!alertData) return;

    setAlerts((prev) => {
      // Only add if there is no existing active/acknowledged alert for this soul
      const hasExisting = prev.some(
        (a) =>
          a.soulId === soulId &&
          (a.status === 'active' || a.status === 'acknowledged')
      );
      if (hasExisting) return prev;

      const newAlert: CrisisAlert = {
        ...alertData,
        id: `crisis-${soulId}-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updated = [newAlert, ...prev];
      saveCrisisAlerts(updated);
      return updated;
    });
  }, [logs, plans, soulId, soulName]);

  const visibleAlerts = soulId
    ? alerts.filter(
        (a) => a.soulId === soulId && (a.status === 'active' || a.status === 'acknowledged')
      )
    : showAll
    ? alerts.filter((a) => a.status === 'active' || a.status === 'acknowledged')
    : [];

  const handleAcknowledge = (alertId: string) => {
    setAlerts((prev) => {
      const updated = prev.map((a) =>
        a.id === alertId
          ? { ...a, status: 'acknowledged' as const, acknowledgedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
          : a
      );
      saveCrisisAlerts(updated);
      return updated;
    });
  };

  const handleResolve = () => {
    if (!selectedAlert) return;
    const id = selectedAlert.id;
    const notes = resolveNotes;
    setAlerts((prev) => {
      const updated = prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: 'resolved' as const,
              resolvedAt: new Date().toISOString(),
              resolvedNotes: notes || undefined,
              updatedAt: new Date().toISOString(),
            }
          : a
      );
      saveCrisisAlerts(updated);
      return updated;
    });
    setSelectedAlert(null);
    setResolveNotes('');
  };

  const handleDismiss = (alertId: string) => {
    setAlerts((prev) => {
      const updated = prev.map((a) =>
        a.id === alertId
          ? { ...a, status: 'dismissed' as const, updatedAt: new Date().toISOString() }
          : a
      );
      saveCrisisAlerts(updated);
      return updated;
    });
  };

  const getLevelIcon = (level: CrisisLevel) => {
    switch (level) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-danger" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      default:
        return <Clock className="h-5 w-5 text-warning" />;
    }
  };

  const getStatusBadge = (status: CrisisAlert['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="destructive">활성</Badge>;
      case 'acknowledged':
        return <Badge variant="secondary">확인됨</Badge>;
      case 'resolved':
        return <Badge className="bg-growth">해결됨</Badge>;
      default:
        return <Badge variant="outline">무시됨</Badge>;
    }
  };

  if (visibleAlerts.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-6">
          <div className="text-center text-muted-foreground">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-growth" />
            <p className="text-sm">활성 위기 알림이 없습니다</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-2 border-danger/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg text-danger">
              <AlertTriangle className="h-5 w-5" />
              위기 알림
              <Badge variant="destructive">{visibleAlerts.length}</Badge>
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent>
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-3">
              {visibleAlerts.map((alert) => {
                const levelInfo = CRISIS_LEVELS[alert.level];
                return (
                  <div
                    key={alert.id}
                    className="p-4 rounded-lg border-2"
                    style={{
                      borderColor: levelInfo.color,
                      backgroundColor: levelInfo.bgColor,
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3">
                        {getLevelIcon(alert.level)}
                        <div>
                          <p className="font-medium">{alert.title}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {alert.description}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(alert.status)}
                    </div>

                    {/* 근거 */}
                    {alert.evidence.length > 0 && (
                      <div className="mt-3 pl-8">
                        <p className="text-xs font-medium text-muted-foreground mb-1">근거:</p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {alert.evidence.map((e, i) => (
                            <li key={i}>• {e}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 권장 조치 */}
                    <div className="mt-3 pl-8">
                      <p className="text-xs font-medium text-muted-foreground mb-1">권장 조치:</p>
                      <ul className="text-xs space-y-1">
                        {alert.recommendedActions.map((action, i) => (
                          <li key={i} className="flex items-center gap-1">
                            {i === 0 && alert.level === 'critical' && (
                              <Phone className="h-3 w-3 text-danger" />
                            )}
                            {i === 0 && alert.level === 'warning' && (
                              <Users className="h-3 w-3 text-warning" />
                            )}
                            {i === 0 && alert.level === 'attention' && (
                              <MessageCircle className="h-3 w-3 text-warning" />
                            )}
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* 액션 버튼 */}
                    <div className="mt-4 pl-8 flex gap-2">
                      {alert.status === 'active' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAcknowledge(alert.id)}
                        >
                          확인
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="default"
                        className="bg-growth hover:bg-growth/90"
                        onClick={() => setSelectedAlert(alert)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        해결
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-muted-foreground"
                        onClick={() => handleDismiss(alert.id)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        무시
                      </Button>
                    </div>

                    {/* 타임스탬프 */}
                    <p className="mt-3 pl-8 text-xs text-muted-foreground">
                      감지: {new Date(alert.detectedAt).toLocaleString('ko-KR')}
                    </p>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* 해결 다이얼로그 */}
      <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>위기 상황 해결</DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              {selectedAlert?.title}
            </p>

            <div className="space-y-2">
              <label className="text-sm font-medium">해결 메모 (선택)</label>
              <Textarea
                placeholder="어떻게 해결되었는지 기록..."
                value={resolveNotes}
                onChange={(e) => setResolveNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedAlert(null)}>
              취소
            </Button>
            <Button onClick={handleResolve} className="bg-growth hover:bg-growth/90">
              해결 완료
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
