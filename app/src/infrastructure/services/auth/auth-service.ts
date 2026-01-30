/**
 * Authentication Service
 * Supabase를 사용한 인증 서비스 구현
 */

import { supabase } from '../supabase/client';
import type { User as SupabaseUser, Session, AuthChangeEvent } from '@supabase/supabase-js';
import type { User } from '../../../domain/entities';
import type { AuthResult, SignUpData, SignInData, Profile, ProfileUpdate } from './types';

/**
 * Supabase User를 Domain User로 변환
 */
const mapSupabaseUserToDomain = (supabaseUser: SupabaseUser, profile?: Profile): User => {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name: profile?.full_name || supabaseUser.user_metadata?.full_name || '',
    role: profile?.role || 'trainer',
    createdAt: supabaseUser.created_at,
    updatedAt: profile?.updated_at || supabaseUser.updated_at || supabaseUser.created_at,
  };
};

/**
 * 이메일/비밀번호로 회원가입
 */
export const signUpWithEmail = async (data: SignUpData): Promise<AuthResult> => {
  try {
    const { email, password, fullName } = data;

    // 1. Supabase Auth에 사용자 생성
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (authError) {
      return {
        success: false,
        error: {
          code: authError.name || 'SIGNUP_ERROR',
          message: authError.message,
          status: authError.status,
        },
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: {
          code: 'NO_USER',
          message: 'User creation failed',
        },
      };
    }

    // 2. profiles 테이블에 프로필 생성
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      email,
      full_name: fullName,
      role: 'trainer',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // 프로필 생성 실패해도 Auth는 성공한 것으로 처리
      // (트리거나 함수로 나중에 프로필을 생성할 수 있음)
    }

    // 3. 프로필 조회
    const profile = await getProfile(authData.user.id);

    return {
      success: true,
      user: mapSupabaseUserToDomain(authData.user, profile || undefined),
      session: authData.session || undefined,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: error instanceof Error ? error.message : 'An unknown error occurred',
      },
    };
  }
};

/**
 * 이메일/비밀번호로 로그인
 */
export const signInWithEmail = async (data: SignInData): Promise<AuthResult> => {
  try {
    const { email, password } = data;

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return {
        success: false,
        error: {
          code: authError.name || 'SIGNIN_ERROR',
          message: authError.message,
          status: authError.status,
        },
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: {
          code: 'NO_USER',
          message: 'Sign in failed',
        },
      };
    }

    // 프로필 조회
    const profile = await getProfile(authData.user.id);

    return {
      success: true,
      user: mapSupabaseUserToDomain(authData.user, profile || undefined),
      session: authData.session,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: error instanceof Error ? error.message : 'An unknown error occurred',
      },
    };
  }
};

/**
 * 로그아웃
 */
export const signOut = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(`Sign out failed: ${error.message}`);
  }
};

/**
 * 현재 세션 가져오기
 */
export const getSession = async (): Promise<Session | null> => {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Get session error:', error);
    return null;
  }
  return data.session;
};

/**
 * 현재 사용자 가져오기
 */
export const getCurrentUser = async (): Promise<User | null> => {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return null;
  }

  const profile = await getProfile(data.user.id);
  return mapSupabaseUserToDomain(data.user, profile || undefined);
};

/**
 * 프로필 조회
 */
export const getProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Get profile error:', error);
    return null;
  }

  return data;
};

/**
 * 프로필 업데이트
 */
export const updateProfile = async (
  userId: string,
  updates: ProfileUpdate
): Promise<Profile | null> => {
  const updateData: Partial<Profile> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.name !== undefined) updateData.full_name = updates.name;
  if (updates.bio !== undefined) updateData.bio = updates.bio;
  if (updates.church !== undefined) updateData.church = updates.church;
  if (updates.phoneNumber !== undefined) updateData.phone_number = updates.phoneNumber;

  const { data, error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Update profile error:', error);
    throw new Error(`Profile update failed: ${error.message}`);
  }

  return data;
};

/**
 * 인증 상태 변경 구독
 */
export const onAuthStateChange = (
  callback: (event: AuthChangeEvent, session: Session | null) => void
) => {
  return supabase.auth.onAuthStateChange(callback);
};

/**
 * 토큰 갱신
 */
export const refreshToken = async (): Promise<string> => {
  const { data, error } = await supabase.auth.refreshSession();
  if (error || !data.session) {
    throw new Error('Token refresh failed');
  }
  return data.session.access_token;
};
