/**
 * @deprecated This store is deprecated. Use the new Supabase-integrated stores instead:
 * - useSoulStore from '@/store/soulStore'
 * - useProgressStore from '@/store/progressStore'
 * - useActivityPlanStore from '@/store/activityPlanStore'
 *
 * Or use the presentation hooks for better developer experience:
 * - useSouls from '@/presentation/hooks'
 * - useProgress from '@/presentation/hooks'
 * - useActivityPlans from '@/presentation/hooks'
 *
 * See SUPABASE_INTEGRATION.md for migration guide.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Soul,
  AreaProgress,
  TrainingType,
  Area,
  ProgressStatus
} from '@/types';
import {
  createDefaultProgress,
  CONVERT_WEEKS,
  DISCIPLE_MONTHS
} from '@/types';

// 스토어 상태 인터페이스
interface GridState {
  // 데이터
  souls: Soul[];
  progress: Record<string, AreaProgress[]>; // soulId -> progress
  
  // UI 상태
  selectedSoulId: string | null;
  filter: 'all' | 'convert' | 'disciple';
  
  // 액션
  addSoul: (name: string, trainingType: TrainingType, startDate: string) => string;
  updateSoul: (soulId: string, updates: Partial<Soul>) => void;
  deleteSoul: (soulId: string) => void;
  
  // 진도 관리
  toggleCellComplete: (soulId: string, areaId: Area, week: number) => void;
  setCellMemo: (soulId: string, areaId: Area, week: number, memo: string) => void;
  setCurrentWeek: (soulId: string, areaId: Area, week: number) => void;
  
  // UI 액션
  selectSoul: (soulId: string | null) => void;
  setFilter: (filter: 'all' | 'convert' | 'disciple') => void;
  
  // 유틸리티
  getSoulProgress: (soulId: string) => AreaProgress[];
  getOverallProgress: (soulId: string) => number;
  getDelayedAreas: (soulId: string) => { areaId: Area; delayWeeks: number }[];
}

// 고유 ID 생성
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// 현재 날짜 문자열
function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0];
}

// 스토어 생성
export const useGridStore = create<GridState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      souls: [],
      progress: {},
      selectedSoulId: null,
      filter: 'all',

      // 영혼 추가
      addSoul: (name: string, trainingType: TrainingType, startDate: string) => {
        const soulId = generateId();
        const now = new Date().toISOString();
        
        const newSoul: Soul = {
          id: soulId,
          name,
          trainingType,
          startDate,
          createdAt: now,
          updatedAt: now
        };

        const defaultProgress = createDefaultProgress(trainingType);

        set(state => ({
          souls: [...state.souls, newSoul],
          progress: {
            ...state.progress,
            [soulId]: defaultProgress
          }
        }));

        return soulId;
      },

      // 영혼 업데이트
      updateSoul: (soulId: string, updates: Partial<Soul>) => {
        set(state => ({
          souls: state.souls.map(soul => 
            soul.id === soulId 
              ? { ...soul, ...updates, updatedAt: new Date().toISOString() }
              : soul
          )
        }));
      },

      // 영혼 삭제
      deleteSoul: (soulId: string) => {
        set(state => {
          const { [soulId]: _, ...remainingProgress } = state.progress;
          return {
            souls: state.souls.filter(soul => soul.id !== soulId),
            progress: remainingProgress,
            selectedSoulId: state.selectedSoulId === soulId ? null : state.selectedSoulId
          };
        });
      },

      // 셀 완료 토글
      toggleCellComplete: (soulId: string, areaId: Area, week: number) => {
        set(state => {
          const soulProgress = state.progress[soulId] || [];
          const areaProgress = soulProgress.find(p => p.areaId === areaId);
          
          if (!areaProgress) return state;

          const item = areaProgress.items.find(i => i.week === week);
          if (!item) return state;

          const isCompleting = item.status !== 'completed';
          
          // 새로운 아이템 배열 생성
          const newItems = areaProgress.items.map(i => {
            if (i.week === week) {
              return {
                ...i,
                status: (isCompleting ? 'completed' : 'current') as ProgressStatus,
                completedAt: isCompleting ? getCurrentDate() : undefined
              };
            }
            // 완료하는 경우: 다음 주차를 current로 설정
            if (isCompleting && i.week === week + 1) {
              return { ...i, status: 'current' as ProgressStatus };
            }
            return i;
          });

          // currentWeek 업데이트
          const newCurrentWeek = isCompleting 
            ? Math.min(week + 1, areaProgress.items.length)
            : areaProgress.currentWeek;

          const newProgress = soulProgress.map(p => 
            p.areaId === areaId 
              ? { ...p, items: newItems, currentWeek: newCurrentWeek }
              : p
          );

          return {
            progress: {
              ...state.progress,
              [soulId]: newProgress
            }
          };
        });
      },

      // 셀 메모 설정
      setCellMemo: (soulId: string, areaId: Area, week: number, memo: string) => {
        set(state => {
          const soulProgress = state.progress[soulId] || [];
          
          const newProgress = soulProgress.map(p => {
            if (p.areaId !== areaId) return p;
            
            return {
              ...p,
              items: p.items.map(i => 
                i.week === week ? { ...i, memo } : i
              )
            };
          });

          return {
            progress: {
              ...state.progress,
              [soulId]: newProgress
            }
          };
        });
      },

      // 현재 주차 설정
      setCurrentWeek: (soulId: string, areaId: Area, week: number) => {
        set(state => {
          const soulProgress = state.progress[soulId] || [];
          
          const newProgress = soulProgress.map(p => {
            if (p.areaId !== areaId) return p;
            
            return {
              ...p,
              currentWeek: week,
              items: p.items.map(i => ({
                ...i,
                status: (i.week < week ? 'completed' : i.week === week ? 'current' : 'future') as ProgressStatus
              }))
            };
          });

          return {
            progress: {
              ...state.progress,
              [soulId]: newProgress
            }
          };
        });
      },

      // 영혼 선택
      selectSoul: (soulId: string | null) => {
        set({ selectedSoulId: soulId });
      },

      // 필터 설정
      setFilter: (filter: 'all' | 'convert' | 'disciple') => {
        set({ filter });
      },

      // 영혼 진도 가져오기
      getSoulProgress: (soulId: string) => {
        return get().progress[soulId] || [];
      },

      // 전체 진도율 계산
      getOverallProgress: (soulId: string) => {
        const soul = get().souls.find(s => s.id === soulId);
        if (!soul) return 0;

        const soulProgress = get().progress[soulId] || [];
        const maxWeek = soul.trainingType === 'convert' ? CONVERT_WEEKS : DISCIPLE_MONTHS;
        const totalCells = soulProgress.length * maxWeek;
        
        if (totalCells === 0) return 0;

        const completedCells = soulProgress.reduce((sum, area) => {
          return sum + area.items.filter(i => i.status === 'completed').length;
        }, 0);

        return Math.round((completedCells / totalCells) * 100);
      },

      // 지연된 영역 가져오기
      getDelayedAreas: (soulId: string) => {
        const soul = get().souls.find(s => s.id === soulId);
        if (!soul) return [];

        const soulProgress = get().progress[soulId] || [];
        
        // 가장 빠른 진도 찾기
        const fastestWeek = Math.max(...soulProgress.map(p => p.currentWeek));
        
        return soulProgress
          .filter(p => fastestWeek - p.currentWeek >= 2)
          .map(p => ({
            areaId: p.areaId,
            delayWeeks: fastestWeek - p.currentWeek
          }));
      }
    }),
    {
      name: 'grid-storage',
      version: 1
    }
  )
);
