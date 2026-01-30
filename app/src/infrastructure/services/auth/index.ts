/**
 * Auth Module Barrel Export
 * 인증 모듈 통합 export
 */

// Context & Provider
export { AuthContext } from './AuthContext';
export { AuthProvider } from './AuthProvider';
export type { AuthContextType } from './AuthContext';

// Hook
export { useAuth } from './useAuth';

// Types
export type {
  AuthResult,
  AuthError,
  ProfileUpdate,
  SignUpData,
  SignInData,
  Profile,
} from './types';

// Services
export {
  signUpWithEmail,
  signInWithEmail,
  signOut,
  getSession,
  getCurrentUser,
  getProfile,
  updateProfile,
  onAuthStateChange,
  refreshToken,
} from './auth-service';
