/**
 * useAuth Hook
 * AuthContext를 사용하는 커스텀 훅
 */

import { useContext } from 'react';
import { AuthContext } from './AuthContext';

/**
 * 인증 컨텍스트를 사용하는 훅
 * @throws {Error} AuthProvider 외부에서 사용 시 에러 발생
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
