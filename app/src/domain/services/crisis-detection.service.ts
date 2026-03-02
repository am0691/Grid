/**
 * Crisis Detection Service (위기 감지 서비스)
 * 패턴 기반으로 위기 상황 감지
 */

import type { ActivityPlan } from '../entities/activity-plan';
import type { PastoralLog } from '../entities/pastoral-log';
import type { AreaProgress } from '../entities/progress';
import type {
  CrisisAlert,
  CrisisLevel,
  CrisisIndicator,
  CrisisDetectionConfig,
} from '../entities/crisis-alert';
import { DEFAULT_CRISIS_CONFIG, CRISIS_INDICATORS, CRISIS_LEVELS } from '../entities/crisis-alert';

export interface CrisisDetectionInput {
  soulId: string;
  soulName: string;
  activities: ActivityPlan[];
  pastoralLogs: PastoralLog[];
  progress: AreaProgress[];
  config?: Partial<CrisisDetectionConfig>;
}

export interface DetectedCrisis {
  indicator: CrisisIndicator;
  level: CrisisLevel;
  evidence: string[];
}

export class CrisisDetectionService {
  private config: CrisisDetectionConfig;

  constructor(config?: Partial<CrisisDetectionConfig>) {
    this.config = { ...DEFAULT_CRISIS_CONFIG, ...config };
  }

  /**
   * 위기 상황 감지 실행
   */
  detectCrises(input: CrisisDetectionInput): DetectedCrisis[] {
    const crises: DetectedCrisis[] = [];

    // 1. 연속 만남 취소 체크
    const cancellationCrisis = this.checkConsecutiveCancellations(input.activities);
    if (cancellationCrisis) crises.push(cancellationCrisis);

    // 2. 장기 무활동 체크
    const inactivityCrisis = this.checkLongInactivity(input.activities);
    if (inactivityCrisis) crises.push(inactivityCrisis);

    // 3. 평가 점수 급락 체크
    const ratingCrisis = this.checkRatingDrop(input.pastoralLogs);
    if (ratingCrisis) crises.push(ratingCrisis);

    // 4. 영역 회피 체크
    const avoidanceCrisis = this.checkAreaAvoidance(input.progress, input.activities);
    if (avoidanceCrisis) crises.push(avoidanceCrisis);

    // 5. 기분 하락 지속 체크
    const moodCrisis = this.checkMoodDecline(input.pastoralLogs);
    if (moodCrisis) crises.push(moodCrisis);

    // 6. 친밀도 하락 체크
    const closenessCrisis = this.checkClosenessDecline(input.pastoralLogs);
    if (closenessCrisis) crises.push(closenessCrisis);

    // 7. 돌파 없음 체크
    const noBreakthroughCrisis = this.checkNoBreakthrough(input.pastoralLogs);
    if (noBreakthroughCrisis) crises.push(noBreakthroughCrisis);

    return crises;
  }

  /**
   * 위기 알림 생성
   */
  createCrisisAlert(
    soulId: string,
    soulName: string,
    crises: DetectedCrisis[]
  ): Omit<CrisisAlert, 'id' | 'createdAt' | 'updatedAt'> | null {
    if (crises.length === 0) return null;

    // 가장 심각한 위기 찾기
    const levelPriority: CrisisLevel[] = ['critical', 'warning', 'attention'];
    let highestLevel: CrisisLevel = 'attention';

    for (const level of levelPriority) {
      if (crises.some(c => c.level === level)) {
        highestLevel = level;
        break;
      }
    }

    const primaryCrisis = crises.find(c => c.level === highestLevel)!;
    const allIndicators = crises.map(c => c.indicator);
    const allEvidence = crises.flatMap(c => c.evidence);

    const levelInfo = CRISIS_LEVELS[highestLevel];
    const indicatorInfo = CRISIS_INDICATORS[primaryCrisis.indicator];

    return {
      soulId,
      level: highestLevel,
      indicators: allIndicators,
      primaryIndicator: primaryCrisis.indicator,
      title: `${levelInfo.emoji} ${soulName}: ${indicatorInfo.name}`,
      description: indicatorInfo.description,
      evidence: allEvidence,
      recommendedActions: this.getRecommendedActions(highestLevel, allIndicators),
      status: 'active',
      detectedAt: new Date().toISOString()
    };
  }

  private checkConsecutiveCancellations(activities: ActivityPlan[]): DetectedCrisis | null {
    const sorted = [...activities]
      .filter(a => a.type === 'meeting')
      .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

    let consecutiveCancels = 0;
    for (const activity of sorted) {
      if (activity.status === 'cancelled') {
        consecutiveCancels++;
      } else {
        break;
      }
    }

    if (consecutiveCancels >= this.config.consecutiveCancellationsThreshold) {
      return {
        indicator: 'consecutive_cancellations',
        level: consecutiveCancels >= 3 ? 'critical' : 'warning',
        evidence: [`최근 ${consecutiveCancels}회 연속 만남 취소`]
      };
    }
    return null;
  }

  private checkLongInactivity(activities: ActivityPlan[]): DetectedCrisis | null {
    const completed = activities.filter(a => a.status === 'completed');
    if (completed.length === 0) {
      return {
        indicator: 'long_inactivity',
        level: 'warning',
        evidence: ['완료된 활동이 없음']
      };
    }

    const lastActivity = completed.sort(
      (a, b) => new Date(b.completedAt || b.scheduledAt).getTime() -
                new Date(a.completedAt || a.scheduledAt).getTime()
    )[0];

    const daysSince = Math.floor(
      (Date.now() - new Date(lastActivity.completedAt || lastActivity.scheduledAt).getTime()) /
      (1000 * 60 * 60 * 24)
    );

    if (daysSince >= this.config.inactivityDaysThreshold) {
      const level: CrisisLevel = daysSince >= 30 ? 'critical' : 'warning';
      return {
        indicator: 'long_inactivity',
        level,
        evidence: [`마지막 활동 후 ${daysSince}일 경과`]
      };
    }
    return null;
  }

  private checkRatingDrop(logs: PastoralLog[]): DetectedCrisis | null {
    const evaluated = logs
      .filter(l => l.rating != null)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (evaluated.length < 2) return null;

    const recent = evaluated[0].rating!;
    const previous = evaluated.slice(1, 4).map(l => l.rating!);
    const avgPrevious = previous.reduce((a, b) => a + b, 0) / previous.length;

    if (avgPrevious - recent >= this.config.ratingDropThreshold) {
      return {
        indicator: 'rating_drop',
        level: recent <= 2 ? 'warning' : 'attention',
        evidence: [`평가 점수 ${avgPrevious.toFixed(1)}점 → ${recent}점으로 하락`]
      };
    }
    return null;
  }

  private checkAreaAvoidance(progress: AreaProgress[], activities: ActivityPlan[]): DetectedCrisis | null {
    const delayedAreas: string[] = [];

    for (const areaProgress of progress) {
      const areaActivities = activities.filter(
        a => a.areaId === areaProgress.areaId && a.status === 'completed'
      );

      // 다른 영역 대비 활동이 현저히 적으면 회피로 판단
      const avgActivities = activities.filter(a => a.status === 'completed').length / progress.length;

      if (areaActivities.length < avgActivities * 0.3 && areaProgress.currentWeek > 1) {
        delayedAreas.push(areaProgress.areaId);
      }
    }

    if (delayedAreas.length >= this.config.areaAvoidanceThreshold) {
      return {
        indicator: 'area_avoidance',
        level: 'warning',
        evidence: [`회피 영역: ${delayedAreas.join(', ')}`]
      };
    }
    return null;
  }

  private checkMoodDecline(logs: PastoralLog[]): DetectedCrisis | null {
    const recent = logs
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4);

    const strugglingCount = recent.filter(l => l.mood === 'struggling').length;
    const weeksOfStruggling = strugglingCount >= 2 ? strugglingCount : 0;

    if (weeksOfStruggling >= this.config.moodDeclineWeeksThreshold) {
      return {
        indicator: 'mood_decline',
        level: weeksOfStruggling >= 3 ? 'critical' : 'warning',
        evidence: [`최근 ${weeksOfStruggling}주 연속 '위기' 상태`]
      };
    }
    return null;
  }

  private checkClosenessDecline(logs: PastoralLog[]): DetectedCrisis | null {
    const recent = logs
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4);

    if (recent.length < 3) return null;

    let declining = true;
    for (let i = 0; i < recent.length - 1; i++) {
      if (recent[i].closenessLevel >= recent[i + 1].closenessLevel) {
        declining = false;
        break;
      }
    }

    if (declining) {
      return {
        indicator: 'closeness_decline',
        level: 'attention',
        evidence: [`관계 친밀도 ${recent[recent.length - 1].closenessLevel} → ${recent[0].closenessLevel}로 지속 하락`]
      };
    }
    return null;
  }

  private checkNoBreakthrough(logs: PastoralLog[]): DetectedCrisis | null {
    const breakthroughLogs = logs.filter(l => l.hasBreakthrough);

    if (breakthroughLogs.length === 0) {
      return {
        indicator: 'no_breakthrough',
        level: 'attention',
        evidence: ['영적 돌파 기록 없음']
      };
    }

    const latest = breakthroughLogs.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];

    const monthsSince = Math.floor(
      (Date.now() - new Date(latest.createdAt).getTime()) /
      (1000 * 60 * 60 * 24 * 30)
    );

    if (monthsSince >= this.config.noBreakthroughMonthsThreshold) {
      return {
        indicator: 'no_breakthrough',
        level: 'attention',
        evidence: [`마지막 돌파 기록 후 ${monthsSince}개월 경과`]
      };
    }
    return null;
  }

  private getRecommendedActions(level: CrisisLevel, indicators: CrisisIndicator[]): string[] {
    const actions: string[] = [];

    // 레벨별 기본 액션
    if (level === 'critical') {
      actions.push('즉시 전화 또는 방문');
      actions.push('담당 사역자에게 보고');
    } else if (level === 'warning') {
      actions.push('이번 주 내 직접 만남 계획');
    } else {
      actions.push('안부 전화 권장');
    }

    // 지표별 추가 액션
    if (indicators.includes('mood_decline')) {
      actions.push('경청과 공감에 집중');
      actions.push('중보기도 강화');
    }
    if (indicators.includes('area_avoidance')) {
      actions.push('회피 영역에 대한 대화 시도');
      actions.push('두려움이나 상처 확인');
    }
    if (indicators.includes('no_breakthrough')) {
      actions.push('영적 갈망 점검');
      actions.push('새로운 접근 방식 고려');
    }

    return actions;
  }
}

export const crisisDetectionService = new CrisisDetectionService();
