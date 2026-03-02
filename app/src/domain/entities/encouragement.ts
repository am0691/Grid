/**
 * Encouragement Entity (감사 & 격려 시스템)
 * 양육자 케어 및 격려
 */

// 격려 유형
export type EncouragementType =
  | 'milestone_reached'      // 마일스톤 달성
  | 'consecutive_meetings'   // 연속 만남
  | 'anniversary'            // 기념일
  | 'breakthrough_recorded'  // 돌파 기록
  | 'mentee_gratitude'       // 멘티 감사
  | 'leader_recognition'     // 리더 인정
  | 'statistics_based'       // 통계 기반
  | 'crisis_resolved';       // 위기 해결

// 배지 유형
export type BadgeType =
  | 'first_soul'             // 첫 영혼 양육
  | 'faithful_shepherd'      // 성실한 목자 (30일 연속)
  | 'prayer_warrior'         // 기도 용사 (기도 활동 30회)
  | 'breakthrough_witness'   // 돌파 증인 (돌파 10회 기록)
  | 'crisis_overcomer'       // 위기 극복자 (위기 3회 해결)
  | 'multiplication'         // 재생산 (멘티가 양육자 됨)
  | 'year_together'          // 1년 함께
  | 'souls_10'               // 10명 양육
  | 'souls_50'               // 50명 양육
  | 'master_trainer';        // 마스터 양육자

export interface Encouragement {
  id: string;
  trainerId: string;       // 받는 사람
  fromUserId?: string;     // 보내는 사람 (시스템이면 null)

  // 내용
  type: EncouragementType;
  title: string;
  message: string;

  // 연관 데이터
  relatedSoulId?: string;
  relatedSoulName?: string;
  relatedData?: Record<string, unknown>;

  // 상태
  isRead: boolean;
  readAt?: string;

  createdAt: string;
}

export interface Badge {
  id: string;
  trainerId: string;

  type: BadgeType;
  earnedAt: string;

  // 상세
  title: string;
  description: string;
  evidence?: string;  // 달성 근거
}

// 멘티가 보내는 감사 메시지
export interface GratitudeMessage {
  id: string;
  fromSoulId: string;
  fromSoulName: string;
  toTrainerId: string;

  message: string;
  memorableMoment?: string;  // 가장 기억에 남는 순간

  isAnonymous: boolean;
  createdAt: string;
}

// 트레이너 통계
export interface TrainerStatistics {
  trainerId: string;

  // 활동 통계
  totalSouls: number;
  activeSouls: number;
  completedSouls: number;  // 양육 수료

  // 기간 통계
  totalMeetings: number;
  meetingsThisMonth: number;
  totalDaysTraining: number;

  // 성과 통계
  totalBreakthroughs: number;
  crisesResolved: number;
  averageRating: number;

  // 배지
  badges: Badge[];

  // 감사 메시지
  gratitudeCount: number;

  lastUpdated: string;
}

// 격려 메시지 템플릿
export const ENCOURAGEMENT_TEMPLATES: Record<EncouragementType, {
  titleTemplate: string;
  messageTemplate: string;
  emoji: string;
}> = {
  milestone_reached: {
    titleTemplate: '축하합니다!',
    messageTemplate: '{soulName}님과 함께 {milestone}을 달성했습니다!',
    emoji: '🎉'
  },
  consecutive_meetings: {
    titleTemplate: '성실한 목자',
    messageTemplate: '{soulName}님과 {count}주 연속 만남을 이어가고 있습니다. 수고하셨습니다!',
    emoji: '🌟'
  },
  anniversary: {
    titleTemplate: '특별한 날',
    messageTemplate: '{soulName}님과 함께한 지 {period}이 되었습니다!',
    emoji: '🎂'
  },
  breakthrough_recorded: {
    titleTemplate: '하나님의 일하심',
    messageTemplate: '{soulName}님에게 {category} 돌파가 있었습니다. 함께 기뻐합니다!',
    emoji: '✨'
  },
  mentee_gratitude: {
    titleTemplate: '감사 메시지',
    messageTemplate: '{soulName}님이 감사 메시지를 보냈습니다.',
    emoji: '💝'
  },
  leader_recognition: {
    titleTemplate: '리더의 격려',
    messageTemplate: '{leaderName}님이 당신의 사역을 격려합니다.',
    emoji: '👏'
  },
  statistics_based: {
    titleTemplate: '멋진 성과',
    messageTemplate: '지난 {period} 동안 {achievement}. 수고하셨습니다!',
    emoji: '📊'
  },
  crisis_resolved: {
    titleTemplate: '위기 극복',
    messageTemplate: '{soulName}님의 위기를 함께 이겨내셨습니다. 좋은 목자입니다!',
    emoji: '💪'
  }
};

// 배지 메타데이터
export const BADGE_METADATA: Record<BadgeType, {
  name: string;
  description: string;
  emoji: string;
  color: string;
  criteria: string;
}> = {
  first_soul: {
    name: '첫 열매',
    description: '첫 번째 영혼을 양육 시작',
    emoji: '🌱',
    color: '#22c55e',
    criteria: '첫 Soul 등록'
  },
  faithful_shepherd: {
    name: '성실한 목자',
    description: '30일 연속 양육 활동',
    emoji: '🐑',
    color: '#3b82f6',
    criteria: '30일 연속 활동 기록'
  },
  prayer_warrior: {
    name: '기도 용사',
    description: '기도 활동 30회 달성',
    emoji: '🙏',
    color: '#8b5cf6',
    criteria: '기도 타입 활동 30회'
  },
  breakthrough_witness: {
    name: '돌파 증인',
    description: '영적 돌파 10회 기록',
    emoji: '✨',
    color: '#f59e0b',
    criteria: '돌파 기록 10회'
  },
  crisis_overcomer: {
    name: '위기 극복자',
    description: '위기 상황 3회 성공적 해결',
    emoji: '💪',
    color: '#ef4444',
    criteria: '위기 알림 3회 resolved'
  },
  multiplication: {
    name: '재생산',
    description: '양육한 영혼이 양육자가 됨',
    emoji: '🌳',
    color: '#10b981',
    criteria: '멘티가 Trainer로 전환'
  },
  year_together: {
    name: '1년 동행',
    description: '한 영혼과 1년 이상 동행',
    emoji: '🎂',
    color: '#ec4899',
    criteria: '양육 시작 후 365일'
  },
  souls_10: {
    name: '10명의 목자',
    description: '10명 이상 양육',
    emoji: '👥',
    color: '#06b6d4',
    criteria: '총 Soul 수 10명'
  },
  souls_50: {
    name: '50명의 목자',
    description: '50명 이상 양육',
    emoji: '🏆',
    color: '#f97316',
    criteria: '총 Soul 수 50명'
  },
  master_trainer: {
    name: '마스터 양육자',
    description: '모든 배지 획득',
    emoji: '👑',
    color: '#eab308',
    criteria: '모든 배지 보유'
  }
};

export interface CreateEncouragementDto {
  trainerId: string;
  fromUserId?: string;
  type: EncouragementType;
  title: string;
  message: string;
  relatedSoulId?: string;
  relatedSoulName?: string;
}

export interface CreateGratitudeMessageDto {
  fromSoulId: string;
  fromSoulName: string;
  toTrainerId: string;
  message: string;
  memorableMoment?: string;
  isAnonymous?: boolean;
}
