/**
 * useActivityPlans Hook
 * 활동 계획 데이터를 제공하는 훅
 */

import { useEffect, useMemo } from 'react';
import { useActivityPlanStore } from '@/store/activityPlanStore';
import type { CreateActivityPlanDto } from '@/domain/entities/activity-plan';

interface UseActivityPlansOptions {
  soulId: string | null;
  autoFetch?: boolean;
}

export const useActivityPlans = (options: UseActivityPlansOptions) => {
  const { soulId, autoFetch = true } = options;

  const {
    plans,
    isLoading,
    error,
    fetchPlans,
    addPlan,
    updatePlan,
    deletePlan,
    togglePlanComplete,
    getSoulPlans,
    clearError,
  } = useActivityPlanStore();

  // 자동으로 계획 가져오기
  useEffect(() => {
    if (autoFetch && soulId && !plans[soulId] && !isLoading) {
      fetchPlans(soulId).catch((err) => {
        console.error('Failed to fetch plans:', err);
      });
    }
  }, [autoFetch, soulId, plans, isLoading, fetchPlans]);

  // 현재 Soul의 계획
  const soulPlans = useMemo(() => {
    if (!soulId) return [];
    return getSoulPlans(soulId);
  }, [soulId, getSoulPlans]);

  // 완료/미완료로 분류
  const categorizedPlans = useMemo(() => {
    return {
      pending: soulPlans.filter((p) => p.status !== 'completed'),
      completed: soulPlans.filter((p) => p.status === 'completed'),
    };
  }, [soulPlans]);

  // 통계
  const stats = useMemo(() => {
    return {
      total: soulPlans.length,
      completed: soulPlans.filter((p) => p.status === 'completed').length,
      pending: soulPlans.filter((p) => p.status !== 'completed').length,
      completionRate:
        soulPlans.length > 0
          ? Math.round((soulPlans.filter((p) => p.status === 'completed').length / soulPlans.length) * 100)
          : 0,
    };
  }, [soulPlans]);

  // 영역/주차별 계획 찾기
  const getPlansByAreaAndWeek = (areaId: string, week: number) => {
    return soulPlans.filter((p) => p.areaId === areaId && p.week === week);
  };

  return {
    // 데이터
    plans: soulPlans,
    categorizedPlans,
    stats,

    // 상태
    isLoading,
    error,

    // 액션
    fetchPlans: () => (soulId ? fetchPlans(soulId) : Promise.resolve()),
    addPlan: (input: Omit<CreateActivityPlanDto, 'soulId'>) =>
      soulId ? addPlan({ ...input, soulId }) : Promise.resolve(),
    updatePlan,
    deletePlan,
    togglePlanComplete,
    clearError,

    // 유틸리티
    getPlansByAreaAndWeek,
  };
};
