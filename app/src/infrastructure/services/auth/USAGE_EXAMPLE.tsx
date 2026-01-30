/**
 * Authentication System Usage Examples
 * 인증 시스템 사용 예제
 */

import { useState } from 'react';
import { useAuth } from './useAuth';
import type { AuthResult } from './types';

/**
 * 로그인 페이지 예제
 */
export function LoginPageExample() {
  const { signIn, isLoading, isAuthenticated, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result: AuthResult = await signIn(email, password);

    if (result.success) {
      console.log('로그인 성공:', result.user);
      // 리다이렉트 또는 상태 업데이트
    } else {
      setError(result.error?.message || '로그인에 실패했습니다.');
    }
  };

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  if (isAuthenticated) {
    return <div>환영합니다, {user?.name}님!</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="이메일"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="비밀번호"
        required
      />
      <button type="submit">로그인</button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  );
}

/**
 * 회원가입 페이지 예제
 */
export function SignUpPageExample() {
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result: AuthResult = await signUp(
      formData.email,
      formData.password,
      formData.fullName
    );

    if (result.success) {
      setSuccess(true);
      console.log('회원가입 성공:', result.user);
    } else {
      setError(result.error?.message || '회원가입에 실패했습니다.');
    }
  };

  if (success) {
    return <div>회원가입이 완료되었습니다! 이메일을 확인해주세요.</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={formData.fullName}
        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
        placeholder="이름"
        required
      />
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="이메일"
        required
      />
      <input
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        placeholder="비밀번호"
        required
      />
      <button type="submit">회원가입</button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  );
}

/**
 * 프로필 페이지 예제
 */
export function ProfilePageExample() {
  const { user, profile, updateProfile, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: profile?.bio || '',
    church: profile?.church || '',
    phoneNumber: profile?.phone_number || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateProfile(formData);
      setIsEditing(false);
      console.log('프로필이 업데이트되었습니다.');
    } catch (error) {
      console.error('프로필 업데이트 실패:', error);
    }
  };

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  if (!user) {
    return <div>로그인이 필요합니다.</div>;
  }

  if (!isEditing) {
    return (
      <div>
        <h2>프로필</h2>
        <p>이름: {user.name}</p>
        <p>이메일: {user.email}</p>
        <p>소속: {profile?.church || '미입력'}</p>
        <p>전화번호: {profile?.phone_number || '미입력'}</p>
        <p>소개: {profile?.bio || '미입력'}</p>
        <button onClick={() => setIsEditing(true)}>수정</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>프로필 수정</h2>
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="이름"
      />
      <input
        type="text"
        value={formData.church}
        onChange={(e) => setFormData({ ...formData, church: e.target.value })}
        placeholder="소속 교회"
      />
      <input
        type="tel"
        value={formData.phoneNumber}
        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
        placeholder="전화번호"
      />
      <textarea
        value={formData.bio}
        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
        placeholder="자기소개"
      />
      <button type="submit">저장</button>
      <button type="button" onClick={() => setIsEditing(false)}>
        취소
      </button>
    </form>
  );
}

/**
 * 로그아웃 버튼 예제
 */
export function LogoutButtonExample() {
  const { signOut, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      console.log('로그아웃되었습니다.');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return <button onClick={handleLogout}>로그아웃</button>;
}

/**
 * Protected Route 예제
 */
export function ProtectedRouteExample({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  if (!isAuthenticated) {
    return <div>이 페이지에 접근하려면 로그인이 필요합니다.</div>;
  }

  return <>{children}</>;
}

/**
 * 직접 auth service 함수 사용 예제
 */
export async function directServiceUsageExample() {
  // useAuth 훅을 사용할 수 없는 컨텍스트에서 직접 서비스 함수 사용
  const {
    signInWithEmail,
    signOut,
    getCurrentUser,
    getProfile,
  } = await import('./auth-service');

  // 로그인
  const result = await signInWithEmail({
    email: 'user@example.com',
    password: 'password123',
  });

  if (result.success) {
    console.log('로그인 성공:', result.user);
  }

  // 현재 사용자 정보 가져오기
  const currentUser = await getCurrentUser();
  console.log('현재 사용자:', currentUser);

  // 프로필 가져오기
  if (currentUser) {
    const profile = await getProfile(currentUser.id);
    console.log('프로필:', profile);
  }

  // 로그아웃
  await signOut();
}
