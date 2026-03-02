/**
 * Spiritual Prescription Entity (맞춤형 영적 처방)
 * AI 기반 맞춤 진단 및 처방
 */

// 신앙 배경
export type FaithBackground =
  | 'new_believer'           // 처음 믿음
  | 'church_background'      // 교회 다녔음 (떠났다가 돌아옴)
  | 'other_religion'         // 타종교 경험
  | 'second_generation'      // 2세 신자
  | 'long_time_believer';    // 오래 믿었음

// 성격 유형 (간소화된 버전)
export type PersonalityType =
  | 'analytical'     // 분석적 - 논리와 근거 선호
  | 'relational'     // 관계적 - 교제와 나눔 선호
  | 'experiential'   // 경험적 - 체험과 감동 선호
  | 'practical';     // 실천적 - 행동과 적용 선호

// 학습 스타일
export type LearningStyle =
  | 'visual'         // 시각적
  | 'auditory'       // 청각적
  | 'reading'        // 독서형
  | 'kinesthetic';   // 체험형

// 영적 상처 유형
export type SpiritualWoundType =
  | 'legalism'           // 율법주의 상처
  | 'church_hurt'        // 교회 상처
  | 'authority_wound'    // 권위 상처
  | 'rejection'          // 거절 상처
  | 'shame'              // 수치심
  | 'loss'               // 상실
  | 'none';              // 해당 없음

// 은사 영역
export type GiftArea =
  | 'teaching'       // 가르침
  | 'serving'        // 섬김
  | 'exhortation'    // 권면
  | 'giving'         // 기부
  | 'leadership'     // 리더십
  | 'mercy'          // 긍휼
  | 'evangelism'     // 전도
  | 'hospitality';   // 환대

// 초기 설문 응답
export interface SpiritualProfileSurvey {
  // 배경
  faithBackground: FaithBackground;
  yearsOfFaith?: number;
  previousChurchExperience?: string;

  // 성격
  personalityType: PersonalityType;
  learningStyle: LearningStyle;

  // 상처
  wounds?: SpiritualWoundType[];
  woundNotes?: string;

  // 은사
  perceivedGifts?: GiftArea[];

  // 기대
  expectations?: string;
  concerns?: string;
  goals?: string;
}

// 영적 처방
export interface SpiritualPrescription {
  id: string;
  soulId: string;

  // 프로필
  profile: SpiritualProfileSurvey;

  // 진단 결과
  diagnosis: {
    strengths: string[];
    challenges: string[];
    primaryFocus: string;
    secondaryFocus: string;
  };

  // 맞춤 처방
  prescriptions: PrescriptionItem[];

  // 양육 방향
  trainingApproach: TrainingApproach;

  // 주의사항
  cautions: string[];

  // 예상 기간 조정
  suggestedPaceAdjustment: 'faster' | 'normal' | 'slower';
  paceReason?: string;

  // 검증
  assessedBy?: string;
  assessedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface PrescriptionItem {
  area: string;           // 관련 영역
  prescription: string;   // 처방 내용
  priority: 'high' | 'medium' | 'low';
  rationale: string;      // 근거
  activities: string[];   // 추천 활동
}

export interface TrainingApproach {
  style: PersonalityType;  // 맞춤 스타일
  emphases: string[];      // 강조점
  avoidances: string[];    // 피해야 할 것
  communicationTips: string[];  // 소통 팁
}

// 프로필 메타데이터
export const FAITH_BACKGROUNDS: Record<FaithBackground, { name: string; description: string }> = {
  new_believer: {
    name: '처음 믿음',
    description: '이전에 신앙 경험이 없음'
  },
  church_background: {
    name: '교회 배경',
    description: '과거 교회 경험 있음'
  },
  other_religion: {
    name: '타종교 경험',
    description: '다른 종교 배경이 있음'
  },
  second_generation: {
    name: '2세 신자',
    description: '신앙 가정에서 성장'
  },
  long_time_believer: {
    name: '오래 믿음',
    description: '오랜 신앙 경험이 있음'
  }
};

export const PERSONALITY_TYPES: Record<PersonalityType, {
  name: string;
  description: string;
  strengths: string[];
  trainingTips: string[];
}> = {
  analytical: {
    name: '분석적',
    description: '논리와 근거를 중시',
    strengths: ['성경 연구', '교리 이해', '체계적 학습'],
    trainingTips: [
      '질문에 충분한 답변 제공',
      '근거와 논리 설명',
      '토론 기회 부여'
    ]
  },
  relational: {
    name: '관계적',
    description: '교제와 나눔을 중시',
    strengths: ['그룹 활동', '간증 나눔', '돌봄 사역'],
    trainingTips: [
      '충분한 나눔 시간',
      '개인적 관심 표현',
      '그룹 연결'
    ]
  },
  experiential: {
    name: '경험적',
    description: '체험과 감동을 중시',
    strengths: ['예배 참여', '기도 경험', '영적 감수성'],
    trainingTips: [
      '경험적 활동 포함',
      '감성적 접근',
      '영적 경험 기회 제공'
    ]
  },
  practical: {
    name: '실천적',
    description: '행동과 적용을 중시',
    strengths: ['섬김', '전도', '실천적 적용'],
    trainingTips: [
      '구체적 적용점 제시',
      '실천 과제 부여',
      '봉사 기회 연결'
    ]
  }
};

export const SPIRITUAL_WOUNDS: Record<SpiritualWoundType, {
  name: string;
  description: string;
  healingApproach: string[];
}> = {
  legalism: {
    name: '율법주의',
    description: '행위 중심 신앙으로 인한 상처',
    healingApproach: ['은혜 강조', '무조건적 사랑', '자유함 경험']
  },
  church_hurt: {
    name: '교회 상처',
    description: '교회 내 관계에서 받은 상처',
    healingApproach: ['신뢰 회복', '천천히 접근', '안전한 관계']
  },
  authority_wound: {
    name: '권위 상처',
    description: '리더십에 대한 불신',
    healingApproach: ['섬기는 리더십 모델', '점진적 신뢰', '투명한 소통']
  },
  rejection: {
    name: '거절 상처',
    description: '거절당한 경험으로 인한 상처',
    healingApproach: ['지속적 수용', '무조건적 환영', '소속감 강조']
  },
  shame: {
    name: '수치심',
    description: '과거에 대한 수치심',
    healingApproach: ['정죄 없는 환경', '회복 이야기', '정체성 회복']
  },
  loss: {
    name: '상실',
    description: '중요한 것을 잃은 경험',
    healingApproach: ['애도 허용', '공감', '소망 제시']
  },
  none: {
    name: '해당 없음',
    description: '특별한 상처 없음',
    healingApproach: []
  }
};

export interface CreateSpiritualPrescriptionDto {
  soulId: string;
  profile: SpiritualProfileSurvey;
}

// 처방 생성 로직을 위한 헬퍼
export function generateTrainingApproach(profile: SpiritualProfileSurvey): TrainingApproach {
  const typeInfo = PERSONALITY_TYPES[profile.personalityType];

  const avoidances: string[] = [];
  if (profile.wounds) {
    profile.wounds.forEach(wound => {
      if (wound !== 'none') {
        const woundInfo = SPIRITUAL_WOUNDS[wound];
        avoidances.push(`${woundInfo.name} 자극 요소`);
      }
    });
  }

  return {
    style: profile.personalityType,
    emphases: typeInfo.strengths,
    avoidances,
    communicationTips: typeInfo.trainingTips
  };
}
