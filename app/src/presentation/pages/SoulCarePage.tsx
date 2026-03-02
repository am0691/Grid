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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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

    </div>
  );
}
