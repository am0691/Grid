/**
 * useSouls Hook
 * Soul 데이터와 필터링 로직을 제공하는 훅
 */

import { useEffect, useMemo } from 'react';
import { useSoulStore } from '@/store/soulStore';

export type SoulFilter = 'all' | 'convert' | 'disciple';

interface UseSoulsOptions {
  filter?: SoulFilter;
  autoFetch?: boolean;
}

export const useSouls = (options: UseSoulsOptions = {}) => {
  const { filter = 'all', autoFetch = true } = options;

  const {
    souls,
    isLoading,
    error,
    selectedSoulId,
    fetchSouls,
    addSoul,
    updateSoul,
    deleteSoul,
    selectSoul,
    getSoulById,
    clearError,
  } = useSoulStore();

  // 자동으로 Souls 가져오기
  useEffect(() => {
    if (autoFetch && souls.length === 0 && !isLoading) {
      fetchSouls().catch((err) => {
        console.error('Failed to fetch souls:', err);
      });
    }
  }, [autoFetch, souls.length, isLoading, fetchSouls]);

  // 필터링된 Souls
  const filteredSouls = useMemo(() => {
    if (filter === 'all') return souls;
    return souls.filter((soul) => soul.trainingType === filter);
  }, [souls, filter]);

  // 선택된 Soul
  const selectedSoul = useMemo(() => {
    if (!selectedSoulId) return null;
    return getSoulById(selectedSoulId);
  }, [selectedSoulId, getSoulById]);

  // 통계
  const stats = useMemo(() => {
    return {
      total: souls.length,
      convert: souls.filter((s) => s.trainingType === 'convert').length,
      disciple: souls.filter((s) => s.trainingType === 'disciple').length,
    };
  }, [souls]);

  return {
    // 데이터
    souls: filteredSouls,
    allSouls: souls,
    selectedSoul,
    stats,

    // 상태
    isLoading,
    error,

    // 액션
    fetchSouls,
    addSoul,
    updateSoul,
    deleteSoul,
    selectSoul,
    getSoulById,
    clearError,
  };
};
