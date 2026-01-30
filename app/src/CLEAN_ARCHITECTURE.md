# Clean Architecture 구조

GRID 웹서비스의 Clean Architecture 설계 문서입니다.

## 폴더 구조

```
src/
├── domain/                    # 도메인 레이어 (비즈니스 로직의 핵심)
│   ├── entities/              # 엔티티 (비즈니스 객체)
│   │   ├── user.ts           # 사용자 엔티티
│   │   ├── soul.ts           # 영혼 엔티티
│   │   ├── progress.ts       # 진도 엔티티
│   │   ├── activity-plan.ts  # 활동계획 엔티티
│   │   └── index.ts
│   ├── value-objects/         # 값 객체
│   │   ├── training-type.ts  # 양육 타입 (Convert/Disciple)
│   │   ├── area.ts           # 영역 정의
│   │   └── index.ts
│   ├── services/              # 도메인 서비스
│   │   ├── progress-calculator.ts  # 진도 계산 로직
│   │   ├── area-service.ts         # 영역 관련 로직
│   │   └── index.ts
│   └── index.ts
│
├── application/               # 애플리케이션 레이어 (유스케이스)
│   ├── use-cases/             # 유스케이스 (비즈니스 시나리오)
│   │   ├── auth/             # 인증 관련
│   │   │   ├── login.use-case.ts
│   │   │   ├── logout.use-case.ts
│   │   │   ├── get-current-user.use-case.ts
│   │   │   └── index.ts
│   │   ├── souls/            # 영혼 관리
│   │   │   ├── create-soul.use-case.ts
│   │   │   ├── get-soul.use-case.ts
│   │   │   ├── get-souls.use-case.ts
│   │   │   ├── update-soul.use-case.ts
│   │   │   ├── delete-soul.use-case.ts
│   │   │   └── index.ts
│   │   ├── progress/         # 진도 관리
│   │   │   ├── get-soul-progress.use-case.ts
│   │   │   ├── update-progress.use-case.ts
│   │   │   ├── get-memo-history.use-case.ts
│   │   │   ├── save-memo.use-case.ts
│   │   │   └── index.ts
│   │   ├── activity-plans/   # 활동계획
│   │   │   ├── create-activity-plan.use-case.ts
│   │   │   ├── get-activity-plan.use-case.ts
│   │   │   ├── get-activity-plans.use-case.ts
│   │   │   ├── update-activity-plan.use-case.ts
│   │   │   ├── delete-activity-plan.use-case.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── ports/                 # 포트 (인터페이스)
│   │   ├── repositories.ts   # 레포지토리 인터페이스
│   │   ├── services.ts       # 외부 서비스 인터페이스
│   │   └── index.ts
│   └── index.ts
│
├── infrastructure/            # 인프라스트럭처 레이어 (구현체)
│   ├── repositories/          # 레포지토리 구현
│   │   ├── soul.repository.ts
│   │   ├── progress.repository.ts
│   │   ├── activity-plan.repository.ts
│   │   ├── user.repository.ts
│   │   └── index.ts
│   ├── services/              # 외부 서비스 구현
│   │   ├── auth.service.ts
│   │   ├── notification.service.ts
│   │   ├── storage.service.ts
│   │   ├── analytics.service.ts
│   │   └── index.ts
│   └── index.ts
│
├── presentation/              # 프레젠테이션 레이어 (UI)
│   ├── components/            # React 컴포넌트
│   ├── hooks/                 # 커스텀 훅
│   └── index.ts
│
├── components/                # 기존 컴포넌트 (점진적 마이그레이션)
├── hooks/                     # 기존 훅 (점진적 마이그레이션)
├── store/                     # 상태 관리 (Zustand)
├── lib/                       # 유틸리티
└── types/                     # 기존 타입 (점진적 마이그레이션)
```

## Clean Architecture 레이어

### 1. Domain Layer (도메인 레이어)
**위치**: `src/domain/`

비즈니스 로직의 핵심. 외부 의존성이 없는 순수한 비즈니스 규칙.

- **Entities**: 비즈니스 객체 (User, Soul, Progress, ActivityPlan)
- **Value Objects**: 불변 값 객체 (TrainingType, Area)
- **Domain Services**: 도메인 로직 (ProgressCalculator, AreaService)

**규칙**:
- 다른 레이어에 의존하지 않음
- 프레임워크에 독립적
- 순수 TypeScript/JavaScript만 사용

### 2. Application Layer (애플리케이션 레이어)
**위치**: `src/application/`

유스케이스를 구현. 도메인 객체를 조율하고 비즈니스 흐름을 정의.

- **Use Cases**: 비즈니스 시나리오 (CreateSoul, UpdateProgress 등)
- **Ports**: 인터페이스 정의 (Repository, Service 인터페이스)

**규칙**:
- Domain Layer에만 의존
- 인터페이스만 정의하고 구현은 하지 않음
- 비즈니스 흐름 조율

### 3. Infrastructure Layer (인프라스트럭처 레이어)
**위치**: `src/infrastructure/`

실제 구현체. 데이터베이스, API, 외부 서비스와 연동.

- **Repositories**: 데이터 저장소 구현
- **Services**: 외부 서비스 구현 (Auth, Notification 등)

**규칙**:
- Application의 Ports를 구현
- 실제 데이터베이스/API와 연동
- 기술 스택 의존적

### 4. Presentation Layer (프레젠테이션 레이어)
**위치**: `src/presentation/` (또는 기존 `src/components/`, `src/hooks/`)

사용자 인터페이스. React 컴포넌트와 커스텀 훅.

**규칙**:
- Application의 Use Cases를 호출
- UI 로직만 포함
- React에 의존

## 의존성 규칙

```
Presentation → Application → Domain
                    ↑
Infrastructure -----┘
```

**핵심 원칙**:
1. 내부 레이어는 외부 레이어를 알지 못함
2. 의존성은 항상 안쪽을 향함
3. Domain은 어떤 레이어에도 의존하지 않음

## 마이그레이션 가이드

### 기존 타입 → Domain Entities

기존 `types/index.ts`의 타입들을 다음과 같이 마이그레이션:

```typescript
// 기존: types/index.ts
export interface Soul { ... }

// 새로운 구조: domain/entities/soul.ts
export interface Soul { ... }
export interface CreateSoulDto { ... }
export interface UpdateSoulDto { ... }
```

### 사용 예시

#### 1. Use Case 사용

```typescript
// presentation/components/SoulList.tsx
import { GetSoulsUseCase } from '@/application/use-cases';
import { SoulRepository } from '@/infrastructure/repositories';

const useCase = new GetSoulsUseCase(new SoulRepository());

function SoulList() {
  const [souls, setSouls] = useState<Soul[]>([]);

  useEffect(() => {
    useCase.execute().then(setSouls);
  }, []);

  return <div>{/* UI */}</div>;
}
```

#### 2. Domain Service 사용

```typescript
// application/use-cases/progress/update-progress.use-case.ts
import { ProgressCalculator } from '@/domain/services';

const overallProgress = ProgressCalculator.calculateOverallProgress(
  areaProgress,
  trainingType
);
```

## 장점

1. **테스트 용이성**: 각 레이어를 독립적으로 테스트 가능
2. **유지보수성**: 비즈니스 로직이 명확히 분리됨
3. **확장성**: 새로운 기능 추가가 쉬움
4. **기술 스택 독립성**: 프레임워크 교체가 용이

## 다음 단계

1. Infrastructure 레이어의 Repository 구현 (실제 API 연동)
2. 기존 컴포넌트에서 Use Case 호출로 전환
3. Zustand 스토어를 Use Case로 대체
4. 단위 테스트 작성
