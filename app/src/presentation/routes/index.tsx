/**
 * Router Configuration
 * React Router 라우트 설정
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { LoginPage } from '../pages/LoginPage';
import { SignupPage } from '../pages/SignupPage';
import { Dashboard } from '@/components/Dashboard';
import { useAuth } from '../hooks/useAuth';

// 컴포넌트를 외부로 분리하여 렌더링 중 생성 문제 해결
const RedirectIfAuthenticated = ({
  children,
  user,
  loading
}: {
  children: React.ReactNode;
  user: unknown;
  loading: boolean;
}) => {
  if (!loading && user) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

export const AppRouter = () => {
  const { user, loading } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
        />
        <Route
          path="/login"
          element={
            <RedirectIfAuthenticated user={user} loading={loading}>
              <LoginPage />
            </RedirectIfAuthenticated>
          }
        />
        <Route
          path="/signup"
          element={
            <RedirectIfAuthenticated user={user} loading={loading}>
              <SignupPage />
            </RedirectIfAuthenticated>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
