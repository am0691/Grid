/**
 * Progress Store - Zustand 진도 관리 스토어
 * Supabase와 연동하여 실시간 진도 동기화
 */

import { create } from 'zustand';
import type { AreaProgress } from '@/types';
import type { Area } from '@/types';
import {
  getProgressBySoulId,
  toggleProgressComplete as toggleProgressRepo,
  saveProgressMemo as saveProgressMemoRepo,
} from '@/infrastructure/repositories/supabase/progress-repository';

interface ProgressStore {
  // 상태
  progress: Record<string, AreaProgress[]>; // soulId -> AreaProgress[]
  isLoading: boolean;
  error: string | null;

  // 액션
  fetchProgress: (soulId: string) => Promise<void>;
  toggleComplete: (soulId: string, areaId: Area, week: number) => Promise<void>;
  saveMemo: (soulId: string, areaId: Area, week: number, memo: string) => Promise<void>;

  // 유틸리티
  getOverallProgress: (soulId: string) => number;
  getSoulProgress: (soulId: string) => AreaProgress[];
  clearError: () => void;
}

export const useProgressStore = create<ProgressStore>((set, get) => ({
  // 초기 상태
  progress: {},
  isLoading: false,
  error: null,

  // Soul의 진도 가져오기
  fetchProgress: async (soulId: string) => {
    set({ isLoading: true, error: null });
    try {
      const areaProgress = await getProgressBySoulId(soulId);
      set((state) => ({
        progress: {
          ...state.progress,
          [soulId]: areaProgress,
        },
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch progress';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // 진도 완료 토글 (Optimistic Update)
  toggleComplete: async (soulId: string, areaId: Area, week: number) => {
    const previousProgress = get().progress[soulId];

    if (!previousProgress) {
      await get().fetchProgress(soulId);
      return;
    }

    // Optimistic update
    const updatedProgress = previousProgress.map((area) => {
      if (area.areaId !== areaId) return area;

      const item = area.items.find((i) => i.week === week);
      if (!item) return area;

      const isCompleting = item.status !== 'completed';

      return {
        ...area,
        currentWeek: isCompleting ? Math.max(area.currentWeek, week + 1) : area.currentWeek,
        items: area.items.map((i) => {
          if (i.week === week) {
            return {
              ...i,
              status: isCompleting ? 'completed' : 'current',
              completedAt: isCompleting ? new Date().toISOString().split('T')[0] : undefined,
            } as const;
          }
          // 완료하는 경우 다음 주차를 current로
          if (isCompleting && i.week === week + 1) {
            return { ...i, status: 'current' as const };
          }
          return i;
        }),
      };
    });

    set((state) => ({
      progress: {
        ...state.progress,
        [soulId]: updatedProgress,
      },
      isLoading: true,
      error: null,
    }));

    try {
      // 실제 DB 업데이트
      await toggleProgressRepo(soulId, areaId, week);

      // 최신 데이터 다시 가져오기 (서버의 단일 진실 소스)
      await get().fetchProgress(soulId);
    } catch (error) {
      // 실패 시 롤백
      set((state) => ({
        progress: {
          ...state.progress,
          [soulId]: previousProgress,
        },
        error: error instanceof Error ? error.message : 'Failed to toggle progress',
        isLoading: false,
      }));
      throw error;
    }
  },

  // 메모 저장 (Optimistic Update)
  saveMemo: async (soulId: string, areaId: Area, week: number, memo: string) => {
    const previousProgress = get().progress[soulId];

    if (!previousProgress) {
      await get().fetchProgress(soulId);
      return;
    }

    // Optimistic update
    const updatedProgress = previousProgress.map((area) => {
      if (area.areaId !== areaId) return area;

      return {
        ...area,
        items: area.items.map((i) =>
          i.week === week ? { ...i, memo } : i
        ),
      };
    });

    set((state) => ({
      progress: {
        ...state.progress,
        [soulId]: updatedProgress,
      },
      error: null,
    }));

    try {
      // 실제 DB 업데이트
      await saveProgressMemoRepo(soulId, areaId, week, memo);
    } catch (error) {
      // 실패 시 롤백
      set((state) => ({
        progress: {
          ...state.progress,
          [soulId]: previousProgress,
        },
        error: error instanceof Error ? error.message : 'Failed to save memo',
      }));
      throw error;
    }
  },

  // 전체 진도율 계산
  getOverallProgress: (soulId: string) => {
    const soulProgress = get().progress[soulId];
    if (!soulProgress || soulProgress.length === 0) return 0;

    const totalCells = soulProgress.reduce((sum, area) => sum + area.items.length, 0);
    if (totalCells === 0) return 0;

    const completedCells = soulProgress.reduce(
      (sum, area) => sum + area.items.filter((i) => i.status === 'completed').length,
      0
    );

    return Math.round((completedCells / totalCells) * 100);
  },

  // Soul 진도 가져오기
  getSoulProgress: (soulId: string) => {
    return get().progress[soulId] || [];
  },

  // 에러 초기화
  clearError: () => {
    set({ error: null });
  },
}));
