# Quick Start Guide - Supabase Integration

## 🚀 5분 안에 시작하기

### 1. 컴포넌트에서 Souls 사용하기

```typescript
import { useSouls } from '@/presentation/hooks';

function SoulList() {
  const { souls, addSoul, deleteSoul, isLoading } = useSouls({
    filter: 'all',  // 'all' | 'convert' | 'disciple'
    autoFetch: true
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <button onClick={() => addSoul({
        name: '홍길동',
        trainingType: 'convert',
        startDate: '2024-01-01'
      })}>
        Add Soul
      </button>

      {souls.map(soul => (
        <div key={soul.id}>
          <h3>{soul.name}</h3>
          <button onClick={() => deleteSoul(soul.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

### 2. 진도 관리

```typescript
import { useProgress } from '@/presentation/hooks';

function ProgressGrid({ soulId }: { soulId: string }) {
  const {
    soulProgress,
    overallProgress,
    toggleComplete,
    saveMemo
  } = useProgress({ soulId, autoFetch: true });

  return (
    <div>
      <h2>Overall Progress: {overallProgress}%</h2>

      {soulProgress.map(area => (
        <div key={area.areaId}>
          <h3>{area.areaId}</h3>
          {area.items.map(item => (
            <div key={item.week}>
              <input
                type="checkbox"
                checked={item.status === 'completed'}
                onChange={() => toggleComplete(area.areaId, item.week)}
              />
              Week {item.week}
              <input
                type="text"
                value={item.memo || ''}
                onChange={(e) => saveMemo(area.areaId, item.week, e.target.value)}
                placeholder="Add memo..."
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
```

### 3. 활동 계획

```typescript
import { useActivityPlans } from '@/presentation/hooks';

function ActivityPlans({ soulId }: { soulId: string }) {
  const {
    categorizedPlans,
    stats,
    addPlan,
    togglePlanComplete
  } = useActivityPlans({ soulId, autoFetch: true });

  return (
    <div>
      <p>Completion Rate: {stats.completionRate}%</p>

      <button onClick={() => addPlan({
        areaId: 'bible_reading',
        week: 1,
        title: '창세기 1-3장',
        description: '창조 이야기 묵상'
      })}>
        Add Plan
      </button>

      <h3>Pending ({categorizedPlans.pending.length})</h3>
      {categorizedPlans.pending.map(plan => (
        <div key={plan.id}>
          <input
            type="checkbox"
            onChange={() => togglePlanComplete(plan.id)}
          />
          {plan.title}
        </div>
      ))}

      <h3>Completed ({categorizedPlans.completed.length})</h3>
      {categorizedPlans.completed.map(plan => (
        <div key={plan.id}>{plan.title}</div>
      ))}
    </div>
  );
}
```

### 4. 마이그레이션 설정 (App.tsx)

```typescript
import { MigrationModal, useMigrationCheck } from '@/presentation/components/MigrationModal';

function App() {
  const { showModal, setShowModal } = useMigrationCheck();

  return (
    <>
      <YourMainApp />

      {/* 자동으로 마이그레이션 필요 여부 확인 */}
      <MigrationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          console.log('Migration complete!');
          window.location.reload();
        }}
      />
    </>
  );
}
```

## 📊 데이터 플로우

```
User Action
    ↓
useSouls() / useProgress() / useActivityPlans()
    ↓
Store (Optimistic Update)
    ↓
UI Updates Immediately ⚡
    ↓
Supabase Repository
    ↓
Supabase Database
    ↓
Success? → Replace with real data
Failure? → Rollback + Show error
```

## 🎯 주요 Hook Options

### useSouls
```typescript
useSouls({
  filter: 'all' | 'convert' | 'disciple',  // Filter by training type
  autoFetch: boolean                        // Auto-fetch on mount (default: true)
})
```

### useProgress
```typescript
useProgress({
  soulId: string | null,   // Soul ID to fetch progress for
  autoFetch: boolean       // Auto-fetch on mount (default: true)
})
```

### useActivityPlans
```typescript
useActivityPlans({
  soulId: string | null,   // Soul ID to fetch plans for
  autoFetch: boolean       // Auto-fetch on mount (default: true)
})
```

## ⚡ Optimistic Updates

모든 액션은 즉시 UI를 업데이트합니다:

```typescript
// 1. User clicks button
await addSoul({ name: 'John' });

// 2. UI updates IMMEDIATELY with temp ID
// 3. Request sent to Supabase
// 4. On success: Replace temp with real data
// 5. On failure: Rollback + Show error
```

## 🔧 에러 처리

```typescript
const { souls, error, clearError } = useSouls();

if (error) {
  return (
    <div className="error">
      <p>{error}</p>
      <button onClick={clearError}>Dismiss</button>
    </div>
  );
}
```

## 📖 더 알아보기

- 전체 문서: `SUPABASE_INTEGRATION.md`
- 구현 요약: `/Users/seo/dev/Grid/app/SUPABASE_INTEGRATION_SUMMARY.md`
- 마이그레이션: `@/utils/migration.ts`

## 🎓 Best Practices

1. **항상 훅 사용**: 직접 스토어 접근 대신 presentation hooks 사용
2. **에러 처리**: `error` 상태 확인하고 사용자에게 표시
3. **로딩 상태**: `isLoading`으로 로딩 UI 표시
4. **자동 Fetch**: `autoFetch: true`로 자동 데이터 로드
5. **타입 안전**: TypeScript 타입 활용

## 🚨 흔한 실수

❌ **나쁜 예**:
```typescript
import { useSoulStore } from '@/store/soulStore';
const store = useSoulStore();  // 직접 스토어 사용
```

✅ **좋은 예**:
```typescript
import { useSouls } from '@/presentation/hooks';
const { souls } = useSouls();  // 훅 사용
```

## 🆘 문제 해결

### "User not authenticated" 에러
```typescript
// AuthProvider로 앱을 감싸야 합니다
import { AuthProvider } from '@/infrastructure/services/auth';

<AuthProvider>
  <App />
</AuthProvider>
```

### 데이터가 표시되지 않음
```typescript
// autoFetch를 확인하세요
const { souls } = useSouls({ autoFetch: true });

// 또는 수동으로 fetch
const { fetchSouls } = useSouls({ autoFetch: false });
useEffect(() => {
  fetchSouls();
}, []);
```

### Optimistic update가 롤백됨
- 인터넷 연결 확인
- Supabase 콘솔에서 RLS 정책 확인
- 브라우저 콘솔에서 에러 확인
