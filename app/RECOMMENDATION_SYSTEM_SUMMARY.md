# 활동 추천 시스템 구현 완료

## 구현 개요

GRID 웹서비스의 주차별/월차별 활동 계획 추천 시스템을 Clean Architecture 원칙에 따라 구현하였습니다.

## 구현된 파일 목록

### 1. Domain Layer (도메인 계층)

#### 엔티티
- `/src/domain/entities/recommendation.ts`
  - `ActivityRecommendation` 인터페이스
  - `WeeklyRecommendation` 인터페이스

#### 추천 데이터
- `/src/domain/data/recommendations/convert-recommendations.ts`
  - CONVERT 13주 과정 추천 데이터
  - 4개 영역 (구원의 확신, 말씀, 교제, 죄에서 떠남)
  - 각 영역별 5개 주차 추천 활동
  - 총 20개 추천 활동

- `/src/domain/data/recommendations/disciple-recommendations.ts`
  - DISCIPLE 12개월 과정 추천 데이터
  - 12개 핵심 영역 (암송, 성경공부, 구원의 확신, 경건의 시간, 말씀, 기도, 교제, 증거, 주재권, 세계비전, 양육, 성품)
  - 각 영역별 2-3개 월차 추천 활동
  - 총 24개 추천 활동

- `/src/domain/data/recommendations/index.ts` - 배럴 익스포트

### 2. Application Layer (응용 계층)

#### 서비스
- `/src/application/services/recommendation-service.ts`
  - `IRecommendationService` 인터페이스
  - `RecommendationService` 클래스
  - 주요 메서드:
    - `getRecommendationsForWeek()` - 주차별 추천 조회
    - `getRecommendationsForArea()` - 영역별 모든 추천 조회
    - `getRecommendationsForSoul()` - Soul의 현재 진행에 맞는 추천 조회
    - `getNextRecommendedActivity()` - 다음 추천 활동 조회
    - `getAllRecommendations()` - 필터링 가능한 전체 추천 조회

#### 유스케이스
- `/src/application/use-cases/activity-plans/get-recommendations.ts`
  - `GetRecommendationsForWeekUseCase` - 주차별 추천 조회
  - `GetRecommendationsForAreaUseCase` - 영역별 추천 조회
  - `GetRecommendationsForSoulUseCase` - Soul별 추천 조회
  - `GetNextRecommendedActivityUseCase` - 다음 추천 조회

### 3. Presentation Layer (프레젠테이션 계층)

#### React Hooks
- `/src/presentation/hooks/useActivityRecommendations.ts`
  - `useActivityRecommendations()` - 주차별 추천 훅
  - `useAreaRecommendations()` - 영역별 추천 훅
  - `useSoulRecommendations()` - Soul별 추천 훅
  - `useNextRecommendedActivity()` - 다음 추천 훅

#### UI 컴포넌트
- `/src/presentation/components/ActivityRecommendation.tsx`
  - `ActivityRecommendationCard` - 추천 카드 컴포넌트
  - `ActivityRecommendationList` - 추천 목록 컴포넌트
  - compact 모드 지원
  - 성경 구절, 목표, 활동, 팁 섹션

#### 예시 페이지
- `/src/presentation/pages/RecommendationsPage.tsx`
  - 완전한 추천 시스템 UI 예시
  - 훈련 타입, 영역, 주차 필터링
  - 추천 목록 표시
  - 활동 계획 추가 기능

### 4. 문서
- `/src/domain/data/recommendations/README.md` - 상세 사용 가이드

## 추천 활동 구조

각 추천 활동은 다음 정보를 포함합니다:

```typescript
interface ActivityRecommendation {
  id: string;                    // 고유 ID
  trainingType: TrainingType;    // 'convert' | 'disciple'
  areaId: Area;                  // 영역 ID
  week: number;                  // 주차/월차
  title: string;                 // 제목
  description: string;           // 설명
  bibleVerse?: {                 // 성경 구절
    reference: string;
    text: string;
  };
  activities: string[];          // 구체적인 활동 목록
  tips?: string[];              // 양육자를 위한 팁
  goals?: string[];             // 이 주차의 목표
}
```

## 사용 예시

### 1. React 컴포넌트에서 사용

```typescript
import { useActivityRecommendations } from '@/presentation/hooks/useActivityRecommendations';
import { ActivityRecommendationList } from '@/presentation/components/ActivityRecommendation';

function MyComponent() {
  const { recommendations, loading, error } = useActivityRecommendations(
    'convert',
    'salvation',
    1
  );

  if (loading) return <Spinner />;
  if (error) return <Alert>{error.message}</Alert>;

  return (
    <ActivityRecommendationList
      recommendations={recommendations}
      onCreateActivity={handleCreate}
    />
  );
}
```

### 2. 서비스 직접 사용

```typescript
import { RecommendationService } from '@/application/services/recommendation-service';

const service = new RecommendationService(soulRepo, progressRepo);

// 특정 주차 추천 조회
const recs = service.getRecommendationsForWeek('convert', 'salvation', 1);

// Soul의 현재 진행에 맞는 추천
const soulRecs = await service.getRecommendationsForSoul(soulId);
```

### 3. 데이터 직접 접근

```typescript
import {
  CONVERT_RECOMMENDATIONS,
  getConvertRecommendations
} from '@/domain/data/recommendations';

// 특정 주차 데이터
const week1 = getConvertRecommendations('salvation', 1);
```

## 주요 기능

1. **주차별/월차별 추천**
   - CONVERT: 13주 과정
   - DISCIPLE: 12개월 과정

2. **영역별 추천**
   - 각 훈련 타입의 모든 영역에 대한 추천 제공

3. **진행 상황 기반 추천**
   - Soul의 현재 진행 상황에 맞는 추천 자동 조회

4. **다음 활동 추천**
   - 특정 영역에서 다음으로 할 활동 제안

5. **풍부한 정보**
   - 성경 구절
   - 구체적인 활동 목록
   - 양육자 팁
   - 주차 목표

6. **UI 컴포넌트**
   - 카드 형식 표시
   - 목록 형식 표시
   - Compact 모드
   - 활동 계획 추가 기능

## 데이터 확장 방법

### 새로운 추천 추가

1. 해당 파일 열기 (`convert-recommendations.ts` 또는 `disciple-recommendations.ts`)
2. 배열에 새 객체 추가:

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

## 아키텍처 특징

1. **Clean Architecture**
   - Domain, Application, Presentation 계층 분리
   - 의존성 역전 원칙 (DIP) 적용
   - 인터페이스 기반 설계

2. **타입 안정성**
   - TypeScript 완전 타입 지원
   - 엄격한 타입 체크

3. **확장성**
   - 새로운 추천 쉽게 추가 가능
   - 서비스 계층 확장 용이
   - UI 컴포넌트 재사용 가능

4. **테스트 가능성**
   - 각 계층 독립적 테스트 가능
   - 의존성 주입으로 Mock 가능

## 다음 단계

1. **백엔드 연동**
   - Supabase와 추천 데이터 동기화
   - 사용자 맞춤형 추천 저장

2. **고급 기능**
   - 추천 활동 평가 시스템
   - 추천 통계 및 분석
   - 개인화된 추천 알고리즘

3. **UI/UX 개선**
   - 추천 활동 검색 기능
   - 즐겨찾기/북마크 기능
   - 활동 이력 추적

4. **컨텐츠 확장**
   - 모든 주차/월차 데이터 완성
   - 다양한 양육 상황별 추천
   - 계절별/특별 행사 추천

## 기술 스택

- **언어**: TypeScript
- **프레임워크**: React
- **상태 관리**: React Hooks
- **UI 라이브러리**: Radix UI + Tailwind CSS
- **아키텍처**: Clean Architecture
- **패턴**: Repository Pattern, Use Case Pattern

## 파일 통계

- **총 파일 수**: 11개
- **총 코드 라인**: ~2,500 라인
- **추천 데이터**: 44개 (CONVERT 20개 + DISCIPLE 24개)
- **컴포넌트**: 2개
- **Hooks**: 4개
- **서비스**: 1개
- **유스케이스**: 4개

## 품질 보증

- ✅ TypeScript 타입 체크 통과
- ✅ Clean Architecture 원칙 준수
- ✅ 코드 가독성 및 유지보수성 고려
- ✅ 실제 제자훈련 컨텍스트에 맞는 내용
- ✅ 포괄적인 문서화
