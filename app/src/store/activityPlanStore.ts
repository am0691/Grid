/**
 * Activity Plan Store - Zustand 활동계획 스토어
 * Supabase와 연동하여 활동 계획 관리
 */

import { create } from 'zustand';
import type {
  ActivityPlan,
  CreatePlanInput,
  UpdatePlanInput,
} from '@/infrastructure/repositories/supabase/activity-plan-repository';
import {
  getPlansBySoulId,
  createPlan as createPlanRepo,
  updatePlan as updatePlanRepo,
  deletePlan as deletePlanRepo,
  togglePlanComplete as togglePlanRepo,
} from '@/infrastructure/repositories/supabase/activity-plan-repository';

interface ActivityPlanStore {
  // 상태
  plans: Record<string, ActivityPlan[]>; // soulId -> ActivityPlan[]
  isLoading: boolean;
  error: string | null;

  // 액션
  fetchPlans: (soulId: string) => Promise<void>;
  addPlan: (plan: CreatePlanInput) => Promise<void>;
  updatePlan: (id: string, updates: UpdatePlanInput) => Promise<void>;
  deletePlan: (id: string) => Promise<void>;
  togglePlanComplete: (id: string) => Promise<void>;

  // 유틸리티
  getSoulPlans: (soulId: string) => ActivityPlan[];
  clearError: () => void;
}

export const useActivityPlanStore = create<ActivityPlanStore>((set, get) => ({
  // 초기 상태
  plans: {},
  isLoading: false,
  error: null,

  // Soul의 활동 계획 가져오기
  fetchPlans: async (soulId: string) => {
    set({ isLoading: true, error: null });
    try {
      const plans = await getPlansBySoulId(soulId);
      set((state) => ({
        plans: {
          ...state.plans,
          [soulId]: plans,
        },
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch plans';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // 활동 계획 추가 (Optimistic Update)
  addPlan: async (input: CreatePlanInput) => {
    // Optimistic update: 임시 ID로 즉시 UI 업데이트
    const tempId = `temp-${Date.now()}`;
    const tempPlan: ActivityPlan = {
      id: tempId,
      soulId: input.soulId,
      areaId: input.areaId,
      week: input.week,
      planType: input.planType || 'custom',
      title: input.title,
      description: input.description || null,
      isCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({
      plans: {
        ...state.plans,
        [input.soulId]: [tempPlan, ...(state.plans[input.soulId] || [])],
      },
      isLoading: true,
      error: null,
    }));

    try {
      // 실제 DB에 저장
      const newPlan = await createPlanRepo(input);

      // 임시 Plan을 실제 Plan으로 교체
      set((state) => ({
        plans: {
          ...state.plans,
          [input.soulId]: state.plans[input.soulId].map((p) =>
            p.id === tempId ? newPlan : p
          ),
        },
        isLoading: false,
      }));
    } catch (error) {
      // 실패 시 롤백
      set((state) => ({
        plans: {
          ...state.plans,
          [input.soulId]: state.plans[input.soulId].filter((p) => p.id !== tempId),
        },
        error: error instanceof Error ? error.message : 'Failed to create plan',
        isLoading: false,
      }));
      throw error;
    }
  },

  // 활동 계획 업데이트 (Optimistic Update)
  updatePlan: async (id: string, updates: UpdatePlanInput) => {
    // 해당 Plan이 속한 soulId 찾기
    let soulId: string | null = null;
    const previousPlans = { ...get().plans };

    for (const [sid, plans] of Object.entries(previousPlans)) {
      if (plans.some((p) => p.id === id)) {
        soulId = sid;
        break;
      }
    }

    if (!soulId) {
      throw new Error('Plan not found');
    }

    // Optimistic update
    set((state) => ({
      plans: {
        ...state.plans,
        [soulId!]: state.plans[soulId!].map((p) =>
          p.id === id
            ? { ...p, ...updates, updatedAt: new Date().toISOString() }
            : p
        ),
      },
      isLoading: true,
      error: null,
    }));

    try {
      // 실제 DB 업데이트
      const updatedPlan = await updatePlanRepo(id, updates);

      set((state) => ({
        plans: {
          ...state.plans,
          [soulId!]: state.plans[soulId!].map((p) => (p.id === id ? updatedPlan : p)),
        },
        isLoading: false,
      }));
    } catch (error) {
      // 실패 시 롤백
      set({
        plans: previousPlans,
        error: error instanceof Error ? error.message : 'Failed to update plan',
        isLoading: false,
      });
      throw error;
    }
  },

  // 활동 계획 삭제 (Optimistic Update)
  deletePlan: async (id: string) => {
    // 해당 Plan이 속한 soulId 찾기
    let soulId: string | null = null;
    const previousPlans = { ...get().plans };

    for (const [sid, plans] of Object.entries(previousPlans)) {
      if (plans.some((p) => p.id === id)) {
        soulId = sid;
        break;
      }
    }

    if (!soulId) {
      throw new Error('Plan not found');
    }

    // Optimistic update
    set((state) => ({
      plans: {
        ...state.plans,
        [soulId!]: state.plans[soulId!].filter((p) => p.id !== id),
      },
      isLoading: true,
      error: null,
    }));

    try {
      // 실제 DB 삭제
      await deletePlanRepo(id);
      set({ isLoading: false });
    } catch (error) {
      // 실패 시 롤백
      set({
        plans: previousPlans,
        error: error instanceof Error ? error.message : 'Failed to delete plan',
        isLoading: false,
      });
      throw error;
    }
  },

  // 활동 계획 완료 토글
  togglePlanComplete: async (id: string) => {
    // 해당 Plan이 속한 soulId와 현재 완료 상태 찾기
    let soulId: string | null = null;
    let currentIsCompleted = false;
    const previousPlans = { ...get().plans };

    for (const [sid, plans] of Object.entries(previousPlans)) {
      const plan = plans.find((p) => p.id === id);
      if (plan) {
        soulId = sid;
        currentIsCompleted = plan.isCompleted;
        break;
      }
    }

    if (!soulId) {
      throw new Error('Plan not found');
    }

    // Optimistic update
    set((state) => ({
      plans: {
        ...state.plans,
        [soulId!]: state.plans[soulId!].map((p) =>
          p.id === id
            ? { ...p, isCompleted: !currentIsCompleted, updatedAt: new Date().toISOString() }
            : p
        ),
      },
      isLoading: true,
      error: null,
    }));

    try {
      // 실제 DB 업데이트
      const updatedPlan = await togglePlanRepo(id);

      set((state) => ({
        plans: {
          ...state.plans,
          [soulId!]: state.plans[soulId!].map((p) => (p.id === id ? updatedPlan : p)),
        },
        isLoading: false,
      }));
    } catch (error) {
      // 실패 시 롤백
      set({
        plans: previousPlans,
        error: error instanceof Error ? error.message : 'Failed to toggle plan completion',
        isLoading: false,
      });
      throw error;
    }
  },

  // Soul의 활동 계획 가져오기
  getSoulPlans: (soulId: string) => {
    return get().plans[soulId] || [];
  },

  // 에러 초기화
  clearError: () => {
    set({ error: null });
  },
}));
