/**
 * Trend-based Recommendation Service
 * 과거 활동 데이터를 분석하여 맞춤형 활동을 추천
 */

import type { ActivityPlan, ActivityType } from '../../domain/entities/activity-plan';
import type { Area } from '../../domain/value-objects/area';
import type { TrainingType } from '../../domain/value-objects/training-type';
import type { ActivityRecommendation } from '../../domain/entities/recommendation';

export interface TrendAnalysis {
  // 활동 유형별 성공률 (평균 평점 기준)
  typeSuccessRate: Record<ActivityType, number>;
  // 영역별 완료율
  areaCompletionRate: Record<string, number>;
  // 선호하는 활동 유형 (가장 높은 평점을 받은)
  preferredTypes: ActivityType[];
  // 개선이 필요한 영역 (가장 낮은 완료율)
  needsImprovementAreas: Area[];
  // 최근 활동 추세 (증가/감소/유지)
  activityTrend: 'increasing' | 'decreasing' | 'stable';
  // 평균 활동 평점
  averageRating: number;
  // 총 완료된 활동 수
  totalCompleted: number;
}

export interface SmartRecommendation extends ActivityRecommendation {
  confidence: number; // 0-100 추천 신뢰도
  reason: string; // 추천 이유
  basedOn: 'trend' | 'evaluation' | 'progress' | 'static';
}

export interface ITrendRecommendationService {
  /**
   * 과거 활동 데이터를 분석
   */
  analyzeTrends(plans: ActivityPlan[]): TrendAnalysis;

  /**
   * 트렌드 기반 스마트 추천 생성
   */
  getSmartRecommendations(
    soulId: string,
    trainingType: TrainingType,
    currentWeek: number,
    plans: ActivityPlan[],
    staticRecommendations: ActivityRecommendation[]
  ): SmartRecommendation[];

  /**
   * 다음 우선순위 활동 추천
   */
  getNextPriorityActivity(
    trainingType: TrainingType,
    currentWeek: number,
    plans: ActivityPlan[],
    staticRecommendations: ActivityRecommendation[]
  ): SmartRecommendation | null;
}

export class TrendRecommendationService implements ITrendRecommendationService {
  /**
   * 과거 활동 데이터를 분석
   */
  analyzeTrends(plans: ActivityPlan[]): TrendAnalysis {
    const completedPlans = plans.filter((p) => p.status === 'completed');
    const evaluatedPlans = completedPlans.filter((p) => p.evaluation);

    // 활동 유형별 성공률 계산
    const typeSuccessRate = this.calculateTypeSuccessRate(evaluatedPlans);

    // 영역별 완료율 계산
    const areaCompletionRate = this.calculateAreaCompletionRate(plans);

    // 선호하는 활동 유형 (상위 2개)
    const preferredTypes = this.getPreferredTypes(typeSuccessRate);

    // 개선이 필요한 영역 (하위 2개)
    const needsImprovementAreas = this.getNeedsImprovementAreas(areaCompletionRate);

    // 활동 추세 분석
    const activityTrend = this.analyzeActivityTrend(plans);

    // 평균 평점 계산
    const averageRating = this.calculateAverageRating(evaluatedPlans);

    return {
      typeSuccessRate,
      areaCompletionRate,
      preferredTypes,
      needsImprovementAreas,
      activityTrend,
      averageRating,
      totalCompleted: completedPlans.length,
    };
  }

  /**
   * 트렌드 기반 스마트 추천 생성
   */
  getSmartRecommendations(
    _soulId: string,
    trainingType: TrainingType,
    currentWeek: number,
    plans: ActivityPlan[],
    staticRecommendations: ActivityRecommendation[]
  ): SmartRecommendation[] {
    const trends = this.analyzeTrends(plans);
    const recommendations: SmartRecommendation[] = [];

    // 1. 정적 추천에서 시작
    const weekRecommendations = staticRecommendations.filter(
      (r) => r.week === currentWeek
    );

    for (const rec of weekRecommendations) {
      const smartRec = this.enhanceRecommendation(rec, trends, plans);
      recommendations.push(smartRec);
    }

    // 2. 개선이 필요한 영역에 추가 추천
    for (const area of trends.needsImprovementAreas) {
      const existingForArea = recommendations.filter((r) => r.areaId === area);
      if (existingForArea.length < 2) {
        const improvementRec = this.createImprovementRecommendation(
          area,
          currentWeek,
          trainingType,
          trends
        );
        if (improvementRec) {
          recommendations.push(improvementRec);
        }
      }
    }

    // 3. 선호 유형 기반 추가 추천
    if (trends.preferredTypes.length > 0 && recommendations.length < 5) {
      const preferredRec = this.createPreferredTypeRecommendation(
        trends.preferredTypes[0],
        currentWeek,
        trainingType,
        trends
      );
      if (preferredRec) {
        recommendations.push(preferredRec);
      }
    }

    // 신뢰도 기준 정렬
    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * 다음 우선순위 활동 추천
   */
  getNextPriorityActivity(
    trainingType: TrainingType,
    currentWeek: number,
    plans: ActivityPlan[],
    staticRecommendations: ActivityRecommendation[]
  ): SmartRecommendation | null {
    const trends = this.analyzeTrends(plans);

    // 개선 필요 영역이 있으면 해당 영역 우선
    if (trends.needsImprovementAreas.length > 0) {
      const targetArea = trends.needsImprovementAreas[0];
      const areaRec = staticRecommendations.find(
        (r) => r.areaId === targetArea && r.week === currentWeek
      );

      if (areaRec) {
        return {
          ...areaRec,
          confidence: 85,
          reason: `'${targetArea}' 영역의 완료율이 낮아 우선 진행을 권장합니다.`,
          basedOn: 'trend',
        };
      }
    }

    // 가장 높은 평점의 활동 유형 추천
    if (trends.preferredTypes.length > 0) {
      const preferredType = trends.preferredTypes[0];
      return {
        id: `trend-${Date.now()}`,
        trainingType,
        areaId: trends.needsImprovementAreas[0] || ('fellowship' as Area),
        week: currentWeek,
        title: this.getTypeTitle(preferredType),
        description: `과거 데이터 분석 결과, ${this.getTypeLabel(preferredType)} 활동이 가장 효과적이었습니다.`,
        activities: [this.getTypeActivity(preferredType)],
        confidence: 75,
        reason: `${this.getTypeLabel(preferredType)} 활동에서 높은 만족도를 보여왔습니다.`,
        basedOn: 'evaluation',
      };
    }

    // 기본 추천
    const defaultRec = staticRecommendations.find((r) => r.week === currentWeek);
    if (defaultRec) {
      return {
        ...defaultRec,
        confidence: 50,
        reason: '이번 주차의 기본 추천 활동입니다.',
        basedOn: 'static',
      };
    }

    return null;
  }

  // ===== Private Helper Methods =====

  private calculateTypeSuccessRate(
    evaluatedPlans: ActivityPlan[]
  ): Record<ActivityType, number> {
    const rates: Record<ActivityType, number> = {
      meeting: 0,
      call: 0,
      study: 0,
      event: 0,
      prayer: 0,
      other: 0,
    };

    const typeCounts: Record<ActivityType, { sum: number; count: number }> = {
      meeting: { sum: 0, count: 0 },
      call: { sum: 0, count: 0 },
      study: { sum: 0, count: 0 },
      event: { sum: 0, count: 0 },
      prayer: { sum: 0, count: 0 },
      other: { sum: 0, count: 0 },
    };

    for (const plan of evaluatedPlans) {
      if (plan.evaluation) {
        typeCounts[plan.type].sum += plan.evaluation.rating;
        typeCounts[plan.type].count += 1;
      }
    }

    for (const type of Object.keys(typeCounts) as ActivityType[]) {
      if (typeCounts[type].count > 0) {
        rates[type] = typeCounts[type].sum / typeCounts[type].count / 5 * 100;
      }
    }

    return rates;
  }

  private calculateAreaCompletionRate(
    plans: ActivityPlan[]
  ): Record<string, number> {
    const rates: Record<string, number> = {};
    const areaCounts: Record<string, { completed: number; total: number }> = {};

    for (const plan of plans) {
      if (plan.areaId) {
        if (!areaCounts[plan.areaId]) {
          areaCounts[plan.areaId] = { completed: 0, total: 0 };
        }
        areaCounts[plan.areaId].total += 1;
        if (plan.status === 'completed') {
          areaCounts[plan.areaId].completed += 1;
        }
      }
    }

    for (const [area, counts] of Object.entries(areaCounts)) {
      rates[area] = counts.total > 0 ? (counts.completed / counts.total) * 100 : 0;
    }

    return rates;
  }

  private getPreferredTypes(
    typeSuccessRate: Record<ActivityType, number>
  ): ActivityType[] {
    return (Object.entries(typeSuccessRate) as [ActivityType, number][])
      .filter(([_, rate]) => rate > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([type]) => type);
  }

  private getNeedsImprovementAreas(
    areaCompletionRate: Record<string, number>
  ): Area[] {
    return (Object.entries(areaCompletionRate) as [Area, number][])
      .filter(([_, rate]) => rate < 70)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 2)
      .map(([area]) => area);
  }

  private analyzeActivityTrend(
    plans: ActivityPlan[]
  ): 'increasing' | 'decreasing' | 'stable' {
    if (plans.length < 4) return 'stable';

    const sortedByDate = [...plans].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const midPoint = Math.floor(sortedByDate.length / 2);
    const firstHalf = sortedByDate.slice(0, midPoint);
    const secondHalf = sortedByDate.slice(midPoint);

    const firstHalfCompleted = firstHalf.filter(
      (p) => p.status === 'completed'
    ).length;
    const secondHalfCompleted = secondHalf.filter(
      (p) => p.status === 'completed'
    ).length;

    const firstRate = firstHalf.length > 0 ? firstHalfCompleted / firstHalf.length : 0;
    const secondRate = secondHalf.length > 0 ? secondHalfCompleted / secondHalf.length : 0;

    if (secondRate > firstRate + 0.1) return 'increasing';
    if (secondRate < firstRate - 0.1) return 'decreasing';
    return 'stable';
  }

  private calculateAverageRating(evaluatedPlans: ActivityPlan[]): number {
    if (evaluatedPlans.length === 0) return 0;

    const totalRating = evaluatedPlans.reduce(
      (sum, plan) => sum + (plan.evaluation?.rating || 0),
      0
    );

    return totalRating / evaluatedPlans.length;
  }

  private enhanceRecommendation(
    rec: ActivityRecommendation,
    trends: TrendAnalysis,
    plans: ActivityPlan[]
  ): SmartRecommendation {
    let confidence = 60; // 기본 신뢰도
    let reason = '이번 주차의 추천 활동입니다.';

    // 해당 영역이 개선 필요 영역이면 신뢰도 증가
    if (trends.needsImprovementAreas.includes(rec.areaId)) {
      confidence += 20;
      reason = `'${rec.areaId}' 영역 강화를 위해 추천합니다.`;
    }

    // 과거에 비슷한 활동을 성공적으로 완료했다면 신뢰도 증가
    const similarCompleted = plans.filter(
      (p) =>
        p.areaId === rec.areaId &&
        p.status === 'completed' &&
        p.evaluation &&
        p.evaluation.rating >= 4
    ).length;

    if (similarCompleted > 0) {
      confidence += 10;
      reason += ` 과거 유사 활동에서 좋은 평가를 받았습니다.`;
    }

    return {
      ...rec,
      confidence: Math.min(confidence, 100),
      reason,
      basedOn: 'static',
    };
  }

  private createImprovementRecommendation(
    area: Area,
    currentWeek: number,
    trainingType: TrainingType,
    trends: TrendAnalysis
  ): SmartRecommendation | null {
    const completionRate = trends.areaCompletionRate[area] || 0;

    return {
      id: `improvement-${area}-${Date.now()}`,
      trainingType,
      areaId: area,
      week: currentWeek,
      title: `${area} 영역 집중 활동`,
      description: `현재 완료율 ${Math.round(completionRate)}%. 이 영역에 더 집중하면 좋겠습니다.`,
      activities: ['간단한 활동부터 시작하기', '매일 5분씩 투자하기'],
      confidence: 80,
      reason: `완료율이 ${Math.round(completionRate)}%로 낮아 개선이 필요합니다.`,
      basedOn: 'trend',
    };
  }

  private createPreferredTypeRecommendation(
    preferredType: ActivityType,
    currentWeek: number,
    trainingType: TrainingType,
    trends: TrendAnalysis
  ): SmartRecommendation | null {
    return {
      id: `preferred-${preferredType}-${Date.now()}`,
      trainingType,
      areaId: trends.needsImprovementAreas[0] || ('fellowship' as Area),
      week: currentWeek,
      title: this.getTypeTitle(preferredType),
      description: `${this.getTypeLabel(preferredType)} 형태의 활동에서 좋은 성과를 보여왔습니다.`,
      activities: [this.getTypeActivity(preferredType)],
      confidence: 70,
      reason: `${this.getTypeLabel(preferredType)} 활동 선호도가 높습니다.`,
      basedOn: 'evaluation',
    };
  }

  private getTypeLabel(type: ActivityType): string {
    const labels: Record<ActivityType, string> = {
      meeting: '만남/양육',
      call: '전화',
      study: '공부',
      event: '행사',
      prayer: '기도',
      other: '기타',
    };
    return labels[type];
  }

  private getTypeTitle(type: ActivityType): string {
    const titles: Record<ActivityType, string> = {
      meeting: '일대일 만남 시간 갖기',
      call: '격려 전화 드리기',
      study: '함께 성경공부하기',
      event: '교회 행사 함께 참여하기',
      prayer: '중보기도 시간 갖기',
      other: '관계 돌봄 활동',
    };
    return titles[type];
  }

  private getTypeActivity(type: ActivityType): string {
    const activities: Record<ActivityType, string> = {
      meeting: '커피숍에서 30분 대화하기',
      call: '주중 안부 전화하기',
      study: '성경 한 장 함께 읽기',
      event: '주일 예배 함께 참석하기',
      prayer: '기도제목 나누고 함께 기도하기',
      other: '카톡으로 격려 메시지 보내기',
    };
    return activities[type];
  }
}

// 싱글톤 인스턴스
export const trendRecommendationService = new TrendRecommendationService();
