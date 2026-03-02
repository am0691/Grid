/**
 * Soul Store - Zustand 영혼 관리 스토어
 * Supabase와 연동하여 실시간 동기화
 */

import { create } from 'zustand';
import type { Soul } from '@/types';
import type { SoulProfile } from '@/domain/entities/soul';
import {
  getSouls,
  createSoul as createSoulRepo,
  updateSoul as updateSoulRepo,
  deleteSoul as deleteSoulRepo,
} from '@/infrastructure/repositories/supabase';
import { initializeAllProgress } from '@/infrastructure/repositories/supabase/progress-repository';

export interface CreateSoulInput {
  name: string;
  trainingType: 'convert' | 'disciple';
  startDate: string;
  phoneNumber?: string;
  email?: string;
  notes?: string;
  profile?: SoulProfile;
}

export interface UpdateSoulInput {
  name?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  birthDate?: string;
  notes?: string;
  isActive?: boolean;
  profile?: SoulProfile;
}

interface SoulStore {
  // 상태
  souls: Soul[];
  isLoading: boolean;
  error: string | null;
  selectedSoulId: string | null;

  // CRUD 액션
  fetchSouls: () => Promise<void>;
  addSoul: (soul: CreateSoulInput) => Promise<string>;
  updateSoul: (id: string, updates: UpdateSoulInput) => Promise<void>;
  deleteSoul: (id: string) => Promise<void>;

  // 선택 상태
  selectSoul: (id: string | null) => void;

  // 유틸리티
  getSoulById: (id: string) => Soul | undefined;
  clearError: () => void;
}

export const useSoulStore = create<SoulStore>((set, get) => ({
  // 초기 상태
  souls: [],
  isLoading: false,
  error: null,
  selectedSoulId: null,

  // 모든 Souls 가져오기
  fetchSouls: async () => {
    set({ isLoading: true, error: null });
    try {
      const souls = await getSouls();
      set({ souls, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch souls';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Soul 추가 (Optimistic Update)
  addSoul: async (input: CreateSoulInput) => {
    // Optimistic update: 임시 ID로 즉시 UI 업데이트
    const tempId = `temp-${Date.now()}`;
    const tempSoul: Soul = {
      id: tempId,
      name: input.name,
      trainingType: input.trainingType,
      startDate: input.startDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({
      souls: [tempSoul, ...state.souls],
      isLoading: true,
      error: null,
    }));

    try {
      // 실제 DB에 저장
      const newSoul = await createSoulRepo({
        name: input.name,
        trainingType: input.trainingType,
        startDate: input.startDate,
        phoneNumber: input.phoneNumber,
        email: input.email,
        notes: input.notes,
        profile: input.profile,
      });

      // 진도 초기화
      await initializeAllProgress(newSoul.id, newSoul.trainingType);

      // 임시 Soul을 실제 Soul로 교체
      set((state) => ({
        souls: state.souls.map((s) => (s.id === tempId ? newSoul : s)),
        isLoading: false,
      }));

      return newSoul.id;
    } catch (error) {
      // 실패 시 롤백
      set((state) => ({
        souls: state.souls.filter((s) => s.id !== tempId),
        error: error instanceof Error ? error.message : 'Failed to create soul',
        isLoading: false,
      }));
      throw error;
    }
  },

  // Soul 업데이트 (Optimistic Update)
  updateSoul: async (id: string, updates: UpdateSoulInput) => {
    // 이전 상태 저장
    const previousSouls = get().souls;

    // Optimistic update
    set((state) => ({
      souls: state.souls.map((s) =>
        s.id === id
          ? { ...s, ...updates, updatedAt: new Date().toISOString() }
          : s
      ),
      isLoading: true,
      error: null,
    }));

    try {
      // 실제 DB 업데이트
      const updatedSoul = await updateSoulRepo(id, updates);

      set((state) => ({
        souls: state.souls.map((s) => (s.id === id ? updatedSoul : s)),
        isLoading: false,
      }));
    } catch (error) {
      // 실패 시 롤백
      set({
        souls: previousSouls,
        error: error instanceof Error ? error.message : 'Failed to update soul',
        isLoading: false,
      });
      throw error;
    }
  },

  // Soul 삭제 (Optimistic Update)
  deleteSoul: async (id: string) => {
    // 이전 상태 저장
    const previousSouls = get().souls;
    const wasSelected = get().selectedSoulId === id;

    // Optimistic update
    set((state) => ({
      souls: state.souls.filter((s) => s.id !== id),
      selectedSoulId: wasSelected ? null : state.selectedSoulId,
      isLoading: true,
      error: null,
    }));

    try {
      // 실제 DB 삭제
      await deleteSoulRepo(id);
      set({ isLoading: false });
    } catch (error) {
      // 실패 시 롤백
      set({
        souls: previousSouls,
        selectedSoulId: wasSelected ? id : get().selectedSoulId,
        error: error instanceof Error ? error.message : 'Failed to delete soul',
        isLoading: false,
      });
      throw error;
    }
  },

  // Soul 선택
  selectSoul: (id: string | null) => {
    set({ selectedSoulId: id });
  },

  // ID로 Soul 조회
  getSoulById: (id: string) => {
    return get().souls.find((s) => s.id === id);
  },

  // 에러 초기화
  clearError: () => {
    set({ error: null });
  },
}));
