/**
 * SoulGridPage - Training Grid Page
 * Full grid view for a soul's training progress
 * Uses useSoulDetailContext() to get soul information
 */

import { useState, useMemo, useEffect } from 'react';
import { useSoulDetailContext } from '@/presentation/layouts/SoulDetailLayout';
import { useGridStore } from '@/store/gridStore';
import { useActivityPlanStore } from '@/store/activityPlanStore';
import type { Area } from '@/types';
import type { ActivityPlan } from '@/domain/entities/activity-plan';

// Grid components
import { GridTable, GridLegend } from '@/presentation/components/Grid/GridTable';
import { CellDialog } from '@/presentation/components/Grid/CellDialog';
import { ProgressInsightsBar } from '@/presentation/components/Grid/ProgressInsightsBar';

interface CellData {
  soulId: string;
  areaId: Area;
  week: number;
  status: 'completed' | 'current' | 'future';
  memo?: string;
  completedAt?: string;
}

export function SoulGridPage() {
  const { soul, soulId } = useSoulDetailContext();
  const [selectedCell, setSelectedCell] = useState<CellData | null>(null);

  // Stores
  const { getSoulProgress, toggleCellComplete, setCellMemo } = useGridStore();
  const { plans, fetchPlans, togglePlanComplete, addPlan, deletePlan } = useActivityPlanStore();

  // Get progress for this soul
  const progress = getSoulProgress(soulId);

  // Fetch activity plans
  useEffect(() => {
    fetchPlans(soulId);
  }, [soulId, fetchPlans]);

  // Activity plans already aligned with domain model
  const activityPlans = useMemo(() => {
    const soulPlans = plans[soulId] || [];
    return soulPlans as ActivityPlan[];
  }, [plans, soulId]);

  // Get activities for selected cell
  const selectedCellActivities = useMemo(() => {
    if (!selectedCell) return [];
    return activityPlans.filter(
      (p) => p.areaId === selectedCell.areaId && p.week === selectedCell.week
    );
  }, [selectedCell, activityPlans]);

  // Get cell data
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

  // Handlers
  const handleCellClick = (areaId: Area, week: number) => {
    const cellData = getCellData(areaId, week);
    setSelectedCell(cellData);
  };

  const handleCloseDialog = () => {
    setSelectedCell(null);
  };

  const handleToggleCellComplete = () => {
    if (!selectedCell) return;
    toggleCellComplete(selectedCell.soulId, selectedCell.areaId, selectedCell.week);
    setSelectedCell(null);
  };

  const handleSaveMemo = (memo: string) => {
    if (!selectedCell) return;
    setCellMemo(selectedCell.soulId, selectedCell.areaId, selectedCell.week, memo);
  };

  const handleAddActivity = async (title: string, _isRecommended?: boolean) => {
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
      console.error('활동 계획 추가 실패:', error);
      throw error;
    }
  };

  const handleToggleActivityComplete = (activityId: string) => {
    togglePlanComplete(activityId);
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (deletePlan) {
      await deletePlan(activityId);
    }
  };

  const handleEvaluateActivity = async (_activityId: string, _evaluation: any) => {
    // Evaluation is now handled via PastoralLog
    console.warn('Activity evaluation is deprecated. Use PastoralLog instead.');
  };

  return (
    <div className="space-y-6">
      {/* Progress Insights */}
      <ProgressInsightsBar soul={soul} progress={progress} />

      {/* Legend */}
      <GridLegend />

      {/* Grid Table */}
      <GridTable
        soul={soul}
        progress={progress}
        activityPlans={activityPlans}
        onCellClick={handleCellClick}
      />

      {/* Cell Dialog */}
      <CellDialog
        cellData={selectedCell}
        trainingType={soul.trainingType}
        activities={selectedCellActivities}
        allActivities={activityPlans}
        onClose={handleCloseDialog}
        onToggleComplete={handleToggleCellComplete}
        onSaveMemo={handleSaveMemo}
        onAddActivity={handleAddActivity}
        onToggleActivityComplete={handleToggleActivityComplete}
        onDeleteActivity={handleDeleteActivity}
        onEvaluateActivity={handleEvaluateActivity}
      />
    </div>
  );
}
