/**
 * useProgress Hook
 * 진도 데이터와 계산 로직을 제공하는 훅
 */

import { useEffect, useMemo } from 'react';
import { useProgressStore } from '@/store/progressStore';
import type { Area } from '@/types';

interface UseProgressOptions {
  soulId: string | null;
  autoFetch?: boolean;
}

export const useProgress = (options: UseProgressOptions) => {
  const { soulId, autoFetch = true } = options;

  const {
    progress,
    isLoading,
    error,
    fetchProgress,
    toggleComplete,
    saveMemo,
    getOverallProgress,
    getSoulProgress,
    clearError,
  } = useProgressStore();

  // 자동으로 진도 가져오기
  useEffect(() => {
    if (autoFetch && soulId && !progress[soulId] && !isLoading) {
      fetchProgress(soulId).catch((err) => {
        console.error('Failed to fetch progress:', err);
      });
    }
  }, [autoFetch, soulId, progress, isLoading, fetchProgress]);

  // 현재 Soul의 진도
  const soulProgress = useMemo(() => {
    if (!soulId) return [];
    return getSoulProgress(soulId);
  }, [soulId, getSoulProgress]);

  // 전체 진도율
  const overallProgress = useMemo(() => {
    if (!soulId) return 0;
    return getOverallProgress(soulId);
  }, [soulId, getOverallProgress]);

  // 영역별 진도율 계산
  const getAreaProgress = (areaId: Area): number => {
    const area = soulProgress.find((a) => a.areaId === areaId);
    if (!area || area.items.length === 0) return 0;

    const completedItems = area.items.filter((i) => i.status === 'completed').length;
    return Math.round((completedItems / area.items.length) * 100);
  };

  // 지연된 영역 찾기
  const delayedAreas = useMemo(() => {
    if (soulProgress.length === 0) return [];

    const fastestWeek = Math.max(...soulProgress.map((p) => p.currentWeek));

    return soulProgress
      .filter((p) => fastestWeek - p.currentWeek >= 2)
      .map((p) => ({
        areaId: p.areaId,
        delayWeeks: fastestWeek - p.currentWeek,
      }));
  }, [soulProgress]);

  // 다음 할 일 찾기
  const nextTasks = useMemo(() => {
    return soulProgress
      .map((area) => {
        const currentItem = area.items.find((i) => i.status === 'current');
        if (!currentItem) return null;

        return {
          areaId: area.areaId,
          week: currentItem.week,
        };
      })
      .filter((task): task is { areaId: Area; week: number } => task !== null);
  }, [soulProgress]);

  return {
    // 데이터
    soulProgress,
    overallProgress,
    delayedAreas,
    nextTasks,

    // 상태
    isLoading,
    error,

    // 액션
    fetchProgress: () => (soulId ? fetchProgress(soulId) : Promise.resolve()),
    toggleComplete: (areaId: Area, week: number) =>
      soulId ? toggleComplete(soulId, areaId, week) : Promise.resolve(),
    saveMemo: (areaId: Area, week: number, memo: string) =>
      soulId ? saveMemo(soulId, areaId, week, memo) : Promise.resolve(),
    clearError,

    // 유틸리티
    getAreaProgress,
  };
};
