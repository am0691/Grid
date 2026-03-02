/**
 * Reproduction Readiness Entity (재생산 준비도)
 * 양육자로 세워질 준비도 추적
 */

export type ReadinessCheckItem =
  | 'gospel_presentation'     // 복음 제시 가능
  | 'personal_testimony'      // 간증 정리
  | 'bible_study_leading'     // 성경공부 인도 가능
  | 'prayer_independence'     // 기도 생활 자립
  | 'serving_position'        // 섬김의 자리
  | 'mentee_connection'       // 양육받을 새신자 연결
  | 'spiritual_disciplines'   // 영적 훈련 습관화
  | 'doctrinal_foundation'    // 교리적 기초
  | 'community_integration'   // 공동체 통합
  | 'leadership_potential';   // 리더십 잠재력

export type ReadinessStatus = 'not_started' | 'in_progress' | 'completed' | 'verified';

export interface ReadinessCheckResult {
  item: ReadinessCheckItem;
  status: ReadinessStatus;
  notes?: string;
  verifiedBy?: string;  // 검증자 ID
  verifiedAt?: string;
  evidences?: string[]; // 근거/증거
}

export interface ReproductionReadiness {
  id: string;
  soulId: string;

  // 체크리스트 결과
  checkResults: ReadinessCheckResult[];

  // 종합 점수
  overallScore: number;  // 0-100
  readinessLevel: 'not_ready' | 'preparing' | 'almost_ready' | 'ready';

  // 강점/약점
  strengths: ReadinessCheckItem[];
  areasToImprove: ReadinessCheckItem[];

  // 추천
  recommendations: string[];
  suggestedNextSteps: string[];

  // 멘티 매칭
  suggestedMenteeProfile?: string;  // 어떤 유형의 멘티가 적합한지

  // 졸업 관련
  isGraduationReady: boolean;
  graduationDate?: string;

  lastAssessedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReproductionReadinessDto {
  soulId: string;
  checkResults: ReadinessCheckResult[];
}

// 체크 항목 메타데이터
export const READINESS_CHECK_ITEMS: Record<ReadinessCheckItem, {
  name: string;
  description: string;
  weight: number;  // 가중치 (총합 100)
  criteria: string[];  // 충족 기준
}> = {
  gospel_presentation: {
    name: '복음 제시',
    description: '복음의 핵심을 명확하게 전달할 수 있는가?',
    weight: 15,
    criteria: [
      '사영리 또는 다리 전도법 설명 가능',
      '개인 간증과 연결하여 복음 제시 가능',
      '질문에 대한 답변 가능'
    ]
  },
  personal_testimony: {
    name: '개인 간증',
    description: '본인의 구원 간증이 정리되어 있는가?',
    weight: 10,
    criteria: [
      '3분 간증 정리 완료',
      '예수님 전/후 삶의 변화 명확',
      '타인 앞에서 나눔 경험'
    ]
  },
  bible_study_leading: {
    name: '성경공부 인도',
    description: '기본 성경공부를 인도할 수 있는가?',
    weight: 15,
    criteria: [
      '귀납적 성경공부 방법 이해',
      '소그룹 인도 경험',
      '질문 만들기 및 토론 진행 가능'
    ]
  },
  prayer_independence: {
    name: '기도 생활',
    description: '자립적인 기도 생활을 하고 있는가?',
    weight: 12,
    criteria: [
      '정기적 경건의 시간 유지',
      '중보기도 실천',
      '공개 기도 가능'
    ]
  },
  serving_position: {
    name: '섬김의 자리',
    description: '교회 내 섬김의 역할이 있는가?',
    weight: 10,
    criteria: [
      '정기적 봉사 참여',
      '책임감 있는 수행',
      '팀원과의 협력'
    ]
  },
  mentee_connection: {
    name: '새신자 연결',
    description: '양육할 새신자가 연결되어 있는가?',
    weight: 10,
    criteria: [
      '잠재적 멘티 1명 이상 파악',
      '관계 형성 시작',
      '양육 의지 표현'
    ]
  },
  spiritual_disciplines: {
    name: '영적 훈련',
    description: '영적 훈련이 습관화되어 있는가?',
    weight: 10,
    criteria: [
      'QT 습관화',
      '말씀 암송 지속',
      '전도 생활화'
    ]
  },
  doctrinal_foundation: {
    name: '교리적 기초',
    description: '기본 교리를 이해하고 있는가?',
    weight: 8,
    criteria: [
      '구원론 이해',
      '삼위일체 이해',
      '성경관 정립'
    ]
  },
  community_integration: {
    name: '공동체 통합',
    description: '공동체에 잘 통합되어 있는가?',
    weight: 5,
    criteria: [
      '셀/소그룹 정착',
      '성도간 관계 형성',
      '공동체 행사 참여'
    ]
  },
  leadership_potential: {
    name: '리더십 잠재력',
    description: '리더십 잠재력이 보이는가?',
    weight: 5,
    criteria: [
      '주도적 참여',
      '다른 사람을 돕는 자세',
      '책임감'
    ]
  }
};

// 준비도 레벨 기준
export const READINESS_LEVELS = {
  not_ready: { min: 0, max: 39, label: '준비 필요', color: '#dc2626' },
  preparing: { min: 40, max: 69, label: '준비 중', color: '#ca8a04' },
  almost_ready: { min: 70, max: 89, label: '거의 준비됨', color: '#2563eb' },
  ready: { min: 90, max: 100, label: '준비 완료', color: '#16a34a' }
};

// 준비도 계산 함수
export function calculateReadinessScore(results: ReadinessCheckResult[]): number {
  let totalWeight = 0;
  let earnedWeight = 0;

  for (const result of results) {
    const itemMeta = READINESS_CHECK_ITEMS[result.item];
    totalWeight += itemMeta.weight;

    if (result.status === 'completed' || result.status === 'verified') {
      earnedWeight += itemMeta.weight;
    } else if (result.status === 'in_progress') {
      earnedWeight += itemMeta.weight * 0.5;
    }
  }

  return totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;
}

export function getReadinessLevel(score: number): ReproductionReadiness['readinessLevel'] {
  if (score >= READINESS_LEVELS.ready.min) return 'ready';
  if (score >= READINESS_LEVELS.almost_ready.min) return 'almost_ready';
  if (score >= READINESS_LEVELS.preparing.min) return 'preparing';
  return 'not_ready';
}
