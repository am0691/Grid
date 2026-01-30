/**
 * Authentication Provider
 * 인증 상태를 관리하고 하위 컴포넌트에 제공하는 Provider
 */

import { useState, useEffect, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { User } from '../../../domain/entities';
import { AuthContext } from './AuthContext';
import type { AuthResult, ProfileUpdate, Profile } from './types';
import {
  signUpWithEmail,
  signInWithEmail,
  signOut as signOutService,
  getSession,
  getCurrentUser,
  getProfile,
  updateProfile as updateProfileService,
  onAuthStateChange,
} from './auth-service';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * 초기 세션 로드 및 사용자 정보 가져오기
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);

        // 1. 세션 가져오기
        const currentSession = await getSession();
        setSession(currentSession);

        if (currentSession?.user) {
          // 2. 사용자 정보 가져오기
          const currentUser = await getCurrentUser();
          setUser(currentUser);

          // 3. 프로필 가져오기
          if (currentUser) {
            const userProfile = await getProfile(currentUser.id);
            setProfile(userProfile);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // 4. 인증 상태 변경 구독
    const { data: authListener } = onAuthStateChange(async (event, newSession) => {
      console.log('Auth state changed:', event);
      setSession(newSession);

      if (newSession?.user) {
        const currentUser = await getCurrentUser();
        setUser(currentUser);

        if (currentUser) {
          const userProfile = await getProfile(currentUser.id);
          setProfile(userProfile);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    // 5. 구독 해제
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  /**
   * 회원가입
   */
  const signUp = async (
    email: string,
    password: string,
    fullName: string
  ): Promise<AuthResult> => {
    const result = await signUpWithEmail({ email, password, fullName });

    if (result.success && result.user) {
      setUser(result.user);
      setSession(result.session || null);

      // 프로필 새로고침
      const userProfile = await getProfile(result.user.id);
      setProfile(userProfile);
    }

    return result;
  };

  /**
   * 로그인
   */
  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    const result = await signInWithEmail({ email, password });

    if (result.success && result.user) {
      setUser(result.user);
      setSession(result.session || null);

      // 프로필 새로고침
      const userProfile = await getProfile(result.user.id);
      setProfile(userProfile);
    }

    return result;
  };

  /**
   * 로그아웃
   */
  const signOut = async (): Promise<void> => {
    await signOutService();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  /**
   * 프로필 업데이트
   */
  const updateProfile = async (updates: ProfileUpdate): Promise<void> => {
    if (!user) {
      throw new Error('No user logged in');
    }

    const updatedProfile = await updateProfileService(user.id, updates);

    if (updatedProfile) {
      setProfile(updatedProfile);

      // User 상태도 업데이트
      if (updates.name !== undefined) {
        setUser({
          ...user,
          name: updates.name,
        });
      }
    }
  };

  /**
   * 사용자 정보 새로고침
   */
  const refreshUser = async (): Promise<void> => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);

    if (currentUser) {
      const userProfile = await getProfile(currentUser.id);
      setProfile(userProfile);
    }
  };

  const value = {
    user,
    session,
    profile,
    isLoading,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
