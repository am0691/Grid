/**
 * Progress Calculator Domain Service
 * 진도 계산 로직
 */

import type { AreaProgress, ProgressStatus } from '../entities/progress';
import type { TrainingType } from '../value-objects/training-type';
import { getMaxWeeks } from '../value-objects/training-type';

export class ProgressCalculator {
  /**
   * 전체 진도율 계산 (0-100)
   */
  static calculateOverallProgress(
    areaProgress: AreaProgress[],
    trainingType: TrainingType
  ): number {
    if (areaProgress.length === 0) return 0;

    const maxWeek = getMaxWeeks(trainingType);
    const totalItems = areaProgress.length * maxWeek;

    const completedItems = areaProgress.reduce((sum, area) => {
      return sum + area.items.filter(item => item.status === 'completed').length;
    }, 0);

    return Math.round((completedItems / totalItems) * 100);
  }

  /**
   * 영역별 진도율 계산 (0-100)
   */
  static calculateAreaProgress(areaProgress: AreaProgress): number {
    const totalItems = areaProgress.items.length;
    const completedItems = areaProgress.items.filter(
      item => item.status === 'completed'
    ).length;

    return Math.round((completedItems / totalItems) * 100);
  }

  /**
   * 다음 주차 계산
   */
  static calculateNextWeek(
    currentWeek: number,
    trainingType: TrainingType
  ): number | null {
    const maxWeek = getMaxWeeks(trainingType);
    return currentWeek < maxWeek ? currentWeek + 1 : null;
  }

  /**
   * 진행 상태 확인
   */
  static getProgressStatus(
    week: number,
    currentWeek: number
  ): ProgressStatus {
    if (week < currentWeek) return 'completed';
    if (week === currentWeek) return 'current';
    return 'future';
  }

  /**
   * 지연 주차 계산
   */
  static calculateDelayWeeks(
    startDate: string,
    currentWeek: number,
    trainingType: TrainingType
  ): number {
    const start = new Date(startDate);
    const now = new Date();
    const daysPassed = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    const expectedWeek = trainingType === 'convert'
      ? Math.floor(daysPassed / 7) + 1  // 주 단위
      : Math.floor(daysPassed / 30) + 1; // 월 단위

    return Math.max(0, expectedWeek - currentWeek);
  }
}
