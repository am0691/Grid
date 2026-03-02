/**
 * Relationship Timeline Entity (관계 히스토리 타임라인)
 * 양육 관계의 주요 순간들을 기록
 */

export type MilestoneType =
  | 'first_meeting'         // 첫 만남
  | 'first_bible_study'     // 첫 성경공부
  | 'baptism'               // 세례
  | 'registration'          // 등록
  | 'first_public_prayer'   // 첫 공개 기도
  | 'first_testimony'       // 첫 간증
  | 'crisis_overcome'       // 위기 극복
  | 'breakthrough'          // 영적 돌파
  | 'cell_assignment'       // 셀 편성
  | 'serving_start'         // 섬김 시작
  | 'training_start'        // 양육 시작
  | 'training_complete'     // 양육 수료
  | 'became_trainer'        // 양육자 됨
  | 'custom';               // 사용자 정의

export interface TimelineMilestone {
  id: string;
  soulId: string;

  // 마일스톤 정보
  type: MilestoneType;
  title: string;
  description?: string;

  // 연결된 데이터
  linkedBreakthroughId?: string;  // 연결된 돌파 기록
  linkedActivityPlanId?: string;  // 연결된 활동

  // 미디어
  photoUrl?: string;

  // 메타데이터
  isHighlight: boolean;  // 하이라이트 여부
  tags?: string[];

  occurredAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTimelineMilestoneDto {
  soulId: string;
  type: MilestoneType;
  title: string;
  description?: string;
  linkedBreakthroughId?: string;
  linkedActivityPlanId?: string;
  photoUrl?: string;
  isHighlight?: boolean;
  tags?: string[];
  occurredAt: string;
}

// 마일스톤 메타데이터
export const MILESTONE_TYPES: Record<MilestoneType, {
  name: string;
  emoji: string;
  color: string;
  isAutoDetectable: boolean;  // 자동 감지 가능 여부
  description: string;
}> = {
  first_meeting: {
    name: '첫 만남',
    emoji: '🎉',
    color: '#f97316',
    isAutoDetectable: true,
    description: '처음 만난 날'
  },
  first_bible_study: {
    name: '첫 성경공부',
    emoji: '📖',
    color: '#2563eb',
    isAutoDetectable: true,
    description: '함께 처음 성경을 공부한 날'
  },
  baptism: {
    name: '세례',
    emoji: '💧',
    color: '#0891b2',
    isAutoDetectable: false,
    description: '세례를 받은 날'
  },
  registration: {
    name: '등록',
    emoji: '✍️',
    color: '#6366f1',
    isAutoDetectable: false,
    description: '교회에 정식 등록한 날'
  },
  first_public_prayer: {
    name: '첫 공개 기도',
    emoji: '🙏',
    color: '#7c3aed',
    isAutoDetectable: false,
    description: '처음으로 모임에서 기도한 날'
  },
  first_testimony: {
    name: '첫 간증',
    emoji: '🎤',
    color: '#db2777',
    isAutoDetectable: false,
    description: '처음으로 간증을 나눈 날'
  },
  crisis_overcome: {
    name: '위기 극복',
    emoji: '💪',
    color: '#16a34a',
    isAutoDetectable: true,
    description: '어려운 시기를 함께 이겨낸 날'
  },
  breakthrough: {
    name: '영적 돌파',
    emoji: '✨',
    color: '#eab308',
    isAutoDetectable: true,
    description: '특별한 영적 경험이 있던 날'
  },
  cell_assignment: {
    name: '셀 편성',
    emoji: '👥',
    color: '#14b8a6',
    isAutoDetectable: false,
    description: '셀/소그룹에 배정된 날'
  },
  serving_start: {
    name: '섬김 시작',
    emoji: '🤲',
    color: '#84cc16',
    isAutoDetectable: false,
    description: '교회에서 섬기기 시작한 날'
  },
  training_start: {
    name: '양육 시작',
    emoji: '🌱',
    color: '#22c55e',
    isAutoDetectable: true,
    description: '양육 과정을 시작한 날'
  },
  training_complete: {
    name: '양육 수료',
    emoji: '🎓',
    color: '#0ea5e9',
    isAutoDetectable: true,
    description: '양육 과정을 마친 날'
  },
  became_trainer: {
    name: '양육자 됨',
    emoji: '👨‍🏫',
    color: '#8b5cf6',
    isAutoDetectable: false,
    description: '다른 사람을 양육하기 시작한 날'
  },
  custom: {
    name: '특별한 순간',
    emoji: '📝',
    color: '#6b7280',
    isAutoDetectable: false,
    description: '기록하고 싶은 특별한 순간'
  }
};

// 관계 요약 (타임라인 헤더용)
export interface RelationshipSummary {
  soulId: string;
  soulName: string;
  trainerName: string;

  // 기간
  startDate: string;
  daysTogetherCount: number;

  // 통계
  totalMilestones: number;
  totalBreakthroughs: number;
  totalActivities: number;

  // 하이라이트
  highlightMilestones: TimelineMilestone[];

  // 함께한 것들
  memorizedVerses?: string[];      // 함께 암송한 말씀
  sharedPrayerTopics?: string[];   // 함께 기도한 주제
}

// 타임라인 필터
export interface TimelineFilter {
  soulId: string;
  types?: MilestoneType[];
  dateFrom?: string;
  dateTo?: string;
  highlightsOnly?: boolean;
}

// 1년 전 오늘 (회상 알림용)
export interface AnniversaryReminder {
  soulId: string;
  soulName: string;
  milestone: TimelineMilestone;
  yearsAgo: number;
  message: string;
}

// 자동 마일스톤 생성 규칙
export const AUTO_MILESTONE_RULES = {
  first_meeting: 'Soul 생성 시 자동 생성',
  first_bible_study: '첫 성경공부 활동 완료 시',
  training_start: 'Soul 생성 시 자동 생성',
  training_complete: '모든 영역 100% 완료 시',
  crisis_overcome: '위기 알림이 resolved 될 때',
  breakthrough: '영적 돌파 기록 추가 시'
};
