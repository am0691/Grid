/**
 * Recommendation Service
 * 활동 추천 서비스
 */

import type { ActivityRecommendation } from '../../domain/entities/recommendation';
import type { Area, ConvertArea, DiscipleArea } from '../../domain/value-objects/area';
import type { TrainingType } from '../../domain/value-objects/training-type';
import {
  CONVERT_RECOMMENDATIONS,
  getConvertRecommendations,
  getConvertAreaRecommendations
} from '../../domain/data/recommendations/convert-recommendations';
import {
  DISCIPLE_RECOMMENDATIONS,
  getDiscipleRecommendations,
  getDiscipleAreaRecommendations
} from '../../domain/data/recommendations/disciple-recommendations';
import type { ISoulRepository, IProgressRepository } from '../ports/repositories';

export interface IRecommendationService {
  /**
   * 특정 훈련 타입, 영역, 주차에 해당하는 추천 활동 조회
   */
  getRecommendationsForWeek(
    trainingType: TrainingType,
    areaId: Area,
    week: number
  ): ActivityRecommendation[];

  /**
   * 특정 영역의 모든 추천 활동 조회
   */
  getRecommendationsForArea(
    trainingType: TrainingType,
    areaId: Area
  ): ActivityRecommendation[];

  /**
   * 특정 Soul의 현재 진행 상황에 맞는 추천 활동 조회
   */
  getRecommendationsForSoul(soulId: string): Promise<{
    areaId: Area;
    currentWeek: number;
    recommendations: ActivityRecommendation[];
  }[]>;

  /**
   * Soul의 특정 영역에서 다음으로 추천할 활동 조회
   */
  getNextRecommendedActivity(
    soulId: string,
    areaId: Area
  ): Promise<ActivityRecommendation | null>;

  /**
   * 모든 추천 활동 조회 (필터링 가능)
   */
  getAllRecommendations(filters?: {
    trainingType?: TrainingType;
    areaId?: Area;
    week?: number;
  }): ActivityRecommendation[];
}

export class RecommendationService implements IRecommendationService {
  private soulRepository: ISoulRepository;
  private progressRepository: IProgressRepository;

  constructor(
    soulRepository: ISoulRepository,
    progressRepository: IProgressRepository
  ) {
    this.soulRepository = soulRepository;
    this.progressRepository = progressRepository;
  }

  getRecommendationsForWeek(
    trainingType: TrainingType,
    areaId: Area,
    week: number
  ): ActivityRecommendation[] {
    if (trainingType === 'convert') {
      return getConvertRecommendations(areaId as ConvertArea, week);
    } else {
      return getDiscipleRecommendations(areaId as DiscipleArea, week);
    }
  }

  getRecommendationsForArea(
    trainingType: TrainingType,
    areaId: Area
  ): ActivityRecommendation[] {
    if (trainingType === 'convert') {
      return getConvertAreaRecommendations(areaId as ConvertArea);
    } else {
      return getDiscipleAreaRecommendations(areaId as DiscipleArea);
    }
  }

  async getRecommendationsForSoul(soulId: string): Promise<{
    areaId: Area;
    currentWeek: number;
    recommendations: ActivityRecommendation[];
  }[]> {
    // Soul 정보 가져오기
    const soul = await this.soulRepository.findById(soulId);
    if (!soul) {
      return [];
    }

    // 진행 상황 가져오기
    const progress = await this.progressRepository.findBySoulId(soulId);
    if (!progress) {
      return [];
    }

    // 각 영역별 현재 주차에 맞는 추천 활동 조회
    return progress.areaProgress.map(areaProgress => ({
      areaId: areaProgress.areaId,
      currentWeek: areaProgress.currentWeek,
      recommendations: this.getRecommendationsForWeek(
        soul.trainingType,
        areaProgress.areaId,
        areaProgress.currentWeek
      )
    }));
  }

  async getNextRecommendedActivity(
    soulId: string,
    areaId: Area
  ): Promise<ActivityRecommendation | null> {
    // Soul 정보 가져오기
    const soul = await this.soulRepository.findById(soulId);
    if (!soul) {
      return null;
    }

    // 진행 상황 가져오기
    const progress = await this.progressRepository.findBySoulId(soulId);
    if (!progress) {
      return null;
    }

    // 해당 영역의 진행 상황 찾기
    const areaProgress = progress.areaProgress.find(ap => ap.areaId === areaId);
    if (!areaProgress) {
      return null;
    }

    // 현재 주차의 추천 활동 중 첫 번째 반환
    const recommendations = this.getRecommendationsForWeek(
      soul.trainingType,
      areaId,
      areaProgress.currentWeek
    );

    return recommendations[0] || null;
  }

  getAllRecommendations(filters?: {
    trainingType?: TrainingType;
    areaId?: Area;
    week?: number;
  }): ActivityRecommendation[] {
    let allRecommendations: ActivityRecommendation[] = [
      ...CONVERT_RECOMMENDATIONS,
      ...DISCIPLE_RECOMMENDATIONS
    ];

    // 필터 적용
    if (filters) {
      if (filters.trainingType) {
        allRecommendations = allRecommendations.filter(
          rec => rec.trainingType === filters.trainingType
        );
      }
      if (filters.areaId) {
        allRecommendations = allRecommendations.filter(
          rec => rec.areaId === filters.areaId
        );
      }
      if (filters.week !== undefined) {
        allRecommendations = allRecommendations.filter(
          rec => rec.week === filters.week
        );
      }
    }

    return allRecommendations;
  }
}
