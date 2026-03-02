/**
 * Encouragement Service (격려 서비스)
 * 자동 격려 메시지 생성
 */

import type { ActivityPlan } from '../entities/activity-plan';
import type { PastoralLog } from '../entities/pastoral-log';
import type { Encouragement, EncouragementType } from '../entities/encouragement';

export interface EncouragementCheckInput {
  trainerId: string;
  souls: Array<{ id: string; name: string; startDate: string }>;
  activities: ActivityPlan[];
  pastoralLogs: PastoralLog[];
}

export class EncouragementService {
  /**
   * 자동 격려 메시지 생성 체크
   */
  checkForEncouragements(input: EncouragementCheckInput): Omit<Encouragement, 'id' | 'createdAt'>[] {
    const encouragements: Omit<Encouragement, 'id' | 'createdAt'>[] = [];

    // 1. 연속 만남 체크 (4주 연속)
    for (const soul of input.souls) {
      const consecutive = this.checkConsecutiveMeetings(soul.id, soul.name, input.activities);
      if (consecutive) encouragements.push(consecutive);
    }

    // 2. 기념일 체크 (100, 200, 365일)
    for (const soul of input.souls) {
      const anniversary = this.checkAnniversary(input.trainerId, soul.id, soul.name, soul.startDate);
      if (anniversary) encouragements.push(anniversary);
    }

    // 3. 최근 돌파 체크 (24시간 이내 hasBreakthrough=true)
    const recentBreakthroughs = input.pastoralLogs.filter(log => {
      if (!log.hasBreakthrough) return false;
      const hoursSince = (Date.now() - new Date(log.createdAt).getTime()) / (1000 * 60 * 60);
      return hoursSince < 24;
    });

    for (const log of recentBreakthroughs) {
      const soul = input.souls.find(s => s.id === log.soulId);
      if (soul) {
        encouragements.push({
          trainerId: input.trainerId,
          type: 'encouragement' as EncouragementType,
          title: '하나님의 일하심',
          message: `${soul.name}님에게 영적 돌파가 있었습니다. 함께 기뻐합니다!`,
          relatedSoulId: soul.id,
          relatedSoulName: soul.name,
          isRead: false,
        });
      }
    }

    // 4. 월간 통계 요약 (매월 1일)
    const statsEncouragement = this.checkMonthlyStats(input);
    if (statsEncouragement) encouragements.push(statsEncouragement);

    return encouragements;
  }

  private checkConsecutiveMeetings(
    soulId: string,
    soulName: string,
    activities: ActivityPlan[]
  ): Omit<Encouragement, 'id' | 'createdAt'> | null {
    const meetings = activities
      .filter(a => a.soulId === soulId && a.type === 'meeting' && a.status === 'completed')
      .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

    const fourWeeksAgo = Date.now() - 28 * 24 * 60 * 60 * 1000;
    const recentMeetings = meetings.filter(m => new Date(m.scheduledAt).getTime() > fourWeeksAgo);

    if (recentMeetings.length >= 4) {
      return {
        trainerId: '',
        type: 'encouragement' as EncouragementType,
        title: '성실한 목자',
        message: `${soulName}님과 4주 연속 만남을 이어가고 있습니다. 수고하셨습니다!`,
        relatedSoulId: soulId,
        relatedSoulName: soulName,
        isRead: false,
      };
    }
    return null;
  }

  private checkAnniversary(
    trainerId: string,
    soulId: string,
    soulName: string,
    startDate: string
  ): Omit<Encouragement, 'id' | 'createdAt'> | null {
    const daysDiff = Math.floor(
      (Date.now() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    const milestones = [100, 200, 365];
    const milestone = milestones.find(m => daysDiff === m);

    if (milestone) {
      const period = milestone === 365 ? '1년' : `${milestone}일`;
      return {
        trainerId,
        type: 'milestone' as EncouragementType,
        title: '특별한 날',
        message: `${soulName}님과 함께한 지 ${period}이 되었습니다!`,
        relatedSoulId: soulId,
        relatedSoulName: soulName,
        isRead: false,
      };
    }
    return null;
  }

  private checkMonthlyStats(
    input: EncouragementCheckInput
  ): Omit<Encouragement, 'id' | 'createdAt'> | null {
    const now = new Date();
    if (now.getDate() !== 1) return null;

    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const lastMonthActivities = input.activities.filter(a => {
      const date = new Date(a.completedAt || a.scheduledAt);
      return date >= lastMonth && date <= lastMonthEnd && a.status === 'completed';
    });

    if (lastMonthActivities.length > 0) {
      return {
        trainerId: input.trainerId,
        type: 'weekly_summary' as EncouragementType,
        title: '지난 달 요약',
        message: `지난 한 달 동안 ${lastMonthActivities.length}개의 활동을 완료하셨습니다. 수고하셨습니다!`,
        isRead: false,
      };
    }
    return null;
  }
}

export const encouragementService = new EncouragementService();
