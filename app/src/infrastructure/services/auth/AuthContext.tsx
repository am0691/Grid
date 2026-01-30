/**
 * Authentication Context
 * 인증 상태 관리를 위한 React Context
 */

import { createContext } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { User } from '../../../domain/entities';
import type { AuthResult, ProfileUpdate, Profile } from './types';

export interface AuthContextType {
  // 상태
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // 메서드
  signUp: (email: string, password: string, fullName: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  updateProfile: (updates: ProfileUpdate) => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
