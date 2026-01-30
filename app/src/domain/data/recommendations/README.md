# 활동 추천 시스템 (Activity Recommendation System)

GRID 웹서비스의 주차별/월차별 활동 계획 추천 시스템입니다.

## 개요

제자훈련 과정(CONVERT 13주, DISCIPLE 12개월)의 각 영역별로 의미 있는 활동들을 추천하여 양육자가 체계적으로 양육 대상자를 돌볼 수 있도록 돕습니다.

## 데이터 구조

### CONVERT (13주 과정)

4개 핵심 영역:
- **구원의 확신 (salvation)**: 복음 이해, 십자가의 의미, 하나님의 자녀 된 신분
- **말씀 (word)**: 성경 읽기 습관, 큐티 방법, 말씀 암송
- **교제 (fellowship)**: 소그룹 참여, 식사 교제, 예배 중의 교제
- **죄에서 떠남 (sin)**: 구습 점검, 성령 충만, 거룩한 습관 형성

각 영역별로 5개 이상의 주차별 추천 활동 포함

### DISCIPLE (12개월 과정)

14개 영역:
- **암송 (memorization)**: 네비게이터 주제별 암송
- **성경공부 (bibleStudy)**: 귀납적 성경공부, 복음서/서신서 공부
- **구원의 확신 (salvation)**: 복음 전하기, 구원 확신 점검
- **경건의 시간 (devotion)**: 경건의 시간 정착, 깊이 있는 묵상
- **말씀 (word)**: 성경 통독, 말씀 필사
- **기도 (prayer)**: 주기도문, 중보기도, 새벽기도
- **교제 (fellowship)**: 소그룹 리더십, 일대일 양육
- **증거 (witness)**: 전도 훈련, 관계 전도, 간증
- **주재권 (lordship)**: 주님께 주권 드리기, 시간 관리
- **세계비전 (vision)**: 선교 비전, 단기 선교
- **양육 (discipleship)**: 제자 삼는 자 되기, 양육 계획
- **성품 (character)**: 그리스도 닮아가기, 섬김의 리더십

각 영역별로 2-3개의 월차별 추천 활동 포함

## 추천 활동 항목

각 추천 활동은 다음 정보를 포함합니다:

```typescript
interface ActivityRecommendation {
  id: string;                 // 고유 ID
  trainingType: TrainingType; // 'convert' | 'disciple'
  areaId: Area;              // 영역 ID
  week: number;              // 주차/월차
  title: string;             // 제목
  description: string;       // 설명
  bibleVerse?: {             // 성경 구절
    reference: string;       // 예: "요한복음 1:12"
    text: string;           // 본문
  };
  activities: string[];      // 구체적인 활동 목록
  tips?: string[];          // 양육자를 위한 팁
  goals?: string[];         // 이 주차의 목표
}
```

## 사용 방법

### 1. 직접 데이터 조회

```typescript
import {
  CONVERT_RECOMMENDATIONS,
  getConvertRecommendations,
  DISCIPLE_RECOMMENDATIONS,
  getDiscipleRecommendations
} from '@/domain/data/recommendations';

// 특정 주차 조회
const week1Salvation = getConvertRecommendations('salvation', 1);

// 특정 월차 조회
const month1Memorization = getDiscipleRecommendations('memorization', 1);
```

### 2. RecommendationService 사용

```typescript
import { RecommendationService } from '@/application/services/recommendation-service';

const service = new RecommendationService(
  soulRepository,
  progressRepository
);

// 주차별 조회
const recommendations = service.getRecommendationsForWeek(
  'convert',
  'salvation',
  1
);

// Soul의 현재 진행 상황에 맞는 추천
const soulRecs = await service.getRecommendationsForSoul(soulId);

// 다음 추천 활동
const next = await service.getNextRecommendedActivity(soulId, 'salvation');
```

### 3. React Hook 사용

```typescript
import { useActivityRecommendations } from '@/presentation/hooks/useActivityRecommendations';

function MyComponent() {
  const { recommendations, loading, error } = useActivityRecommendations(
    'convert',
    'salvation',
    1
  );

  return (
    <ActivityRecommendationList
      recommendations={recommendations}
      onCreateActivity={handleCreate}
    />
  );
}
```

### 4. UI 컴포넌트 사용

```typescript
import {
  ActivityRecommendationCard,
  ActivityRecommendationList
} from '@/presentation/components/ActivityRecommendation';

// 단일 카드
<ActivityRecommendationCard
  recommendation={rec}
  onCreateActivity={handleCreate}
/>

// 목록 (compact 모드)
<ActivityRecommendationList
  recommendations={recs}
  compact={true}
/>
```

## 파일 구조

```
src/
├── domain/
│   ├── entities/
│   │   └── recommendation.ts          # 추천 타입 정의
│   └── data/
│       └── recommendations/
│           ├── convert-recommendations.ts    # CONVERT 추천 데이터
│           ├── disciple-recommendations.ts   # DISCIPLE 추천 데이터
│           ├── index.ts
│           └── README.md
├── application/
│   ├── services/
│   │   └── recommendation-service.ts  # 추천 서비스
│   └── use-cases/
│       └── activity-plans/
│           └── get-recommendations.ts # 추천 조회 유스케이스
└── presentation/
    ├── hooks/
    │   └── useActivityRecommendations.ts  # React Hook
    ├── components/
    │   └── ActivityRecommendation.tsx     # UI 컴포넌트
    └── pages/
        └── RecommendationsPage.tsx        # 예시 페이지
```

## 확장 방법

### 새로운 추천 활동 추가

1. `convert-recommendations.ts` 또는 `disciple-recommendations.ts` 파일 수정
2. 해당 영역과 주차에 맞는 `ActivityRecommendation` 객체 추가
3. 고유한 `id` 부여 (예: `convert-salvation-6`)
4. 필수 필드 작성: `title`, `description`, `activities`
5. 선택 필드 추가: `bibleVerse`, `tips`, `goals`

예시:
```typescript
{
  id: 'convert-salvation-6',
  trainingType: 'convert',
  areaId: 'salvation',
  week: 6,
  title: '새로운 주제',
  description: '주제 설명',
  bibleVerse: {
    reference: '요한복음 3:16',
    text: '하나님이 세상을 이처럼 사랑하사...'
  },
  activities: [
    '활동 1',
    '활동 2',
    '활동 3'
  ],
  tips: [
    '팁 1',
    '팁 2'
  ],
  goals: [
    '목표 1',
    '목표 2'
  ]
}
```

### 새로운 영역 추가

1. `src/domain/value-objects/area.ts`에서 영역 타입 추가
2. 해당 영역의 추천 데이터 작성
3. 헬퍼 함수에 새 영역 로직 추가

## 주의사항

- 각 추천 활동은 **실제 제자훈련 컨텍스트**에 맞게 작성되어야 합니다
- 성경 구절은 **정확한 참조**와 **본문**을 포함해야 합니다
- 활동은 **구체적이고 실행 가능**해야 합니다
- 팁은 **양육자 관점**에서 작성합니다
- 목표는 **측정 가능**하고 **명확**해야 합니다

## 향후 개선 사항

- [ ] 추천 활동의 난이도 레벨 추가
- [ ] 개인 맞춤형 추천 알고리즘
- [ ] 계절별/상황별 추천 활동
- [ ] 추천 활동 평가 및 피드백 시스템
- [ ] 다국어 지원
- [ ] 추천 활동 통계 및 분석
