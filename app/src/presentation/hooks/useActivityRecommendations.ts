/**
 * Activity Recommendations Hook
 * 활동 추천 React Hook
 */

import { useState, useEffect } from 'react';
import type { ActivityRecommendation } from '../../domain/entities/recommendation';
import type { Area } from '../../domain/value-objects/area';
import type { TrainingType } from '../../domain/value-objects/training-type';
import { RecommendationService } from '../../application/services/recommendation-service';
import { SoulRepository } from '../../infrastructure/repositories/soul.repository';
import { ProgressRepository } from '../../infrastructure/repositories/progress.repository';

// 리포지토리 인스턴스 생성 (실제 구현에서는 DI 컨테이너에서 주입)
const soulRepository = new SoulRepository();
const progressRepository = new ProgressRepository();

const recommendationService = new RecommendationService(
  soulRepository,
  progressRepository
);

/**
 * 주차/월차별 추천 활동 훅
 */
export function useActivityRecommendations(
  trainingType: TrainingType,
  areaId: Area,
  week: number
) {
  const [recommendations, setRecommendations] = useState<ActivityRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = recommendationService.getRecommendationsForWeek(
          trainingType,
          areaId,
          week
        );
        setRecommendations(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [trainingType, areaId, week]);

  return { recommendations, loading, error };
}

/**
 * 영역별 모든 추천 활동 훅
 */
export function useAreaRecommendations(
  trainingType: TrainingType,
  areaId: Area
) {
  const [recommendations, setRecommendations] = useState<ActivityRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = recommendationService.getRecommendationsForArea(
          trainingType,
          areaId
        );
        setRecommendations(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [trainingType, areaId]);

  return { recommendations, loading, error };
}

/**
 * Soul의 현재 진행 상황에 맞는 추천 활동 훅
 */
export function useSoulRecommendations(soulId: string) {
  const [recommendations, setRecommendations] = useState<{
    areaId: Area;
    currentWeek: number;
    recommendations: ActivityRecommendation[];
  }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await recommendationService.getRecommendationsForSoul(soulId);
        setRecommendations(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    if (soulId) {
      fetchRecommendations();
    }
  }, [soulId]);

  return { recommendations, loading, error };
}

/**
 * Soul의 특정 영역에서 다음 추천 활동 훅
 */
export function useNextRecommendedActivity(soulId: string, areaId: Area) {
  const [recommendation, setRecommendation] = useState<ActivityRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchRecommendation = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await recommendationService.getNextRecommendedActivity(
          soulId,
          areaId
        );
        setRecommendation(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    if (soulId && areaId) {
      fetchRecommendation();
    }
  }, [soulId, areaId]);

  return { recommendation, loading, error };
}
