/**
 * SoulCarePage (Pastoral Care Hub)
 * 목양 케어 허브 - 영혼의 영적 상태와 양육 정보를 한눈에
 *
 * Phase 3: 레거시 패널 제거, PastoralLog 중심으로 정리
 */

import { useState, useMemo, useCallback } from 'react';
import { useSoulDetailContext } from '@/presentation/layouts/SoulDetailLayout';
import { PastoralLogList } from '@/presentation/components/PastoralLogList';
import { PastoralLogForm } from '@/presentation/components/PastoralLogForm';
import { CrisisAlertPanel } from '@/presentation/components/CrisisAlertPanel';
import { ReproductionReadinessPanel } from '@/presentation/components/ReproductionReadinessPanel';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { usePastoralLogStore } from '@/store/pastoralLogStore';
import { useActivityPlanStore } from '@/store/activityPlanStore';
import type { CreatePastoralLogDto, PastoralLog } from '@/domain/entities/pastoral-log';

export function SoulCarePage() {
  const { soul, soulId } = useSoulDetailContext();
  const { addLog, fetchLogs } = usePastoralLogStore();
  const plans = useActivityPlanStore((s) => s.plans[soulId] || []);

  // Form dialog state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<PastoralLog | null>(null);

  // Collapsible state for ReproductionReadinessPanel
  const [readinessOpen, setReadinessOpen] = useState(false);

  // Calculate if soul is eligible for reproduction readiness (disciples >6 months)
  const showReproductionReadiness = useMemo(() => {
    if (soul.trainingType !== 'disciple') return false;

    const startDate = new Date(soul.startDate);
    const today = new Date();
    const diffMonths =
      (today.getFullYear() - startDate.getFullYear()) * 12 +
      (today.getMonth() - startDate.getMonth());

    return diffMonths >= 6;
  }, [soul.trainingType, soul.startDate]);

  // Available plans for form selector (incomplete plans only)
  const availablePlans = useMemo(() => {
    return plans
      .filter((p) => p.status !== 'completed' && p.status !== 'cancelled')
      .map((p) => ({ id: p.id, title: p.title, type: p.type }));
  }, [plans]);

  const handleCreateNew = useCallback(() => {
    setEditingLog(null);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((log: PastoralLog) => {
    setEditingLog(log);
    setIsFormOpen(true);
  }, []);

  const handleSubmit = useCallback(async (data: CreatePastoralLogDto) => {
    await addLog(data);
    setIsFormOpen(false);
    setEditingLog(null);
    await fetchLogs(soulId);
  }, [addLog, fetchLogs, soulId]);

  const handleCancel = useCallback(() => {
    setIsFormOpen(false);
    setEditingLog(null);
  }, []);

  return (
    <div className="space-y-6">
      {/* Primary: 목양 일지 (PastoralLog) */}
      <section className="space-y-4">
        <PastoralLogList
          soulId={soulId}
          onCreateNew={handleCreateNew}
          onEdit={handleEdit}
        />
      </section>

      {/* PastoralLog Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLog ? '목양 일지 수정' : '새 목양 일지'}
            </DialogTitle>
          </DialogHeader>
          <PastoralLogForm
            soulId={soulId}
            initialData={editingLog ? {
              activityPlanId: editingLog.activityPlanId,
              mood: editingLog.mood,
              hungerLevel: editingLog.hungerLevel,
              closenessLevel: editingLog.closenessLevel,
              observations: editingLog.observations,
              concerns: editingLog.concerns,
              praises: editingLog.praises,
              prayerNeeds: editingLog.prayerNeeds,
              rating: editingLog.rating,
              evaluationNotes: editingLog.evaluationNotes,
              hasBreakthrough: editingLog.hasBreakthrough,
              breakthroughCategory: editingLog.breakthroughCategory,
              breakthroughTitle: editingLog.breakthroughTitle,
              breakthroughDescription: editingLog.breakthroughDescription,
              bibleReferences: editingLog.bibleReferences,
              nextSteps: editingLog.nextSteps,
              followUpActions: editingLog.followUpActions,
            } : undefined}
            availablePlans={availablePlans}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </DialogContent>
      </Dialog>

      {/* 위기 알림 */}
      <section>
        <CrisisAlertPanel soulId={soulId} soulName={soul.name} />
      </section>

      {/* 재생산 준비도 (conditional - disciples >6 months) */}
      {showReproductionReadiness && (
        <section>
          <Collapsible open={readinessOpen} onOpenChange={setReadinessOpen}>
            <div className="rounded-lg border bg-card">
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-4 h-auto hover:bg-muted/50"
                >
                  <span className="text-base font-medium">재생산 준비도</span>
                  {readinessOpen ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-4 pb-4">
                  <ReproductionReadinessPanel
                    soulId={soulId}
                    soulName={soul.name}
                  />
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        </section>
      )}
    </div>
  );
}
