/**
 * Crisis Alert Entity (위기 감지 알림)
 * 패턴 기반 위기 감지 및 알림
 */

export type CrisisLevel = 'attention' | 'warning' | 'critical';  // 관심 / 주의 / 위기

export type CrisisIndicator =
  | 'consecutive_cancellations'    // 연속 만남 취소
  | 'long_inactivity'              // 장기 무활동
  | 'rating_drop'                  // 평가 점수 급락
  | 'area_avoidance'               // 특정 영역 회피
  | 'mood_decline'                 // 기분 하락 지속
  | 'closeness_decline'            // 친밀도 하락
  | 'no_breakthrough'              // 오랜 기간 돌파 없음
  | 'missed_milestones'            // 마일스톤 놓침
  | 'communication_pattern';       // 연락 회피 패턴

export interface CrisisAlert {
  id: string;
  soulId: string;

  // 위기 정보
  level: CrisisLevel;
  indicators: CrisisIndicator[];
  primaryIndicator: CrisisIndicator;

  // 상세
  title: string;
  description: string;
  evidence: string[];  // 근거 데이터

  // 권장 조치
  recommendedActions: string[];

  // 상태
  status: 'active' | 'acknowledged' | 'resolved' | 'dismissed';
  acknowledgedAt?: string;
  resolvedAt?: string;
  resolvedNotes?: string;

  // 타임스탬프
  detectedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCrisisAlertDto {
  soulId: string;
  level: CrisisLevel;
  indicators: CrisisIndicator[];
  primaryIndicator: CrisisIndicator;
  title: string;
  description: string;
  evidence: string[];
  recommendedActions: string[];
}

// 위기 레벨 메타데이터
export const CRISIS_LEVELS: Record<CrisisLevel, {
  name: string;
  emoji: string;
  color: string;
  bgColor: string;
  action: string;
}> = {
  attention: {
    name: '관심 필요',
    emoji: '🟡',
    color: '#ca8a04',
    bgColor: '#fef9c3',
    action: '전화 한번 권장'
  },
  warning: {
    name: '주의',
    emoji: '🟠',
    color: '#ea580c',
    bgColor: '#ffedd5',
    action: '직접 만남 권장'
  },
  critical: {
    name: '위기',
    emoji: '🔴',
    color: '#dc2626',
    bgColor: '#fee2e2',
    action: '즉시 연락 + 담당 사역자 보고'
  }
};

// 위기 지표 메타데이터
export const CRISIS_INDICATORS: Record<CrisisIndicator, {
  name: string;
  description: string;
  threshold: string;
}> = {
  consecutive_cancellations: {
    name: '연속 만남 취소',
    description: '연속으로 만남이 취소됨',
    threshold: '2회 이상 연속'
  },
  long_inactivity: {
    name: '장기 무활동',
    description: '활동 기록이 없음',
    threshold: '3주 이상'
  },
  rating_drop: {
    name: '평가 점수 급락',
    description: '활동 평가 점수가 급격히 하락',
    threshold: '4점→2점 이하'
  },
  area_avoidance: {
    name: '영역 회피',
    description: '특정 영역을 계속 건너뜀',
    threshold: '3회 이상 회피'
  },
  mood_decline: {
    name: '기분 하락 지속',
    description: '영혼의 온도가 지속적으로 낮음',
    threshold: '2주 이상 위기 상태'
  },
  closeness_decline: {
    name: '친밀도 하락',
    description: '관계 친밀도가 하락 추세',
    threshold: '3회 연속 하락'
  },
  no_breakthrough: {
    name: '돌파 없음',
    description: '영적 돌파 기록이 없음',
    threshold: '2개월 이상'
  },
  missed_milestones: {
    name: '마일스톤 놓침',
    description: '예상 마일스톤을 달성하지 못함',
    threshold: '2개 이상 지연'
  },
  communication_pattern: {
    name: '연락 회피',
    description: '"다음에 연락드릴게요" 패턴',
    threshold: '3회 이상'
  }
};

// 위기 감지 설정
export interface CrisisDetectionConfig {
  consecutiveCancellationsThreshold: number;  // 기본 2
  inactivityDaysThreshold: number;            // 기본 21
  ratingDropThreshold: number;                // 기본 2 (4점에서 2점 이상 하락)
  areaAvoidanceThreshold: number;             // 기본 3
  moodDeclineWeeksThreshold: number;          // 기본 2
  closenessDeclineThreshold: number;          // 기본 3
  noBreakthroughMonthsThreshold: number;      // 기본 2
  missedMilestonesThreshold: number;          // 기본 2
}

export const DEFAULT_CRISIS_CONFIG: CrisisDetectionConfig = {
  consecutiveCancellationsThreshold: 2,
  inactivityDaysThreshold: 21,
  ratingDropThreshold: 2,
  areaAvoidanceThreshold: 3,
  moodDeclineWeeksThreshold: 2,
  closenessDeclineThreshold: 3,
  noBreakthroughMonthsThreshold: 2,
  missedMilestonesThreshold: 2
};
