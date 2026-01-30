/**
 * Authentication Types
 * 인증 관련 타입 정의
 */

import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import type { User, UserProfile } from '../../../domain/entities';

/**
 * 인증 결과 타입
 */
export interface AuthResult {
  success: boolean;
  user?: User;
  session?: Session;
  error?: AuthError;
}

/**
 * 인증 에러 타입
 */
export interface AuthError {
  code: string;
  message: string;
  status?: number;
}

/**
 * 프로필 업데이트 타입
 */
export interface ProfileUpdate {
  name?: string;
  bio?: string;
  church?: string;
  phoneNumber?: string;
}

/**
 * 회원가입 데이터 타입
 */
export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
}

/**
 * 로그인 데이터 타입
 */
export interface SignInData {
  email: string;
  password: string;
}

/**
 * Supabase User를 Domain User로 변환하는 타입
 */
export interface UserMapper {
  toDomain: (supabaseUser: SupabaseUser, profile?: Profile) => User;
  toProfile: (supabaseUser: SupabaseUser, profile: Profile) => UserProfile;
}

/**
 * 데이터베이스 Profile 타입 (Supabase profiles 테이블)
 */
export interface Profile {
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
