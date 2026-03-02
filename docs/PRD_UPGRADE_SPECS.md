# Grid 교회 양육 관리 시스템 - PRD & 개발 Specs

> **문서 버전**: 1.0
> **작성일**: 2026-03-02
> **상태**: Approved
> **기술 스택**: React + TypeScript, Zustand, Supabase, Clean Architecture

---

## 목차

1. [Product Overview](#1-product-overview)
2. [Current Problems](#2-current-problems)
3. [Upgrade Goals & KPIs](#3-upgrade-goals--kpis)
4. [Feature Specifications](#4-feature-specifications)
5. [Database Schema Changes](#5-database-schema-changes)
6. [Repository/Service Layer Changes](#6-repositoryservice-layer-changes)
7. [UI/UX Changes](#7-uiux-changes)
8. [Non-Functional Requirements](#8-non-functional-requirements)
9. [Acceptance Criteria](#9-acceptance-criteria)
10. [Edge Cases & Risks](#10-edge-cases--risks)

---

## 1. Product Overview

### 1.1 제품 비전

Grid는 교회 양육자(목회자, 소그룹 리더)가 양육 대상자(Soul)의 영적 성장을 체계적으로 기록하고 추적할 수 있는 웹 애플리케이션이다. 양육 과정의 진도 관리, 활동 계획, 목양 기록을 하나의 플랫폼에서 통합 관리하여 양육의 질을 높이는 것이 목표이다.

### 1.2 목표 사용자

| 사용자 유형 | 설명 | 핵심 니즈 |
|------------|------|----------|
| **양육자 (Trainer)** | 교회에서 새신자/제자를 양육하는 사람 | 양육 진도 추적, 목양 기록, 활동 관리 |
| **목회자 (Admin)** | 양육 사역을 총괄하는 목회자 | 전체 양육 현황 파악, 위기 감지 |

### 1.3 핵심 가치

1. **단순함**: 양육자가 5분 이내에 한 주의 양육 기록을 완료할 수 있어야 한다
2. **통합성**: 분산된 데이터를 하나의 흐름으로 통합한다
3. **실용성**: 실제 양육 현장에서 쓸 수 있는 기능만 남긴다
4. **인사이트**: 축적된 데이터에서 의미 있는 패턴을 발견한다

---

## 2. Current Problems

### 2.1 과설계 (Over-Engineering)

현재 도메인 엔티티가 **13개**에 달하며, 실제 사용되지 않는 기능이 다수 포함되어 있다.

| AS-IS 엔티티 | 실사용 여부 | 문제점 |
|-------------|-----------|--------|
| Soul | O | SoulDetails와 분리되어 있어 불필요한 복잡성 |
| SoulProfile | O | Soul과 별도 인터페이스지만 동일 UI에서 관리 |
| Progress | O | 정상 작동 |
| ActivityPlan | O | DB 스키마(planType, isCompleted)와 도메인 모델(type, status)이 불일치 |
| ActivityEvaluation | △ | ActivityPlan에 내장되어 있으나 별도 기록 필요 |
| SpiritualState | △ | 독립 기록이지만 활동과 연결 부족 |
| Breakthrough | △ | SpiritualState와 중복되는 기록 흐름 |
| CrisisAlert | △ | 감지 로직이 클라이언트에 있어 비효율 |
| Encouragement | X | Badge, GratitudeMessage 등 미구현 기능 다수 |
| ReproductionReadiness | X | 복잡한 체크리스트, 실사용 어려움 |
| SpiritualPrescription | X | AI 의존 기능, Phase 1에서 불필요 |
| RelationshipTimeline | X | Activity Timeline으로 대체 가능 |
| Recommendation | O | 정상 작동 (시드 데이터 기반) |

### 2.2 데이터 분산

| 저장소 | 데이터 | 문제점 |
|-------|-------|--------|
| Supabase `souls` | 이름, 타입, 시작일 | phoneNumber, email 등 미포함 |
| Supabase `progress` | 진도 데이터 | 정상 |
| Supabase `activity_plans` | 활동 계획 | 도메인 모델과 스키마 불일치 |
| localStorage `grid_demo_souls` | 데모 Soul | Supabase와 이중 관리 |
| localStorage `grid_demo_activity_plans` | 데모 활동 | Supabase와 이중 관리 |
| localStorage (기타) | SpiritualState, Breakthrough 등 | Supabase 미연동 |

### 2.3 복잡한 UX

- 영적 상태 기록, 돌파 기록, 활동 평가가 각각 별도 폼으로 분리
- 하나의 양육 만남 후 3개 이상의 폼을 작성해야 함
- 양육자 피로도 증가, 기록 누락 발생

### 2.4 도메인 모델 vs DB 스키마 불일치

```
// 도메인 모델 (activity-plan.ts)
type: ActivityType  // 'meeting' | 'call' | 'study' | ...
status: ActivityStatus  // 'planned' | 'in-progress' | 'completed' | 'cancelled'

// DB 스키마 (001_initial_schema.sql)
plan_type: PlanType  // 'recommended' | 'custom'
is_completed: boolean
```

이 불일치로 인해 repository 레이어에서 별도의 인터페이스를 재정의하고 있으며, 도메인 로직과 인프라 코드가 혼재되어 있다.

---

## 3. Upgrade Goals & KPIs

### 3.1 목표

| 목표 | 측정 지표 | 목표치 |
|-----|---------|-------|
| 엔티티 단순화 | 도메인 엔티티 수 | 13개 → 6개 (54% 감소) |
| 핵심 워크플로우 집중 | 주요 사용자 흐름 | 3개 (양육 기록, 진도 관리, 활동 계획) |
| 데이터 일원화 | 데이터 저장소 | Supabase 단일화 (Demo Mode 점진 폐기) |
| 기록 간소화 | 양육 후 입력 시간 | 3분 이내 (목양일지 단일 폼) |
| DB 모델 정합성 | 도메인-DB 불일치 | 0건 |

### 3.2 TO-BE 엔티티 구조

```
AS-IS (13개)                    TO-BE (6개)
─────────────                   ──────────
Soul                    ──→    Soul (통합: SoulDetails + SoulProfile 흡수)
SoulProfile             ──┘
Progress                ──→    Progress (변경 없음)
ActivityPlan            ──→    ActivityPlan (정비: evaluation 제거, 스키마 통합)
ActivityEvaluation      ──┐
SpiritualState          ──┤→   PastoralLog (신규: 통합 목양 일지)
Breakthrough            ──┘
CrisisAlert             ──→    CrisisAlert (경량화: 클라이언트 계산)
User                    ──→    User (변경 없음)
Encouragement           ──→    삭제 (Badge, GratitudeMessage, TrainerStatistics 포함)
ReproductionReadiness   ──→    삭제 (AI 계산 뷰로 대체)
SpiritualPrescription   ──→    삭제 (AI 계산 뷰로 대체)
RelationshipTimeline    ──→    삭제 (Activity Timeline 뷰로 대체)
Recommendation          ──→    Recommendation (변경 없음, 시드 데이터)
```

### 3.3 Phase 계획

| Phase | 범위 | 목표 시점 |
|-------|-----|----------|
| **Phase 1** | Soul 통합, PastoralLog 도입, ActivityPlan 정비, Encouragement 폐기 | 2주 |
| **Phase 2** | Supabase 마이그레이션, localStorage 데이터 변환, Demo Mode 점진 폐기 | 2주 |
| **Phase 3** | AI Insights 규칙 기반 계산 뷰, Crisis Detection 경량화 | 2주 |
| **Phase 4** | 오프라인 IndexedDB 쓰기+동기화, AI LLM 통합 검토 | 별도 |

---

## 4. Feature Specifications

### 4.1 Soul 엔티티 통합

#### Before (AS-IS)

```typescript
// 3개의 분리된 인터페이스
interface Soul {
  id: string;
  name: string;
  trainingType: TrainingType;
  startDate: string;
  createdAt: string;
  updatedAt: string;
  trainerId?: string;
  isActive: boolean;
}

interface SoulProfile {
  ageGroup?: 'teens' | '20s' | '30s' | '40s' | '50s' | '60s+';
  gender?: 'male' | 'female';
  occupation?: string;
  mbti?: string;
  faithBackground?: 'new' | 'returned' | 'transferred' | 'seeker';
  // ... 15개 이상의 선택 필드
}

interface SoulDetails extends Soul {
  phoneNumber?: string;
  email?: string;
  address?: string;
  birthDate?: string;
  notes?: string;
  profile?: SoulProfile;
}
```

**DB 스키마 (AS-IS)**:
```sql
CREATE TABLE souls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  training_type TEXT NOT NULL CHECK (training_type IN ('convert', 'disciple')),
  start_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- phoneNumber, email, profile 등 미포함
```

#### After (TO-BE)

```typescript
// 단일 통합 인터페이스
interface Soul {
  id: string;
  name: string;
  trainingType: TrainingType;  // 'convert' | 'disciple'
  startDate: string;
  createdAt: string;
  updatedAt: string;
  trainerId?: string;
  isActive: boolean;

  // SoulDetails 흡수
  phoneNumber?: string;
  email?: string;
  address?: string;
  birthDate?: string;
  notes?: string;

  // SoulProfile 흡수 (JSONB 단일 컬럼)
  profile?: SoulProfile;
}

// SoulProfile은 타입으로만 유지 (JSONB 값 타입)
interface SoulProfile {
  ageGroup?: 'teens' | '20s' | '30s' | '40s' | '50s' | '60s+';
  gender?: 'male' | 'female';
  occupation?: string;
  mbti?: string;
  faithBackground?: 'new' | 'returned' | 'transferred' | 'seeker';
  previousChurchExperience?: string;
  hasSalvationAssurance?: boolean;
  salvationDate?: string;
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

// DTO
interface CreateSoulDto {
  name: string;
  trainingType: TrainingType;
  startDate: string;
  trainerId?: string;
  phoneNumber?: string;
  email?: string;
  notes?: string;
  profile?: SoulProfile;
}

interface UpdateSoulDto {
  name?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  birthDate?: string;
  notes?: string;
  isActive?: boolean;
  profile?: SoulProfile;
}
```

**DB 스키마 (TO-BE)**:
```sql
ALTER TABLE souls
  ADD COLUMN phone_number TEXT,
  ADD COLUMN email TEXT,
  ADD COLUMN address TEXT,
  ADD COLUMN birth_date TEXT,
  ADD COLUMN notes TEXT CHECK (char_length(notes) <= 2000),
  ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN profile JSONB DEFAULT '{}';
```

#### 변경 범위

| 파일 | 변경 내용 |
|-----|---------|
| `domain/entities/soul.ts` | SoulDetails 제거, Soul에 필드 통합 |
| `infrastructure/database/schema.ts` | Soul 타입에 새 컬럼 추가 |
| `infrastructure/repositories/supabase/soul-repository.ts` | mapDbToDomain에 새 필드 매핑 추가 |
| `store/soulStore.ts` | SoulDetails 참조 제거 |
| `types/index.ts` | Soul 타입 동기화 |

#### 인수 조건

- [ ] Soul 생성 시 phoneNumber, email, profile 저장 가능
- [ ] Soul 조회 시 통합된 모든 필드 반환
- [ ] SoulDetails 인터페이스가 코드베이스에서 완전 제거
- [ ] 기존 Soul 데이터와 하위 호환성 유지 (새 필드는 모두 optional)

---

### 4.2 목양 일지 (PastoralLog) -- 핵심 Feature

#### 개요

PastoralLog는 이번 업그레이드의 **가장 중요한 신규 엔티티**이다. 기존에 분산되어 있던 ActivityEvaluation, SpiritualState, Breakthrough를 하나의 통합 기록으로 합친다.

#### 설계 원칙

1. **1회 만남 = 1개 기록**: 양육자가 한 번의 만남 후 단일 폼으로 모든 것을 기록
2. **ActivityPlan과 1:1 선택적 연결**: `activityPlanId`는 optional, 활동 없이 독립 기록 가능
3. **점진적 입력**: 필수 필드(mood, hungerLevel, closenessLevel)만 있으면 저장 가능, 나머지는 선택

#### Before (AS-IS)

```
[양육 만남 발생]
    ├── ActivityPlan.evaluation에 평가 기록     (폼 1)
    ├── SpiritualState 별도 생성               (폼 2)
    └── Breakthrough 별도 생성 (있을 경우)      (폼 3)
```

3개의 폼, 3개의 엔티티, 3번의 API 호출이 필요했다.

#### After (TO-BE)

```
[양육 만남 발생]
    └── PastoralLog 1개 생성                   (폼 1)
         ├── 활동 평가 섹션 (optional)
         ├── 영적 상태 섹션 (required)
         └── 영적 돌파 섹션 (optional)
```

1개의 폼, 1개의 엔티티, 1번의 API 호출로 완료된다.

#### TypeScript 인터페이스

```typescript
import type { BreakthroughCategory, BibleReference } from './breakthrough';

type SpiritualMood = 'growing' | 'stable' | 'struggling';

interface PastoralLog {
  id: string;
  soulId: string;
  activityPlanId?: string;  // 선택적 1:1 연결

  // ── 활동 평가 (from ActivityEvaluation) ──
  rating?: 1 | 2 | 3 | 4 | 5;
  evaluationNotes?: string;          // max 2000자

  // ── 영적 상태 (from SpiritualState) ── 필수 섹션
  mood: SpiritualMood;
  hungerLevel: 1 | 2 | 3 | 4 | 5;
  closenessLevel: 1 | 2 | 3 | 4 | 5;
  observations?: string;             // max 2000자
  concerns?: string;                 // max 2000자
  praises?: string;                  // max 2000자
  prayerNeeds?: string;              // max 2000자

  // ── 영적 돌파 (from Breakthrough) ── 선택적 섹션
  hasBreakthrough: boolean;
  breakthroughCategory?: BreakthroughCategory;
  breakthroughTitle?: string;        // max 200자
  breakthroughDescription?: string;  // max 5000자
  bibleReferences?: BibleReference[];

  // ── 다음 단계 ──
  nextSteps?: string;                // max 2000자
  followUpActions?: string[];

  // ── 타임스탬프 ──
  recordedAt: string;   // 실제 기록 일시
  createdAt: string;
  updatedAt: string;
}

// DTO
interface CreatePastoralLogDto {
  soulId: string;
  activityPlanId?: string;

  // 활동 평가
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

  // 영적 돌파
  hasBreakthrough?: boolean;
  breakthroughCategory?: BreakthroughCategory;
  breakthroughTitle?: string;
  breakthroughDescription?: string;
  bibleReferences?: BibleReference[];

  // 다음 단계
  nextSteps?: string;
  followUpActions?: string[];

  recordedAt?: string;  // 미입력 시 NOW()
}

interface UpdatePastoralLogDto {
  rating?: 1 | 2 | 3 | 4 | 5;
  evaluationNotes?: string;
  mood?: SpiritualMood;
  hungerLevel?: 1 | 2 | 3 | 4 | 5;
  closenessLevel?: 1 | 2 | 3 | 4 | 5;
  observations?: string;
  concerns?: string;
  praises?: string;
  prayerNeeds?: string;
  hasBreakthrough?: boolean;
  breakthroughCategory?: BreakthroughCategory;
  breakthroughTitle?: string;
  breakthroughDescription?: string;
  bibleReferences?: BibleReference[];
  nextSteps?: string;
  followUpActions?: string[];
}

// 필터
interface PastoralLogFilter {
  soulId?: string;
  mood?: SpiritualMood;
  hasBreakthrough?: boolean;
  dateFrom?: string;
  dateTo?: string;
  activityPlanId?: string;
}

// 요약 (대시보드용)
interface PastoralLogSummary {
  soulId: string;
  soulName: string;
  totalLogs: number;
  latestMood: SpiritualMood;
  moodTrend: 'improving' | 'stable' | 'declining';
  averageHunger: number;
  averageCloseness: number;
  breakthroughCount: number;
  lastRecordedAt: string;
  needsAttention: boolean;      // mood='struggling' 2주 이상 연속
  daysSinceLastLog: number;
}
```

#### DDL

```sql
CREATE TABLE pastoral_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  soul_id UUID REFERENCES souls(id) ON DELETE CASCADE NOT NULL,
  activity_plan_id UUID REFERENCES activity_plans(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,

  -- 활동 평가
  rating SMALLINT CHECK (rating BETWEEN 1 AND 5),
  evaluation_notes TEXT CHECK (char_length(evaluation_notes) <= 2000),

  -- 영적 상태 (필수)
  mood TEXT NOT NULL CHECK (mood IN ('growing', 'stable', 'struggling')),
  hunger_level SMALLINT NOT NULL CHECK (hunger_level BETWEEN 1 AND 5),
  closeness_level SMALLINT NOT NULL CHECK (closeness_level BETWEEN 1 AND 5),
  observations TEXT CHECK (char_length(observations) <= 2000),
  concerns TEXT CHECK (char_length(concerns) <= 2000),
  praises TEXT CHECK (char_length(praises) <= 2000),
  prayer_needs TEXT CHECK (char_length(prayer_needs) <= 2000),

  -- 영적 돌파
  has_breakthrough BOOLEAN NOT NULL DEFAULT false,
  breakthrough_category TEXT CHECK (
    breakthrough_category IS NULL OR
    breakthrough_category IN (
      'repentance', 'decision', 'insight', 'healing',
      'liberation', 'gift', 'encounter', 'answered', 'other'
    )
  ),
  breakthrough_title TEXT CHECK (char_length(breakthrough_title) <= 200),
  breakthrough_description TEXT CHECK (char_length(breakthrough_description) <= 5000),
  bible_references JSONB DEFAULT '[]',

  -- 다음 단계
  next_steps TEXT CHECK (char_length(next_steps) <= 2000),
  follow_up_actions JSONB DEFAULT '[]',

  -- 타임스탬프
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE pastoral_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pastoral logs"
  ON pastoral_logs FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own pastoral logs"
  ON pastoral_logs FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own pastoral logs"
  ON pastoral_logs FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own pastoral logs"
  ON pastoral_logs FOR DELETE
  USING (user_id = auth.uid());

-- Indexes
CREATE INDEX idx_pastoral_logs_soul_id ON pastoral_logs(soul_id);
CREATE INDEX idx_pastoral_logs_user_id ON pastoral_logs(user_id);
CREATE INDEX idx_pastoral_logs_activity_plan_id ON pastoral_logs(activity_plan_id);
CREATE INDEX idx_pastoral_logs_recorded_at ON pastoral_logs(recorded_at DESC);
CREATE INDEX idx_pastoral_logs_mood ON pastoral_logs(mood);
CREATE INDEX idx_pastoral_logs_has_breakthrough ON pastoral_logs(has_breakthrough) WHERE has_breakthrough = true;
CREATE INDEX idx_pastoral_logs_soul_recorded ON pastoral_logs(soul_id, recorded_at DESC);

-- Trigger
CREATE TRIGGER update_pastoral_logs_updated_at
  BEFORE UPDATE ON pastoral_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### 비즈니스 규칙

| 규칙 | 설명 |
|-----|------|
| 필수 필드 | `soulId`, `mood`, `hungerLevel`, `closenessLevel` |
| 선택적 연결 | `activityPlanId`가 있으면 해당 활동과 1:1 연결, 없으면 독립 기록 |
| 돌파 일관성 | `hasBreakthrough=true`이면 `breakthroughCategory` 필수 |
| 텍스트 제한 | observations/concerns/praises/prayerNeeds: 각 2000자, breakthroughDescription: 5000자 |
| 기록 일시 | `recordedAt` 미입력 시 서버 시간(NOW()) 사용 |
| 삭제 정책 | Soul 삭제 시 CASCADE, ActivityPlan 삭제 시 SET NULL |

#### 인수 조건

- [ ] 활동 연결 없이 독립 목양일지 생성 가능
- [ ] ActivityPlan과 연결된 목양일지 생성 가능
- [ ] mood, hungerLevel, closenessLevel 없이 저장 시 validation 에러
- [ ] hasBreakthrough=true일 때 breakthroughCategory 없으면 validation 에러
- [ ] 텍스트 필드 2000자/5000자 초과 시 DB constraint 에러
- [ ] Soul 삭제 시 관련 PastoralLog 자동 삭제
- [ ] ActivityPlan 삭제 시 PastoralLog의 activityPlanId가 NULL로 변경
- [ ] 특정 Soul의 PastoralLog 목록을 recorded_at DESC로 조회 가능
- [ ] mood 기준 필터링 가능
- [ ] 날짜 범위 필터링 가능

---

### 4.3 ActivityPlan 정비

#### Before (AS-IS)

도메인 모델과 DB 스키마가 완전히 불일치하는 상태:

```typescript
// 도메인 모델 (domain/entities/activity-plan.ts)
interface ActivityPlan {
  type: ActivityType;        // 'meeting' | 'call' | 'study' | 'event' | 'prayer' | 'other'
  status: ActivityStatus;    // 'planned' | 'in-progress' | 'completed' | 'cancelled'
  scheduledAt: string;
  completedAt?: string;
  evaluation?: ActivityEvaluation;  // 내장 평가
  // ...
}

// DB 스키마 & Repository (infrastructure)
interface ActivityPlan {
  planType: 'recommended' | 'custom';
  isCompleted: boolean;      // 단순 boolean
  // type, status, scheduledAt 없음
  // evaluation 없음
}
```

#### After (TO-BE)

도메인 모델을 기준으로 DB 스키마를 통합. `evaluation` 필드는 PastoralLog로 이동하여 제거.

```typescript
type ActivityType =
  | 'meeting'   // 만남/양육
  | 'call'      // 전화
  | 'study'     // 공부
  | 'event'     // 행사
  | 'prayer'    // 기도
  | 'other';    // 기타

type ActivityStatus =
  | 'planned'      // 계획됨
  | 'in-progress'  // 진행중
  | 'completed'    // 완료
  | 'cancelled';   // 취소

interface ActivityPlan {
  id: string;
  soulId: string;
  title: string;
  type: ActivityType;
  status: ActivityStatus;
  scheduledAt: string;
  completedAt?: string;
  areaId?: string;       // Area (optional)
  week?: number;
  location?: string;
  description?: string;  // max 5000자
  notes?: string;        // max 2000자
  createdAt: string;
  updatedAt: string;
  // evaluation 제거 → PastoralLog로 이동
}

interface CreateActivityPlanDto {
  soulId: string;
  title: string;
  type: ActivityType;
  scheduledAt: string;
  areaId?: string;
  week?: number;
  location?: string;
  description?: string;
}

interface UpdateActivityPlanDto {
  title?: string;
  type?: ActivityType;
  status?: ActivityStatus;
  scheduledAt?: string;
  completedAt?: string;
  areaId?: string;
  week?: number;
  location?: string;
  description?: string;
  notes?: string;
}

interface ActivityPlanFilter {
  soulId?: string;
  type?: ActivityType;
  status?: ActivityStatus;
  dateFrom?: string;
  dateTo?: string;
  areaId?: string;
}
```

#### DDL 변경

```sql
-- 기존 activity_plans 테이블을 도메인 모델 기준으로 재정의
-- 주의: 기존 데이터 마이그레이션 필요 (섹션 4.9 참조)

ALTER TABLE activity_plans
  ADD COLUMN type TEXT NOT NULL DEFAULT 'meeting'
    CHECK (type IN ('meeting', 'call', 'study', 'event', 'prayer', 'other')),
  ADD COLUMN status TEXT NOT NULL DEFAULT 'planned'
    CHECK (status IN ('planned', 'in-progress', 'completed', 'cancelled')),
  ADD COLUMN scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN completed_at TIMESTAMPTZ,
  ADD COLUMN location TEXT,
  ADD COLUMN notes TEXT CHECK (char_length(notes) <= 2000);

-- description 길이 제한 추가
ALTER TABLE activity_plans
  ADD CONSTRAINT chk_description_length CHECK (char_length(description) <= 5000);

-- 기존 컬럼 정리 (데이터 마이그레이션 후)
-- ALTER TABLE activity_plans DROP COLUMN plan_type;
-- ALTER TABLE activity_plans DROP COLUMN is_completed;

-- 새 인덱스
CREATE INDEX idx_activity_plans_type ON activity_plans(type);
CREATE INDEX idx_activity_plans_status ON activity_plans(status);
CREATE INDEX idx_activity_plans_scheduled_at ON activity_plans(scheduled_at DESC);
CREATE INDEX idx_activity_plans_soul_status ON activity_plans(soul_id, status);
```

#### 데이터 마이그레이션 (plan_type/is_completed → type/status)

```sql
-- Step 1: 기존 데이터를 새 컬럼으로 변환
UPDATE activity_plans
SET
  type = 'meeting',  -- plan_type으로는 실제 활동 유형을 알 수 없으므로 기본값
  status = CASE
    WHEN is_completed = true THEN 'completed'
    ELSE 'planned'
  END,
  scheduled_at = created_at;  -- 기존에 scheduled_at이 없으므로 created_at 사용

-- Step 2: 기존 컬럼 제거 (마이그레이션 검증 후)
ALTER TABLE activity_plans
  DROP COLUMN plan_type,
  DROP COLUMN is_completed;
```

#### 변경 범위

| 파일 | 변경 내용 |
|-----|---------|
| `domain/entities/activity-plan.ts` | `evaluation` 필드 및 `ActivityEvaluation` 인터페이스 제거 |
| `infrastructure/database/schema.ts` | ActivityPlan 타입 재정의 |
| `infrastructure/repositories/supabase/activity-plan-repository.ts` | 전면 재작성 (도메인 기준 매핑) |
| `store/activityPlanStore.ts` | 새 인터페이스에 맞게 업데이트 |

#### 인수 조건

- [ ] ActivityPlan에 type(ActivityType) 저장/조회 가능
- [ ] ActivityPlan에 status(ActivityStatus) 저장/조회 가능
- [ ] scheduledAt으로 예정일 관리 가능
- [ ] status 변경 시 completedAt 자동 설정 (completed 시)
- [ ] evaluation 필드가 ActivityPlan에서 완전 제거
- [ ] ActivityPlan에 연결된 PastoralLog 조회 가능 (PastoralLog.activityPlanId 역참조)
- [ ] 기존 activity_plans 데이터가 새 스키마로 정상 마이그레이션

---

### 4.4 Progress (변경 없음)

Progress 엔티티와 테이블은 현재 정상 작동하고 있으며 변경이 필요 없다. 확인 사항만 기록한다.

```typescript
// 변경 없음 - 현행 유지
interface ProgressItem {
  week: number;
  status: ProgressStatus;  // 'completed' | 'current' | 'future'
  completedAt?: string;
  memo?: string;
}

interface AreaProgress {
  areaId: Area;
  currentWeek: number;
  items: ProgressItem[];
}

interface SoulProgress {
  soulId: string;
  areaProgress: AreaProgress[];
  overallProgress: number;  // 0-100
  lastUpdatedAt: string;
}
```

#### 확인 사항

- [ ] 기존 progress 테이블 데이터 무결성 유지
- [ ] Soul 통합 후에도 progress CRUD 정상 동작
- [ ] TrainingType 전환 시 기존 progress 히스토리 유지 (새 과정은 새로 시작)

---

### 4.5 AI Insights 계산 뷰

Phase 1에서는 규칙 기반 계산, Phase 2에서 LLM 통합을 검토한다.

#### Phase 1: 규칙 기반 계산

PastoralLog 데이터를 집계하여 계산하는 **읽기 전용 뷰 함수**를 제공한다. 별도 테이블 없이 런타임 계산한다.

```typescript
// AI Insights 계산 결과 (테이블 없음, 런타임 계산)
interface SoulInsights {
  soulId: string;

  // 영적 성장 추이
  moodTrend: 'improving' | 'stable' | 'declining';
  hungerTrend: 'improving' | 'stable' | 'declining';
  closenessTrend: 'improving' | 'stable' | 'declining';

  // 활동 통계
  totalActivities: number;
  completedActivities: number;
  activityCompletionRate: number;  // 0-100
  averageRating: number;           // 1-5

  // 돌파 통계
  totalBreakthroughs: number;
  recentBreakthroughs: number;     // 최근 30일
  dominantBreakthroughCategory?: BreakthroughCategory;

  // 주의 지표
  daysSinceLastActivity: number;
  daysSinceLastLog: number;
  consecutiveStrugglingCount: number;  // 연속 'struggling' 기록 수

  // 추천
  suggestedNextAction?: string;
  riskLevel: 'low' | 'medium' | 'high';

  calculatedAt: string;
}

// 계산 서비스 인터페이스
interface InsightsCalculationService {
  calculateSoulInsights(soulId: string): Promise<SoulInsights>;
  calculateTrainerOverview(trainerId: string): Promise<TrainerOverview>;
}

interface TrainerOverview {
  trainerId: string;
  totalSouls: number;
  activeSouls: number;
  soulsNeedingAttention: number;
  averageMood: number;
  totalActivitiesThisMonth: number;
  totalLogsThisMonth: number;
  topBreakthroughCategories: Array<{ category: BreakthroughCategory; count: number }>;
}
```

#### Phase 2: LLM 통합 (별도 계획)

- PastoralLog 텍스트(observations, concerns 등)를 LLM에 전달
- 개인화된 양육 조언 생성
- 위기 신호 자연어 분석

#### 인수 조건 (Phase 1)

- [ ] PastoralLog 데이터 기반 moodTrend 계산 (최근 4건 비교)
- [ ] 활동 완료율 계산
- [ ] daysSinceLastActivity/daysSinceLastLog 정확 계산
- [ ] riskLevel 계산 (high: struggling 2주+, medium: 무활동 2주+, low: 나머지)
- [ ] TrainerOverview에서 전체 양육 현황 요약

---

### 4.6 Activity Timeline 뷰

기존 RelationshipTimeline 엔티티를 완전 삭제하고, ActivityPlan + PastoralLog 데이터를 조합한 **읽기 전용 타임라인 뷰**로 대체한다.

```typescript
// 타임라인 아이템 (여러 엔티티 조합)
type TimelineItemType = 'activity' | 'pastoral_log' | 'progress_milestone';

interface TimelineItem {
  id: string;
  type: TimelineItemType;
  soulId: string;
  date: string;

  // 공통
  title: string;
  description?: string;

  // activity
  activityType?: ActivityType;
  activityStatus?: ActivityStatus;

  // pastoral_log
  mood?: SpiritualMood;
  hasBreakthrough?: boolean;
  breakthroughCategory?: BreakthroughCategory;

  // progress_milestone
  areaId?: string;
  week?: number;
}

interface TimelineFilter {
  soulId: string;
  types?: TimelineItemType[];
  dateFrom?: string;
  dateTo?: string;
}

// 타임라인 서비스
interface TimelineService {
  getTimeline(filter: TimelineFilter): Promise<TimelineItem[]>;
}
```

#### 구현 방식

별도 테이블 없이 `activity_plans`, `pastoral_logs`, `progress` 테이블을 UNION ALL로 조회하거나, 클라이언트 측에서 각 데이터를 병합하여 날짜순 정렬한다.

#### 인수 조건

- [ ] Soul별 통합 타임라인 조회 가능
- [ ] ActivityPlan, PastoralLog, Progress 데이터 모두 포함
- [ ] 날짜순 정렬 (DESC)
- [ ] 타입별 필터링 가능
- [ ] RelationshipTimeline 엔티티 파일 완전 삭제

---

### 4.7 Encouragement 간소화 및 폐기

#### 삭제 대상

| 인터페이스/타입 | 삭제 이유 |
|-------------|---------|
| `Badge` | 게이미피케이션 미구현, 불필요한 복잡성 |
| `BadgeType` | Badge와 함께 삭제 |
| `GratitudeMessage` | 멘티→양육자 메시지, 현재 미사용 |
| `TrainerStatistics` | 런타임 계산으로 전환 (TrainerOverview) |
| `Encouragement` | AI 보조 격려 메시지만 유지, 나머지 삭제 |
| `EncouragementType` | 대부분 미사용 타입 |
| `ENCOURAGEMENT_TEMPLATES` | 삭제 |
| `BADGE_METADATA` | 삭제 |

#### 유지 대상

AI 보조 격려 메시지 기능은 Phase 2 AI 통합 시 별도 설계한다. Phase 1에서는 관련 코드 전체를 삭제한다.

#### 변경 범위

| 파일 | 변경 내용 |
|-----|---------|
| `domain/entities/encouragement.ts` | **파일 삭제** |
| `domain/entities/index.ts` | encouragement export 제거 |
| `presentation/components/EncouragementPanel.tsx` | **파일 삭제** |
| `presentation/components/BreakthroughJournal.tsx` | **파일 삭제** (PastoralLog로 흡수) |
| `store/pastoralCareStore.ts` | Encouragement 관련 state/action 제거 |

#### 인수 조건

- [ ] `encouragement.ts` 파일 삭제
- [ ] Encouragement 관련 UI 컴포넌트 삭제
- [ ] 코드베이스에서 Badge, GratitudeMessage, TrainerStatistics 참조 0건
- [ ] 빌드 에러 0건

---

### 4.8 Crisis Detection 경량화

#### Before (AS-IS)

CrisisAlert가 독립 엔티티로, 클라이언트에서 복잡한 감지 로직을 수행. 9개의 CrisisIndicator를 추적.

#### After (TO-BE)

CrisisAlert 인터페이스는 유지하되, **PastoralLog 데이터 기반 클라이언트 계산**으로 변경. 별도 테이블 없음.

```typescript
// 인터페이스 유지 (변경 없음)
type CrisisLevel = 'attention' | 'warning' | 'critical';
type CrisisIndicator =
  | 'consecutive_cancellations'
  | 'long_inactivity'
  | 'rating_drop'
  | 'mood_decline'
  | 'closeness_decline'
  | 'no_breakthrough'
  | 'missed_milestones'
  | 'communication_pattern';
  // 'area_avoidance' 제거 (감지 어려움)

interface CrisisAlert {
  id: string;
  soulId: string;
  level: CrisisLevel;
  indicators: CrisisIndicator[];
  primaryIndicator: CrisisIndicator;
  title: string;
  description: string;
  evidence: string[];
  recommendedActions: string[];
  status: 'active' | 'acknowledged' | 'resolved' | 'dismissed';
  detectedAt: string;
}

// 감지 로직 변경
interface CrisisDetectionInput {
  recentPastoralLogs: PastoralLog[];  // 최근 N건
  recentActivityPlans: ActivityPlan[]; // 최근 N건
  soulProgress: SoulProgress;
}

interface CrisisDetectionService {
  detect(input: CrisisDetectionInput): CrisisAlert[];
}
```

#### 감지 규칙 (PastoralLog 기반)

| 지표 | 데이터 소스 | 조건 | 레벨 |
|-----|-----------|------|------|
| mood_decline | PastoralLog.mood | 'struggling' 2주 이상 연속 | warning → critical |
| closeness_decline | PastoralLog.closenessLevel | 3회 연속 하락 | attention → warning |
| rating_drop | PastoralLog.rating | 4점 → 2점 이하 급락 | attention |
| long_inactivity | PastoralLog.recordedAt | 마지막 기록 21일 이상 | warning |
| consecutive_cancellations | ActivityPlan.status | 'cancelled' 2회 이상 연속 | attention → warning |
| no_breakthrough | PastoralLog.hasBreakthrough | 2개월 이상 돌파 없음 | attention |
| missed_milestones | Progress | 예상 진도 대비 2개 이상 지연 | attention |

#### 인수 조건

- [ ] PastoralLog 데이터 기반 위기 감지 동작
- [ ] CrisisAlert가 별도 DB 테이블 없이 런타임 계산
- [ ] 'area_avoidance' 지표 제거
- [ ] 감지 결과를 대시보드에 표시
- [ ] CrisisDetectionConfig는 기존 기본값 유지

---

### 4.9 Supabase 마이그레이션

#### 4.9.1 localStorage 데이터 → PastoralLog 변환

기존 localStorage에 저장된 SpiritualState, Breakthrough 데이터를 PastoralLog로 변환하여 Supabase에 저장한다.

```typescript
interface MigrationService {
  // localStorage → Supabase 마이그레이션
  migrateSpiritualStatesToPastoralLogs(): Promise<MigrationResult>;
  migrateBreakthroughsToPastoralLogs(): Promise<MigrationResult>;
  migrateActivityEvaluationsToPastoralLogs(): Promise<MigrationResult>;

  // 마이그레이션 상태 확인
  getMigrationStatus(): MigrationStatus;
}

interface MigrationResult {
  success: boolean;
  migratedCount: number;
  skippedCount: number;
  errorCount: number;
  errors: Array<{ id: string; error: string }>;
}

type MigrationStatus = {
  spiritualStates: 'pending' | 'in_progress' | 'completed' | 'failed';
  breakthroughs: 'pending' | 'in_progress' | 'completed' | 'failed';
  evaluations: 'pending' | 'in_progress' | 'completed' | 'failed';
};
```

#### 변환 매핑

**SpiritualState → PastoralLog**:
```
SpiritualState.soulId          → PastoralLog.soulId
SpiritualState.activityPlanId  → PastoralLog.activityPlanId
SpiritualState.mood            → PastoralLog.mood
SpiritualState.hungerLevel     → PastoralLog.hungerLevel
SpiritualState.closenessLevel  → PastoralLog.closenessLevel
SpiritualState.observations    → PastoralLog.observations
SpiritualState.concerns        → PastoralLog.concerns
SpiritualState.praises         → PastoralLog.praises
SpiritualState.prayerNeeds     → PastoralLog.prayerNeeds
SpiritualState.recordedAt      → PastoralLog.recordedAt
SpiritualState.createdAt       → PastoralLog.createdAt
(없음)                          → PastoralLog.hasBreakthrough = false
```

**Breakthrough → PastoralLog** (동일 soulId + 동일 날짜의 SpiritualState가 있으면 병합):
```
Breakthrough.soulId              → PastoralLog.soulId
Breakthrough.activityPlanId      → PastoralLog.activityPlanId
Breakthrough.category            → PastoralLog.breakthroughCategory
Breakthrough.title               → PastoralLog.breakthroughTitle
Breakthrough.description         → PastoralLog.breakthroughDescription
Breakthrough.bibleReferences     → PastoralLog.bibleReferences
Breakthrough.followUpActions     → PastoralLog.followUpActions
Breakthrough.occurredAt          → PastoralLog.recordedAt
(없음)                            → PastoralLog.hasBreakthrough = true
```

**ActivityEvaluation → PastoralLog** (ActivityPlan에 내장된 evaluation):
```
ActivityEvaluation.rating          → PastoralLog.rating
ActivityEvaluation.evaluationNotes → PastoralLog.evaluationNotes
ActivityEvaluation.nextSteps       → PastoralLog.nextSteps
ActivityEvaluation.evaluatedAt     → PastoralLog.recordedAt
```

#### 병합 전략

동일 soulId + 동일 날짜(날짜 부분만 비교)에 SpiritualState, Breakthrough, ActivityEvaluation이 모두 존재하면 하나의 PastoralLog로 병합한다. 우선순위:

1. SpiritualState의 mood/hunger/closeness 필수 필드 사용
2. Breakthrough가 있으면 hasBreakthrough=true, 관련 필드 병합
3. ActivityEvaluation이 있으면 rating/evaluationNotes 병합
4. 동일 날짜에 SpiritualState가 없는 Breakthrough는 독립 PastoralLog로 생성 (mood='stable', hungerLevel=3, closenessLevel=3 기본값)

#### 4.9.2 Demo Mode 점진적 폐기

```typescript
// Phase 1: Demo fallback 유지
const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

// Phase 2: pastoral_logs에도 demo fallback 추가
// Phase 3: Demo Mode 경고 배너 표시
// Phase 4: Demo Mode 완전 폐기
```

#### 인수 조건

- [ ] SpiritualState → PastoralLog 변환 정상 동작
- [ ] Breakthrough → PastoralLog 변환 정상 동작 (병합 포함)
- [ ] ActivityEvaluation → PastoralLog 변환 정상 동작
- [ ] 동일 날짜 데이터 병합 로직 정상 동작
- [ ] 변환 실패 시 원본 데이터 보존 (폐기 아님)
- [ ] MigrationResult에 성공/스킵/에러 카운트 정확 반영
- [ ] Demo Mode에서 pastoral_logs 테이블에 demo fallback 동작

---

## 5. Database Schema Changes

### 5.1 전체 마이그레이션 SQL (002_upgrade_schema.sql)

```sql
-- ============================================================================
-- GRID Database Schema Migration
-- Version: 002
-- Description: Upgrade schema - Soul integration, PastoralLog, ActivityPlan alignment
-- ============================================================================

-- ============================================================================
-- 1. SOULS TABLE UPGRADE
-- ============================================================================

ALTER TABLE souls
  ADD COLUMN IF NOT EXISTS phone_number TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS birth_date TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS profile JSONB DEFAULT '{}';

-- 텍스트 길이 제한
ALTER TABLE souls
  ADD CONSTRAINT chk_souls_notes_length CHECK (char_length(notes) <= 2000);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_souls_is_active ON souls(is_active);
CREATE INDEX IF NOT EXISTS idx_souls_email ON souls(email) WHERE email IS NOT NULL;

-- ============================================================================
-- 2. PASTORAL_LOGS TABLE (NEW)
-- ============================================================================

CREATE TABLE IF NOT EXISTS pastoral_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  soul_id UUID REFERENCES souls(id) ON DELETE CASCADE NOT NULL,
  activity_plan_id UUID REFERENCES activity_plans(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,

  -- 활동 평가
  rating SMALLINT CHECK (rating BETWEEN 1 AND 5),
  evaluation_notes TEXT CHECK (char_length(evaluation_notes) <= 2000),

  -- 영적 상태 (필수)
  mood TEXT NOT NULL CHECK (mood IN ('growing', 'stable', 'struggling')),
  hunger_level SMALLINT NOT NULL CHECK (hunger_level BETWEEN 1 AND 5),
  closeness_level SMALLINT NOT NULL CHECK (closeness_level BETWEEN 1 AND 5),
  observations TEXT CHECK (char_length(observations) <= 2000),
  concerns TEXT CHECK (char_length(concerns) <= 2000),
  praises TEXT CHECK (char_length(praises) <= 2000),
  prayer_needs TEXT CHECK (char_length(prayer_needs) <= 2000),

  -- 영적 돌파
  has_breakthrough BOOLEAN NOT NULL DEFAULT false,
  breakthrough_category TEXT CHECK (
    breakthrough_category IS NULL OR
    breakthrough_category IN (
      'repentance', 'decision', 'insight', 'healing',
      'liberation', 'gift', 'encounter', 'answered', 'other'
    )
  ),
  breakthrough_title TEXT CHECK (char_length(breakthrough_title) <= 200),
  breakthrough_description TEXT CHECK (char_length(breakthrough_description) <= 5000),
  bible_references JSONB DEFAULT '[]',

  -- 다음 단계
  next_steps TEXT CHECK (char_length(next_steps) <= 2000),
  follow_up_actions JSONB DEFAULT '[]',

  -- 타임스탬프
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- 돌파 일관성 체크
  CONSTRAINT chk_breakthrough_consistency
    CHECK (
      (has_breakthrough = false) OR
      (has_breakthrough = true AND breakthrough_category IS NOT NULL)
    )
);

-- RLS
ALTER TABLE pastoral_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pastoral logs"
  ON pastoral_logs FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own pastoral logs"
  ON pastoral_logs FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own pastoral logs"
  ON pastoral_logs FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own pastoral logs"
  ON pastoral_logs FOR DELETE
  USING (user_id = auth.uid());

-- Indexes
CREATE INDEX idx_pastoral_logs_soul_id ON pastoral_logs(soul_id);
CREATE INDEX idx_pastoral_logs_user_id ON pastoral_logs(user_id);
CREATE INDEX idx_pastoral_logs_activity_plan_id ON pastoral_logs(activity_plan_id);
CREATE INDEX idx_pastoral_logs_recorded_at ON pastoral_logs(recorded_at DESC);
CREATE INDEX idx_pastoral_logs_mood ON pastoral_logs(mood);
CREATE INDEX idx_pastoral_logs_breakthrough ON pastoral_logs(has_breakthrough)
  WHERE has_breakthrough = true;
CREATE INDEX idx_pastoral_logs_soul_recorded ON pastoral_logs(soul_id, recorded_at DESC);

-- Trigger
CREATE TRIGGER update_pastoral_logs_updated_at
  BEFORE UPDATE ON pastoral_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 3. ACTIVITY_PLANS TABLE UPGRADE
-- ============================================================================

-- 새 컬럼 추가
ALTER TABLE activity_plans
  ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'meeting'
    CHECK (type IN ('meeting', 'call', 'study', 'event', 'prayer', 'other')),
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'planned'
    CHECK (status IN ('planned', 'in-progress', 'completed', 'cancelled')),
  ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT CHECK (char_length(notes) <= 2000);

-- description 길이 제한
ALTER TABLE activity_plans
  ADD CONSTRAINT chk_ap_description_length
    CHECK (description IS NULL OR char_length(description) <= 5000);

-- 기존 데이터 마이그레이션
UPDATE activity_plans
SET
  type = 'meeting',
  status = CASE
    WHEN is_completed = true THEN 'completed'
    ELSE 'planned'
  END,
  scheduled_at = created_at
WHERE type = 'meeting' AND status = 'planned';
-- 조건은 기본값과 동일한 행만 업데이트 (이미 마이그레이션된 행 스킵)

-- 새 인덱스
CREATE INDEX IF NOT EXISTS idx_activity_plans_type ON activity_plans(type);
CREATE INDEX IF NOT EXISTS idx_activity_plans_status ON activity_plans(status);
CREATE INDEX IF NOT EXISTS idx_activity_plans_scheduled ON activity_plans(scheduled_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_plans_soul_status ON activity_plans(soul_id, status);

-- 기존 컬럼 제거 (Phase 2에서 검증 후 실행)
-- ALTER TABLE activity_plans DROP COLUMN IF EXISTS plan_type;
-- ALTER TABLE activity_plans DROP COLUMN IF EXISTS is_completed;

-- ============================================================================
-- 4. COMMENTS
-- ============================================================================

COMMENT ON TABLE pastoral_logs IS 'Integrated pastoral care logs combining spiritual state, activity evaluation, and breakthrough records';
COMMENT ON COLUMN pastoral_logs.mood IS 'Spiritual mood: growing, stable, or struggling';
COMMENT ON COLUMN pastoral_logs.has_breakthrough IS 'Whether a spiritual breakthrough was recorded';
COMMENT ON COLUMN pastoral_logs.activity_plan_id IS 'Optional link to related activity plan (1:1)';
COMMENT ON COLUMN souls.profile IS 'Soul profile data stored as JSONB (age, gender, personality, etc.)';
COMMENT ON COLUMN souls.is_active IS 'Whether the soul is currently being trained';
```

### 5.2 스키마 요약

| 테이블 | 변경 유형 | 내용 |
|-------|---------|------|
| `profiles` | 변경 없음 | - |
| `souls` | ALTER | phone_number, email, address, birth_date, notes, is_active, profile 추가 |
| `progress` | 변경 없음 | - |
| `activity_plans` | ALTER | type, status, scheduled_at, completed_at, location, notes 추가 |
| `pastoral_logs` | CREATE | 신규 테이블 |
| `activity_recommendations` | 변경 없음 | - |

---

## 6. Repository/Service Layer Changes

### 6.1 새로 생성할 파일

| 파일 경로 | 역할 |
|---------|------|
| `domain/entities/pastoral-log.ts` | PastoralLog 도메인 엔티티 |
| `infrastructure/repositories/supabase/pastoral-log-repository.ts` | PastoralLog Supabase 구현체 |
| `infrastructure/repositories/pastoral-log.repository.ts` | PastoralLog Repository 인터페이스 |
| `store/pastoralLogStore.ts` | PastoralLog Zustand Store |
| `application/services/insights-calculation-service.ts` | 규칙 기반 Insights 계산 |
| `application/services/crisis-detection-service.ts` | PastoralLog 기반 위기 감지 |
| `application/services/timeline-service.ts` | 통합 타임라인 뷰 서비스 |
| `application/services/migration-service.ts` | localStorage → Supabase 마이그레이션 |

### 6.2 수정할 파일

| 파일 경로 | 변경 내용 |
|---------|---------|
| `domain/entities/soul.ts` | SoulDetails 제거, Soul에 필드 통합 |
| `domain/entities/activity-plan.ts` | ActivityEvaluation 제거, evaluation 필드 제거 |
| `domain/entities/crisis-alert.ts` | 'area_avoidance' 제거, 감지 입력 인터페이스 추가 |
| `domain/entities/index.ts` | export 정리 (삭제된 엔티티 제거, PastoralLog 추가) |
| `infrastructure/database/schema.ts` | Soul, ActivityPlan 타입 업데이트, PastoralLog 추가 |
| `infrastructure/repositories/supabase/soul-repository.ts` | 새 필드 매핑 추가 |
| `infrastructure/repositories/supabase/activity-plan-repository.ts` | 도메인 모델 기준 전면 재작성 |
| `store/soulStore.ts` | Soul 통합 인터페이스 반영 |
| `store/activityPlanStore.ts` | 새 ActivityPlan 인터페이스 반영 |
| `store/pastoralCareStore.ts` | PastoralLog Store로 전환 또는 제거 |
| `store/index.ts` | export 정리 |
| `types/index.ts` | 도메인 타입 동기화 |

### 6.3 삭제할 파일

| 파일 경로 | 삭제 이유 |
|---------|---------|
| `domain/entities/encouragement.ts` | Encouragement 완전 폐기 |
| `domain/entities/reproduction-readiness.ts` | AI 계산 뷰로 대체 |
| `domain/entities/spiritual-prescription.ts` | AI 계산 뷰로 대체 |
| `domain/entities/relationship-timeline.ts` | Activity Timeline 뷰로 대체 |
| `domain/entities/spiritual-state.ts` | PastoralLog로 흡수 |
| `domain/entities/breakthrough.ts` | PastoralLog로 흡수 (BibleReference, BreakthroughCategory 타입만 유지) |
| `domain/services/crisis-detection.service.ts` | 새 서비스로 대체 |
| `domain/services/encouragement.service.ts` | Encouragement 폐기 |
| `presentation/components/EncouragementPanel.tsx` | 폐기 |
| `presentation/components/BreakthroughJournal.tsx` | PastoralLog UI로 대체 |
| `presentation/components/SoulTemperaturePanel.tsx` | PastoralLog 요약 뷰로 대체 |
| `presentation/components/SpiritualPrescriptionPanel.tsx` | 폐기 |
| `presentation/components/ReproductionReadinessPanel.tsx` | 폐기 |
| `presentation/components/RelationshipTimeline.tsx` | Activity Timeline으로 대체 |
| `presentation/components/CrisisAlertPanel.tsx` | 새 경량화 버전으로 교체 |

### 6.4 Repository 패턴

기존 패턴을 유지한다. 모든 Repository는 다음 구조를 따른다:

```typescript
// 패턴: functional export (클래스 아님)
// Demo Mode: isDemoMode 분기
// 매핑: mapDbToDomain / mapDomainToDb 함수
// 에러: throw new Error('Failed to ...: ' + error.message)
// 인증: supabase.auth.getUser() 확인

// pastoral-log-repository.ts 예시 구조
export const getPastoralLogsBySoulId = async (soulId: string): Promise<PastoralLog[]> => { ... };
export const getPastoralLogById = async (id: string): Promise<PastoralLog | null> => { ... };
export const createPastoralLog = async (dto: CreatePastoralLogDto): Promise<PastoralLog> => { ... };
export const updatePastoralLog = async (id: string, dto: UpdatePastoralLogDto): Promise<PastoralLog> => { ... };
export const deletePastoralLog = async (id: string): Promise<void> => { ... };
export const getPastoralLogsByFilter = async (filter: PastoralLogFilter): Promise<PastoralLog[]> => { ... };
```

### 6.5 Store 패턴

기존 Zustand Store 패턴을 유지한다:

```typescript
// pastoralLogStore.ts 예시 구조
interface PastoralLogState {
  logs: PastoralLog[];
  currentLog: PastoralLog | null;
  isLoading: boolean;
  error: string | null;
}

interface PastoralLogActions {
  fetchLogsBySoulId: (soulId: string) => Promise<void>;
  fetchLogById: (id: string) => Promise<void>;
  createLog: (dto: CreatePastoralLogDto) => Promise<PastoralLog>;
  updateLog: (id: string, dto: UpdatePastoralLogDto) => Promise<void>;
  deleteLog: (id: string) => Promise<void>;
  clearError: () => void;
}

type PastoralLogStore = PastoralLogState & PastoralLogActions;
```

---

## 7. UI/UX Changes

### 7.1 화면별 변경

#### 7.1.1 Soul 관리 화면

| AS-IS | TO-BE |
|-------|-------|
| Soul 추가 다이얼로그: 이름, 타입, 시작일만 | 이름, 타입, 시작일 + 연락처(phone, email) + 메모 |
| Soul 상세: 별도 SoulDetails 컴포넌트 | Soul 단일 상세 페이지 (프로필 탭 포함) |
| SoulProfile: 별도 폼 | Soul 상세의 "프로필" 탭에 통합 |

#### 7.1.2 목양일지 화면 (신규)

**목양일지 작성 폼** - 단일 페이지/다이얼로그로 구성:

```
┌─────────────────────────────────────┐
│ 목양일지 작성                          │
├─────────────────────────────────────┤
│ Soul: [드롭다운 선택]                   │
│ 연결 활동: [선택 없음 | 활동 목록]        │
│ 기록 일시: [날짜/시간 선택]              │
├─────────────────────────────────────┤
│ ■ 영적 상태 (필수)                     │
│   기분: [성장중] [정체기] [위기]          │
│   영적 갈급함: ★★★☆☆ (3/5)            │
│   관계 친밀도: ★★★★☆ (4/5)            │
│   관찰 내용: [텍스트 입력]              │
│   우려 사항: [텍스트 입력]              │
│   감사/칭찬: [텍스트 입력]              │
│   기도 제목: [텍스트 입력]              │
├─────────────────────────────────────┤
│ ■ 활동 평가 (선택)                     │
│   만족도: ★★★★☆ (4/5)                │
│   평가 메모: [텍스트 입력]              │
├─────────────────────────────────────┤
│ ■ 영적 돌파 (선택)                     │
│   [ ] 오늘 돌파가 있었습니다             │
│   (체크 시 확장)                       │
│   카테고리: [회개|결단|깨달음|...]        │
│   제목: [텍스트 입력]                   │
│   설명: [텍스트 입력]                   │
│   말씀: [성경 구절 추가]                │
├─────────────────────────────────────┤
│ ■ 다음 단계                           │
│   다음 계획: [텍스트 입력]              │
│   실천 사항: [+ 추가]                  │
├─────────────────────────────────────┤
│         [취소]  [저장]                 │
└─────────────────────────────────────┘
```

**목양일지 목록** - Soul 상세 페이지의 "목양일지" 탭:

```
┌─────────────────────────────────────┐
│ 홍길동님 - 목양일지                     │
├─────────────────────────────────────┤
│ [+ 새 기록] [필터: 전체|성장|정체|위기]   │
├─────────────────────────────────────┤
│ 📗 2026-03-01 (토) - 성장중 ★★★★     │
│   "이번 주 QT에서 큰 은혜를 받았다..."    │
│   ✨ 돌파: 깨달음 - "은혜의 의미"        │
├─────────────────────────────────────┤
│ 📙 2026-02-22 (토) - 정체기 ★★★      │
│   "직장 문제로 힘든 시간을 보내고..."     │
├─────────────────────────────────────┤
│ 📗 2026-02-15 (토) - 성장중 ★★★★★   │
│   "세례 준비를 시작하며..."              │
│   ✨ 돌파: 결단 - "세례 결단"           │
└─────────────────────────────────────┘
```

#### 7.1.3 대시보드 변경

| AS-IS | TO-BE |
|-------|-------|
| SoulTemperaturePanel | PastoralLog 기반 요약 카드 |
| BreakthroughJournal | 최근 돌파 목록 (PastoralLog에서 추출) |
| EncouragementPanel | **삭제** |
| ReproductionReadinessPanel | **삭제** |
| SpiritualPrescriptionPanel | **삭제** |
| CrisisAlertPanel | 경량화된 위기 알림 카드 |

#### 7.1.4 타임라인 화면

| AS-IS | TO-BE |
|-------|-------|
| RelationshipTimeline 컴포넌트 (14개 MilestoneType) | 통합 Activity Timeline (3개 TimelineItemType) |
| 별도 마일스톤 생성 UI | 자동 생성 (ActivityPlan, PastoralLog, Progress에서) |

#### 7.1.5 삭제 화면/컴포넌트

| 삭제 대상 | 대체 |
|---------|------|
| ActivityEvaluationDialog.tsx | PastoralLog 작성 폼 내 "활동 평가" 섹션 |
| BreakthroughJournal.tsx | PastoralLog 목록 내 돌파 표시 |
| EncouragementPanel.tsx | 삭제 (대체 없음) |
| ReproductionReadinessPanel.tsx | 삭제 (Phase 3 AI 뷰) |
| SpiritualPrescriptionPanel.tsx | 삭제 (Phase 3 AI 뷰) |
| RelationshipTimeline.tsx | Activity Timeline 컴포넌트 |
| SoulTemperaturePanel.tsx | PastoralLog Summary 카드 |
| CrisisAlertPanel.tsx | 경량화 CrisisAlert 카드 |

---

## 8. Non-Functional Requirements

### 8.1 성능

| 항목 | 목표치 | 측정 방법 |
|-----|-------|---------|
| PastoralLog 목록 조회 | < 500ms (50건 기준) | Supabase query time |
| PastoralLog 생성 | < 1s | API round-trip |
| 대시보드 로딩 | < 2s (전체 렌더링) | Lighthouse |
| Insights 계산 | < 1s (Soul 1명 기준) | 클라이언트 측 계산 |
| Timeline 조회 | < 1s (100건 기준) | 병합 + 정렬 시간 |

### 8.2 오프라인

| Phase | 지원 범위 |
|-------|---------|
| Phase 1-3 | **읽기 캐시만**: Zustand Store에 로드된 데이터를 메모리 캐시로 사용. 네트워크 끊김 시 마지막 로드 데이터 표시. 쓰기 작업은 온라인 필수. |
| Phase 4 | **IndexedDB 쓰기 + 동기화**: 오프라인에서 PastoralLog 작성 가능. 온라인 복귀 시 Supabase와 동기화. 충돌 해결은 last-write-wins. |

### 8.3 보안

| 항목 | 구현 |
|-----|------|
| 데이터 접근 제어 | Supabase RLS: `user_id = auth.uid()` |
| Soul 소유권 | 모든 Soul 관련 쿼리에 `user_id` 필터 |
| PastoralLog 민감 정보 | concerns, prayerNeeds 등은 user_id 소유자만 조회 가능 |
| 입력 검증 | 클라이언트 + DB constraint 이중 검증 |
| XSS 방지 | React 기본 이스케이핑 + 텍스트 필드 sanitization |

### 8.4 데이터 무결성

| 항목 | 구현 |
|-----|------|
| 외래 키 | souls → pastoral_logs (CASCADE), activity_plans → pastoral_logs (SET NULL) |
| 체크 제약 | mood IN (...), rating BETWEEN 1 AND 5, 텍스트 길이 제한 |
| 비즈니스 제약 | has_breakthrough=true → breakthrough_category NOT NULL (DB CHECK) |
| 동시성 | updated_at 트리거로 낙관적 잠금 지원 가능 |

---

## 9. Acceptance Criteria

### 9.1 Soul 통합 (Feature 4.1)

| ID | 테스트 | 예상 결과 | Pass/Fail |
|----|-------|---------|-----------|
| S-01 | Soul 생성 시 phoneNumber, email 입력 | DB에 정상 저장 | |
| S-02 | Soul 조회 시 profile JSONB 반환 | 모든 profile 필드 포함 | |
| S-03 | Soul 업데이트 시 profile 부분 업데이트 | 기존 profile 필드 유지, 변경 필드만 업데이트 | |
| S-04 | 기존 Soul (profile 없음) 조회 | profile: {} 기본값 반환 | |
| S-05 | SoulDetails 인터페이스 참조 | 코드베이스에서 0건 | |

### 9.2 PastoralLog (Feature 4.2)

| ID | 테스트 | 예상 결과 | Pass/Fail |
|----|-------|---------|-----------|
| PL-01 | 필수 필드만으로 PastoralLog 생성 | soulId, mood, hungerLevel, closenessLevel으로 생성 성공 | |
| PL-02 | ActivityPlan 연결 PastoralLog 생성 | activityPlanId 정상 저장 | |
| PL-03 | 독립 PastoralLog 생성 (activityPlanId 없음) | activityPlanId=NULL로 정상 저장 | |
| PL-04 | hasBreakthrough=true, category 없음 | DB constraint 에러 | |
| PL-05 | hasBreakthrough=true, category 있음 | 정상 저장 | |
| PL-06 | observations 2001자 입력 | DB constraint 에러 | |
| PL-07 | breakthroughDescription 5001자 입력 | DB constraint 에러 | |
| PL-08 | Soul 삭제 | 관련 PastoralLog 모두 삭제 (CASCADE) | |
| PL-09 | ActivityPlan 삭제 | PastoralLog.activityPlanId = NULL (SET NULL) | |
| PL-10 | mood 기준 필터 조회 | 해당 mood의 PastoralLog만 반환 | |
| PL-11 | 날짜 범위 필터 조회 | 범위 내 PastoralLog만 반환 | |
| PL-12 | PastoralLogSummary 계산 | moodTrend, averageHunger 등 정확 계산 | |

### 9.3 ActivityPlan 정비 (Feature 4.3)

| ID | 테스트 | 예상 결과 | Pass/Fail |
|----|-------|---------|-----------|
| AP-01 | type='meeting' ActivityPlan 생성 | DB에 type='meeting' 저장 | |
| AP-02 | status='completed'로 업데이트 | completedAt 자동 설정 | |
| AP-03 | status='cancelled'로 업데이트 | 정상 업데이트 | |
| AP-04 | evaluation 필드 접근 | 컴파일 에러 (필드 없음) | |
| AP-05 | 기존 데이터 마이그레이션 후 조회 | is_completed=true → status='completed' | |

### 9.4 삭제 기능 (Features 4.7)

| ID | 테스트 | 예상 결과 | Pass/Fail |
|----|-------|---------|-----------|
| D-01 | encouragement.ts import | 파일 없음 에러 | |
| D-02 | reproduction-readiness.ts import | 파일 없음 에러 | |
| D-03 | spiritual-prescription.ts import | 파일 없음 에러 | |
| D-04 | relationship-timeline.ts import | 파일 없음 에러 | |
| D-05 | 전체 빌드 (`npm run build`) | 에러 0건 | |
| D-06 | 'Badge' 문자열 검색 | 코드베이스에서 0건 (타입 참조 포함) | |

### 9.5 마이그레이션 (Feature 4.9)

| ID | 테스트 | 예상 결과 | Pass/Fail |
|----|-------|---------|-----------|
| M-01 | SpiritualState → PastoralLog 변환 | mood, hungerLevel, closenessLevel 정확 매핑 | |
| M-02 | Breakthrough → PastoralLog 변환 | hasBreakthrough=true, category 정확 매핑 | |
| M-03 | 동일 날짜 SpiritualState + Breakthrough 병합 | 단일 PastoralLog로 통합 | |
| M-04 | Breakthrough만 있는 날짜 (SpiritualState 없음) | 기본값으로 독립 PastoralLog 생성 | |
| M-05 | 마이그레이션 실패 시 원본 보존 | localStorage 데이터 삭제 안 됨 | |
| M-06 | MigrationResult 카운트 | migratedCount + skippedCount + errorCount = 전체 건수 | |

---

## 10. Edge Cases & Risks

### 10.1 Edge Cases

| 상황 | 처리 방법 |
|-----|---------|
| ActivityPlan 완료 후 PastoralLog 미작성 | ActivityPlan.status는 'completed'이지만 PastoralLog 없음 허용. 대시보드에서 "기록 누락" 알림 표시 |
| 동일 ActivityPlan에 PastoralLog 2개 연결 시도 | activityPlanId는 UNIQUE 제약 없음 (1:N 허용). 단, UI에서는 1:1 권장하고 이미 연결된 활동은 표시 |
| Soul의 trainingType 변경 | 기존 Progress 히스토리 유지. 새 trainingType에 대한 Progress를 새로 초기화. PastoralLog는 trainingType에 의존하지 않으므로 영향 없음 |
| profile JSONB 부분 업데이트 | 클라이언트에서 기존 profile과 merge 후 전체 JSONB를 UPDATE. Supabase JSONB 패치 미사용 (단순성 우선) |
| PastoralLog 작성 중 네트워크 끊김 | Phase 1-3: 에러 메시지 표시, 재시도 안내. Phase 4: IndexedDB에 임시 저장 |
| mood='struggling' 입력 직후 위기 감지 | 위기 감지는 "2주 이상 연속"이므로 단발 struggling은 attention 미발생. 단, daysSinceLastLog > 21이면 long_inactivity 감지 |
| 마이그레이션 시 동일 SpiritualState ID 중복 | PastoralLog는 새 UUID 생성. 원본 ID는 보존하지 않음 |
| bibleReferences JSONB 잘못된 형식 | 클라이언트에서 BibleReference[] 스키마 검증 후 저장. DB에서는 JSONB만 검증 |
| 텍스트 필드에 HTML/스크립트 삽입 | React 기본 이스케이핑으로 XSS 방지. DB에는 원본 텍스트 저장 |

### 10.2 마이그레이션 위험

| 위험 | 영향도 | 발생 확률 | 완화 전략 |
|-----|-------|---------|---------|
| **localStorage 데이터 손실** | 높음 | 낮음 | 마이그레이션 전 localStorage 스냅샷 백업. 원본은 마이그레이션 성공 확인 전까지 삭제 안 함 |
| **activity_plans 스키마 변경 시 기존 데이터 깨짐** | 높음 | 중간 | 새 컬럼에 DEFAULT 값 설정. 기존 컬럼은 Phase 2 검증 후 삭제. 롤백 SQL 준비 |
| **PastoralLog-ActivityPlan 병합 시 데이터 불일치** | 중간 | 중간 | 날짜 기반 병합 시 동일 날짜 여러 건 처리 로직. 병합 불가 시 독립 레코드 생성 |
| **Demo Mode 사용자 데이터 유실** | 중간 | 낮음 | Demo Mode에도 pastoral_logs fallback 추가. 마이그레이션 안내 배너 표시 |
| **DB CHECK constraint 위반** | 낮음 | 중간 | 클라이언트 측 사전 검증. 에러 발생 시 사용자 친화적 메시지 |

### 10.3 기술적 위험

| 위험 | 영향도 | 완화 전략 |
|-----|-------|---------|
| **JSONB 쿼리 성능 (profile, bibleReferences)** | 낮음 | JSONB 필드는 필터 조건으로 사용하지 않음. 필요 시 GIN 인덱스 추가 |
| **pastoral_logs 테이블 크기 증가** | 낮음 | 인덱스 최적화. 6개월 이상 데이터는 아카이브 검토 (Phase 4) |
| **클라이언트 측 Insights 계산 부하** | 중간 | Soul 1명 기준 최근 20건만 로드. 전체 Overview는 서버 함수(Supabase Edge Function) 검토 |
| **도메인 모델-DB 스키마 재매핑 작업량** | 중간 | Repository 패턴 유지, mapDbToDomain/mapDomainToDb 함수만 수정 |

### 10.4 롤백 계획

각 Phase 별 롤백 SQL을 준비하고, 마이그레이션 전 Supabase DB 백업을 수행한다.

```sql
-- 롤백: 002_upgrade_schema.sql
-- Phase 1 롤백
DROP TABLE IF EXISTS pastoral_logs CASCADE;
ALTER TABLE souls
  DROP COLUMN IF EXISTS phone_number,
  DROP COLUMN IF EXISTS email,
  DROP COLUMN IF EXISTS address,
  DROP COLUMN IF EXISTS birth_date,
  DROP COLUMN IF EXISTS notes,
  DROP COLUMN IF EXISTS is_active,
  DROP COLUMN IF EXISTS profile;
ALTER TABLE souls DROP CONSTRAINT IF EXISTS chk_souls_notes_length;

-- Phase 2 롤백 (activity_plans)
ALTER TABLE activity_plans
  DROP COLUMN IF EXISTS type,
  DROP COLUMN IF EXISTS status,
  DROP COLUMN IF EXISTS scheduled_at,
  DROP COLUMN IF EXISTS completed_at,
  DROP COLUMN IF EXISTS location,
  DROP COLUMN IF EXISTS notes;
ALTER TABLE activity_plans DROP CONSTRAINT IF EXISTS chk_ap_description_length;
```

---

## 부록 A: 파일 변경 매트릭스

| 파일 | Phase 1 | Phase 2 | Phase 3 |
|-----|---------|---------|---------|
| `domain/entities/soul.ts` | 수정 | - | - |
| `domain/entities/activity-plan.ts` | 수정 | - | - |
| `domain/entities/pastoral-log.ts` | **신규** | - | - |
| `domain/entities/breakthrough.ts` | 삭제 (타입만 pastoral-log.ts로 이동) | - | - |
| `domain/entities/spiritual-state.ts` | 삭제 | - | - |
| `domain/entities/encouragement.ts` | 삭제 | - | - |
| `domain/entities/reproduction-readiness.ts` | 삭제 | - | - |
| `domain/entities/spiritual-prescription.ts` | 삭제 | - | - |
| `domain/entities/relationship-timeline.ts` | 삭제 | - | - |
| `domain/entities/crisis-alert.ts` | - | - | 수정 |
| `domain/entities/index.ts` | 수정 | - | - |
| `infrastructure/database/schema.ts` | 수정 | 수정 | - |
| `infrastructure/repositories/supabase/soul-repository.ts` | 수정 | - | - |
| `infrastructure/repositories/supabase/activity-plan-repository.ts` | - | 수정 | - |
| `infrastructure/repositories/supabase/pastoral-log-repository.ts` | **신규** | - | - |
| `store/soulStore.ts` | 수정 | - | - |
| `store/activityPlanStore.ts` | - | 수정 | - |
| `store/pastoralLogStore.ts` | **신규** | - | - |
| `store/pastoralCareStore.ts` | 수정/삭제 | - | - |
| `store/index.ts` | 수정 | - | - |
| `types/index.ts` | 수정 | - | - |
| `application/services/migration-service.ts` | - | **신규** | - |
| `application/services/insights-calculation-service.ts` | - | - | **신규** |
| `application/services/crisis-detection-service.ts` | - | - | **신규** |
| `application/services/timeline-service.ts` | - | - | **신규** |

## 부록 B: BreakthroughCategory/BibleReference 타입 유지

`breakthrough.ts` 파일은 삭제하지만, 다음 타입은 `pastoral-log.ts`로 이동하여 유지한다:

```typescript
// pastoral-log.ts에 포함
export type BreakthroughCategory =
  | 'repentance' | 'decision' | 'insight' | 'healing'
  | 'liberation' | 'gift' | 'encounter' | 'answered' | 'other';

export interface BibleReference {
  book: string;
  chapter: number;
  verse: string;
  text?: string;
}

export const BREAKTHROUGH_CATEGORIES: Record<BreakthroughCategory, {
  name: string;
  emoji: string;
  color: string;
  description: string;
}> = {
  repentance: { name: '회개', emoji: '🙏', color: '#7c3aed', description: '죄를 깨닫고 돌이킴' },
  decision:   { name: '결단', emoji: '💪', color: '#2563eb', description: '중요한 신앙적 결단' },
  insight:    { name: '깨달음', emoji: '💡', color: '#ca8a04', description: '말씀이나 진리에 대한 새로운 이해' },
  healing:    { name: '치유', emoji: '❤️‍🩹', color: '#16a34a', description: '마음/관계/몸의 치유' },
  liberation: { name: '해방', emoji: '🕊️', color: '#0891b2', description: '속박에서 자유함' },
  gift:       { name: '은사 발현', emoji: '✨', color: '#db2777', description: '성령의 은사가 나타남' },
  encounter:  { name: '하나님 만남', emoji: '👑', color: '#9333ea', description: '특별한 하나님 임재 경험' },
  answered:   { name: '기도 응답', emoji: '🎉', color: '#059669', description: '기도가 응답됨' },
  other:      { name: '기타', emoji: '📝', color: '#6b7280', description: '기타 영적 경험' },
};

// SpiritualMood 관련 상수도 이동
export type SpiritualMood = 'growing' | 'stable' | 'struggling';

export const MOOD_LABELS: Record<SpiritualMood, string> = {
  growing: '성장중',
  stable: '정체기',
  struggling: '위기',
};

export const MOOD_COLORS: Record<SpiritualMood, string> = {
  growing: '#16a34a',
  stable: '#ca8a04',
  struggling: '#dc2626',
};
```

## 부록 C: 용어 사전

| 용어 | 영문 | 설명 |
|-----|------|------|
| 영혼 | Soul | 양육 대상자 |
| 양육자 | Trainer | 양육하는 사람 (사용자) |
| 목양일지 | PastoralLog | 양육 만남 후 통합 기록 |
| 활동계획 | ActivityPlan | 양육 활동 일정 |
| 진도 | Progress | 양육 과정 진행 상황 |
| 영적 돌파 | Breakthrough | 특별한 영적 성장 경험 |
| 위기 감지 | Crisis Detection | 패턴 기반 위기 상황 알림 |
| 초신자 | Convert | 새로 믿음을 시작한 사람 |
| 제자 | Disciple | 믿음을 성숙시키는 단계의 사람 |
