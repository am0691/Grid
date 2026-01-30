# Supabase 스토어 통합 가이드

GRID 웹서비스의 Zustand 스토어가 Supabase와 완전히 통합되었습니다.

## 🏗️ 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                     React Components                         │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ uses hooks
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Presentation Hooks                              │
│  • useSouls()     • useProgress()    • useActivityPlans()   │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ reads from/writes to
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   Zustand Stores                             │
│  • soulStore      • progressStore    • activityPlanStore    │
│  (Optimistic Updates + Error Handling)                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ calls
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Supabase Repositories                           │
│  • soul-repository                                           │
│  • progress-repository                                       │
│  • activity-plan-repository                                  │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ queries
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   Supabase Database                          │
│  Tables: souls, progress, activity_plans                     │
│  RLS: User isolation enabled                                 │
└─────────────────────────────────────────────────────────────┘
```

## 📁 파일 구조

```
/Users/seo/dev/Grid/app/src/
├── store/
│   ├── soulStore.ts              # 영혼 관리 스토어
│   ├── progressStore.ts          # 진도 관리 스토어
│   ├── activityPlanStore.ts      # 활동계획 스토어
│   └── gridStore.ts              # [DEPRECATED] 기존 localStorage 스토어
│
├── infrastructure/
│   └── repositories/
│       └── supabase/
│           ├── soul-repository.ts
│           ├── progress-repository.ts
│           └── activity-plan-repository.ts
│
├── presentation/
│   ├── hooks/
│   │   ├── useSouls.ts           # Soul 훅
│   │   ├── useProgress.ts        # Progress 훅
│   │   └── useActivityPlans.ts   # ActivityPlan 훅
│   └── components/
│       └── MigrationModal.tsx    # 마이그레이션 UI
│
└── utils/
    └── migration.ts              # localStorage → Supabase 마이그레이션
```

## 🎯 스토어 사용법

### 1. Soul Store (영혼 관리)

```typescript
import { useSoulStore } from '@/store/soulStore';

function MyComponent() {
  const { souls, isLoading, addSoul, updateSoul, deleteSoul } = useSoulStore();

  const handleAddSoul = async () => {
    const soulId = await addSoul({
      name: '홍길동',
      trainingType: 'convert',
      startDate: '2024-01-01',
    });
    console.log('Created soul:', soulId);
  };

  return (
    <div>
      {isLoading ? <p>Loading...</p> : null}
      {souls.map(soul => <div key={soul.id}>{soul.name}</div>)}
    </div>
  );
}
```

### 2. Progress Store (진도 관리)

```typescript
import { useProgressStore } from '@/store/progressStore';

function ProgressComponent({ soulId }: { soulId: string }) {
  const {
    getSoulProgress,
    toggleComplete,
    saveMemo,
    getOverallProgress
  } = useProgressStore();

  const progress = getSoulProgress(soulId);
  const overallProgress = getOverallProgress(soulId);

  const handleToggle = async (areaId: Area, week: number) => {
    await toggleComplete(soulId, areaId, week);
  };

  return (
    <div>
      <p>전체 진도: {overallProgress}%</p>
      {/* Render progress items */}
    </div>
  );
}
```

### 3. Activity Plan Store (활동계획)

```typescript
import { useActivityPlanStore } from '@/store/activityPlanStore';

function PlanComponent({ soulId }: { soulId: string }) {
  const { getSoulPlans, addPlan, togglePlanComplete } = useActivityPlanStore();

  const plans = getSoulPlans(soulId);

  const handleAddPlan = async () => {
    await addPlan({
      soulId,
      areaId: 'bible_reading',
      week: 1,
      title: '창세기 1-3장 읽기',
      description: '창조 이야기 묵상',
    });
  };

  return (
    <div>
      {plans.map(plan => (
        <div key={plan.id}>
          <input
            type="checkbox"
            checked={plan.isCompleted}
            onChange={() => togglePlanComplete(plan.id)}
          />
          {plan.title}
        </div>
      ))}
    </div>
  );
}
```

## 🎨 Presentation Hooks 사용법

훅을 사용하면 필터링, 자동 fetch, 통계 등이 포함되어 더 편리합니다.

### useSouls Hook

```typescript
import { useSouls } from '@/presentation/hooks';

function SoulList() {
  const {
    souls,           // 필터링된 souls
    stats,           // { total, convert, disciple }
    isLoading,
    addSoul,
    selectSoul,
  } = useSouls({ filter: 'convert', autoFetch: true });

  return (
    <div>
      <p>Total Converts: {stats.convert}</p>
      {souls.map(soul => <div key={soul.id}>{soul.name}</div>)}
    </div>
  );
}
```

### useProgress Hook

```typescript
import { useProgress } from '@/presentation/hooks';

function ProgressView({ soulId }: { soulId: string }) {
  const {
    soulProgress,
    overallProgress,
    delayedAreas,      // 지연된 영역들
    nextTasks,         // 다음 할 일들
    toggleComplete,
    getAreaProgress,   // 영역별 진도율
  } = useProgress({ soulId, autoFetch: true });

  return (
    <div>
      <h2>Overall: {overallProgress}%</h2>
      {delayedAreas.length > 0 && (
        <div>
          <h3>지연된 영역</h3>
          {delayedAreas.map(area => (
            <p key={area.areaId}>
              {area.areaId}: {area.delayWeeks}주 지연
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
```

### useActivityPlans Hook

```typescript
import { useActivityPlans } from '@/presentation/hooks';

function PlanList({ soulId }: { soulId: string }) {
  const {
    categorizedPlans,  // { pending, completed }
    stats,             // { total, completed, pending, completionRate }
    addPlan,
    getPlansByAreaAndWeek,
  } = useActivityPlans({ soulId, autoFetch: true });

  return (
    <div>
      <p>완료율: {stats.completionRate}%</p>
      <h3>진행 중 ({categorizedPlans.pending.length})</h3>
      {categorizedPlans.pending.map(plan => (
        <div key={plan.id}>{plan.title}</div>
      ))}
    </div>
  );
}
```

## 🔄 마이그레이션 가이드

기존 localStorage 데이터를 Supabase로 마이그레이션하는 방법:

### 1. 컴포넌트에서 마이그레이션 모달 사용

```typescript
import { MigrationModal, useMigrationCheck } from '@/presentation/components/MigrationModal';

function App() {
  const { showModal, setShowModal } = useMigrationCheck();

  return (
    <>
      <YourApp />
      <MigrationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          console.log('Migration completed!');
          // 데이터 다시 로드
        }}
      />
    </>
  );
}
```

### 2. 프로그래밍 방식으로 마이그레이션

```typescript
import {
  migrateLocalStorageToSupabase,
  isMigrationNeeded,
  backupLocalStorage
} from '@/utils/migration';

async function migrate() {
  // 마이그레이션 필요 여부 확인
  if (!isMigrationNeeded()) {
    console.log('No migration needed');
    return;
  }

  // 백업 다운로드 (선택사항)
  backupLocalStorage();

  // 마이그레이션 실행
  const result = await migrateLocalStorageToSupabase();

  if (result.success) {
    console.log('✓ Migration successful!');
    console.log(`Migrated ${result.details?.soulsCount} souls`);
  } else {
    console.error('✗ Migration failed:', result.message);
  }
}
```

## ⚡ Optimistic Updates

모든 스토어는 Optimistic Updates 패턴을 사용하여 빠른 UI 반응성을 제공합니다.

```typescript
// 사용자가 버튼을 클릭하면
await addSoul({ name: '홍길동', ... });

// 1. 즉시 UI 업데이트 (임시 ID로)
// 2. Supabase에 저장 요청
// 3. 성공 시: 임시 ID를 실제 ID로 교체
// 4. 실패 시: 롤백 + 에러 표시
```

이로 인해:
- ✅ 즉각적인 UI 피드백
- ✅ 네트워크 지연 숨김
- ✅ 실패 시 자동 롤백
- ✅ 에러 처리 내장

## 🔒 보안 (RLS)

Supabase Row Level Security (RLS)가 자동으로 적용됩니다:

- 각 사용자는 자신의 데이터만 접근 가능
- 모든 쿼리에서 `user_id` 필터링 자동 적용
- 다른 사용자의 데이터는 조회/수정 불가

## 🧪 테스트

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useSoulStore } from '@/store/soulStore';

test('should add soul', async () => {
  const { result } = renderHook(() => useSoulStore());

  await act(async () => {
    await result.current.addSoul({
      name: 'Test Soul',
      trainingType: 'convert',
      startDate: '2024-01-01',
    });
  });

  await waitFor(() => {
    expect(result.current.souls).toHaveLength(1);
    expect(result.current.souls[0].name).toBe('Test Soul');
  });
});
```

## 📊 상태 관리 흐름

```
User Action
    ↓
Component Handler
    ↓
Store Action (Optimistic Update)
    ↓
UI Updates Immediately
    ↓
Repository Call (Supabase)
    ↓
Success? → Replace temp data with real data
    ↓
Failure? → Rollback + Show error
```

## 🎓 Best Practices

1. **항상 Hooks 사용**: 직접 스토어를 사용하는 대신 presentation hooks를 사용하세요.
2. **에러 처리**: `error` 상태를 확인하고 사용자에게 표시하세요.
3. **로딩 상태**: `isLoading`을 사용하여 로딩 UI를 표시하세요.
4. **자동 Fetch**: `autoFetch: true` 옵션으로 자동으로 데이터를 가져오세요.
5. **마이그레이션**: 앱 시작 시 `useMigrationCheck()`를 사용하세요.

## 🚀 다음 단계

- [ ] Real-time subscriptions 추가 (Supabase Realtime)
- [ ] Offline support 추가 (Service Worker)
- [ ] 데이터 캐싱 최적화
- [ ] 성능 모니터링 추가

## 📝 참고자료

- [Zustand Documentation](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [Supabase Client Library](https://supabase.com/docs/reference/javascript/introduction)
- [Optimistic UI Patterns](https://www.smashingmagazine.com/2016/11/true-lies-of-optimistic-user-interfaces/)
