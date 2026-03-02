/**
 * Pastoral Log Entity (목회 일지)
 * ActivityEvaluation + SpiritualState + Breakthrough를 하나의 기록으로 통합
 *
 * NOTE: This is the canonical source for SpiritualMood, BreakthroughCategory,
 * BibleReference, and related types. spiritual-state.ts and breakthrough.ts
 * now re-export from here for backwards compatibility.
 */

// ─── SpiritualState 타입 (spiritual-state.ts에서 이동) ─────────────────────

export type SpiritualMood = 'growing' | 'stable' | 'struggling';  // 성장중 / 정체기 / 위기

export type SpiritualHungerLevel = 1 | 2 | 3 | 4 | 5;  // 영적 갈급함 레벨

export interface SpiritualState {
  id: string;
  soulId: string;
  activityPlanId?: string;  // 연관된 활동 (선택)

  // 핵심 지표
  mood: SpiritualMood;
  hungerLevel: SpiritualHungerLevel;
  closenessLevel: 1 | 2 | 3 | 4 | 5;  // 관계 친밀도

  // 상세 기록
  observations?: string;  // 관찰 내용
  concerns?: string;      // 우려 사항
  praises?: string;       // 감사/칭찬할 점
  prayerNeeds?: string;   // 기도 필요 사항

  recordedAt: string;     // 기록 일시
  createdAt: string;
}

export interface CreateSpiritualStateDto {
  soulId: string;
  activityPlanId?: string;
  mood: SpiritualMood;
  hungerLevel: SpiritualHungerLevel;
  closenessLevel: 1 | 2 | 3 | 4 | 5;
  observations?: string;
  concerns?: string;
  praises?: string;
  prayerNeeds?: string;
}

// 영혼 온도 요약 (대시보드용)
export interface SoulTemperatureSummary {
  soulId: string;
  soulName: string;
  currentMood: SpiritualMood;
  moodTrend: 'improving' | 'stable' | 'declining';
  averageHunger: number;
  averageCloseness: number;
  lastRecordedAt: string;
  consecutiveStrugglingDays: number;  // 연속 위기 일수
  needsAttention: boolean;
}

// 상태 변화 추적
export interface SpiritualStateTrend {
  soulId: string;
  period: 'week' | 'month' | 'quarter';
  moodHistory: Array<{ date: string; mood: SpiritualMood }>;
  hungerHistory: Array<{ date: string; level: number }>;
  closenessHistory: Array<{ date: string; level: number }>;
  overallTrend: 'improving' | 'stable' | 'declining';
}

// 무드 레이블
export const MOOD_LABELS: Record<SpiritualMood, string> = {
  growing: '😊 성장중',
  stable: '😐 정체기',
  struggling: '😟 위기'
};

export const MOOD_COLORS: Record<SpiritualMood, string> = {
  growing: '#16a34a',   // green
  stable: '#ca8a04',    // yellow
  struggling: '#dc2626' // red
};

// ─── Breakthrough 타입 (breakthrough.ts에서 이동) ──────────────────────────

export type BreakthroughCategory =
  | 'repentance'    // 회개
  | 'decision'      // 결단
  | 'insight'       // 깨달음
  | 'healing'       // 치유
  | 'liberation'    // 해방
  | 'gift'          // 은사 발현
  | 'encounter'     // 하나님 만남
  | 'answered'      // 기도 응답
  | 'other';        // 기타

export interface BibleReference {
  book: string;       // 성경 책명
  chapter: number;    // 장
  verse: string;      // 절 (범위 가능: "1-5")
  text?: string;      // 말씀 본문 (선택)
}

export interface Breakthrough {
  id: string;
  soulId: string;
  activityPlanId?: string;  // 연관된 활동 (선택)

  // 핵심 내용
  category: BreakthroughCategory;
  title: string;            // 한줄 요약
  description: string;      // 상세 내용

  // 말씀 연결
  bibleReferences?: BibleReference[];

  // 메타데이터
  significance: 1 | 2 | 3 | 4 | 5;  // 중요도
  isPrivate: boolean;               // 개인적 기록 여부
  tags?: string[];                  // 태그

  // 후속 조치
  followUpActions?: string[];       // 다짐/실천 사항

  occurredAt: string;    // 발생 일시
  createdAt: string;
  updatedAt: string;
}

export interface CreateBreakthroughDto {
  soulId: string;
  activityPlanId?: string;
  category: BreakthroughCategory;
  title: string;
  description: string;
  bibleReferences?: BibleReference[];
  significance?: 1 | 2 | 3 | 4 | 5;
  isPrivate?: boolean;
  tags?: string[];
  followUpActions?: string[];
  occurredAt?: string;
}

// 카테고리 메타데이터
export const BREAKTHROUGH_CATEGORIES: Record<BreakthroughCategory, {
  name: string;
  emoji: string;
  color: string;
  description: string;
}> = {
  repentance: {
    name: '회개',
    emoji: '🙏',
    color: '#7c3aed',
    description: '죄를 깨닫고 돌이킴'
  },
  decision: {
    name: '결단',
    emoji: '💪',
    color: '#2563eb',
    description: '중요한 신앙적 결단'
  },
  insight: {
    name: '깨달음',
    emoji: '💡',
    color: '#ca8a04',
    description: '말씀이나 진리에 대한 새로운 이해'
  },
  healing: {
    name: '치유',
    emoji: '❤️‍🩹',
    color: '#16a34a',
    description: '마음/관계/몸의 치유'
  },
  liberation: {
    name: '해방',
    emoji: '🕊️',
    color: '#0891b2',
    description: '속박에서 자유함'
  },
  gift: {
    name: '은사 발현',
    emoji: '✨',
    color: '#db2777',
    description: '성령의 은사가 나타남'
  },
  encounter: {
    name: '하나님 만남',
    emoji: '👑',
    color: '#9333ea',
    description: '특별한 하나님 임재 경험'
  },
  answered: {
    name: '기도 응답',
    emoji: '🎉',
    color: '#059669',
    description: '기도가 응답됨'
  },
  other: {
    name: '기타',
    emoji: '📝',
    color: '#6b7280',
    description: '기타 영적 경험'
  }
};

// 타임라인 뷰용
export interface BreakthroughTimelineItem {
  id: string;
  soulId: string;
  soulName: string;
  category: BreakthroughCategory;
  title: string;
  occurredAt: string;
  significance: number;
}

// ─── 핵심 엔티티 ──────────────────────────────────────────

export interface PastoralLog {
  id: string;
  soulId: string;
  activityPlanId?: string;  // 활동 계획 1:1 연결 (선택)

  // 활동 평가 (ActivityEvaluation 에서 통합)
  rating?: 1 | 2 | 3 | 4 | 5;
  evaluationNotes?: string;          // max 2000

  // 영적 상태 (SpiritualState 에서 통합) — 필수 섹션
  mood: SpiritualMood;
  hungerLevel: 1 | 2 | 3 | 4 | 5;   // 영적 갈급함
  closenessLevel: 1 | 2 | 3 | 4 | 5; // 관계 친밀도
  observations?: string;             // 관찰 내용, max 2000
  concerns?: string;                 // 우려 사항, max 2000
  praises?: string;                  // 감사/칭찬할 점, max 2000
  prayerNeeds?: string;              // 기도 필요 사항, max 2000

  // 영적 돌파 (Breakthrough 에서 통합) — 선택 섹션
  hasBreakthrough: boolean;
  breakthroughCategory?: BreakthroughCategory;
  breakthroughTitle?: string;        // max 200
  breakthroughDescription?: string;  // max 5000
  bibleReferences?: BibleReference[];

  // 다음 단계
  nextSteps?: string;                // max 2000
  followUpActions?: string[];

  // 타임스탬프
  recordedAt: string;     // 기록 일시
  createdAt: string;
  updatedAt: string;
}

// ─── DTO ──────────────────────────────────────────────────

export interface CreatePastoralLogDto {
  soulId: string;
  activityPlanId?: string;

  // 활동 평가 (선택)
  rating?: 1 | 2 | 3 | 4 | 5;
  evaluationNotes?: string;

  // 영적 상태 (필수)
  mood: SpiritualMood;
  hungerLevel: 1 | 2 | 3 | 4 | 5;
  closenessLevel: 1 | 2 | 3 | 4 | 5;
  observations?: string;
  concerns?: string;
  praises?: string;
  prayerNeeds?: string;

  // 영적 돌파 (선택)
  hasBreakthrough?: boolean;
  breakthroughCategory?: BreakthroughCategory;
  breakthroughTitle?: string;
  breakthroughDescription?: string;
  bibleReferences?: BibleReference[];

  // 다음 단계 (선택)
  nextSteps?: string;
  followUpActions?: string[];

  // 기록 일시 (미입력 시 현재 시각)
  recordedAt?: string;
}

export interface UpdatePastoralLogDto {
  activityPlanId?: string;

  // 활동 평가
  rating?: 1 | 2 | 3 | 4 | 5;
  evaluationNotes?: string;

  // 영적 상태
  mood?: SpiritualMood;
  hungerLevel?: 1 | 2 | 3 | 4 | 5;
  closenessLevel?: 1 | 2 | 3 | 4 | 5;
  observations?: string;
  concerns?: string;
  praises?: string;
  prayerNeeds?: string;

  // 영적 돌파
  hasBreakthrough?: boolean;
  breakthroughCategory?: BreakthroughCategory;
  breakthroughTitle?: string;
  breakthroughDescription?: string;
  bibleReferences?: BibleReference[];

  // 다음 단계
  nextSteps?: string;
  followUpActions?: string[];

  recordedAt?: string;
}

// ─── 필터 & 요약 ─────────────────────────────────────────

export interface PastoralLogFilter {
  soulId?: string;
  mood?: SpiritualMood;
  hasBreakthrough?: boolean;
  dateFrom?: string;
  dateTo?: string;
  activityPlanId?: string;
}

// 대시보드용 목회 일지 요약
export interface PastoralLogSummary {
  soulId: string;
  soulName: string;
  totalLogs: number;
  latestMood: SpiritualMood;
  moodTrend: 'improving' | 'stable' | 'declining';
  averageHunger: number;
  averageCloseness: number;
  breakthroughCount: number;
  lastRecordedAt: string;
  needsAttention: boolean;         // 관심 필요 여부
  daysSinceLastLog: number;        // 마지막 기록 이후 경과일
}
