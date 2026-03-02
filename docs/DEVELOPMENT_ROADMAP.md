# Grid 교회 양육 관리 시스템 - 개발 로드맵

> Synod 숙의 결과 기반 Phase별 리팩토링 계획
> 작성일: 2026-03-02
> 기술 스택: React + TypeScript, Zustand, Supabase, Clean Architecture

---

## 목차

- [현재 상태 요약](#현재-상태-요약)
- [Phase 1: Foundation (기반 정비)](#phase-1-foundation-기반-정비)
- [Phase 2: Core Workflow (핵심 워크플로우)](#phase-2-core-workflow-핵심-워크플로우)
- [Phase 3: Data Migration & Views (데이터 마이그레이션 & 뷰)](#phase-3-data-migration--views-데이터-마이그레이션--뷰)
- [Phase 4: Intelligence & Polish (AI & 마무리)](#phase-4-intelligence--polish-ai--마무리)
- [보류 항목](#보류-항목)
- [부록: 엔티티 매핑 표](#부록-엔티티-매핑-표)

---

## 현재 상태 요약

### 도메인 엔티티 (13개 파일)

| 파일 | 상태 | Synod 결정 |
|------|------|------------|
| `soul.ts` | Soul + SoulProfile + SoulDetails 분리됨 | **통합** (Phase 1) |
| `activity-plan.ts` | ActivityPlan + ActivityEvaluation | 유지 (PastoralLog과 연결) |
| `progress.ts` | AreaProgress, SoulProgress | 유지 |
| `spiritual-state.ts` | SpiritualState, SoulTemperatureSummary | **PastoralLog로 통합** (Phase 2) |
| `breakthrough.ts` | Breakthrough, BibleReference | **PastoralLog로 통합** (Phase 2) |
| `crisis-alert.ts` | CrisisAlert, CrisisDetectionConfig | **경량화** (Phase 3) |
| `encouragement.ts` | Encouragement, Badge, GratitudeMessage, TrainerStatistics | **간소화** (Phase 4) |
| `reproduction-readiness.ts` | ReproductionReadiness, ReadinessCheckResult | **계산 뷰로 전환** (Phase 4) |
| `spiritual-prescription.ts` | SpiritualPrescription, SpiritualProfileSurvey | **계산 뷰로 전환** (Phase 4) |
| `relationship-timeline.ts` | TimelineMilestone, RelationshipSummary | **Activity Timeline 뷰로 대체** (Phase 3) |
| `recommendation.ts` | ActivityRecommendation | 유지 |
| `user.ts` | User | 유지 |
| `index.ts` | barrel export | 업데이트 필요 |

### 데이터 저장소 현황

| 데이터 | 저장소 | 비고 |
|--------|--------|------|
| Soul, Progress, ActivityPlan | Supabase (+ Demo Mode localStorage) | `supabase/` 리포지토리 존재 |
| SpiritualState, Breakthrough, CrisisAlert, Readiness, Milestones, Encouragements, Prescriptions | **localStorage만** | `pastoralCareStore.ts`에서 관리 |

### Supabase 현재 스키마

- `profiles` - 사용자 프로필
- `souls` - 영혼 (name, training_type, start_date만 저장)
- `progress` - 진도 추적
- `activity_plans` - 활동 계획 (DB 스키마와 도메인 엔티티 불일치)
- `activity_recommendations` - 활동 추천 템플릿

### 타입 이중화 문제

- `app/src/types/index.ts`의 `Soul` 타입 (trainerId 없음, profile 있음)
- `app/src/domain/entities/soul.ts`의 `Soul` 인터페이스 (trainerId 있음, isActive 있음)
- `app/src/infrastructure/database/schema.ts`의 DB `Soul` 타입 (snake_case)
- 스토어는 `@/types`의 Soul을 사용, 리포지토리는 domain entities의 Soul을 import

---

## Phase 1: Foundation (기반 정비)

**예상 기간:** 1~2주
**핵심 목적:** Soul 엔티티를 단일 소스로 통합하고, 타입 이중화를 해소하여 이후 Phase의 안정적 기반 마련

### 의존성

- 없음 (첫 번째 Phase)

### 작업 목록

#### 1.1 Soul 엔티티 통합

- [ ] `app/src/domain/entities/soul.ts` 리팩토링
  - `Soul`, `SoulProfile`, `SoulDetails`를 단일 `Soul` 인터페이스로 통합
  - 연락처 정보(phoneNumber, email, address, birthDate)를 Soul에 직접 포함
  - `SoulProfile`을 Soul의 인라인 필드로 병합 (별도 인터페이스 제거)
  - `CreateSoulDto`, `UpdateSoulDto` 업데이트

```typescript
// 통합 후 Soul 인터페이스 (예시)
export interface Soul {
  id: string;
  name: string;
  trainingType: TrainingType;
  startDate: string;
  createdAt: string;
  updatedAt: string;
  trainerId?: string;
  isActive: boolean;

  // 연락처 (기존 SoulDetails)
  phoneNumber?: string;
  email?: string;
  address?: string;
  birthDate?: string;
  notes?: string;

  // 프로필 (기존 SoulProfile 인라인)
  ageGroup?: 'teens' | '20s' | '30s' | '40s' | '50s' | '60s+';
  gender?: 'male' | 'female';
  occupation?: string;
  mbti?: string;
  faithBackground?: 'new' | 'returned' | 'transferred' | 'seeker';
  personalityType?: 'analytical' | 'relational' | 'experiential' | 'practical';
  learningStyle?: 'visual' | 'auditory' | 'reading' | 'kinesthetic';
  preferredMeetingType?: 'in-person' | 'online' | 'both';
  interests?: string[];
  perceivedGifts?: string[];
  servingAreas?: string[];
  spiritualGoals?: string;
  challenges?: string;
  specialNeeds?: string;
}
```

#### 1.2 타입 이중화 해소

- [ ] `app/src/types/index.ts`의 `Soul` 타입을 제거하고, `@/domain/entities/soul`에서 re-export
  - `app/src/types/index.ts`에서 Soul, SoulWithProgress 정의를 domain entities로 이동
  - 기존 `@/types`에서 Soul을 import하는 모든 파일 업데이트
- [ ] `app/src/infrastructure/database/schema.ts`의 DB Soul 타입에 새 필드 반영

#### 1.3 Supabase `souls` 테이블 스키마 업데이트

- [ ] `supabase/migrations/002_soul_profile_fields.sql` 마이그레이션 생성
  - `souls` 테이블에 프로필 필드 추가 (phone_number, email, address, birth_date, notes, age_group, gender, occupation, mbti, faith_background, personality_type, learning_style, preferred_meeting_type, interests, perceived_gifts, serving_areas, spiritual_goals, challenges, special_needs)
  - JSONB 컬럼 활용: `interests`, `perceived_gifts`, `serving_areas`는 JSONB 배열
  - `is_active BOOLEAN NOT NULL DEFAULT TRUE` 추가

#### 1.4 리포지토리 업데이트

- [ ] `app/src/infrastructure/repositories/supabase/soul-repository.ts` 업데이트
  - `mapDbToDomain`, `mapDomainToDb` 함수에 새 필드 매핑 추가
  - `createSoul`, `updateSoul` 함수에 프로필 필드 지원
- [ ] `app/src/infrastructure/database/schema.ts` DB 타입 업데이트
  - `Soul` 인터페이스에 새 컬럼 추가
  - `SoulInsert`, `SoulUpdate` 타입 업데이트

#### 1.5 스토어 및 컴포넌트 참조 업데이트

- [ ] `app/src/store/soulStore.ts` - CreateSoulInput, UpdateSoulInput 확장
- [ ] `app/src/components/AddSoulDialog.tsx` - 프로필 필드 입력 폼 추가
- [ ] `app/src/components/SoulCard.tsx` - 통합된 Soul 타입 사용
- [ ] `app/src/components/GridView.tsx` - Soul 타입 참조 업데이트
- [ ] `app/src/presentation/pages/SoulOverviewPage.tsx` - 프로필 정보 표시
- [ ] `app/src/presentation/pages/SoulsListPage.tsx` - Soul 타입 참조

#### 1.6 불필요한 파일 정리 (소프트 deprecation)

- [ ] `app/src/infrastructure/repositories/soul.repository.ts` (미구현 클래스) - 삭제 또는 통합
- [ ] `app/src/domain/entities/index.ts` barrel export 업데이트

### 영향받는 파일

| 작업 | 수정 | 생성 | 삭제 |
|------|------|------|------|
| 엔티티 통합 | `domain/entities/soul.ts` | - | - |
| 타입 해소 | `types/index.ts`, `infrastructure/database/schema.ts` | - | - |
| DB 마이그레이션 | - | `supabase/migrations/002_soul_profile_fields.sql` | - |
| 리포지토리 | `infrastructure/repositories/supabase/soul-repository.ts` | - | `infrastructure/repositories/soul.repository.ts` (삭제 후보) |
| 스토어/컴포넌트 | `store/soulStore.ts`, `components/AddSoulDialog.tsx`, `components/SoulCard.tsx`, `components/GridView.tsx`, `presentation/pages/SoulOverviewPage.tsx`, `presentation/pages/SoulsListPage.tsx` | - | - |

### 검증 기준

1. `Soul` 타입이 프로젝트 전체에서 단일 소스(`domain/entities/soul.ts`)에서만 정의됨
2. `SoulProfile`, `SoulDetails` 인터페이스가 더 이상 사용되지 않음
3. Supabase `souls` 테이블에 프로필 필드가 추가되고 CRUD 동작 확인
4. 기존 AddSoulDialog에서 프로필 정보 입력 가능
5. `tsc --noEmit` 타입 체크 통과
6. 기존 Soul CRUD(생성, 조회, 수정, 삭제)가 정상 동작

### 예상 위험

| 위험 | 영향 | 대응 |
|------|------|------|
| 타입 변경으로 인한 대량 컴파일 에러 | 높음 | 단계적 변경: 먼저 통합 타입 정의 후 alias로 호환성 유지, 이후 일괄 전환 |
| Supabase 마이그레이션 실패 | 중간 | 로컬에서 먼저 테스트, 롤백 SQL 준비 |
| Demo Mode 호환성 깨짐 | 낮음 | localStorage 저장 구조도 함께 업데이트 |

### 마이그레이션 전략

- **타입 마이그레이션**: `SoulDetails`를 `Soul`로 alias 지정 후 점진적 교체 (`type SoulDetails = Soul`)
- **DB 마이그레이션**: ALTER TABLE로 nullable 컬럼 추가 (기존 데이터 영향 없음)
- **Demo Mode**: localStorage의 기존 Soul 데이터는 새 필드가 undefined로 처리되므로 호환됨

---

## Phase 2: Core Workflow (핵심 워크플로우)

**예상 기간:** 2주
**핵심 목적:** 분산된 목양 기록(ActivityEvaluation, SpiritualState, Breakthrough)을 PastoralLog 단일 엔티티로 통합하여, 양육자가 활동 후 한 번의 폼 작성으로 모든 기록을 남길 수 있도록 함

### 의존성

- Phase 1 완료 필수 (Soul 엔티티 통합, Supabase 스키마 안정화)

### 작업 목록

#### 2.1 PastoralLog 엔티티 설계

- [ ] `app/src/domain/entities/pastoral-log.ts` 생성

```typescript
// PastoralLog 엔티티 (예시)
export type PastoralLogType = 'meeting' | 'call' | 'observation' | 'prayer' | 'other';

export interface PastoralLog {
  id: string;
  soulId: string;
  activityPlanId?: string;    // 연결된 활동 계획 (선택)

  // 기본 정보
  type: PastoralLogType;
  title: string;
  date: string;               // 기록 날짜
  content: string;             // 본문 (자유 기술)

  // 활동 평가 (기존 ActivityEvaluation 통합)
  rating?: 1 | 2 | 3 | 4 | 5;
  actualOutcome?: string;
  challengesFaced?: string;
  nextSteps?: string;

  // 영적 상태 (기존 SpiritualState 핵심 필드 통합)
  mood?: 'growing' | 'stable' | 'struggling';
  hungerLevel?: 1 | 2 | 3 | 4 | 5;
  closenessLevel?: 1 | 2 | 3 | 4 | 5;
  prayerNeeds?: string;

  // 돌파 기록 (기존 Breakthrough 간소화 통합)
  hasBreakthrough: boolean;
  breakthroughCategory?: string;
  breakthroughDescription?: string;
  bibleReferences?: string[];   // 간소화: 문자열 배열

  // 메타데이터
  tags?: string[];
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePastoralLogDto {
  soulId: string;
  activityPlanId?: string;
  type: PastoralLogType;
  title: string;
  date: string;
  content: string;
  rating?: 1 | 2 | 3 | 4 | 5;
  actualOutcome?: string;
  challengesFaced?: string;
  nextSteps?: string;
  mood?: 'growing' | 'stable' | 'struggling';
  hungerLevel?: 1 | 2 | 3 | 4 | 5;
  closenessLevel?: 1 | 2 | 3 | 4 | 5;
  prayerNeeds?: string;
  hasBreakthrough?: boolean;
  breakthroughCategory?: string;
  breakthroughDescription?: string;
  bibleReferences?: string[];
  tags?: string[];
  isPrivate?: boolean;
}
```

#### 2.2 Supabase `pastoral_logs` 테이블 생성

- [ ] `supabase/migrations/003_pastoral_logs.sql` 마이그레이션 생성

```sql
-- 예시 스키마
CREATE TABLE pastoral_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    soul_id UUID NOT NULL REFERENCES souls(id) ON DELETE CASCADE,
    activity_plan_id UUID REFERENCES activity_plans(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('meeting', 'call', 'observation', 'prayer', 'other')),
    title TEXT NOT NULL,
    date DATE NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    rating SMALLINT CHECK (rating BETWEEN 1 AND 5),
    actual_outcome TEXT,
    challenges_faced TEXT,
    next_steps TEXT,
    mood TEXT CHECK (mood IN ('growing', 'stable', 'struggling')),
    hunger_level SMALLINT CHECK (hunger_level BETWEEN 1 AND 5),
    closeness_level SMALLINT CHECK (closeness_level BETWEEN 1 AND 5),
    prayer_needs TEXT,
    has_breakthrough BOOLEAN NOT NULL DEFAULT FALSE,
    breakthrough_category TEXT,
    breakthrough_description TEXT,
    bible_references JSONB DEFAULT '[]'::JSONB,
    tags JSONB DEFAULT '[]'::JSONB,
    is_private BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- RLS, 인덱스, 트리거 추가
```

#### 2.3 PastoralLog 리포지토리 구현

- [ ] `app/src/infrastructure/repositories/supabase/pastoral-log-repository.ts` 생성
  - CRUD 함수: `getPastoralLogs`, `getPastoralLogsBySoul`, `createPastoralLog`, `updatePastoralLog`, `deletePastoralLog`
  - 필터: soulId, dateRange, type, hasBreakthrough
  - Demo Mode 지원 (localStorage 폴백)
- [ ] `app/src/infrastructure/database/schema.ts`에 PastoralLog DB 타입 추가

#### 2.4 PastoralLog Zustand 스토어 생성

- [ ] `app/src/store/pastoralLogStore.ts` 생성
  - Supabase 리포지토리 연동
  - Optimistic Update 패턴 (soulStore 패턴 참고)
  - Soul별 로그 캐싱

#### 2.5 PastoralLog 작성 폼 UI

- [ ] `app/src/presentation/components/PastoralLogForm.tsx` 생성
  - 통합 폼: 기본 정보 + 활동 평가 + 영적 상태 + 돌파 기록
  - 섹션별 접기/펼치기 (돌파 기록은 `hasBreakthrough` 토글 시 표시)
  - ActivityPlan 연결 선택기 (해당 Soul의 미완료 활동 목록)
- [ ] `app/src/presentation/components/PastoralLogList.tsx` 생성
  - Soul별 목양 일지 목록 (날짜순 정렬)
  - 필터: 타입, 날짜 범위, 돌파 여부
- [ ] `app/src/presentation/components/PastoralLogCard.tsx` 생성
  - 일지 카드 컴포넌트 (요약 표시)

#### 2.6 ActivityPlan-PastoralLog 연결

- [ ] `app/src/domain/entities/activity-plan.ts` 수정
  - `evaluation` 필드에 `@deprecated` 주석 추가
  - ActivityPlan 완료 시 PastoralLog 작성 유도 플로우 추가
- [ ] `app/src/presentation/components/ActivityEvaluationDialog.tsx` 수정
  - 기존 평가 다이얼로그를 PastoralLogForm으로 리다이렉트
  - 또는 PastoralLogForm을 내장하도록 변경

#### 2.7 라우트 및 페이지 통합

- [ ] `app/src/presentation/pages/SoulCarePage.tsx` 수정
  - 기존 개별 패널(SoulTemperaturePanel, BreakthroughJournal 등) 대신 PastoralLogList + PastoralLogForm 표시
  - 기존 패널은 유지하되 PastoralLog 섹션을 메인으로 배치

#### 2.8 기존 코드 소프트 Deprecation

- [ ] 기존 엔티티 파일에 `@deprecated` JSDoc 추가 (삭제는 Phase 3)
  - `spiritual-state.ts` → `@deprecated Phase 2: PastoralLog로 통합됨`
  - `breakthrough.ts` → `@deprecated Phase 2: PastoralLog로 통합됨`
- [ ] `app/src/store/pastoralCareStore.ts`에 deprecation 주석 추가
  - 새 기능은 `pastoralLogStore.ts` 사용 안내

### 영향받는 파일

| 작업 | 수정 | 생성 | 삭제 |
|------|------|------|------|
| 엔티티 | `domain/entities/activity-plan.ts`, `domain/entities/index.ts` | `domain/entities/pastoral-log.ts` | - |
| DB | `infrastructure/database/schema.ts` | `supabase/migrations/003_pastoral_logs.sql` | - |
| 리포지토리 | `infrastructure/repositories/supabase/index.ts` | `infrastructure/repositories/supabase/pastoral-log-repository.ts` | - |
| 스토어 | `store/index.ts` | `store/pastoralLogStore.ts` | - |
| 컴포넌트 | `presentation/components/ActivityEvaluationDialog.tsx`, `presentation/pages/SoulCarePage.tsx` | `presentation/components/PastoralLogForm.tsx`, `presentation/components/PastoralLogList.tsx`, `presentation/components/PastoralLogCard.tsx` | - |
| Deprecation | `domain/entities/spiritual-state.ts`, `domain/entities/breakthrough.ts`, `store/pastoralCareStore.ts` | - | - |

### 검증 기준

1. PastoralLog CRUD가 Supabase에서 정상 동작
2. Soul 상세 페이지에서 목양 일지를 작성하고 목록을 확인할 수 있음
3. ActivityPlan 완료 시 PastoralLog 작성 폼이 연동됨
4. 기존 SoulTemperaturePanel, BreakthroughJournal이 여전히 렌더링됨 (이 Phase에서는 삭제하지 않음)
5. `tsc --noEmit` 타입 체크 통과
6. 기존 기능(Soul CRUD, Progress, ActivityPlan)에 regression 없음

### 예상 위험

| 위험 | 영향 | 대응 |
|------|------|------|
| PastoralLog 폼이 너무 복잡해짐 | 중간 | 섹션별 접기/펼치기로 UX 단순화, 필수 필드 최소화 |
| ActivityPlan 테이블 스키마 불일치 | 높음 | 도메인 엔티티의 ActivityPlan과 DB activity_plans 테이블의 차이 먼저 해소 |
| pastoralCareStore와 pastoralLogStore 혼재 | 낮음 | 명확한 deprecation 주석과 사용 가이드 |

### 마이그레이션 전략

- **데이터 마이그레이션**: 이 Phase에서는 기존 localStorage 데이터를 PastoralLog로 변환하지 않음 (Phase 3에서 처리)
- **코드 마이그레이션**: 기존 컴포넌트를 즉시 삭제하지 않고 `@deprecated` 표시 후 공존
- **점진적 전환**: SoulCarePage에서 새 PastoralLog UI를 primary로, 기존 패널을 secondary로 배치

---

## Phase 3: Data Migration & Views (데이터 마이그레이션 & 뷰)

**예상 기간:** 2주
**핵심 목적:** localStorage에 남아있는 모든 목양 데이터를 Supabase로 마이그레이션하고, deprecated 엔티티를 삭제하며, Activity Timeline 뷰와 경량화된 Crisis Detection을 구현

### 의존성

- Phase 2 완료 필수 (PastoralLog 엔티티 및 Supabase 테이블 존재)

### 작업 목록

#### 3.1 localStorage 데이터 Supabase 마이그레이션

- [ ] `app/src/utils/pastoral-data-migration.ts` 생성
  - localStorage의 기존 데이터를 PastoralLog 형태로 변환하는 변환 함수
  - SpiritualState -> PastoralLog (type: 'observation')
  - Breakthrough -> PastoralLog (hasBreakthrough: true)
  - ActivityEvaluation (ActivityPlan 내장) -> PastoralLog (type: 활동 타입에 따라)
  - CrisisAlert -> 별도 마이그레이션 (경량화된 새 구조로)
  - Milestone -> 마이그레이션 불필요 (Activity Timeline 뷰가 대체)
- [ ] `app/src/presentation/components/MigrationModal.tsx` 수정
  - 기존 마이그레이션 모달에 목양 데이터 마이그레이션 단계 추가
  - 진행률 표시, 에러 핸들링, 롤백 기능

#### 3.2 Activity Timeline 뷰 구현

- [ ] `app/src/presentation/components/ActivityTimeline.tsx` 생성
  - RelationshipTimeline을 대체하는 새 뷰
  - 데이터 소스: ActivityPlan(완료된 것) + PastoralLog
  - 시간순 타임라인 표시 (활동, 목양 일지, 돌파 포인트)
  - 필터: 날짜 범위, 활동 타입
  - 하이라이트: 돌파 기록이 있는 항목 강조
- [ ] `app/src/presentation/pages/SoulTimelinePage.tsx` 수정
  - 기존 RelationshipTimeline 컴포넌트를 ActivityTimeline으로 교체

#### 3.3 Crisis Detection 경량화

- [ ] `app/src/domain/services/crisis-detection.service.ts` 리팩토링
  - 기존 입력: ActivityPlan, SpiritualState, Breakthrough, AreaProgress
  - 새 입력: ActivityPlan, PastoralLog, AreaProgress (Supabase 데이터 기반)
  - SpiritualState/Breakthrough 의존성 제거
  - PastoralLog의 mood, hungerLevel, closenessLevel, hasBreakthrough 필드 활용
- [ ] Crisis Detection 클라이언트 사이드 계산 최적화
  - Soul별 최근 N개 PastoralLog만 조회하여 계산
  - 결과를 Zustand 스토어에 캐싱 (별도 저장 불필요)
- [ ] `app/src/presentation/components/CrisisAlertPanel.tsx` 수정
  - 새 Crisis Detection 서비스 연동
  - CrisisAlert 엔티티 대신 계산된 결과 직접 사용

#### 3.4 pastoralCareStore 해체

- [ ] `app/src/store/pastoralCareStore.ts` 기능 분리
  - SpiritualState 관련 -> 삭제 (PastoralLog로 대체)
  - Breakthrough 관련 -> 삭제 (PastoralLog로 대체)
  - CrisisAlert 관련 -> 경량화 후 pastoralLogStore 또는 별도 스토어로 이동
  - Readiness 관련 -> Phase 4로 이관 (AI Insights)
  - Milestone 관련 -> 삭제 (ActivityTimeline이 대체)
  - Encouragement 관련 -> Phase 4로 이관
  - Prescription 관련 -> Phase 4로 이관
- [ ] `app/src/store/index.ts` barrel export 업데이트

#### 3.5 Deprecated 엔티티 및 컴포넌트 삭제

- [ ] 엔티티 파일 삭제
  - `app/src/domain/entities/spiritual-state.ts`
  - `app/src/domain/entities/breakthrough.ts`
  - `app/src/domain/entities/relationship-timeline.ts`
- [ ] 도메인 서비스 삭제/리팩토링
  - `app/src/domain/services/encouragement.service.ts` -> Phase 4에서 간소화 후 유지 (아직 삭제하지 않음)
- [ ] 컴포넌트 삭제
  - `app/src/presentation/components/SoulTemperaturePanel.tsx`
  - `app/src/presentation/components/BreakthroughJournal.tsx`
  - `app/src/presentation/components/RelationshipTimeline.tsx`
- [ ] `app/src/domain/entities/index.ts` 업데이트
  - 삭제된 엔티티 export 제거
  - `pastoral-log.ts` export 추가

#### 3.6 ActivityPlan DB 스키마 정합성 확보

- [ ] `supabase/migrations/004_activity_plans_update.sql` 생성
  - 도메인 엔티티 `ActivityPlan`과 DB `activity_plans` 테이블의 불일치 해소
  - DB에 `type`, `status`, `scheduled_at`, `completed_at`, `location`, `notes` 컬럼 추가
  - 기존 `is_completed` -> `status` 마이그레이션
  - `evaluation` 필드는 추가하지 않음 (PastoralLog가 대체)
- [ ] `app/src/infrastructure/repositories/supabase/activity-plan-repository.ts` 수정

### 영향받는 파일

| 작업 | 수정 | 생성 | 삭제 |
|------|------|------|------|
| 데이터 마이그레이션 | `presentation/components/MigrationModal.tsx` | `utils/pastoral-data-migration.ts` | - |
| Activity Timeline | `presentation/pages/SoulTimelinePage.tsx` | `presentation/components/ActivityTimeline.tsx` | - |
| Crisis Detection | `domain/services/crisis-detection.service.ts`, `presentation/components/CrisisAlertPanel.tsx` | - | - |
| 스토어 해체 | `store/index.ts` | - | `store/pastoralCareStore.ts` |
| 엔티티 삭제 | `domain/entities/index.ts` | - | `domain/entities/spiritual-state.ts`, `domain/entities/breakthrough.ts`, `domain/entities/relationship-timeline.ts` |
| 컴포넌트 삭제 | - | - | `presentation/components/SoulTemperaturePanel.tsx`, `presentation/components/BreakthroughJournal.tsx`, `presentation/components/RelationshipTimeline.tsx` |
| DB 정합성 | `infrastructure/repositories/supabase/activity-plan-repository.ts`, `infrastructure/database/schema.ts` | `supabase/migrations/004_activity_plans_update.sql` | - |

### 검증 기준

1. localStorage에 저장된 기존 목양 데이터가 Supabase PastoralLog로 마이그레이션됨
2. 마이그레이션 후 localStorage 목양 데이터 키가 정리됨 (또는 백업 후 제거)
3. Activity Timeline이 SoulTimelinePage에서 정상 렌더링됨
4. Crisis Detection이 PastoralLog 데이터 기반으로 동작
5. 삭제된 파일에 대한 import가 프로젝트에 존재하지 않음
6. `tsc --noEmit` 타입 체크 통과
7. `pastoralCareStore`가 더 이상 사용되지 않음

### 예상 위험

| 위험 | 영향 | 대응 |
|------|------|------|
| 데이터 마이그레이션 중 데이터 손실 | **높음** | 마이그레이션 전 localStorage 스냅샷 백업, 롤백 함수 준비 |
| 삭제된 컴포넌트를 참조하는 코드 누락 | 중간 | 삭제 전 `grep -r` 으로 모든 import 경로 확인 |
| Crisis Detection 정확도 변화 | 낮음 | 기존 로직 테스트 케이스 작성 후 리팩토링, 결과 비교 |
| ActivityPlan DB 마이그레이션 충돌 | 중간 | 기존 데이터 백업, `is_completed` -> `status` 변환 스크립트 |

### 마이그레이션 전략

- **데이터 마이그레이션 순서**:
  1. localStorage 데이터를 메모리에 로드
  2. PastoralLog 형태로 변환
  3. Supabase에 batch insert
  4. 성공 확인 후 localStorage 키 제거 (실패 시 유지)
- **컴포넌트 삭제 순서**:
  1. 먼저 페이지에서 import 제거 및 대체 컴포넌트 연결
  2. 스토어에서 관련 액션 제거
  3. 엔티티 파일 삭제
  4. 컴포넌트 파일 삭제
- **점진적 삭제**: 한 번에 모든 파일을 삭제하지 않고, 삭제할 파일 목록을 만들어 하나씩 처리하며 빌드 확인

---

## Phase 4: Intelligence & Polish (AI & 마무리)

**예상 기간:** 2주
**핵심 목적:** AI Insights를 계산 뷰로 구현하고, Encouragement를 간소화하며, 대시보드를 리디자인하고, PWA 오프라인 캐시를 추가하여 전체 업그레이드 완료

### 의존성

- Phase 3 완료 필수 (모든 데이터가 Supabase에 존재, PastoralLog 기반 워크플로우 안정화)

### 작업 목록

#### 4.1 AI Insights 계산 뷰 구현

- [ ] `app/src/application/services/insights-service.ts` 리팩토링
  - 기존 `reproduction-readiness.ts`, `spiritual-prescription.ts`의 핵심 로직 추출
  - Progress + PastoralLog 데이터를 분석하여 인사이트 생성
  - **별도 테이블 저장 없음** - 요청 시 계산하여 반환
  - 인사이트 유형:
    - 재생산 준비도 점수 (Progress 완료율 + PastoralLog 긍정 지표 기반)
    - 양육 방향 제안 (PastoralLog의 mood/hunger/closeness 트렌드 기반)
    - 주간/월간 요약 (활동 통계 + 핵심 돌파 하이라이트)
- [ ] `app/src/presentation/components/InsightsPanel.tsx` 생성
  - 계산된 인사이트를 카드 형태로 표시
  - 준비도 게이지, 트렌드 차트, 추천 액션
- [ ] `app/src/presentation/pages/InsightsPage.tsx` 수정
  - 새 InsightsPanel 통합

#### 4.2 Encouragement 간소화

- [ ] `app/src/domain/entities/encouragement.ts` 대폭 간소화
  - Badge, GratitudeMessage, TrainerStatistics 제거
  - Encouragement를 AI 보조 격려 메시지로 단순화

```typescript
// 간소화된 Encouragement
export interface Encouragement {
  id: string;
  trainerId: string;
  type: 'milestone' | 'weekly_summary' | 'encouragement' | 'reminder';
  title: string;
  message: string;          // AI 생성 또는 템플릿 기반
  relatedSoulId?: string;
  isRead: boolean;
  createdAt: string;
}
```

- [ ] `app/src/domain/services/encouragement.service.ts` 간소화
  - Badge 로직 제거
  - AI 보조 격려 메시지 생성으로 전환 (PastoralLog 분석 기반)
  - 주간 요약 메시지 생성
- [ ] `app/src/presentation/components/EncouragementPanel.tsx` 리디자인
  - 배지/통계 UI 제거
  - 격려 메시지 카드 목록으로 단순화

#### 4.3 Deprecated 엔티티 최종 삭제

- [ ] 엔티티 파일 삭제
  - `app/src/domain/entities/reproduction-readiness.ts`
  - `app/src/domain/entities/spiritual-prescription.ts`
  - `app/src/domain/entities/crisis-alert.ts` (경량화된 인라인 타입으로 대체)
- [ ] 컴포넌트 삭제
  - `app/src/presentation/components/ReproductionReadinessPanel.tsx`
  - `app/src/presentation/components/SpiritualPrescriptionPanel.tsx`
- [ ] 도메인 서비스 정리
  - `app/src/domain/services/encouragement.service.ts` -> 간소화된 버전으로 교체
  - `app/src/domain/services/crisis-detection.service.ts` -> 이미 Phase 3에서 리팩토링됨, 최종 정리
- [ ] `app/src/domain/entities/index.ts` 최종 업데이트

#### 4.4 대시보드 리디자인

- [ ] `app/src/presentation/pages/DashboardPage.tsx` 리디자인
  - 통합된 데이터 모델 반영
  - 위젯 구성:
    - 전체 Soul 현황 (활성/비활성, 양육 타입별)
    - 이번 주 활동 요약 (ActivityPlan 기반)
    - 관심 필요 Soul (Crisis Detection 경량 결과)
    - 최근 목양 일지 요약
    - AI 인사이트 스니펫
- [ ] `app/src/presentation/components/Dashboard/` 하위 컴포넌트 업데이트
  - `TodaysFocus.tsx` - PastoralLog + ActivityPlan 연동
  - `AttentionNeeded.tsx` - 경량 Crisis Detection 결과 사용
  - `RecentActivity.tsx` - PastoralLog 기반
  - `QuickStats.tsx` - 통합 통계

#### 4.5 PWA / IndexedDB 오프라인 캐시

- [ ] IndexedDB 캐시 레이어 구현
  - `app/src/infrastructure/cache/indexed-db-cache.ts` 생성
  - Supabase 데이터의 로컬 캐시 (Soul, PastoralLog, ActivityPlan, Progress)
  - 온라인 복귀 시 자동 동기화
  - 충돌 해결 전략: last-write-wins (서버 우선)
- [ ] Service Worker 설정 (Vite PWA 플러그인 활용)
  - 앱 셸 캐싱
  - API 요청 캐싱 전략 (stale-while-revalidate)
- [ ] 오프라인 상태 표시 UI
  - 네트워크 상태 배너
  - 오프라인 모드에서 읽기 가능 / 쓰기 큐잉

#### 4.6 성능 최적화 및 최종 QA

- [ ] React 렌더링 최적화
  - 불필요한 리렌더링 방지 (Zustand selector 최적화)
  - 대량 데이터 목록 가상화 (react-window 등)
- [ ] Supabase 쿼리 최적화
  - N+1 쿼리 방지
  - 필요한 인덱스 추가
- [ ] 전체 기능 QA 체크리스트
  - [ ] Soul CRUD (생성, 조회, 수정, 삭제, 프로필 포함)
  - [ ] Progress 관리 (Grid 뷰, 진도 업데이트)
  - [ ] ActivityPlan CRUD (계획, 완료, 연결)
  - [ ] PastoralLog CRUD (작성, 조회, 수정, 삭제)
  - [ ] Activity Timeline 뷰
  - [ ] Crisis Detection (관심 필요 Soul 표시)
  - [ ] AI Insights (계산 뷰)
  - [ ] Encouragement (격려 메시지)
  - [ ] Dashboard (전체 위젯)
  - [ ] 인증 (로그인, 회원가입, 로그아웃)
  - [ ] 오프라인 모드 (읽기, 쓰기 큐)
  - [ ] Demo Mode 호환성

### 영향받는 파일

| 작업 | 수정 | 생성 | 삭제 |
|------|------|------|------|
| AI Insights | `application/services/insights-service.ts`, `presentation/pages/InsightsPage.tsx` | `presentation/components/InsightsPanel.tsx` | - |
| Encouragement | `domain/entities/encouragement.ts`, `domain/services/encouragement.service.ts`, `presentation/components/EncouragementPanel.tsx` | - | - |
| 엔티티 삭제 | `domain/entities/index.ts` | - | `domain/entities/reproduction-readiness.ts`, `domain/entities/spiritual-prescription.ts`, `domain/entities/crisis-alert.ts` |
| 컴포넌트 삭제 | - | - | `presentation/components/ReproductionReadinessPanel.tsx`, `presentation/components/SpiritualPrescriptionPanel.tsx` |
| 대시보드 | `presentation/pages/DashboardPage.tsx`, `presentation/components/Dashboard/*.tsx` | - | - |
| PWA | - | `infrastructure/cache/indexed-db-cache.ts`, Service Worker 설정 | - |

### 검증 기준

1. AI Insights가 저장 없이 계산 뷰로 동작하며 InsightsPage에 표시됨
2. Encouragement가 간소화된 메시지 목록으로 동작
3. 삭제 대상 엔티티(reproduction-readiness, spiritual-prescription, crisis-alert)가 프로젝트에서 완전 제거
4. 대시보드가 통합된 데이터 모델을 반영
5. 오프라인 모드에서 기존 데이터 조회 가능, 온라인 복귀 시 동기화
6. 전체 QA 체크리스트 통과
7. `tsc --noEmit` 타입 체크 통과
8. Lighthouse 성능 점수 90+ (PWA 적용 후)

### 예상 위험

| 위험 | 영향 | 대응 |
|------|------|------|
| AI Insights 계산 비용이 큰 경우 | 중간 | 결과 캐싱 (5분 TTL), 무거운 계산은 Supabase Edge Function으로 이관 |
| IndexedDB 동기화 충돌 | 높음 | last-write-wins 전략 + 충돌 로그 기록, 중요 데이터는 서버 우선 |
| PWA 서비스 워커 캐시 무효화 | 낮음 | 버전 기반 캐시 전략, 수동 캐시 클리어 옵션 |
| Encouragement 간소화로 기존 배지 데이터 유실 | 낮음 | 마이그레이션 시 기존 배지 데이터는 아카이브 (별도 localStorage 백업) |

### 마이그레이션 전략

- **AI Insights**: 기존 ReproductionReadiness, SpiritualPrescription의 핵심 계산 로직만 추출하여 새 서비스에 통합. 저장된 데이터는 폐기 (localStorage에만 있었으므로 자연 소멸)
- **Encouragement**: 기존 Badge/GratitudeMessage 데이터는 localStorage에만 있으므로 마이그레이션 불필요. 간소화된 Encouragement만 Supabase에 저장
- **PWA**: 기존 앱에 점진적으로 적용. Service Worker 등록 실패 시 기존 동작에 영향 없음

---

## 보류 항목

Synod 합의에 따라 다음 항목은 현재 로드맵에서 제외됩니다.

| 항목 | 사유 | 재검토 시점 |
|------|------|-------------|
| **Global Search** | 핵심 워크플로우 안정화 우선 | Phase 4 완료 후 |
| **Notification Center** | 핵심 워크플로우 안정화 우선 | Phase 4 완료 후 |
| **AI 기반 자동 위기 감지 (Edge Functions)** | 클라이언트 경량 버전 먼저 검증 | Phase 3 완료 후 효과 평가 |
| **멀티 양육자 협업** | 현재 단일 사용자 모델로 충분 | 사용자 피드백에 따라 |

---

## 부록: 엔티티 매핑 표

### 현재 -> 목표 엔티티 매핑

| 현재 엔티티 | Phase | 목표 상태 |
|-------------|-------|-----------|
| Soul | 1 | **통합** (Soul + SoulProfile + SoulDetails -> Soul) |
| SoulProfile | 1 | **삭제** (Soul에 인라인) |
| SoulDetails | 1 | **삭제** (Soul에 인라인) |
| Progress | - | **유지** |
| ActivityPlan | 2-3 | **유지** (evaluation 필드 deprecated, DB 정합성 확보) |
| ActivityEvaluation | 2 | **통합** (PastoralLog로) |
| SpiritualState | 2-3 | **삭제** (PastoralLog로 통합) |
| Breakthrough | 2-3 | **삭제** (PastoralLog로 통합) |
| CrisisAlert | 3-4 | **삭제** (계산 뷰로 대체) |
| RelationshipTimeline | 3 | **삭제** (ActivityTimeline 뷰로 대체) |
| ReproductionReadiness | 4 | **삭제** (AI Insights 계산 뷰로 대체) |
| SpiritualPrescription | 4 | **삭제** (AI Insights 계산 뷰로 대체) |
| Encouragement | 4 | **간소화** (Badge/GratitudeMessage/TrainerStatistics 제거) |
| **PastoralLog** | 2 | **신규 생성** |

### 최종 엔티티 구조 (Phase 4 완료 후)

```
app/src/domain/entities/
  soul.ts              # 통합된 Soul 엔티티
  progress.ts          # 진도 추적 (변경 없음)
  activity-plan.ts     # 활동 계획 (evaluation 제거)
  pastoral-log.ts      # 목양 일지 (신규)
  encouragement.ts     # 간소화된 격려 메시지
  recommendation.ts    # 활동 추천 (변경 없음)
  user.ts              # 사용자 (변경 없음)
  index.ts             # barrel export
```

### Supabase 최종 테이블 구조

```
profiles          # 사용자 프로필 (변경 없음)
souls             # 영혼 (프로필 필드 추가)
progress          # 진도 (변경 없음)
activity_plans    # 활동 계획 (스키마 업데이트)
activity_recommendations  # 활동 추천 (변경 없음)
pastoral_logs     # 목양 일지 (신규)
```

---

> 이 로드맵은 Synod 숙의 결과를 반영한 살아있는 문서입니다.
> 각 Phase 완료 시 실제 진행 상황을 기반으로 다음 Phase의 세부 사항을 조정할 수 있습니다.
