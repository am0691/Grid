/**
 * Pastoral Log Store - Zustand 목회 일지 스토어
 * Supabase와 연동하여 목회 일지(PastoralLog) 관리
 */

import { create } from 'zustand';
import type { PastoralLog, CreatePastoralLogDto, UpdatePastoralLogDto } from '@/domain/entities/pastoral-log';
import {
  getPastoralLogsBySoul,
  createPastoralLog as createLogRepo,
  updatePastoralLog as updateLogRepo,
  deletePastoralLog as deleteLogRepo,
} from '@/infrastructure/repositories/supabase/pastoral-log-repository';

interface PastoralLogStore {
  // State
  logs: Record<string, PastoralLog[]>; // soulId -> PastoralLog[]
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchLogs: (soulId: string) => Promise<void>;
  addLog: (input: CreatePastoralLogDto) => Promise<void>;
  updateLog: (id: string, updates: UpdatePastoralLogDto) => Promise<void>;
  deleteLog: (id: string) => Promise<void>;

  // Getters
  getSoulLogs: (soulId: string) => PastoralLog[];
  getLatestLog: (soulId: string) => PastoralLog | null;

  // Utility
  clearError: () => void;
}

export const usePastoralLogStore = create<PastoralLogStore>((set, get) => ({
  // 초기 상태
  logs: {},
  isLoading: false,
  error: null,

  // Soul의 목회 일지 가져오기
  fetchLogs: async (soulId: string) => {
    set({ isLoading: true, error: null });
    try {
      const logs = await getPastoralLogsBySoul(soulId);
      set((state) => ({
        logs: {
          ...state.logs,
          [soulId]: logs,
        },
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch pastoral logs';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // 목회 일지 추가 (Optimistic Update)
  addLog: async (input: CreatePastoralLogDto) => {
    // Optimistic update: 임시 ID로 즉시 UI 업데이트
    const tempId = `temp-log-${Date.now()}`;
    const tempLog: PastoralLog = {
      id: tempId,
      soulId: input.soulId,
      activityPlanId: input.activityPlanId,
      rating: input.rating,
      evaluationNotes: input.evaluationNotes,
      mood: input.mood,
      hungerLevel: input.hungerLevel,
      closenessLevel: input.closenessLevel,
      observations: input.observations,
      concerns: input.concerns,
      praises: input.praises,
      prayerNeeds: input.prayerNeeds,
      hasBreakthrough: input.hasBreakthrough ?? false,
      breakthroughCategory: input.breakthroughCategory,
      breakthroughTitle: input.breakthroughTitle,
      breakthroughDescription: input.breakthroughDescription,
      bibleReferences: input.bibleReferences,
      nextSteps: input.nextSteps,
      followUpActions: input.followUpActions,
      recordedAt: input.recordedAt || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({
      logs: {
        ...state.logs,
        [input.soulId]: [tempLog, ...(state.logs[input.soulId] || [])],
      },
      isLoading: true,
      error: null,
    }));

    try {
      // 실제 DB에 저장
      const newLog = await createLogRepo(input);

      // 임시 Log를 실제 Log로 교체
      set((state) => ({
        logs: {
          ...state.logs,
          [input.soulId]: state.logs[input.soulId].map((l) =>
            l.id === tempId ? newLog : l
          ),
        },
        isLoading: false,
      }));
    } catch (error) {
      // 실패 시 롤백
      set((state) => ({
        logs: {
          ...state.logs,
          [input.soulId]: state.logs[input.soulId].filter((l) => l.id !== tempId),
        },
        error: error instanceof Error ? error.message : 'Failed to create pastoral log',
        isLoading: false,
      }));
      throw error;
    }
  },

  // 목회 일지 업데이트 (Optimistic Update)
  updateLog: async (id: string, updates: UpdatePastoralLogDto) => {
    // 해당 Log가 속한 soulId 찾기
    let soulId: string | null = null;
    const previousLogs = { ...get().logs };

    for (const [sid, logs] of Object.entries(previousLogs)) {
      if (logs.some((l) => l.id === id)) {
        soulId = sid;
        break;
      }
    }

    if (!soulId) {
      throw new Error('Pastoral log not found');
    }

    // Optimistic update
    set((state) => ({
      logs: {
        ...state.logs,
        [soulId!]: state.logs[soulId!].map((l) =>
          l.id === id
            ? { ...l, ...updates, updatedAt: new Date().toISOString() }
            : l
        ),
      },
      isLoading: true,
      error: null,
    }));

    try {
      // 실제 DB 업데이트
      const updatedLog = await updateLogRepo(id, updates);

      set((state) => ({
        logs: {
          ...state.logs,
          [soulId!]: state.logs[soulId!].map((l) => (l.id === id ? updatedLog : l)),
        },
        isLoading: false,
      }));
    } catch (error) {
      // 실패 시 롤백
      set({
        logs: previousLogs,
        error: error instanceof Error ? error.message : 'Failed to update pastoral log',
        isLoading: false,
      });
      throw error;
    }
  },

  // 목회 일지 삭제 (Optimistic Update)
  deleteLog: async (id: string) => {
    // 해당 Log가 속한 soulId 찾기
    let soulId: string | null = null;
    const previousLogs = { ...get().logs };

    for (const [sid, logs] of Object.entries(previousLogs)) {
      if (logs.some((l) => l.id === id)) {
        soulId = sid;
        break;
      }
    }

    if (!soulId) {
      throw new Error('Pastoral log not found');
    }

    // Optimistic update
    set((state) => ({
      logs: {
        ...state.logs,
        [soulId!]: state.logs[soulId!].filter((l) => l.id !== id),
      },
      isLoading: true,
      error: null,
    }));

    try {
      // 실제 DB 삭제
      await deleteLogRepo(id);
      set({ isLoading: false });
    } catch (error) {
      // 실패 시 롤백
      set({
        logs: previousLogs,
        error: error instanceof Error ? error.message : 'Failed to delete pastoral log',
        isLoading: false,
      });
      throw error;
    }
  },

  // Soul의 목회 일지 가져오기
  getSoulLogs: (soulId: string) => {
    return get().logs[soulId] || [];
  },

  // Soul의 최신 목회 일지 가져오기 (이미 recorded_at DESC 정렬된 상태)
  getLatestLog: (soulId: string) => {
    const logs = get().logs[soulId];
    return logs && logs.length > 0 ? logs[0] : null;
  },

  // 에러 초기화
  clearError: () => {
    set({ error: null });
  },
}));
