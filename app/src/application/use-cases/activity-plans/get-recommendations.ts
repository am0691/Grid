/**
 * Get Recommendations Use Case
 * 활동 추천 조회 유스케이스
 */

import type { ActivityRecommendation } from '../../../domain/entities/recommendation';
import type { Area } from '../../../domain/value-objects/area';
import type { TrainingType } from '../../../domain/value-objects/training-type';
import type { IRecommendationService } from '../../services/recommendation-service';

/**
 * 주차별 추천 활동 조회
 */
export class GetRecommendationsForWeekUseCase {
  private recommendationService: IRecommendationService;

  constructor(recommendationService: IRecommendationService) {
    this.recommendationService = recommendationService;
  }

  async execute(
    trainingType: TrainingType,
    areaId: Area,
    week: number
  ): Promise<ActivityRecommendation[]> {
    return this.recommendationService.getRecommendationsForWeek(
      trainingType,
      areaId,
      week
    );
  }
}

/**
 * 영역별 모든 추천 활동 조회
 */
export class GetRecommendationsForAreaUseCase {
  private recommendationService: IRecommendationService;

  constructor(recommendationService: IRecommendationService) {
    this.recommendationService = recommendationService;
  }

  async execute(
    trainingType: TrainingType,
    areaId: Area
  ): Promise<ActivityRecommendation[]> {
    return this.recommendationService.getRecommendationsForArea(
      trainingType,
      areaId
    );
  }
}

/**
 * Soul의 현재 진행 상황에 맞는 추천 활동 조회
 */
export class GetRecommendationsForSoulUseCase {
  private recommendationService: IRecommendationService;

  constructor(recommendationService: IRecommendationService) {
    this.recommendationService = recommendationService;
  }

  async execute(soulId: string): Promise<{
    areaId: Area;
    currentWeek: number;
    recommendations: ActivityRecommendation[];
  }[]> {
    return this.recommendationService.getRecommendationsForSoul(soulId);
  }
}

/**
 * Soul의 특정 영역에서 다음 추천 활동 조회
 */
export class GetNextRecommendedActivityUseCase {
  private recommendationService: IRecommendationService;

  constructor(recommendationService: IRecommendationService) {
    this.recommendationService = recommendationService;
  }

  async execute(
    soulId: string,
    areaId: Area
  ): Promise<ActivityRecommendation | null> {
    return this.recommendationService.getNextRecommendedActivity(
      soulId,
      areaId
    );
  }
}
