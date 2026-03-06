/**
 * AuthProvider
 * 인증 상태를 제공하는 Context Provider
 */

import { useState, useEffect, type ReactNode } from 'react';
import { AuthContext } from '../hooks/useAuth';
import type { User } from '@/domain/entities';
import {
  signInWithEmail,
  signUpWithEmail,
  signOut as authSignOut,
  getCurrentUser,
  onAuthStateChange,
} from '@/infrastructure/services/auth/auth-service';


interface AuthProviderProps {
  children: ReactNode;
}

// Demo Mode 체크
const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

// Demo 사용자
const DEMO_USER: User = {
  id: 'demo-user-001',
  email: 'demo@grid.church',
  fullName: '데모 양육자',
  avatarUrl: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(!isDemoMode);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Demo Mode에서는 초기화 건너뛰기
    if (isDemoMode) {
      console.log('🎮 GRID Demo Mode - Supabase 없이 로컬 테스트 중');
      return;
    }

    // 초기 사용자 세션 확인 (타임아웃 보호)
    const initAuth = async () => {
      let resolved = false;

      // 3초 안전장치: Supabase 응답 없으면 강제로 로그인 페이지로
      const timer = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          console.warn('[GRID] Auth timeout - localStorage 정리 후 로그인 페이지로 이동');
          // Supabase 호출 없이 직접 localStorage 정리
          try {
            const storageKey = `sb-aryeyzovzpysnedhvlih-auth-token`;
            localStorage.removeItem(storageKey);
          } catch {}
          setUser(null);
          setLoading(false);
        }
      }, 3000);

      try {
        const currentUser = await getCurrentUser();
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          setUser(currentUser);
          setLoading(false);
        }
      } catch (err) {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          console.error('[GRID] Auth initialization error:', err);
          setUser(null);
          setLoading(false);
        }
      }
    };

    initAuth();

    // 인증 상태 변경 구독
    const { data: subscription } = onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription?.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    // Demo Mode: 즉시 로그인
    if (isDemoMode) {
      setUser({ ...DEMO_USER, email });
      return;
    }

    try {
      setError(null);
      setLoading(true);

      // 8초 타임아웃: Supabase hang 방지
      const result = await Promise.race([
        signInWithEmail({ email, password }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('로그인 요청 시간이 초과되었습니다. 다시 시도해주세요.')), 8000)
        ),
      ]);

      if (!result.success) {
        setError(result.error?.message || '로그인에 실패했습니다.');
        throw new Error(result.error?.message);
      }

      setUser(result.user || null);
    } catch (err) {
      const message = err instanceof Error ? err.message : '로그인에 실패했습니다.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    // Demo Mode: 즉시 회원가입
    if (isDemoMode) {
      setUser({ ...DEMO_USER, email, fullName: name });
      return { emailConfirmationRequired: false };
    }

    try {
      setError(null);
      setLoading(true);
      const result = await signUpWithEmail({
        email,
        password,
        fullName: name,
      });

      if (!result.success) {
        setError(result.error?.message || '회원가입에 실패했습니다.');
        throw new Error(result.error?.message);
      }

      // 이메일 인증이 필요하지 않은 경우에만 사용자 설정
      if (!result.emailConfirmationRequired) {
        setUser(result.user || null);
      }

      return { emailConfirmationRequired: result.emailConfirmationRequired || false };
    } catch (err) {
      const message = err instanceof Error ? err.message : '회원가입에 실패했습니다.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    // Demo Mode: 즉시 로그아웃
    if (isDemoMode) {
      setUser(null);
      return;
    }

    try {
      setError(null);
      await authSignOut();
      setUser(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : '로그아웃에 실패했습니다.';
      setError(message);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
