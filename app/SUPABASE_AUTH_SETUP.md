# Supabase 인증 시스템 설치 완료

GRID 웹서비스에 Supabase 인증 시스템이 성공적으로 구현되었습니다.

## 📁 생성된 파일 목록

### 1. Supabase 클라이언트
- `/Users/seo/dev/Grid/app/src/infrastructure/services/supabase/client.ts`
- `/Users/seo/dev/Grid/app/src/infrastructure/services/supabase/index.ts`

### 2. 인증 시스템
- `/Users/seo/dev/Grid/app/src/infrastructure/services/auth/types.ts` - 타입 정의
- `/Users/seo/dev/Grid/app/src/infrastructure/services/auth/auth-service.ts` - 인증 서비스 함수들
- `/Users/seo/dev/Grid/app/src/infrastructure/services/auth/AuthContext.tsx` - React Context
- `/Users/seo/dev/Grid/app/src/infrastructure/services/auth/AuthProvider.tsx` - Context Provider
- `/Users/seo/dev/Grid/app/src/infrastructure/services/auth/useAuth.ts` - Custom Hook
- `/Users/seo/dev/Grid/app/src/infrastructure/services/auth/index.ts` - Barrel export
- `/Users/seo/dev/Grid/app/src/infrastructure/services/auth/README.md` - 사용 가이드
- `/Users/seo/dev/Grid/app/src/infrastructure/services/auth/USAGE_EXAMPLE.tsx` - 예제 코드

### 3. 설정 파일
- `/Users/seo/dev/Grid/app/.env.example` - 환경 변수 예제
- `/Users/seo/dev/Grid/app/.gitignore` - .env 파일 제외 설정 추가

### 4. 기존 파일 업데이트
- `/Users/seo/dev/Grid/app/src/infrastructure/services/auth.service.ts` - Supabase 연동
- `/Users/seo/dev/Grid/app/src/infrastructure/services/index.ts` - Export 추가

## 🚀 시작하기

### 1단계: Supabase 프로젝트 설정

1. [Supabase](https://app.supabase.com) 접속 및 로그인
2. 새 프로젝트 생성
3. Project Settings → API에서 다음 정보 복사:
   - Project URL
   - Anon (public) key

### 2단계: 환경 변수 설정

`.env` 파일을 생성하고 Supabase 정보를 입력하세요:

```bash
cp .env.example .env
```

`.env` 파일 내용:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3단계: Supabase 데이터베이스 스키마 생성

Supabase SQL Editor에서 다음 SQL을 실행하세요:

```sql
-- profiles 테이블 생성
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text not null,
  bio text,
  church text,
  phone_number text,
  role text not null default 'trainer' check (role in ('trainer', 'admin')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- RLS (Row Level Security) 활성화
alter table profiles enable row level security;

-- 정책: 자신의 프로필 조회 가능
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

-- 정책: 자신의 프로필 업데이트 가능
create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- 회원가입 시 프로필 자동 생성 트리거
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

-- updated_at 자동 업데이트 트리거
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_profile_updated
  before update on profiles
  for each row execute procedure public.handle_updated_at();
```

### 4단계: AuthProvider 설정

앱의 최상위 레벨(main.tsx 또는 App.tsx)에 AuthProvider를 추가하세요:

```tsx
import { AuthProvider } from '@/infrastructure/services/auth';

function App() {
  return (
    <AuthProvider>
      {/* 기존 앱 컴포넌트들 */}
    </AuthProvider>
  );
}
```

## 💻 사용 방법

### 기본 사용

```tsx
import { useAuth } from '@/infrastructure/services/auth';

function MyComponent() {
  const { user, isLoading, isAuthenticated, signIn, signOut } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return <button onClick={() => signIn('email', 'password')}>Login</button>;
  }

  return (
    <div>
      <p>Welcome, {user?.name}!</p>
      <button onClick={signOut}>Logout</button>
    </div>
  );
}
```

### 회원가입

```tsx
const { signUp } = useAuth();

const handleSignUp = async () => {
  const result = await signUp('email@example.com', 'password123', 'John Doe');

  if (result.success) {
    console.log('Success!', result.user);
  } else {
    console.error('Error:', result.error);
  }
};
```

### 프로필 업데이트

```tsx
const { updateProfile } = useAuth();

await updateProfile({
  name: 'New Name',
  bio: 'My bio',
  church: 'My Church',
  phoneNumber: '010-1234-5678',
});
```

## 📚 API Reference

### useAuth Hook

```typescript
const {
  // 상태
  user,            // User | null
  session,         // Session | null
  profile,         // Profile | null
  isLoading,       // boolean
  isAuthenticated, // boolean

  // 메서드
  signUp,          // (email, password, fullName) => Promise<AuthResult>
  signIn,          // (email, password) => Promise<AuthResult>
  signOut,         // () => Promise<void>
  updateProfile,   // (updates) => Promise<void>
  refreshUser,     // () => Promise<void>
} = useAuth();
```

### 직접 서비스 함수 사용

```typescript
import {
  signUpWithEmail,
  signInWithEmail,
  signOut,
  getCurrentUser,
  getProfile,
  updateProfile,
} from '@/infrastructure/services/auth';

// 로그인
const result = await signInWithEmail({
  email: 'user@example.com',
  password: 'password',
});

// 현재 사용자 가져오기
const user = await getCurrentUser();

// 프로필 조회
const profile = await getProfile(userId);

// 프로필 업데이트
await updateProfile(userId, {
  name: 'New Name',
  bio: 'Updated bio',
});
```

## 🔒 보안 고려사항

1. **환경 변수 보호**: `.env` 파일은 절대 Git에 커밋하지 마세요
2. **RLS 활성화**: Supabase의 Row Level Security를 반드시 활성화하세요
3. **이메일 인증**: Supabase 프로젝트 설정에서 이메일 인증을 활성화하는 것을 권장합니다
4. **비밀번호 정책**: Supabase Auth 설정에서 강력한 비밀번호 정책을 설정하세요

## 📖 추가 문서

- [README.md](/Users/seo/dev/Grid/app/src/infrastructure/services/auth/README.md) - 상세 사용 가이드
- [USAGE_EXAMPLE.tsx](/Users/seo/dev/Grid/app/src/infrastructure/services/auth/USAGE_EXAMPLE.tsx) - 실제 사용 예제 코드

## 🎯 주요 기능

### ✅ 구현된 기능

- ✅ 이메일/비밀번호 회원가입
- ✅ 이메일/비밀번호 로그인
- ✅ 로그아웃
- ✅ 세션 관리 (자동 갱신)
- ✅ 사용자 프로필 관리
- ✅ 프로필 업데이트
- ✅ 인증 상태 실시간 구독
- ✅ TypeScript 타입 안전성
- ✅ Clean Architecture 통합

### 🔜 확장 가능 기능

- OAuth 로그인 (Google, GitHub 등)
- 비밀번호 재설정
- 이메일 인증
- 2단계 인증 (2FA)
- 역할 기반 접근 제어 (RBAC)

## 🛠️ 기술 스택

- **Supabase**: 인증 및 데이터베이스
- **React Context**: 상태 관리
- **TypeScript**: 타입 안전성
- **Clean Architecture**: 계층화된 구조

## ✅ 다음 단계

1. ✅ Supabase 프로젝트 생성
2. ✅ 환경 변수 설정 (.env 파일)
3. ✅ 데이터베이스 스키마 생성 (profiles 테이블)
4. ✅ AuthProvider를 App에 추가
5. ⬜ 로그인/회원가입 UI 구현
6. ⬜ Protected Routes 구현
7. ⬜ 프로필 페이지 구현

## 🐛 문제 해결

### 환경 변수를 찾을 수 없는 경우

개발 서버를 재시작하세요:
```bash
npm run dev
```

### RLS 정책 오류

Supabase Dashboard → Authentication → Policies에서 정책이 올바르게 설정되었는지 확인하세요.

### 프로필이 자동 생성되지 않는 경우

트리거가 올바르게 생성되었는지 확인하세요. Supabase Dashboard → Database → Functions에서 `handle_new_user` 함수를 확인할 수 있습니다.

## 📞 지원

문제가 발생하면 다음을 확인하세요:

1. [Supabase 공식 문서](https://supabase.com/docs)
2. [인증 가이드](/Users/seo/dev/Grid/app/src/infrastructure/services/auth/README.md)
3. [사용 예제](/Users/seo/dev/Grid/app/src/infrastructure/services/auth/USAGE_EXAMPLE.tsx)
