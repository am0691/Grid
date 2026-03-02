/**
 * Encouragement Service (격려 서비스)
 * 자동 격려 메시지 및 배지 생성
 */

import type { ActivityPlan } from '../entities/activity-plan';
import type { Breakthrough } from '../entities/pastoral-log';
import type { CrisisAlert } from '../entities/crisis-alert';
import type { TimelineMilestone } from '../entities/relationship-timeline';
import type {
  Encouragement,
  Badge,
  BadgeType,
  TrainerStatistics,
} from '../entities/encouragement';
import { BADGE_METADATA, ENCOURAGEMENT_TEMPLATES } from '../entities/encouragement';

export interface EncouragementCheckInput {
  trainerId: string;
  souls: Array<{ id: string; name: string; startDate: string }>;
  activities: ActivityPlan[];
  breakthroughs: Breakthrough[];
  milestones: TimelineMilestone[];
  crisisAlerts: CrisisAlert[];
  existingBadges: Badge[];
}

export class EncouragementService {
  /**
   * 자동 격려 메시지 생성 체크
   */
  checkForEncouragements(input: EncouragementCheckInput): Omit<Encouragement, 'id' | 'createdAt'>[] {
    const encouragements: Omit<Encouragement, 'id' | 'createdAt'>[] = [];

    // 1. 연속 만남 체크 (주간)
    for (const soul of input.souls) {
      const consecutive = this.checkConsecutiveMeetings(soul.id, soul.name, input.activities);
      if (consecutive) encouragements.push(consecutive);
    }

    // 2. 기념일 체크
    for (const soul of input.souls) {
      const anniversary = this.checkAnniversary(soul.id, soul.name, soul.startDate);
      if (anniversary) encouragements.push(anniversary);
    }

    // 3. 돌파 기록 체크 (최근)
    const recentBreakthroughs = input.breakthroughs.filter(b => {
      const daysSince = (Date.now() - new Date(b.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      return daysSince < 1;  // 24시간 이내
    });

    for (const breakthrough of recentBreakthroughs) {
      const soul = input.souls.find(s => s.id === breakthrough.soulId);
      if (soul) {
        encouragements.push(this.createBreakthroughEncouragement(input.trainerId, soul.name, breakthrough));
      }
    }

    // 4. 위기 해결 체크
    const recentResolved = input.crisisAlerts.filter(c => {
      if (c.status !== 'resolved' || !c.resolvedAt) return false;
      const daysSince = (Date.now() - new Date(c.resolvedAt).getTime()) / (1000 * 60 * 60 * 24);
      return daysSince < 1;
    });

    for (const crisis of recentResolved) {
      const soul = input.souls.find(s => s.id === crisis.soulId);
      if (soul) {
        encouragements.push(this.createCrisisResolvedEncouragement(input.trainerId, soul.name, crisis));
      }
    }

    // 5. 통계 기반 격려 (월간)
    const statsEncouragement = this.checkMonthlyStats(input);
    if (statsEncouragement) encouragements.push(statsEncouragement);

    return encouragements;
  }

  /**
   * 배지 획득 체크
   */
  checkForNewBadges(input: EncouragementCheckInput): Omit<Badge, 'id'>[] {
    const newBadges: Omit<Badge, 'id'>[] = [];
    const existingTypes = new Set(input.existingBadges.map(b => b.type));

    // 1. 첫 영혼
    if (!existingTypes.has('first_soul') && input.souls.length >= 1) {
      newBadges.push(this.createBadge(input.trainerId, 'first_soul', '첫 번째 영혼 등록'));
    }

    // 2. 10명 양육
    if (!existingTypes.has('souls_10') && input.souls.length >= 10) {
      newBadges.push(this.createBadge(input.trainerId, 'souls_10', `${input.souls.length}명 양육 중`));
    }

    // 3. 50명 양육
    if (!existingTypes.has('souls_50') && input.souls.length >= 50) {
      newBadges.push(this.createBadge(input.trainerId, 'souls_50', `${input.souls.length}명 양육 중`));
    }

    // 4. 기도 용사 (기도 활동 30회)
    const prayerActivities = input.activities.filter(a => a.type === 'prayer' && a.status === 'completed');
    if (!existingTypes.has('prayer_warrior') && prayerActivities.length >= 30) {
      newBadges.push(this.createBadge(input.trainerId, 'prayer_warrior', `기도 활동 ${prayerActivities.length}회`));
    }

    // 5. 돌파 증인 (돌파 10회)
    if (!existingTypes.has('breakthrough_witness') && input.breakthroughs.length >= 10) {
      newBadges.push(this.createBadge(input.trainerId, 'breakthrough_witness', `돌파 기록 ${input.breakthroughs.length}회`));
    }

    // 6. 위기 극복자 (3회 해결)
    const resolvedCrises = input.crisisAlerts.filter(c => c.status === 'resolved');
    if (!existingTypes.has('crisis_overcomer') && resolvedCrises.length >= 3) {
      newBadges.push(this.createBadge(input.trainerId, 'crisis_overcomer', `위기 ${resolvedCrises.length}회 해결`));
    }

    // 7. 1년 동행
    const oneYearSouls = input.souls.filter(s => {
      const daysSince = (Date.now() - new Date(s.startDate).getTime()) / (1000 * 60 * 60 * 24);
      return daysSince >= 365;
    });
    if (!existingTypes.has('year_together') && oneYearSouls.length >= 1) {
      newBadges.push(this.createBadge(input.trainerId, 'year_together', `${oneYearSouls[0].name}님과 1년`));
    }

    // 8. 성실한 목자 (30일 연속) - 복잡한 로직, 간략화
    const recentActivities = input.activities
      .filter(a => a.status === 'completed')
      .sort((a, b) => new Date(b.completedAt || b.scheduledAt).getTime() -
                      new Date(a.completedAt || a.scheduledAt).getTime());

    if (!existingTypes.has('faithful_shepherd') && recentActivities.length >= 30) {
      // 간략화: 30개 이상 완료 활동이 있으면 달성
      newBadges.push(this.createBadge(input.trainerId, 'faithful_shepherd', '꾸준한 양육 활동'));
    }

    return newBadges;
  }

  /**
   * 트레이너 통계 계산
   */
  calculateStatistics(input: EncouragementCheckInput): Omit<TrainerStatistics, 'badges'> {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const completedActivities = input.activities.filter(a => a.status === 'completed');
    const meetingsThisMonth = completedActivities.filter(a => {
      const date = new Date(a.completedAt || a.scheduledAt);
      return date >= thisMonth && a.type === 'meeting';
    });

    const ratings = completedActivities
      .filter(a => a.evaluation)
      .map(a => a.evaluation!.rating);
    const averageRating = ratings.length > 0
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : 0;

    // 총 양육 일수 계산
    const totalDays = input.souls.reduce((sum, soul) => {
      const days = (Date.now() - new Date(soul.startDate).getTime()) / (1000 * 60 * 60 * 24);
      return sum + Math.floor(days);
    }, 0);

    return {
      trainerId: input.trainerId,
      totalSouls: input.souls.length,
      activeSouls: input.souls.length, // 활성 상태 필터 필요시 추가
      completedSouls: 0, // 수료 로직 필요시 추가
      totalMeetings: completedActivities.filter(a => a.type === 'meeting').length,
      meetingsThisMonth: meetingsThisMonth.length,
      totalDaysTraining: totalDays,
      totalBreakthroughs: input.breakthroughs.length,
      crisesResolved: input.crisisAlerts.filter(c => c.status === 'resolved').length,
      averageRating: Math.round(averageRating * 10) / 10,
      gratitudeCount: 0, // 감사 메시지 카운트 필요시 추가
      lastUpdated: new Date().toISOString()
    };
  }

  private checkConsecutiveMeetings(
    soulId: string,
    soulName: string,
    activities: ActivityPlan[]
  ): Omit<Encouragement, 'id' | 'createdAt'> | null {
    const meetings = activities
      .filter(a => a.soulId === soulId && a.type === 'meeting' && a.status === 'completed')
      .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

    // 최근 4주 연속 체크
    const fourWeeksAgo = Date.now() - (28 * 24 * 60 * 60 * 1000);
    const recentMeetings = meetings.filter(m => new Date(m.scheduledAt).getTime() > fourWeeksAgo);

    if (recentMeetings.length >= 4) {
      const template = ENCOURAGEMENT_TEMPLATES.consecutive_meetings;
      return {
        trainerId: '', // 호출 시 설정
        type: 'consecutive_meetings',
        title: template.emoji + ' ' + template.titleTemplate,
        message: template.messageTemplate.replace('{soulName}', soulName).replace('{count}', '4'),
        relatedSoulId: soulId,
        relatedSoulName: soulName,
        isRead: false
      };
    }
    return null;
  }

  private checkAnniversary(
    soulId: string,
    soulName: string,
    startDate: string
  ): Omit<Encouragement, 'id' | 'createdAt'> | null {
    const start = new Date(startDate);
    const now = new Date();

    const daysDiff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    // 100일, 200일, 365일 기념일 체크
    const milestones = [100, 200, 365, 730];
    const milestone = milestones.find(m => daysDiff === m);

    if (milestone) {
      const template = ENCOURAGEMENT_TEMPLATES.anniversary;
      const period = milestone === 365 ? '1년' : milestone === 730 ? '2년' : `${milestone}일`;

      return {
        trainerId: '',
        type: 'anniversary',
        title: template.emoji + ' ' + template.titleTemplate,
        message: template.messageTemplate.replace('{soulName}', soulName).replace('{period}', period),
        relatedSoulId: soulId,
        relatedSoulName: soulName,
        isRead: false
      };
    }
    return null;
  }

  private createBreakthroughEncouragement(
    trainerId: string,
    soulName: string,
    breakthrough: Breakthrough
  ): Omit<Encouragement, 'id' | 'createdAt'> {
    const template = ENCOURAGEMENT_TEMPLATES.breakthrough_recorded;
    return {
      trainerId,
      type: 'breakthrough_recorded',
      title: template.emoji + ' ' + template.titleTemplate,
      message: template.messageTemplate
        .replace('{soulName}', soulName)
        .replace('{category}', breakthrough.category),
      relatedSoulId: breakthrough.soulId,
      relatedSoulName: soulName,
      isRead: false
    };
  }

  private createCrisisResolvedEncouragement(
    trainerId: string,
    soulName: string,
    crisis: CrisisAlert
  ): Omit<Encouragement, 'id' | 'createdAt'> {
    const template = ENCOURAGEMENT_TEMPLATES.crisis_resolved;
    return {
      trainerId,
      type: 'crisis_resolved',
      title: template.emoji + ' ' + template.titleTemplate,
      message: template.messageTemplate.replace('{soulName}', soulName),
      relatedSoulId: crisis.soulId,
      relatedSoulName: soulName,
      isRead: false
    };
  }

  private checkMonthlyStats(
    input: EncouragementCheckInput
  ): Omit<Encouragement, 'id' | 'createdAt'> | null {
    const now = new Date();
    // 매월 1일에만 체크
    if (now.getDate() !== 1) return null;

    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const lastMonthActivities = input.activities.filter(a => {
      const date = new Date(a.completedAt || a.scheduledAt);
      return date >= lastMonth && date <= lastMonthEnd && a.status === 'completed';
    });

    if (lastMonthActivities.length > 0) {
      const template = ENCOURAGEMENT_TEMPLATES.statistics_based;
      return {
        trainerId: input.trainerId,
        type: 'statistics_based',
        title: template.emoji + ' ' + template.titleTemplate,
        message: template.messageTemplate
          .replace('{period}', '한 달')
          .replace('{achievement}', `${lastMonthActivities.length}개의 활동을 완료하셨습니다`),
        isRead: false
      };
    }
    return null;
  }

  private createBadge(trainerId: string, type: BadgeType, evidence: string): Omit<Badge, 'id'> {
    const meta = BADGE_METADATA[type];
    return {
      trainerId,
      type,
      title: meta.emoji + ' ' + meta.name,
      description: meta.description,
      evidence,
      earnedAt: new Date().toISOString()
    };
  }
}

export const encouragementService = new EncouragementService();
