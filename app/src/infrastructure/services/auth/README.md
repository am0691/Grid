# Authentication System

Supabase를 사용한 인증 시스템 구현

## 구조

```
auth/
├── AuthContext.tsx        # React Context 정의
├── AuthProvider.tsx       # Context Provider 구현
├── useAuth.ts            # Custom Hook
├── auth-service.ts       # Supabase 인증 서비스 함수들
├── types.ts              # 타입 정의
├── index.ts              # Barrel export
└── README.md             # 이 파일
```

## 사용 방법

### 1. 환경 변수 설정

`.env` 파일을 생성하고 Supabase 프로젝트 정보를 입력하세요:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 2. AuthProvider 설정

앱의 최상위 레벨에 `AuthProvider`를 추가하세요:

```tsx
// main.tsx 또는 App.tsx
import { AuthProvider } from '@/infrastructure/services/auth';

function App() {
  return (
    <AuthProvider>
      {/* 앱 컴포넌트들 */}
    </AuthProvider>
  );
}
```

### 3. 컴포넌트에서 인증 사용

```tsx
import { useAuth } from '@/infrastructure/services/auth';

function LoginPage() {
  const { signIn, isLoading, isAuthenticated, user } = useAuth();

  const handleLogin = async () => {
    const result = await signIn('email@example.com', 'password');

    if (result.success) {
      console.log('Logged in:', result.user);
    } else {
      console.error('Login failed:', result.error);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (isAuthenticated) return <div>Welcome, {user?.name}!</div>;

  return <button onClick={handleLogin}>Login</button>;
}
```

## API Reference

### useAuth Hook

```typescript
const {
  // 상태
  user,            // User | null - 현재 로그인된 사용자
  session,         // Session | null - Supabase 세션
  profile,         // Profile | null - 사용자 프로필
  isLoading,       // boolean - 로딩 상태
  isAuthenticated, // boolean - 로그인 여부

  // 메서드
  signUp,          // 회원가입
  signIn,          // 로그인
  signOut,         // 로그아웃
  updateProfile,   // 프로필 업데이트
  refreshUser,     // 사용자 정보 새로고침
} = useAuth();
```

### 회원가입

```typescript
const result = await signUp('email@example.com', 'password123', 'John Doe');

if (result.success) {
  console.log('User created:', result.user);
} else {
  console.error('Signup failed:', result.error);
}
```

### 로그인

```typescript
const result = await signIn('email@example.com', 'password123');
```

### 로그아웃

```typescript
await signOut();
```

### 프로필 업데이트

```typescript
await updateProfile({
  name: 'New Name',
  bio: 'My bio',
  church: 'My Church',
  phoneNumber: '010-1234-5678',
});
```

## Supabase 데이터베이스 스키마

인증 시스템이 작동하려면 다음 테이블이 필요합니다:

### profiles 테이블

```sql
create table profiles (
  id uuid references auth.users primary key,
  email text not null,
  full_name text not null,
  bio text,
  church text,
  phone_number text,
  role text not null default 'trainer',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- RLS 활성화
alter table profiles enable row level security;

-- 자신의 프로필만 조회 가능
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

-- 자신의 프로필만 업데이트 가능
create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- 회원가입 시 프로필 자동 생성을 위한 트리거 (선택사항)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'trainer'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

## 타입 정의

### User (Domain Entity)

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'trainer' | 'admin';
  createdAt: string;
  updatedAt: string;
}
```

### Profile (Database)

```typescript
interface Profile {
  id: string;
  email: string;
  full_name: string;
  bio?: string;
  church?: string;
  phone_number?: string;
  role: 'trainer' | 'admin';
  created_at: string;
  updated_at: string;
}
```

### AuthResult

```typescript
interface AuthResult {
  success: boolean;
  user?: User;
  session?: Session;
  error?: AuthError;
}
```

## 주의사항

1. **환경 변수**: `.env` 파일은 Git에 커밋하지 마세요 (`.gitignore`에 포함됨)
2. **RLS (Row Level Security)**: Supabase의 RLS를 활성화하여 데이터 보안을 강화하세요
3. **이메일 인증**: Supabase 프로젝트 설정에서 이메일 인증 활성화 여부를 확인하세요
4. **에러 처리**: 모든 인증 작업은 `AuthResult`를 반환하므로 에러 처리를 적절히 수행하세요

## 확장 가능성

- OAuth 로그인 (Google, GitHub 등) 추가 가능
- 2FA (Two-Factor Authentication) 구현 가능
- 비밀번호 재설정 기능 추가 가능
- 이메일 인증 기능 추가 가능
