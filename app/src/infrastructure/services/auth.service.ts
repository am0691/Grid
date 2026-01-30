/**
 * Authentication Service Implementation
 * Supabase 인증을 사용하는 IAuthService 구현체
 */

import type { IAuthService } from '../../application/ports/services';
import type { User } from '../../domain/entities';
import {
  signInWithEmail,
  signOut as signOutAuth,
  getCurrentUser as getCurrentUserAuth,
  refreshToken as refreshTokenAuth,
  getSession,
} from './auth';

export class AuthService implements IAuthService {
  /**
   * 이메일/비밀번호로 로그인
   */
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const result = await signInWithEmail({ email, password });

    if (!result.success || !result.user || !result.session) {
      throw new Error(result.error?.message || 'Login failed');
    }

    return {
      user: result.user,
      token: result.session.access_token,
    };
  }

  /**
   * 로그아웃
   */
  async logout(): Promise<void> {
    await signOutAuth();
  }

  /**
   * 현재 사용자 가져오기
   */
  async getCurrentUser(): Promise<User | null> {
    return await getCurrentUserAuth();
  }

  /**
   * 토큰 갱신
   */
  async refreshToken(): Promise<string> {
    return await refreshTokenAuth();
  }

  /**
   * 토큰 검증
   */
  async verifyToken(token: string): Promise<boolean> {
    try {
      const session = await getSession();
      return session?.access_token === token;
    } catch {
      return false;
    }
  }
}
